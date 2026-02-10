# HTML Rewriter SDK - 테스터 설치 가이드

## 설치 방법

### 1. 저장소 접근 권한 확인

GitHub 저장소 Collaborator로 초대받아야 설치 가능합니다.

### 2. 패키지 설치

별도 설정 없이 바로 설치:

```bash
npm install github:rkddls8138/html-rewriter#pkg/sdk-nextjs
```

> core 패키지는 sdk-nextjs의 의존성으로 자동 설치됩니다.

---

## Next.js 프로젝트 설정

### 1. middleware.ts 생성

프로젝트 루트(또는 `src/`)에 `middleware.ts` 파일 생성:

```typescript
// middleware.ts
import { createHtmlRewriterMiddleware } from 'html-rewriter-seo-nextjs';

const middleware = createHtmlRewriterMiddleware({
  rules: [
    // 홈페이지
    {
      path: '/',
      metaTags: {
        title: '내 서비스 - SEO 최적화 테스트',
        description: 'HTML Rewriter SDK 테스트 페이지입니다.',
        ogTitle: '내 서비스',
        ogDescription: 'SEO 최적화를 위한 HTML Rewriter',
        ogImage: 'https://example.com/og-image.png',
        ogType: 'website',
      },
    },

    // 동적 경로 예시
    {
      path: '/product/:id',
      metaTags: async (url, params) => {
        return {
          title: `상품 ${params.id} - 내 쇼핑몰`,
          description: `상품 ${params.id}의 상세 페이지입니다.`,
          ogType: 'product',
        };
      },
    },

    // 와일드카드 예시
    {
      path: '/blog/:slug',
      metaTags: (url, params) => ({
        title: `블로그 - ${params.slug}`,
        description: '블로그 포스트',
        ogType: 'article',
      }),
    },
  ],

  // 캐시 설정
  cache: {
    enabled: true,
    ttl: 3600, // 1시간
  },

  // 개발 중에는 true로 설정하여 로그 확인
  debug: true,
});

export default middleware;

export const config = {
  matcher: [
    // API, 정적 파일 제외
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
```

### 2. 테스트

```bash
# 개발 서버 실행
npm run dev

# 터미널에서 봇으로 테스트
curl -A "Googlebot" http://localhost:3000/

# 일반 요청 (동일한 결과 확인 - SEO 정책 준수)
curl http://localhost:3000/
```

### 3. 결과 확인

**모든 요청 시 (봇 및 일반 사용자):**
```html
<head>
    <title>내 서비스 - SEO 최적화 테스트</title>
    <meta name="description" content="HTML Rewriter SDK 테스트 페이지입니다.">
    <meta property="og:title" content="내 서비스">
    <meta property="og:description" content="SEO 최적화를 위한 HTML Rewriter">
    ...
</head>
```

> **참고:** Google SEO 정책 준수를 위해 봇과 일반 사용자에게 동일한 HTML을 제공합니다.

---

## 지원 Meta 태그

```typescript
interface MetaTags {
  // 기본
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  robots?: string;

  // Open Graph
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;         // website, article, product 등
  ogSiteName?: string;

  // Twitter Card
  twitterCard?: string;    // summary, summary_large_image 등
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;    // @username

  // 커스텀
  custom?: Record<string, string>;
}
```

---

## 문제 해결

### GitHub 인증 오류

```bash
# SSH 키 등록 확인
ssh -T git@github.com

# HTTPS 사용시 - 저장소 Collaborator 권한 확인
```

### TypeScript 타입 오류

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 미들웨어가 작동하지 않을 때

1. `middleware.ts` 위치 확인 (프로젝트 루트 또는 `src/`)
2. `matcher` 설정 확인
3. `debug: true` 설정 후 콘솔 로그 확인

---

## 피드백

테스트 중 발견한 버그나 개선 사항은 GitHub Issues에 등록해주세요.

- 이슈 등록: https://github.com/rkddls8138/html-rewriter/issues
