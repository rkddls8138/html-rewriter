# HTML ReWriter - Edge 기반 아키텍처 설계

## 1. 시스템 개요

### 1.1 목적
SEO 최적화를 위한 HTML 리라이팅 SaaS 서비스. 고객 웹사이트의 Meta 태그를 동적으로 주입/수정하여 검색엔진 최적화를 지원.

### 1.2 핵심 특징
- **프레임워크 무관**: 고객 기술 스택에 관계없이 작동
- **코드 수정 불필요**: DNS CNAME 설정만으로 적용
- **실시간 처리**: Edge에서 요청 시점에 HTML 변환
- **AWS Marketplace 통합**: 구독/결제/미터링 자동화

---

## 2. 전체 아키텍처

```
                                    ┌─────────────────────────┐
                                    │    AWS Marketplace      │
                                    │    (구독/결제)          │
                                    └───────────┬─────────────┘
                                                │ SNS
                                                ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                           HTML ReWriter 서비스 (AWS)                          │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         CloudFront Distribution                          │ │
│  │                                                                          │ │
│  │   *.html-rewriter.com                                                   │ │
│  │   customer1.html-rewriter.com ─┐                                        │ │
│  │   customer2.html-rewriter.com ─┼─→ Lambda@Edge (Origin Request)         │ │
│  │   customer3.html-rewriter.com ─┘                                        │ │
│  │                                                                          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                        │
│                    ┌─────────────────┼─────────────────┐                     │
│                    ▼                 ▼                 ▼                     │
│  ┌──────────────────────┐ ┌──────────────────┐ ┌──────────────────────────┐ │
│  │   Lambda@Edge        │ │   API Gateway    │ │   Lambda (Marketplace)   │ │
│  │   (HTML Rewriter)    │ │   (Management)   │ │   (SNS Handler)          │ │
│  │                      │ │                  │ │                          │ │
│  │   • 봇 감지          │ │   • 고객 등록    │ │   • 구독 처리            │ │
│  │   • 규칙 조회        │ │   • 규칙 CRUD    │ │   • 미터링 보고          │ │
│  │   • HTML 변환        │ │   • 사용량 조회  │ │   • 권한 확인            │ │
│  │   • 캐싱             │ │                  │ │                          │ │
│  └──────────┬───────────┘ └────────┬─────────┘ └─────────────┬────────────┘ │
│             │                      │                         │               │
│             └──────────────────────┼─────────────────────────┘               │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                           DynamoDB Tables                                │ │
│  │                                                                          │ │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐ │ │
│  │   │  Customers  │  │   Rules     │  │   Usage     │  │  EdgeConfig   │ │ │
│  │   │             │  │             │  │             │  │               │ │ │
│  │   │ • 고객정보  │  │ • 매핑규칙  │  │ • 사용량    │  │ • 원본서버   │ │ │
│  │   │ • AWS계정   │  │ • 경로별    │  │ • 일별집계  │  │ • 캐시설정   │ │ │
│  │   │ • 구독상태  │  │ • Meta태그  │  │ • 미터링    │  │ • 봇목록     │ │ │
│  │   └─────────────┘  └─────────────┘  └─────────────┘  └───────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                        관리자 대시보드 (React)                           │ │
│  │                                                                          │ │
│  │   • 고객 온보딩        • 규칙 설정 UI       • 사용량 모니터링           │ │
│  │   • 도메인 발급        • Meta 태그 편집기   • 빌링 현황                  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ fetch (원본 요청)
                                      ▼
                    ┌─────────────────────────────────────┐
                    │         고객 원본 서버               │
                    │                                      │
                    │   AWS / GCP / Azure / Vercel /       │
                    │   Netlify / 온프레미스 / 기타        │
                    │                                      │
                    │   (아무 프레임워크나 인프라 가능)    │
                    └─────────────────────────────────────┘
```

---

## 3. 데이터 흐름

### 3.1 일반 사용자 요청

```
사용자 → www.customer.com (CNAME) → customer123.html-rewriter.com
       → CloudFront → Lambda@Edge (봇 아님 → 패스스루)
       → 원본 서버 → 원본 HTML 그대로 반환
```

### 3.2 검색엔진 봇 요청

```
Googlebot → www.customer.com (CNAME) → customer123.html-rewriter.com
          → CloudFront → Lambda@Edge
                         ├─ 1. User-Agent로 봇 감지
                         ├─ 2. DynamoDB에서 규칙 조회
                         ├─ 3. 원본 서버에서 HTML fetch
                         ├─ 4. HTMLParser로 Meta 태그 주입
                         └─ 5. 수정된 HTML 반환
          → Googlebot (SEO 최적화된 HTML 수신)
```

