/**
 * HTML ReWriter - Lambda@Edge Origin Request Handler
 *
 * 검색엔진 봇 요청 시 HTML을 가로채서 Meta 태그를 동적으로 주입
 */

import { CloudFrontRequestEvent, CloudFrontRequestResult, CloudFrontRequest } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

// Types
interface MetaTags {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  ogSiteName?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  custom?: Record<string, string>;
}

interface Rule {
  ruleId: string;
  path: string;
  pathType: 'exact' | 'pattern' | 'regex';
  priority: number;
  metaTags: MetaTags;
  enabled: boolean;
}

interface EdgeConfig {
  originUrl: string;
  originHeaders?: Record<string, string>;
  cacheSettings?: {
    enabled: boolean;
    ttl: number;
  };
  botUserAgents?: string[];
  enabledPaths?: string[];
  excludedPaths?: string[];
  fallbackBehavior?: 'passthrough' | 'error';
}

// Constants
const DEFAULT_BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'slurp',
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'applebot',
  'semrushbot',
  'ahrefsbot',
];

// DynamoDB Client (us-east-1 for Lambda@Edge)
const ddbClient = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(ddbClient);

const CUSTOMERS_TABLE = process.env.CUSTOMERS_TABLE || 'html-rewriter-customers';
const RULES_TABLE = process.env.RULES_TABLE || 'html-rewriter-rules';
const CONFIG_TABLE = process.env.CONFIG_TABLE || 'html-rewriter-config';

// In-memory cache for rules (Lambda container reuse)
const ruleCache = new Map<string, { rules: Rule[]; config: EdgeConfig; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Main handler
 */
export const handler = async (event: CloudFrontRequestEvent): Promise<CloudFrontRequestResult> => {
  const request = event.Records[0].cf.request;

  try {
    // 1. Extract customer ID from host
    const host = request.headers.host?.[0]?.value || '';
    const customerId = extractCustomerId(host);

    if (!customerId) {
      console.log('No customer ID found, passing through');
      return request;
    }

    // 2. Check if bot
    const userAgent = request.headers['user-agent']?.[0]?.value || '';
    const config = await getEdgeConfig(customerId);

    if (!config) {
      console.log(`No config found for customer: ${customerId}`);
      return request;
    }

    const botUserAgents = config.botUserAgents || DEFAULT_BOT_USER_AGENTS;
    const isBot = checkIfBot(userAgent, botUserAgents);

    // 3. If not a bot, pass through to origin
    if (!isBot) {
      return createOriginRequest(request, config);
    }

    // 4. Check if path is enabled/excluded
    const path = request.uri;
    if (!isPathEnabled(path, config)) {
      return createOriginRequest(request, config);
    }

    // 5. Find matching rule
    const rules = await getRules(customerId);
    const matchedRule = findMatchingRule(path, rules);

    if (!matchedRule) {
      console.log(`No matching rule for path: ${path}`);
      return createOriginRequest(request, config);
    }

    // 6. Fetch original HTML
    const originUrl = `${config.originUrl}${path}`;
    const originalHtml = await fetchOriginHtml(originUrl, request, config);

    if (!originalHtml) {
      console.log('Failed to fetch origin HTML');
      return createOriginRequest(request, config);
    }

    // 7. Transform HTML
    const transformedHtml = transformHtml(originalHtml, matchedRule.metaTags);

    // 8. Return transformed response
    return {
      status: '200',
      statusDescription: 'OK',
      headers: {
        'content-type': [{ key: 'Content-Type', value: 'text/html; charset=utf-8' }],
        'cache-control': [{
          key: 'Cache-Control',
          value: config.cacheSettings?.enabled
            ? `public, max-age=${config.cacheSettings.ttl}`
            : 'no-cache'
        }],
        'x-html-rewriter': [{ key: 'X-HTML-Rewriter', value: 'processed' }],
      },
      body: transformedHtml,
    };

  } catch (error) {
    console.error('Error processing request:', error);
    return request; // Fallback to passthrough
  }
};

/**
 * Extract customer ID from hostname
 * customer123.html-rewriter.com → customer123
 */
function extractCustomerId(host: string): string | null {
  const match = host.match(/^([^.]+)\.html-rewriter\.com$/);
  return match ? match[1] : null;
}

/**
 * Check if User-Agent is a bot
 */
function checkIfBot(userAgent: string, botList: string[]): boolean {
  const ua = userAgent.toLowerCase();
  return botList.some(bot => ua.includes(bot.toLowerCase()));
}

/**
 * Get edge config from DynamoDB (with cache)
 */
async function getEdgeConfig(customerId: string): Promise<EdgeConfig | null> {
  const cached = ruleCache.get(customerId);
  if (cached && Date.now() < cached.expires) {
    return cached.config;
  }

  try {
    const result = await docClient.send(new GetCommand({
      TableName: CONFIG_TABLE,
      Key: {
        PK: `CUSTOMER#${customerId}`,
        SK: 'CONFIG',
      },
    }));

    if (!result.Item) {
      return null;
    }

    const config = result.Item as EdgeConfig;

    // Update cache
    const rules = await fetchRulesFromDb(customerId);
    ruleCache.set(customerId, {
      rules,
      config,
      expires: Date.now() + CACHE_TTL,
    });

    return config;
  } catch (error) {
    console.error('Error fetching config:', error);
    return null;
  }
}

/**
 * Get rules from DynamoDB (with cache)
 */
async function getRules(customerId: string): Promise<Rule[]> {
  const cached = ruleCache.get(customerId);
  if (cached && Date.now() < cached.expires) {
    return cached.rules;
  }

  return fetchRulesFromDb(customerId);
}

/**
 * Fetch rules from DynamoDB
 */
async function fetchRulesFromDb(customerId: string): Promise<Rule[]> {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: RULES_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `CUSTOMER#${customerId}`,
        ':sk': 'RULE#',
      },
    }));

    const rules = (result.Items || []) as Rule[];
    return rules
      .filter(r => r.enabled)
      .sort((a, b) => a.priority - b.priority);
  } catch (error) {
    console.error('Error fetching rules:', error);
    return [];
  }
}

