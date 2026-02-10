# HTML Rewriter SDK - 테스터 설치 가이드

## 설치 방법

### 1. GitHub 저장소 접근 권한 확인

이 SDK는 Private 저장소입니다. 초대를 받은 후 설치 가능합니다.

### 2. 패키지 설치

```bash
# pnpm 사용시
pnpm add git+https://github.com/rkddls8138/html-rewriter.git#packages/core
pnpm add git+https://github.com/rkddls8138/html-rewriter.git#packages/sdk-nextjs

# npm 사용시
npm install git+https://github.com/rkddls8138/html-rewriter.git#packages/core
npm install git+https://github.com/rkddls8138/html-rewriter.git#packages/sdk-nextjs

# yarn 사용시
yarn add git+https://github.com/rkddls8138/html-rewriter.git#packages/core
yarn add git+https://github.com/rkddls8138/html-rewriter.git#packages/sdk-nextjs
```

**또는 package.json에 직접 추가:**

```json
{
  "dependencies": {
    "html-rewriter-seo-core": "github:rkddls8138/html-rewriter#packages/core",
    "html-rewriter-seo-nextjs": "github:rkddls8138/html-rewriter#packages/sdk-nextjs"
  }
}
```

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
        // API에서 상품 정보 조회 (예시)
        // const product = await fetch(`/api/products/${params.id}`).then(r => r.json());

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
pnpm dev

# 터미널에서 봇으로 테스트
curl -A "Googlebot" http://localhost:3000/

# 일반 요청 (비교용)
curl http://localhost:3000/
```

### 3. 결과 확인

**봇 요청 시 (Googlebot):**
```html
<head>
    <title>내 서비스 - SEO 최적화 테스트</title>
    <meta name="description" content="HTML Rewriter SDK 테스트 페이지입니다.">
    <meta property="og:title" content="내 서비스">
    <meta property="og:description" content="SEO 최적화를 위한 HTML Rewriter">
    ...
</head>
```

**일반 요청 시:**
- 원본 HTML 그대로 반환 (변경 없음)

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

# HTTPS 사용시 Personal Access Token 필요
git config --global credential.helper store
```

### TypeScript 타입 오류

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 미들웨어가 작동하지 않을 때

1. `middleware.ts` 위치 확인 (프로젝트 루트 또는 `src/`)
2. `matcher` 설정 확인
3. `debug: true` 설정 후 콘솔 로그 확인

---

## 피드백

테스트 중 발견한 버그나 개선 사항은 GitHub Issues에 등록해주세요.

- 이슈 등록: https://github.com/rkddls8138/html-rewriter/issues
