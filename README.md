# HTML Rewriter SDK

SEO 최적화를 위한 HTML 리라이팅 SDK. CSR 애플리케이션에 동적으로 Meta 태그를 주입합니다.

## 패키지

| 패키지 | 설명 | 버전 |
|--------|------|------|
| `html-rewriter-seo-core` | 공통 로직 (봇 감지, Meta 태그 주입) | 0.1.2 |
| `html-rewriter-seo-nextjs` | Next.js 미들웨어 SDK | 0.1.2 |

## 설치

저장소 Collaborator로 초대받은 후 바로 설치 가능합니다. (별도 설정 불필요)

```bash
npm install github:rkddls8138/html-rewriter#pkg/sdk-nextjs
```

> core 패키지는 sdk-nextjs의 의존성으로 자동 설치됩니다.

## 사용법

```typescript
// middleware.ts
import { createHtmlRewriterMiddleware } from 'html-rewriter-seo-nextjs';

const middleware = createHtmlRewriterMiddleware({
  rules: [
    {
      path: '/',
      metaTags: {
        title: '내 서비스 - SEO 최적화',
        description: 'SEO 최적화된 페이지입니다.',
        ogTitle: '내 서비스',
        ogType: 'website',
      },
    },
  ],
  debug: true,
});

export default middleware;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 빌드
npm run build

# 개발 모드 (watch)
npm run dev

# 타입 체크
npm run typecheck
```

## 문서

- [테스터 가이드](./TESTER_GUIDE.md)
- [아키텍처 설계](./docs/ARCHITECTURE.md)
- [SDK 설정 가이드](./docs/SDK_SETUP.md)

## 라이센스

MIT