### 3.3 AWS Marketplace 구독 흐름

```
고객 → AWS Marketplace 구독
     → SNS 알림 (subscribe-success)
     → Lambda (Marketplace Handler)
        ├─ ResolveCustomer API 호출
        ├─ DynamoDB에 고객 정보 저장
        └─ Fulfillment URL로 리다이렉트
     → 대시보드 (고객 온보딩)
        ├─ 원본 서버 URL 입력
        ├─ 규칙 설정
        └─ 프록시 도메인 발급
     → 고객 DNS에 CNAME 설정
     → 서비스 시작
```

---

## 4. DynamoDB 스키마

### 4.1 Customers 테이블

```
PK: CUSTOMER#{customerId}
SK: METADATA

Attributes:
{
  customerId: string,           // AWS Marketplace Customer ID
  awsAccountId: string,         // 고객 AWS 계정 ID
  email: string,
  companyName: string,
  subscriptionStatus: "active" | "pending" | "cancelled",
  subscribedAt: string (ISO8601),
  plan: "basic" | "pro" | "enterprise",
  proxyDomain: string,          // customer123.html-rewriter.com
  originUrl: string,            // https://www.customer.com
  createdAt: string,
  updatedAt: string
}
```

### 4.2 Rules 테이블

```
PK: CUSTOMER#{customerId}
SK: RULE#{ruleId}

Attributes:
{
  ruleId: string,
  customerId: string,
  path: string,                 // "/product/:id" 또는 정규식
  pathType: "exact" | "pattern" | "regex",
  priority: number,             // 낮을수록 우선
  metaTags: {
    title: string,
    description: string,
    ogTitle: string,
    ogDescription: string,
    ogImage: string,
    // ... 기타 meta 태그
  },
  dynamicFields: [              // 동적 필드 (API에서 값 조회)
    {
      field: "title",
      source: "api",
      endpoint: "https://api.customer.com/product/{id}",
      jsonPath: "$.name"
    }
  ],
  enabled: boolean,
  createdAt: string,
  updatedAt: string
}
```

### 4.3 EdgeConfig 테이블

```
PK: CUSTOMER#{customerId}
SK: CONFIG

Attributes:
{
  customerId: string,
  originUrl: string,
  originHeaders: {              // 원본 요청 시 추가할 헤더
    "X-Forwarded-Host": "{original_host}"
  },
  cacheSettings: {
    enabled: boolean,
    ttl: number                 // 초 단위
  },
  botUserAgents: string[],      // 커스텀 봇 목록
  enabledPaths: string[],       // 적용할 경로 (없으면 전체)
  excludedPaths: string[],      // 제외할 경로
  fallbackBehavior: "passthrough" | "error",
  updatedAt: string
}
```

### 4.4 Usage 테이블

```
PK: CUSTOMER#{customerId}
SK: USAGE#{date}#{hour}

Attributes:
{
  customerId: string,
  date: string,                 // "2026-02-10"
  hour: number,                 // 0-23
  totalRequests: number,
  botRequests: number,
  htmlProcessed: number,        // 바이트
  cacheHits: number,
  cacheMisses: number,
  errors: number,
  avgLatencyMs: number
}

GSI: CustomerDateIndex
  PK: customerId
  SK: date
```

---

## 5. Lambda@Edge 함수 설계

### 5.1 트리거 포인트

| 이벤트 | 함수 | 용도 |
|--------|------|------|
| Origin Request | html-rewriter-origin | 봇 감지, HTML 변환 |
| Origin Response | html-rewriter-cache | 캐시 헤더 설정 |

### 5.2 Origin Request 처리 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│                    Lambda@Edge (Origin Request)                  │
│                                                                  │
│   1. 요청 파싱                                                  │
│      ├─ Host 헤더에서 customerId 추출                          │
│      ├─ User-Agent 확인                                         │
│      └─ 요청 경로 확인                                          │
│                                                                  │
│   2. 봇 여부 확인                                               │
│      ├─ 봇 아님 → 원본으로 패스스루                            │
│      └─ 봇 → 다음 단계                                          │
│                                                                  │
│   3. 규칙 조회 (DynamoDB)                                       │
│      ├─ EdgeConfig 조회                                         │
│      └─ 매칭되는 Rule 조회                                      │
│                                                                  │
│   4. 원본 서버 요청                                             │
│      └─ fetch(originUrl + path)                                 │
│                                                                  │
│   5. HTML 변환                                                  │
│      ├─ 기존 Meta 태그 제거/수정                               │
│      ├─ 새 Meta 태그 주입                                       │
│      └─ 동적 필드 처리 (필요시 외부 API 호출)                  │
│                                                                  │
│   6. 응답 반환                                                  │
│      └─ 수정된 HTML + 캐시 헤더                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. API 설계

