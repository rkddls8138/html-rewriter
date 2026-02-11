# Pages Router SEO

Next.js Pages Router의 `next/head`와 `getServerSideProps`를 사용하는 SEO 메타 태그 관리 모듈입니다.

## 설치

```bash
npm install @rkddls8138/seo-nextjs
```

## 사용법

### 방법 1: API 기반 동적 메타 태그 (권장)

```typescript
// pages/product/[id].tsx
import { SeoHead, fetchSeoMetaForPages } from '@rkddls8138/seo-nextjs';
import type { GetServerSideProps } from 'next';
import type { MetaTags } from '@rkddls8138/seo-core';

interface Props {
  meta: MetaTags;
  product: Product;
}

export default function ProductPage({ meta, product }: Props) {
  return (
    <>
      <SeoHead {...meta} />
      <main>{product.name}</main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const meta = await fetchSeoMetaForPages(
    process.env.SEO_API_KEY!,
    `/product/${params?.id}`
  );
  const product = await fetchProduct(params?.id);

  return { props: { meta, product } };
};
```

### 방법 2: 재사용 가능한 Fetcher 생성

```typescript
// lib/seo.ts
import { createPagesMetaFetcher } from '@rkddls8138/seo-nextjs';

export const getSeoMeta = createPagesMetaFetcher({
  apiKey: process.env.SEO_API_KEY!,
  apiUrl: 'https://api.seo-rewriter.com',
  fallback: { title: '기본 타이틀' },
});

// pages/product/[id].tsx
import { getSeoMeta } from '@/lib/seo';

export const getServerSideProps = async ({ params }) => {
  const meta = await getSeoMeta(`/product/${params.id}`);
  const product = await fetchProduct(params.id);
  return { props: { meta, product } };
};
```

### 방법 3: withSeoMeta 래퍼 사용

```typescript
// pages/product/[id].tsx
import { SeoHead, withSeoMeta } from '@rkddls8138/seo-nextjs';

export default function ProductPage({ _seoMeta, product }) {
  return (
    <>
      <SeoHead {..._seoMeta} />
      <main>{product.name}</main>
    </>
  );
}

export const getServerSideProps = withSeoMeta(
  process.env.SEO_API_KEY!,
  async ({ params }) => {
    const product = await fetchProduct(params?.id);
    return { props: { product } };
  },
  (context) => `/product/${context.params?.id}`
);
```

### 방법 4: 정적 메타 태그

```typescript
// pages/product/[id].tsx
import { SeoHead } from '@rkddls8138/seo-nextjs';

export default function ProductPage({ product }) {
  return (
    <>
      <SeoHead
        title={product.name}
        description={product.description}
        ogImage={product.image}
        ogType="website"
      />
      <main>{product.name}</main>
    </>
  );
}
```

## API 참조

### `<SeoHead {...props} />`

Pages Router용 SEO Head 컴포넌트입니다. `MetaTags` 타입의 모든 속성을 지원합니다.

### `fetchSeoMetaForPages(apiKey, path, options?)`

API에서 메타 태그를 가져옵니다.

### `createPagesMetaFetcher(config)`

재사용 가능한 메타 태그 fetcher를 생성합니다.

### `withSeoMeta(apiKey, getServerSideProps, getPath, options?)`

getServerSideProps를 래핑하여 `_seoMeta` props를 자동 주입합니다.
