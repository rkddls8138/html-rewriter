# HTML Rewriter 프로젝트 작업 계획서

## 1. 프로젝트 개요

### 1.1 목적
SEO 최적화를 위한 HTML 리팩토링 라이브러리 개발 및 AWS Marketplace 등록

### 1.2 주요 요구사항
- AWS Marketplace 등록을 위한 CIS 벤치마크 준수
- Partner Hosted Foundational Technical Review Self-Assessment 통과

### 1.3 참고 문서
| 구분 | 링크/경로 |
|------|-----------|
| CIS 벤치마크 | https://docs.aws.amazon.com/ko_kr/audit-manager/latest/userguide/CIS-1-4.html |
| SaaS 제품 설정 | https://docs.aws.amazon.com/marketplace/latest/userguide/saas-product-settings.html |
| Self-Assessment | `C:\Users\gi.kim\Downloads\Partner Hosted Foundational Technical Review Self-Assessment (1).xlsx` |

---

## 2. 작업 단계별 계획

### Phase 1: 분석 및 설계 (2주)

#### 2.1 프레임워크별 대응 분석
| 작업 | 설명 | 우선순위 |
|------|------|----------|
| React SDK 설계 | Next.js, CRA 환경 지원, 페이지/경로별 적용 | P0 |
| Vue SDK 설계 | Nuxt.js 환경 지원 | P0 |
| Angular SDK 설계 | Universal(SSR) 지원 | P1 |
| Svelte SDK 설계 | SvelteKit 환경 지원 | P2 |
| Spring SDK 설계 | Java/Kotlin 백엔드 지원 | P1 |
| PHP SDK 설계 | Laravel, WordPress 플러그인 | P2 |

**핵심 고려사항:**
- 전역 적용 X → 특정 페이지/경로 단위 적용 (비용 최적화)
- API 호출 최소화를 위한 캐싱 전략 필수

#### 2.2 인프라 설정별 대응 분석
| 구성 | 대응 방안 |
|------|----------|
| CDN 사용 | Origin Shield 패턴, Edge Function 연동 |
| CDN 미사용 | 직접 미들웨어 주입 |
| 리버스 프록시 (Nginx/Apache) | Lua 모듈 또는 mod_rewrite 확장 |
| 컨테이너 환경 | Sidecar 패턴 적용 |

#### 2.3 CSR/SSR 렌더링 대응
| 검색엔진 | 대응 방법 |
|----------|----------|
| Google | Dynamic Rendering (Puppeteer/Playwright) |
| Bing | User-Agent 기반 분기 처리 |

**구현 방식:**
1. User-Agent 감지 → 봇 여부 판별
2. 봇인 경우 → Pre-rendered HTML 제공
3. 일반 사용자 → 원본 CSR 제공

---

### Phase 2: 아키텍처 설계 (1주)

#### 2.4 서버 인프라 권장 구성

**권장 아키텍처: Serverless + Edge Computing**

```
┌─────────────────────────────────────────────────────────────┐
│                      Route 53 (DNS)                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              CloudFront (CDN + Edge Functions)              │
│  - Lambda@Edge: User-Agent 감지, HTML 변환                  │
│  - 캐싱: 변환된 HTML 캐싱 (비용 절감)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    API Gateway                               │
│  - 사용량 제한 (Rate Limiting)                               │
│  - API Key 관리                                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              Lambda (HTML Rewriting 로직)                    │
│  - 저비용, Auto-scaling                                      │
│  - Cold start 최소화 (Provisioned Concurrency)              │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
┌─────────▼─────────┐         ┌───────────▼───────────┐
│   DynamoDB        │         │   S3                   │
│   - 사용량 로그   │         │   - 변환 규칙 저장    │
│   - 고객 설정     │         │   - 캐시 저장         │
└───────────────────┘         └───────────────────────┘
```

**대안 비교:**

| 옵션 | 장점 | 단점 | 월 예상 비용 |
|------|------|------|-------------|
| **Lambda + CloudFront (권장)** | 저비용, Auto-scaling, 관리 최소화 | Cold start | $50-200 |
| EC2 인스턴스 | 예측 가능한 성능 | 관리 부담, 고정 비용 | $200-500 |
| EKS 클러스터 | 확장성, 유연성 | 복잡한 운영, 높은 비용 | $500+ |

---

### Phase 3: SDK 개발 (4주)

#### 2.5 SDK 통합 관리 전략

**Monorepo 구조:**
```
html-rewriter/
├── packages/
│   ├── core/           # 공통 로직 (HTML 파싱, 변환)
│   ├── sdk-react/      # React SDK
│   ├── sdk-vue/        # Vue SDK
│   ├── sdk-angular/    # Angular SDK
│   ├── sdk-svelte/     # Svelte SDK
│   ├── sdk-node/       # Node.js 미들웨어
│   ├── sdk-java/       # Spring SDK
│   └── sdk-php/        # PHP SDK
├── tools/
│   ├── cli/            # CLI 도구
│   └── dashboard/      # 관리 대시보드
└── docs/               # 문서화
```