### 6.1 Management API (API Gateway + Lambda)

#### 고객 관리

```
POST   /api/customers              # 고객 등록 (Marketplace webhook)
GET    /api/customers/{id}         # 고객 정보 조회
PUT    /api/customers/{id}         # 고객 정보 수정
DELETE /api/customers/{id}         # 고객 삭제 (구독 취소)
```

#### 규칙 관리

```
GET    /api/customers/{id}/rules           # 규칙 목록
POST   /api/customers/{id}/rules           # 규칙 생성
GET    /api/customers/{id}/rules/{ruleId}  # 규칙 조회
PUT    /api/customers/{id}/rules/{ruleId}  # 규칙 수정
DELETE /api/customers/{id}/rules/{ruleId}  # 규칙 삭제
```

#### Edge 설정

```
GET    /api/customers/{id}/config          # Edge 설정 조회
PUT    /api/customers/{id}/config          # Edge 설정 수정
POST   /api/customers/{id}/config/test     # 설정 테스트
```

#### 사용량/빌링

```
GET    /api/customers/{id}/usage                    # 사용량 조회
GET    /api/customers/{id}/usage/summary            # 사용량 요약
GET    /api/customers/{id}/billing                  # 빌링 정보
```

---

## 7. 보안 설계

### 7.1 인증/인가

| 대상 | 방식 |
|------|------|
| 대시보드 | AWS Cognito + JWT |
| Management API | API Key + IAM |
| Lambda@Edge | IAM Role |
| 원본 서버 | Origin Header Secret |

### 7.2 데이터 보호

- DynamoDB: 암호화 활성화 (AWS managed key)
- 전송 중: TLS 1.2+
- API Key: Secrets Manager 저장
- 고객 원본 헤더: 암호화 저장

### 7.3 접근 제어

```yaml
# Lambda@Edge IAM Role
Policies:
  - DynamoDB: Read (Rules, EdgeConfig)
  - DynamoDB: Write (Usage)
  - CloudWatch: PutMetricData

# Management Lambda IAM Role
Policies:
  - DynamoDB: Full (all tables)
  - Marketplace: MeterUsage, GetEntitlement
  - SES: SendEmail (알림용)
```

---

## 8. 확장성 및 성능

### 8.1 캐싱 전략

| 레벨 | 대상 | TTL |
|------|------|-----|
| CloudFront | 변환된 HTML | 고객 설정 (기본 1시간) |
| Lambda@Edge | 규칙 캐시 | 5분 |
| DynamoDB DAX | Hot data | 1분 |

### 8.2 성능 목표

| 지표 | 목표 |
|------|------|
| 응답 시간 (P50) | < 100ms |
| 응답 시간 (P99) | < 500ms |
| 가용성 | 99.9% |
| 처리량 | 10,000 req/sec |

### 8.3 비용 최적화

- Lambda@Edge: us-east-1 배포 (필수)
- DynamoDB: On-demand → Provisioned (트래픽 예측 가능 시)
- CloudFront: Reserved capacity (대용량 고객)

---

## 9. 모니터링

### 9.1 CloudWatch 메트릭

```
HTMLRewriter/Requests          # 총 요청 수
HTMLRewriter/BotRequests       # 봇 요청 수
HTMLRewriter/ProcessedBytes    # 처리된 HTML 바이트
HTMLRewriter/Latency           # 처리 지연 시간
HTMLRewriter/Errors            # 에러 수
HTMLRewriter/CacheHitRate      # 캐시 히트율
```

### 9.2 알람

| 알람 | 조건 | 액션 |
|------|------|------|
| High Error Rate | 에러율 > 5% (5분) | SNS → PagerDuty |
| High Latency | P99 > 1초 (5분) | SNS → Slack |
| DynamoDB Throttle | ThrottledRequests > 0 | Auto-scaling |

---

## 10. 배포 전략

### 10.1 인프라 (Terraform/CDK)

```
/infra
  /terraform
    main.tf
    cloudfront.tf
    lambda.tf
    dynamodb.tf
    api-gateway.tf
    iam.tf
```

### 10.2 CI/CD

```
main branch push
  → GitHub Actions
    → Build Lambda functions
    → Run tests
    → Deploy to staging
    → Integration tests
    → Deploy to production (manual approval)
```

---

*작성일: 2026-02-10*
*버전: 2.0 (Edge 기반 아키텍처)*
