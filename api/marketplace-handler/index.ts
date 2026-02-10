/**
 * AWS Marketplace Integration Handler
 * 구독 이벤트 처리, 고객 등록, 미터링
 */

import { SNSEvent, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import {
  MarketplaceMeteringClient,
  ResolveCustomerCommand,
  BatchMeterUsageCommand,
  UsageRecord,
} from '@aws-sdk/client-marketplace-metering';
import {
  MarketplaceEntitlementServiceClient,
  GetEntitlementsCommand,
} from '@aws-sdk/client-marketplace-entitlement-service';

// Clients
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);
const meteringClient = new MarketplaceMeteringClient({ region: 'us-east-1' });
const entitlementClient = new MarketplaceEntitlementServiceClient({ region: 'us-east-1' });

const CUSTOMERS_TABLE = process.env.CUSTOMERS_TABLE!;
const PRODUCT_CODE = process.env.PRODUCT_CODE!;
const FULFILLMENT_URL = process.env.FULFILLMENT_URL!;

// Types
interface SubscriptionNotification {
  action: 'subscribe-success' | 'subscribe-fail' | 'unsubscribe-pending' | 'unsubscribe-success';
  'customer-identifier': string;
  'product-code': string;
  'offer-identifier'?: string;
  isFreeTrialTermPresent?: string;
}

interface EntitlementNotification {
  action: 'entitlement-updated';
  'customer-identifier': string;
  'product-code': string;
}

/**
 * SNS Subscription Notification Handler
 */
export const subscriptionHandler = async (event: SNSEvent): Promise<void> => {
  for (const record of event.Records) {
    const message: SubscriptionNotification = JSON.parse(record.Sns.Message);

    console.log('Received subscription notification:', message);

    switch (message.action) {
      case 'subscribe-success':
        await handleSubscribeSuccess(message);
        break;

      case 'subscribe-fail':
        console.log('Subscription failed for:', message['customer-identifier']);
        break;

      case 'unsubscribe-pending':
        await handleUnsubscribePending(message);
        break;

      case 'unsubscribe-success':
        await handleUnsubscribeSuccess(message);
        break;
    }
  }
};

/**
 * SNS Entitlement Notification Handler
 */
export const entitlementHandler = async (event: SNSEvent): Promise<void> => {
  for (const record of event.Records) {
    const message: EntitlementNotification = JSON.parse(record.Sns.Message);

    console.log('Received entitlement notification:', message);

    // Get updated entitlements
    const entitlements = await getEntitlements(message['customer-identifier']);
    console.log('Updated entitlements:', entitlements);

    // Update customer record with new entitlements
    await updateCustomerEntitlements(message['customer-identifier'], entitlements);
  }
};

/**
 * Fulfillment Page Handler (Registration)
 * AWS Marketplace에서 구독 후 리다이렉트되는 페이지
 */
