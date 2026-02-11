# App Router SEO (Next.js 13+)

Next.js App Router의 `generateMetadata` 함수와 함께 사용하는 SEO 메타 태그 관리 모듈입니다.

## 설치

```bash
npm install @rkddls8138/seo-nextjs
```

## 사용법

### 방법 1: API 기반 동적 메타 태그 (권장)

```typescript
// app/product/[id]/page.tsx
import { fetchAndGenerateMetadata } from '@rkddls8138/seo-nextjs';

export async function generateMetadata({ params }: { params: { id: string } }) {
  return fetchAndGenerateMetadata(
    process.env.SEO_API_KEY!,
    `/product/${params.id}`
  );
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return <div>상품 {params.id}</div>;
}
```

### 방법 2: 재사용 가능한 Fetcher 생성

```typescript
// lib/seo.ts
import { createMetadataFetcher } from '@rkddls8138/seo-nextjs';

export const getSeoMetadata = createMetadataFetcher({
  apiKey: process.env.SEO_API_KEY!,
  apiUrl: 'https://api.seo-rewriter.com',
  fallback: { title: '기본 타이틀' },
  cacheTtl: 3600,
});

// app/product/[id]/page.tsx
import { getSeoMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  return getSeoMetadata(`/product/${params.id}`);
}
```

### 방법 3: 정적 메타 태그

```typescript
// app/product/[id]/page.tsx
import { generateSeoMetadata } from '@rkddls8138/seo-nextjs';

export async function generateMetadata({ params }: { params: { id: string } }) {
  return generateSeoMetadata({
    title: `상품 ${params.id}`,
    description: '상품 상세 페이지입니다.',
    ogType: 'website',
    ogImage: 'https://example.com/image.png',
  });
}
```

## API 참조

### `fetchAndGenerateMetadata(apiKey, path, options?)`

API에서 메타 태그를 가져와 Next.js Metadata 형식으로 반환합니다.

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `apiKey` | `string` | SEO API 키 |
| `path` | `string` | 페이지 경로 |
| `options.apiUrl` | `string` | API 엔드포인트 URL |
| `options.params` | `Record<string, string>` | 추가 파라미터 |
| `options.fallback` | `MetaTags` | API 실패 시 기본값 |
| `options.cacheTtl` | `number` | 캐시 TTL (초) |

### `createMetadataFetcher(config)`

재사용 가능한 메타데이터 fetcher를 생성합니다.

### `generateSeoMetadata(tags)`

MetaTags 객체를 Next.js Metadata 형식으로 변환합니다.
