# HTML ReWriter - Terraform Infrastructure
# AWS 기반 Edge HTML 리라이팅 서비스

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "html-rewriter-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "ap-northeast-2"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

# Provider 설정 - Lambda@Edge는 us-east-1 필수
provider "aws" {
  region = "ap-northeast-2"
  alias  = "seoul"
}

provider "aws" {
  region = "us-east-1"
  alias  = "edge"
}

# Variables
variable "environment" {
  type    = string
  default = "prod"
}

variable "domain_name" {
  type    = string
  default = "html-rewriter.com"
}

# ============================================
# DynamoDB Tables
# ============================================

resource "aws_dynamodb_table" "customers" {
  provider     = aws.seoul
  name         = "html-rewriter-customers-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "awsAccountId"
    type = "S"
  }

  global_secondary_index {
    name            = "AwsAccountIndex"
    hash_key        = "awsAccountId"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Environment = var.environment
    Service     = "html-rewriter"
  }
}

resource "aws_dynamodb_table" "rules" {
  provider     = aws.seoul
  name         = "html-rewriter-rules-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  # Global Table for Edge access (us-east-1)
  replica {
    region_name = "us-east-1"
  }

  tags = {
    Environment = var.environment
    Service     = "html-rewriter"
  }
}

resource "aws_dynamodb_table" "config" {
  provider     = aws.seoul
  name         = "html-rewriter-config-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  # Global Table for Edge access (us-east-1)
  replica {
    region_name = "us-east-1"
  }

  tags = {
    Environment = var.environment
    Service     = "html-rewriter"
  }
}

resource "aws_dynamodb_table" "usage" {
  provider     = aws.seoul
  name         = "html-rewriter-usage-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "customerId"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }

  global_secondary_index {
    name            = "CustomerDateIndex"
    hash_key        = "customerId"
    range_key       = "date"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Environment = var.environment
    Service     = "html-rewriter"
  }
}

# ============================================
# Lambda@Edge Function
# ============================================

# IAM Role for Lambda@Edge
resource "aws_iam_role" "lambda_edge" {
  provider = aws.edge
  name     = "html-rewriter-lambda-edge-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = [
            "lambda.amazonaws.com",
            "edgelambda.amazonaws.com"
          ]
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_edge_policy" {
  provider = aws.edge
  name     = "html-rewriter-lambda-edge-policy"
  role     = aws_iam_role.lambda_edge.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:Query"
        ]
        Resource = [
          "arn:aws:dynamodb:us-east-1:*:table/html-rewriter-rules-${var.environment}",
          "arn:aws:dynamodb:us-east-1:*:table/html-rewriter-config-${var.environment}"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ]
        Resource = "arn:aws:dynamodb:us-east-1:*:table/html-rewriter-usage-${var.environment}"
      }
    ]
  })
}

# Lambda@Edge Function
resource "aws_lambda_function" "edge_rewriter" {
  provider         = aws.edge
  filename         = "${path.module}/../lambda/edge-rewriter.zip"
  function_name    = "html-rewriter-edge-${var.environment}"
  role             = aws_iam_role.lambda_edge.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 512
  publish          = true  # Required for Lambda@Edge

  environment {
    variables = {
      RULES_TABLE  = aws_dynamodb_table.rules.name
      CONFIG_TABLE = aws_dynamodb_table.config.name
      USAGE_TABLE  = aws_dynamodb_table.usage.name
    }
  }

  tags = {
    Environment = var.environment
    Service     = "html-rewriter"
  }
}

# ============================================
# CloudFront Distribution
# ============================================

# SSL Certificate (must be in us-east-1 for CloudFront)
resource "aws_acm_certificate" "main" {
  provider          = aws.edge
  domain_name       = "*.${var.domain_name}"
  validation_method = "DNS"

  subject_alternative_names = [
    var.domain_name
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Environment = var.environment
    Service     = "html-rewriter"
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "main" {
  provider        = aws.edge
  enabled         = true
  is_ipv6_enabled = true
  comment         = "HTML ReWriter - ${var.environment}"
  price_class     = "PriceClass_All"

  aliases = ["*.${var.domain_name}"]

  # Default origin (placeholder - will be overridden by Lambda@Edge)
  origin {
    domain_name = "example.com"
    origin_id   = "default"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "default"

    forwarded_values {
      query_string = true
      headers      = ["Host", "User-Agent", "Accept-Language"]

      cookies {
        forward = "none"
      }
    }

    lambda_function_association {
      event_type   = "origin-request"
      lambda_arn   = aws_lambda_function.edge_rewriter.qualified_arn
      include_body = false
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.main.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Environment = var.environment
    Service     = "html-rewriter"
  }
}

# ============================================
# API Gateway (Management API)
# ============================================

resource "aws_apigatewayv2_api" "management" {
  provider      = aws.seoul
  name          = "html-rewriter-api-${var.environment}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["https://dashboard.${var.domain_name}"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Authorization", "Content-Type"]
    max_age       = 3600
  }

  tags = {
    Environment = var.environment
    Service     = "html-rewriter"
  }
}

# ============================================
# Outputs
# ============================================

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.main.id
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.main.domain_name
}

output "api_endpoint" {
  value = aws_apigatewayv2_api.management.api_endpoint
}

output "dynamodb_tables" {
  value = {
    customers = aws_dynamodb_table.customers.name
    rules     = aws_dynamodb_table.rules.name
    config    = aws_dynamodb_table.config.name
    usage     = aws_dynamodb_table.usage.name
  }
}
