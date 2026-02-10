# HTML Rewriter SDK

SEO 최적화를 위한 Meta 태그 관리 SDK. Next.js App Router와 Pages Router 모두 지원합니다.

## 패키지

| 패키지 | 설명 | 버전 |
|--------|------|------|
| `html-rewriter-seo-core` | 공통 로직 (타입, 유틸리티) | 0.2.0 |
| `html-rewriter-seo-nextjs` | Next.js SDK | 0.2.0 |

## 설치

```bash
npm install github:rkddls8138/html-rewriter#pkg/sdk-nextjs
```

## 사용법

### App Router (Next.js 13+)

```typescript
// app/product/[id]/page.tsx
import { generateSeoMetadata } from 'html-rewriter-seo-nextjs';

export async function generateMetadata({ params }: { params: { id: string } }) {
  return generateSeoMetadata({
    title: `상품 ${params.id}`,
    description: '상품 상세 페이지입니다.',
    ogType: 'product',
    ogImage: 'https://example.com/image.png',
  });
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return <div>상품 {params.id}</div>;
}
```

### Pages Router

```typescript
// pages/product/[id].tsx
import { SeoHead } from 'html-rewriter-seo-nextjs';

export default function ProductPage({ product }) {
  return (
    <>
      <SeoHead
        title={product.name}
        description={product.description}
        ogImage={product.image}
        ogType="product"
      />
      <main>{product.name}</main>
    </>
  );
}
```

### 동적 메타데이터

```typescript
// app/product/[id]/page.tsx
import { generateDynamicSeoMetadata } from 'html-rewriter-seo-nextjs';

export async function generateMetadata({ params }) {
  return generateDynamicSeoMetadata(async () => {
    const product = await fetch(`/api/products/${params.id}`).then(r => r.json());
    return {
      title: product.name,
      description: product.description,
      ogImage: product.image,
    };
  });
}
```

## 지원 Meta 태그

```typescript
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
```

## 개발 환경 설정

```bash
npm install
npm run build
npm run dev
npm run typecheck
```

## 문서

- [테스터 가이드](./TESTER_GUIDE.md)

## 라이센스

MIT
