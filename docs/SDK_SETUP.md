# HTML Rewriter SDK - Next.js 설치 가이드

## 로컬 개발 환경에서 테스트

### 1. SDK 빌드

```bash
cd c:\git\html-rewriter

# 의존성 설치
pnpm install

# 빌드
pnpm build
```

### 2. 글로벌 링크 설정

```bash
# SDK를 글로벌로 링크
pnpm link:global
```

### 3. Next.js 프로젝트에서 링크

```bash
# 본인의 Next.js 프로젝트로 이동
cd [your-nextjs-project]

# 글로벌 링크된 패키지 연결
pnpm link --global @html-rewriter/core
pnpm link --global @html-rewriter/nextjs
```

---

## Next.js 프로젝트 설정

### 1. middleware.ts 생성

프로젝트 루트에 `middleware.ts` 파일 생성:

```typescript
// middleware.ts
import { createHtmlRewriterMiddleware } from '@html-rewriter/nextjs';

const middleware = createHtmlRewriterMiddleware({
  rules: [
    // 홈페이지
    {
      path: '/',
      metaTags: {
        title: '내 서비스 - 홈',
        description: '서비스 소개 페이지입니다.',
        ogTitle: '내 서비스',
        ogDescription: '최고의 서비스를 제공합니다.',
        ogImage: 'https://example.com/og-home.png',
        ogType: 'website',
      },
    },

    // 동적 경로 (상품 페이지)
    {
      path: '/product/:id',
      metaTags: async (url, params) => {
        // 실제로는 API나 DB에서 데이터 조회
        const productId = params.id;

        // 예시: 하드코딩된 데이터
        const products: Record<string, any> = {
          '1': { name: '상품 A', description: '상품 A 설명', image: '/product-a.jpg' },
          '2': { name: '상품 B', description: '상품 B 설명', image: '/product-b.jpg' },
        };

        const product = products[productId] || { name: '상품', description: '상품 설명' };

        return {
          title: `${product.name} - 내 쇼핑몰`,
          description: product.description,
          ogTitle: product.name,
          ogDescription: product.description,
          ogImage: product.image,
          ogType: 'product',
        };
      },
    },

    // 블로그 (정규식 패턴)
    {
      path: '/blog/:slug',
      metaTags: async (url, params) => {
        return {
          title: `블로그 - ${params.slug}`,
          description: '블로그 포스트입니다.',
          ogType: 'article',
        };
      },
    },
  ],

  cache: {
    enabled: true,
    ttl: 3600, // 1시간 캐시
  },

  debug: true, // 개발 중에는 true로 설정
});

export default middleware;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 2. Provider 설정 (선택사항)

클라이언트 사이드에서도 Meta 태그를 동적으로 변경하려면:

```tsx
// app/layout.tsx
import { HtmlRewriterProvider } from '@html-rewriter/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
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

### 3. 페이지에서 동적 Meta 태그 설정

```tsx
// app/product/[id]/page.tsx
'use client';

import { usePageMeta } from '@html-rewriter/nextjs';
import { useEffect, useState } from 'react';

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    // 상품 데이터 로드
    fetch(`/api/products/${params.id}`)
      .then(res => res.json())
      .then(setProduct);
  }, [params.id]);

  // Meta 태그 자동 업데이트
  usePageMeta(
    product
      ? {
          title: `${product.name} - 내 쇼핑몰`,
          description: product.description,
          ogImage: product.imageUrl,
        }
      : {},
    [product]
  );

  if (!product) return <div>로딩 중...</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}
```

---

## 테스트 방법

### 1. 개발 서버 실행

```bash
cd [your-nextjs-project]
pnpm dev
```

### 2. 봇으로 테스트

```bash
# Googlebot으로 요청
curl -A "Googlebot" http://localhost:3000/

# 일반 브라우저로 요청 (비교용)
curl http://localhost:3000/
```

### 3. 디버그 로그 확인

`debug: true` 설정 시 터미널에 다음과 같은 로그가 출력됩니다:

```
[HtmlRewriter] Request: /product/1
[HtmlRewriter] User-Agent: Googlebot
[HtmlRewriter] Injected meta tags for /product/1
```

---

## 문제 해결

### pnpm link가 작동하지 않을 때

```bash
# 기존 링크 정리
pnpm unlink --global @html-rewriter/core
pnpm unlink --global @html-rewriter/nextjs

# node_modules 삭제 후 재설치
rm -rf node_modules
pnpm install

# 다시 링크
pnpm link:global
```

### TypeScript 에러 발생 시

```bash
# SDK 재빌드
cd c:\git\html-rewriter
pnpm build

# Next.js 프로젝트 재시작
cd [your-nextjs-project]
pnpm dev
```

---

## npm 배포 (나중에)

```bash
cd c:\git\html-rewriter

# npm 로그인
npm login

# 배포
cd packages/core && npm publish --access public
cd ../sdk-nextjs && npm publish --access public
```