**핵심 기능:**
- 공통 Core 라이브러리로 로직 통일
- 프레임워크별 래퍼 SDK 제공
- 버전 동기화 (Lerna/Turborepo)

#### 2.6 미들웨어 패턴

**Node.js (Express/Fastify):**
```javascript
// 예시 구조
app.use('/seo/*', htmlRewriterMiddleware({
  apiKey: process.env.HTML_REWRITER_API_KEY,
  rules: ['meta-optimization', 'structured-data'],
  cache: { ttl: 3600 }
}));
```

**주요 미들웨어 기능:**
1. 경로 필터링 (특정 경로만 적용)
2. User-Agent 기반 분기
3. 응답 캐싱
4. 에러 핸들링 (Fallback to original)

---

### Phase 4: AWS Marketplace 통합 (2주)

#### 2.7 결제 및 대시보드 연동

**결제 플로우:**
```
AWS Marketplace 구독
        │
        ▼
SNS 알림 수신 (구독 이벤트)
        │
        ▼
Lambda 처리 → 고객 정보 저장 (DynamoDB)
        │
        ▼
대시보드 리다이렉트 URL 생성
        │
        ▼
고객 온보딩 페이지 표시
```

**필수 구현 항목:**

| 항목 | 설명 |
|------|------|
| SNS 구독 처리 | `aws-marketplace-subscription` 이벤트 핸들링 |
| 고객 대시보드 | API 사용량, 빌링 현황, 설정 관리 |
| 사용량 미터링 | AWS Marketplace Metering API 연동 |
| 리다이렉트 처리 | Marketplace → 자체 대시보드 |

#### 2.8 API 사용량 모니터링

**로깅 항목:**
- API 호출 횟수 (시간별/일별/월별)
- 처리된 HTML 크기 (MB)
- 응답 시간 (평균/P95/P99)
- 에러율
- 고객별 사용량

**저장소:** CloudWatch Logs + DynamoDB (집계 데이터)

---

### Phase 5: 보안 및 컴플라이언스 (1주)

#### 2.9 CIS 벤치마크 준수 체크리스트

| 항목 | 상태 | 담당 |
|------|------|------|
| IAM 최소 권한 원칙 | ⬜ | 인프라 |
| S3 버킷 암호화 | ⬜ | 인프라 |
| VPC 보안 그룹 설정 | ⬜ | 인프라 |
| CloudTrail 로깅 활성화 | ⬜ | 인프라 |
| KMS 키 관리 | ⬜ | 인프라 |
| WAF 설정 | ⬜ | 보안 |

#### 2.10 Partner Hosted FTR 준비

- [ ] 아키텍처 다이어그램 작성
- [ ] 데이터 흐름 문서화
- [ ] 보안 정책 문서화
- [ ] 인시던트 대응 절차 수립
- [ ] Self-Assessment 엑셀 작성

---

## 3. 일정 요약

| Phase | 기간 | 산출물 |
|-------|------|--------|
| Phase 1: 분석 및 설계 | 2주 | 요구사항 명세서, 프레임워크 분석 문서 |
| Phase 2: 아키텍처 설계 | 1주 | 아키텍처 문서, 인프라 설계서 |
| Phase 3: SDK 개발 | 4주 | Core 라이브러리, 프레임워크별 SDK |
| Phase 4: AWS 통합 | 2주 | Marketplace 연동, 대시보드 |
| Phase 5: 보안/컴플라이언스 | 1주 | CIS 체크리스트, FTR 문서 |

**총 예상 기간: 10주**

---

## 4. 리스크 및 대응

| 리스크 | 영향 | 대응 방안 |
|--------|------|----------|
| Cold Start 지연 | 사용자 경험 저하 | Provisioned Concurrency, 워밍업 스케줄링 |
| API 비용 폭증 | 수익성 악화 | 캐싱 전략, 사용량 제한 |
| 프레임워크 버전 호환성 | 지원 범위 축소 | 주요 버전만 지원, 호환성 매트릭스 관리 |
| AWS Marketplace 심사 지연 | 출시 일정 지연 | 사전 검토, 체크리스트 준수 |

---

## 5. 다음 단계 (Immediate Actions)

1. **Self-Assessment 엑셀 파일 분석** - AWS 요구사항 상세 파악
2. **프레임워크 우선순위 확정** - 고객 수요 기반 결정
3. **PoC 개발** - Lambda@Edge + CloudFront 기반 프로토타입
4. **SDK Core 설계** - 공통 인터페이스 정의

---

*작성일: 2026-02-09*
*버전: 1.0*