/**
 * Check if path is enabled for processing
 */
function isPathEnabled(path: string, config: EdgeConfig): boolean {
  // Check excluded paths first
  if (config.excludedPaths?.length) {
    for (const excluded of config.excludedPaths) {
      if (matchPath(path, excluded)) {
        return false;
      }
    }
  }

  // Check enabled paths (if specified)
  if (config.enabledPaths?.length) {
    for (const enabled of config.enabledPaths) {
      if (matchPath(path, enabled)) {
        return true;
      }
    }
    return false;
  }

  return true;
}

/**
 * Find matching rule for path
 */
function findMatchingRule(path: string, rules: Rule[]): Rule | null {
  for (const rule of rules) {
    if (matchPath(path, rule.path, rule.pathType)) {
      return rule;
    }
  }
  return null;
}

/**
 * Match path against pattern
 */
function matchPath(path: string, pattern: string, type: string = 'pattern'): boolean {
  switch (type) {
    case 'exact':
      return path === pattern;

    case 'regex':
      try {
        const regex = new RegExp(pattern);
        return regex.test(path);
      } catch {
        return false;
      }

    case 'pattern':
    default:
      // Convert /product/:id to regex
      const regexPattern = pattern
        .replace(/\//g, '\\/')
        .replace(/:([^/]+)/g, '([^/]+)')
        .replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(path);
  }
}

/**
 * Create origin request (passthrough)
 */
function createOriginRequest(request: CloudFrontRequest, config: EdgeConfig): CloudFrontRequest {
  // Update origin
  const originUrl = new URL(config.originUrl);

  request.origin = {
    custom: {
      domainName: originUrl.hostname,
      port: originUrl.port ? parseInt(originUrl.port) : (originUrl.protocol === 'https:' ? 443 : 80),
      protocol: originUrl.protocol.replace(':', '') as 'http' | 'https',
      path: originUrl.pathname === '/' ? '' : originUrl.pathname,
      sslProtocols: ['TLSv1.2'],
      readTimeout: 30,
      keepaliveTimeout: 5,
      customHeaders: {},
    },
  };

  // Add custom headers
  if (config.originHeaders) {
    for (const [key, value] of Object.entries(config.originHeaders)) {
      request.headers[key.toLowerCase()] = [{ key, value }];
    }
  }

  return request;
}

/**
 * Fetch HTML from origin server
 */
async function fetchOriginHtml(
  url: string,
  request: CloudFrontRequest,
  config: EdgeConfig
): Promise<string | null> {
  try {
    const headers: Record<string, string> = {
      'User-Agent': request.headers['user-agent']?.[0]?.value || 'HTMLRewriter/1.0',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': request.headers['accept-language']?.[0]?.value || 'en-US,en;q=0.9',
    };

    // Add custom origin headers
    if (config.originHeaders) {
      Object.assign(headers, config.originHeaders);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`Origin returned ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      console.log('Response is not HTML');
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error('Error fetching origin:', error);
    return null;
  }
}

/**
 * Transform HTML by injecting/replacing meta tags
 */
function transformHtml(html: string, metaTags: MetaTags): string {
  // Remove existing meta tags that we're going to replace
  html = removeExistingMetaTags(html);

  // Generate new meta tags HTML
  const metaHtml = generateMetaTagsHtml(metaTags);

  // Inject after <head> tag
  const headMatch = html.match(/<head[^>]*>/i);
  if (headMatch) {
    const insertPosition = headMatch.index! + headMatch[0].length;
    return html.slice(0, insertPosition) + '\n' + metaHtml + html.slice(insertPosition);
  }

  // Fallback: insert before </head> or at beginning
  if (html.includes('</head>')) {
    return html.replace('</head>', metaHtml + '\n</head>');
  }

  return metaHtml + '\n' + html;
}

/**
 * Remove existing meta tags
 */
function removeExistingMetaTags(html: string): string {
  // Remove title
  html = html.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');

  // Remove meta description, keywords, robots
  html = html.replace(/<meta\s+name=["'](description|keywords|robots)["'][^>]*>/gi, '');

  // Remove Open Graph tags
  html = html.replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '');

  // Remove Twitter Card tags
  html = html.replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '');

  // Remove canonical link
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '');

  return html;
}

/**
 * Generate meta tags HTML string
 */
function generateMetaTagsHtml(tags: MetaTags): string {
  const lines: string[] = [];

  // Basic tags
  if (tags.title) {
    lines.push(`    <title>${escapeHtml(tags.title)}</title>`);
  }
  if (tags.description) {
    lines.push(`    <meta name="description" content="${escapeHtml(tags.description)}">`);
  }
  if (tags.keywords) {
    lines.push(`    <meta name="keywords" content="${escapeHtml(tags.keywords)}">`);
  }
  if (tags.canonical) {
    lines.push(`    <link rel="canonical" href="${escapeHtml(tags.canonical)}">`);
  }
  if (tags.robots) {
    lines.push(`    <meta name="robots" content="${escapeHtml(tags.robots)}">`);
  }

  // Open Graph tags
  if (tags.ogTitle) {
    lines.push(`    <meta property="og:title" content="${escapeHtml(tags.ogTitle)}">`);
  }
  if (tags.ogDescription) {
    lines.push(`    <meta property="og:description" content="${escapeHtml(tags.ogDescription)}">`);
  }
  if (tags.ogImage) {
    lines.push(`    <meta property="og:image" content="${escapeHtml(tags.ogImage)}">`);
  }
  if (tags.ogUrl) {
    lines.push(`    <meta property="og:url" content="${escapeHtml(tags.ogUrl)}">`);
  }
  if (tags.ogType) {
    lines.push(`    <meta property="og:type" content="${escapeHtml(tags.ogType)}">`);
  }
  if (tags.ogSiteName) {
    lines.push(`    <meta property="og:site_name" content="${escapeHtml(tags.ogSiteName)}">`);
  }

  // Twitter Card tags
  if (tags.twitterCard) {
    lines.push(`    <meta name="twitter:card" content="${escapeHtml(tags.twitterCard)}">`);
  }
  if (tags.twitterTitle) {
    lines.push(`    <meta name="twitter:title" content="${escapeHtml(tags.twitterTitle)}">`);
  }
  if (tags.twitterDescription) {
    lines.push(`    <meta name="twitter:description" content="${escapeHtml(tags.twitterDescription)}">`);
  }
  if (tags.twitterImage) {
    lines.push(`    <meta name="twitter:image" content="${escapeHtml(tags.twitterImage)}">`);
  }
  if (tags.twitterSite) {
    lines.push(`    <meta name="twitter:site" content="${escapeHtml(tags.twitterSite)}">`);
  }

  // Custom tags
  if (tags.custom) {
    for (const [name, content] of Object.entries(tags.custom)) {
      if (name.startsWith('og:') || name.startsWith('article:')) {
        lines.push(`    <meta property="${escapeHtml(name)}" content="${escapeHtml(content)}">`);
      } else {
        lines.push(`    <meta name="${escapeHtml(name)}" content="${escapeHtml(content)}">`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
