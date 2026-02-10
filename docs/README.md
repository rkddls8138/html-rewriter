# HTML Rewriter SDK

SEO 최적화를 위한 HTML 리라이팅 라이브러리. 검색엔진 봇에게 최적화된 Meta 태그를 동적으로 제공합니다.

## 특징

- **봇 감지**: Google, Bing 등 주요 검색엔진 봇 자동 감지
- **동적 Meta 태그**: 경로별 Meta 태그 규칙 설정
- **캐싱**: 성능 최적화를 위한 내장 캐시
- **CSR 지원**: Client Side Rendering 환경에서도 SEO 최적화

## 설치

```bash
pnpm add @html-rewriter/nextjs
# 또는
npm install @html-rewriter/nextjs
```

## Quick Start (Next.js)

### 1. 미들웨어 설정

`middleware.ts` 파일을 프로젝트 루트에 생성:

```typescript
// middleware.ts
import { createHtmlRewriterMiddleware } from '@html-rewriter/nextjs';

const middleware = createHtmlRewriterMiddleware({
  rules: [
    // 정적 Meta 태그
    {
      path: '/',
      metaTags: {
        title: '홈페이지 - 내 서비스',
        description: '서비스 소개 페이지입니다.',
        ogTitle: '홈페이지 - 내 서비스',
        ogDescription: '서비스 소개 페이지입니다.',
        ogImage: 'https://example.com/og-image.png',
      },
    },

    // 동적 Meta 태그 (URL 파라미터 사용)
    {
      path: '/product/:id',
      metaTags: async (url, params) => {
        // DB에서 상품 정보 조회
        const product = await fetchProduct(params.id);
        return {
          title: `${product.name} - 내 쇼핑몰`,
          description: product.description,
          ogTitle: product.name,
          ogDescription: product.description,
          ogImage: product.imageUrl,
          ogType: 'product',
        };
      },
    },

    // 정규식 패턴
    {
      path: /^\/blog\/(.+)$/,
      metaTags: async (url) => {
        const slug = url.split('/blog/')[1];
        const post = await fetchBlogPost(slug);
        return {
          title: post.title,
          description: post.excerpt,
          ogType: 'article',
        };
      },
    },
  ],

  cache: {
    enabled: true,
    ttl: 3600, // 1시간
  },

  debug: process.env.NODE_ENV === 'development',
});

export default middleware;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 2. Provider 설정 (선택사항)

클라이언트 사이드에서도 Meta 태그를 관리하려면:

```tsx
// app/layout.tsx
import { HtmlRewriterProvider } from '@html-rewriter/nextjs';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <HtmlRewriterProvider
          defaultTags={{
            ogSiteName: '내 서비스',
            twitterCard: 'summary_large_image',
          }}
        >
          {children}
        </HtmlRewriterProvider>
      </body>
    </html>
  );
}
```

### 3. 페이지에서 사용

```tsx
// app/product/[id]/page.tsx
'use client';

import { usePageMeta } from '@html-rewriter/nextjs';

export default function ProductPage({ product }) {
  // 페이지 마운트 시 Meta 태그 자동 설정
  usePageMeta({
    title: `${product.name} - 내 쇼핑몰`,
    description: product.description,
    ogImage: product.imageUrl,
  }, [product.id]);

  return (
    <div>
      <h1>{product.name}</h1>
      {/* ... */}
    </div>
  );
}
```

## API Reference

### MetaTags

```typescript
interface MetaTags {
  // 기본 태그
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
  ogType?: string;
  ogSiteName?: string;

  // Twitter Card
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;

  // 커스텀 태그
  custom?: Record<string, string>;
}
```

### RewriteRule

```typescript
interface RewriteRule {
  // 경로 패턴 (문자열 또는 정규식)
  path: string | RegExp;

  // Meta 태그 (정적 또는 동적 함수)
  metaTags: MetaTags | ((url: string, params: Record<string, string>) => MetaTags | Promise<MetaTags>);
}
```

### 설정 옵션

```typescript
interface HtmlRewriterMiddlewareConfig {
  rules: RewriteRule[];

  cache?: {
    enabled: boolean;
    ttl: number; // 초 단위
  };

  // 커스텀 봇 User-Agent 목록
  botUserAgents?: string[];

  // 모든 사용자에게 적용 (봇 외)
  applyToAllUsers?: boolean;

  // 디버그 로깅
  debug?: boolean;
}
```

## 지원 검색엔진 봇

기본 지원 봇:
- Googlebot
- Bingbot
- Yandexbot
- DuckDuckBot
- Baiduspider
- facebookexternalhit
- Twitterbot
- LinkedInBot
- WhatsApp
- Telegrambot

커스텀 봇 추가:
```typescript
createHtmlRewriterMiddleware({
  botUserAgents: ['MyCustomBot', 'AnotherBot'],
  // ...
});
```

## 개발

```bash
# 의존성 설치
pnpm install

# 빌드
pnpm build

# 개발 모드
pnpm dev
```

## 라이센스

MIT