export const fulfillmentHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Get registration token from query string
    const token = event.queryStringParameters?.['x-amzn-marketplace-token'];

    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing marketplace token' }),
      };
    }

    // Resolve customer from token
    const resolveResult = await meteringClient.send(
      new ResolveCustomerCommand({ RegistrationToken: token })
    );

    const customerId = resolveResult.CustomerIdentifier!;
    const awsAccountId = resolveResult.CustomerAWSAccountId!;
    const productCode = resolveResult.ProductCode!;

    console.log('Resolved customer:', { customerId, awsAccountId, productCode });

    // Check if customer already exists
    const existingCustomer = await getCustomer(customerId);

    if (existingCustomer) {
      // Redirect to dashboard
      return {
        statusCode: 302,
        headers: {
          Location: `${FULFILLMENT_URL}/dashboard?customer=${customerId}`,
        },
        body: '',
      };
    }

    // Create pending customer record
    await createCustomer({
      customerId,
      awsAccountId,
      productCode,
      status: 'pending_registration',
    });

    // Redirect to registration form
    return {
      statusCode: 302,
      headers: {
        Location: `${FULFILLMENT_URL}/register?customer=${customerId}`,
      },
      body: '',
    };
  } catch (error) {
    console.error('Fulfillment error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

/**
 * Registration Completion Handler
 */
export const registrationHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { customerId, email, companyName, originUrl } = body;

    if (!customerId || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Generate proxy domain
    const proxyDomain = `${generateProxyId()}.html-rewriter.com`;

    // Update customer record
    await docClient.send(new UpdateCommand({
      TableName: CUSTOMERS_TABLE,
      Key: {
        PK: `CUSTOMER#${customerId}`,
        SK: 'METADATA',
      },
      UpdateExpression: `
        SET email = :email,
            companyName = :companyName,
            originUrl = :originUrl,
            proxyDomain = :proxyDomain,
            subscriptionStatus = :status,
            updatedAt = :updatedAt
      `,
      ExpressionAttributeValues: {
        ':email': email,
        ':companyName': companyName || '',
        ':originUrl': originUrl || '',
        ':proxyDomain': proxyDomain,
        ':status': 'active',
        ':updatedAt': new Date().toISOString(),
      },
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        proxyDomain,
        message: 'Registration complete. Configure your DNS CNAME to start.',
      }),
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

/**
 * Metering Handler (Scheduled)
 * 시간별 사용량을 AWS Marketplace에 보고
 */
export const meteringHandler = async (): Promise<void> => {
  console.log('Starting metering job...');

  // Get all active customers
  const customers = await getActiveCustomers();

  for (const customer of customers) {
    try {
      // Get usage for the last hour
      const usage = await getHourlyUsage(customer.customerId);

      if (usage.totalRequests > 0) {
        const usageRecords: UsageRecord[] = [
          {
            CustomerIdentifier: customer.customerId,
            Dimension: 'api-requests',
            Quantity: usage.totalRequests,
            Timestamp: new Date(),
          },
        ];

        // Report to AWS Marketplace
        await meteringClient.send(new BatchMeterUsageCommand({
          ProductCode: PRODUCT_CODE,
          UsageRecords: usageRecords,
        }));

        console.log(`Reported usage for ${customer.customerId}:`, usage.totalRequests);
      }
    } catch (error) {
      console.error(`Metering error for ${customer.customerId}:`, error);
    }
  }

  console.log('Metering job complete');
};

// Helper functions

async function handleSubscribeSuccess(message: SubscriptionNotification): Promise<void> {
  const customerId = message['customer-identifier'];

  await docClient.send(new UpdateCommand({
    TableName: CUSTOMERS_TABLE,
    Key: {
      PK: `CUSTOMER#${customerId}`,
      SK: 'METADATA',
    },
    UpdateExpression: `
      SET subscriptionStatus = :status,
          subscribedAt = :subscribedAt,
          isFreeTrialTermPresent = :freeTrial,
          updatedAt = :updatedAt
    `,
    ExpressionAttributeValues: {
      ':status': 'active',
      ':subscribedAt': new Date().toISOString(),
      ':freeTrial': message.isFreeTrialTermPresent === 'true',
      ':updatedAt': new Date().toISOString(),
    },
  }));

  console.log('Customer subscribed:', customerId);
}

async function handleUnsubscribePending(message: SubscriptionNotification): Promise<void> {
  const customerId = message['customer-identifier'];

  // Send final metering records
  const usage = await getHourlyUsage(customerId);
  if (usage.totalRequests > 0) {
    await meteringClient.send(new BatchMeterUsageCommand({
      ProductCode: PRODUCT_CODE,
      UsageRecords: [{
        CustomerIdentifier: customerId,
        Dimension: 'api-requests',
        Quantity: usage.totalRequests,
        Timestamp: new Date(),
      }],
    }));
  }

  // Update status
  await docClient.send(new UpdateCommand({
    TableName: CUSTOMERS_TABLE,
    Key: {
      PK: `CUSTOMER#${customerId}`,
      SK: 'METADATA',
    },
    UpdateExpression: 'SET subscriptionStatus = :status, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':status': 'cancelling',
      ':updatedAt': new Date().toISOString(),
    },
  }));

  console.log('Customer unsubscribe pending:', customerId);
}

async function handleUnsubscribeSuccess(message: SubscriptionNotification): Promise<void> {
  const customerId = message['customer-identifier'];

  await docClient.send(new UpdateCommand({
    TableName: CUSTOMERS_TABLE,
    Key: {
      PK: `CUSTOMER#${customerId}`,
      SK: 'METADATA',
    },
    UpdateExpression: `
      SET subscriptionStatus = :status,
          cancelledAt = :cancelledAt,
          updatedAt = :updatedAt
    `,
    ExpressionAttributeValues: {
      ':status': 'cancelled',
      ':cancelledAt': new Date().toISOString(),
      ':updatedAt': new Date().toISOString(),
    },
  }));

  console.log('Customer unsubscribed:', customerId);
}

async function getEntitlements(customerId: string): Promise<any[]> {
  const result = await entitlementClient.send(new GetEntitlementsCommand({
    ProductCode: PRODUCT_CODE,
    Filter: {
      CUSTOMER_IDENTIFIER: [customerId],
    },
  }));

  return result.Entitlements || [];
}

async function updateCustomerEntitlements(customerId: string, entitlements: any[]): Promise<void> {
  await docClient.send(new UpdateCommand({
    TableName: CUSTOMERS_TABLE,
    Key: {
      PK: `CUSTOMER#${customerId}`,
      SK: 'METADATA',
    },
    UpdateExpression: 'SET entitlements = :entitlements, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':entitlements': entitlements,
      ':updatedAt': new Date().toISOString(),
    },
  }));
}

async function getCustomer(customerId: string): Promise<any | null> {
  const result = await docClient.send(new GetCommand({
    TableName: CUSTOMERS_TABLE,
    Key: {
      PK: `CUSTOMER#${customerId}`,
      SK: 'METADATA',
    },
  }));

  return result.Item || null;
}

async function createCustomer(data: {
  customerId: string;
  awsAccountId: string;
  productCode: string;
  status: string;
}): Promise<void> {
  await docClient.send(new PutCommand({
    TableName: CUSTOMERS_TABLE,
    Item: {
      PK: `CUSTOMER#${data.customerId}`,
      SK: 'METADATA',
      customerId: data.customerId,
      awsAccountId: data.awsAccountId,
      productCode: data.productCode,
      subscriptionStatus: data.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }));
}

async function getActiveCustomers(): Promise<any[]> {
  // Implementation: Query customers with active status
  // Simplified for brevity
  return [];
}

async function getHourlyUsage(customerId: string): Promise<{ totalRequests: number }> {
  // Implementation: Query usage table for last hour
  // Simplified for brevity
  return { totalRequests: 0 };
}

function generateProxyId(): string {
  return Math.random().toString(36).substring(2, 10);
}
