# @rkddls8138/seo-nextjs

Next.js SEO Meta Tag SDK - API Key 기반

`.env`에 API Key 하나만 설정하면, 함수 한 줄로 SEO 메타 태그를 적용할 수 있습니다.

## Quick Start

### 1. 설치

```bash
npm install github:rkddls8138/html-rewriter
```

### 2. 환경변수 설정

```env
# .env.local
SEO_REWRITER_API_KEY=seo_live_xxxx
```

### 3. 사용

#### App Router (Next.js 13+)

```typescript
// app/vehicles/tucson/page.tsx
import { fetchAndGenerateMetadata } from '@rkddls8138/seo-nextjs/app-router';

export async function generateMetadata() {
  return fetchAndGenerateMetadata('/vehicles/tucson');
}

export default function TucsonPage() {
  return <div>투싼 페이지</div>;
}
```

#### Pages Router

```typescript
// pages/vehicles/tucson.tsx
import { SeoHead, withSeoMeta } from '@rkddls8138/seo-nextjs/pages-router';

export const getServerSideProps = withSeoMeta(
  async () => ({ props: { data: 'hello' } }),
  () => '/vehicles/tucson'
);

export default function TucsonPage({ _seoMeta, data }) {
  return (
    <>
      <SeoHead {..._seoMeta} />
      <div>투싼 페이지</div>
    </>
  );
}
```

끝입니다. 추가 설정은 없습니다.

---

## Packages

| 패키지 | 설명 |
|--------|------|
| `@rkddls8138/seo-core` | 프레임워크 무관 코어 라이브러리 (순수 fetch 클라이언트) |
| `@rkddls8138/seo-nextjs` | Next.js App Router + Pages Router 통합 |


## API Reference

### Core (`@rkddls8138/seo-core`)

#### `fetchSeoMeta(path, options?)`

Edge Function API에서 SEO 메타 태그를 가져옵니다.

```typescript
import { fetchSeoMeta } from '@rkddls8138/seo-core';

const tags = await fetchSeoMeta('/vehicles/tucson');
// { title: '투싼 | 현대자동차', description: '...', ogTitle: '투싼', ... }
```

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `path` | `string` | URL 경로 (예: `/vehicles/tucson`) |
| `options.apiKey` | `string` | API key 직접 전달 (기본: `process.env.SEO_REWRITER_API_KEY`) |
| `options.noCache` | `boolean` | 캐시 비활성화 (기본: `false`) |
| `options.revalidate` | `number` | Next.js ISR revalidate 주기 초 (기본: `3600`) |

**반환**: `Promise<MetaTags>` - 매칭 없으면 빈 객체 `{}`

#### `clearSeoCache()`

캐시를 초기화합니다. 테스트/디버깅용.

#### `MetaTags` 인터페이스

```typescript
interface MetaTags {
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
  // Custom
  custom?: Record<string, string>;
}
```

---

### Next.js App Router (`@rkddls8138/seo-nextjs/app-router`)

#### `fetchAndGenerateMetadata(path, options?)`

API에서 메타 태그를 가져와 Next.js `Metadata` 형식으로 반환합니다.

```typescript
import { fetchAndGenerateMetadata } from '@rkddls8138/seo-nextjs/app-router';

// app/page.tsx
export async function generateMetadata() {
  return fetchAndGenerateMetadata('/');
}
```

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `path` | `string` | URL 경로 |
| `options.apiKey` | `string` | API key 직접 전달 |
| `options.noCache` | `boolean` | 캐시 비활성화 |

#### `createMetadataFetcher(options?)`

옵션을 미리 구성한 재사용 가능한 fetcher를 생성합니다.

```typescript
// lib/seo.ts
import { createMetadataFetcher } from '@rkddls8138/seo-nextjs/app-router';

export const getSeo = createMetadataFetcher({ noCache: false });

// app/any/page.tsx
export async function generateMetadata() {
  return getSeo('/any');
}
```

#### `generateSeoMetadata(tags)`

`MetaTags` 객체를 Next.js `Metadata` 형식으로 변환합니다. 정적 메타 태그에 유용합니다.

```typescript
import { generateSeoMetadata } from '@rkddls8138/seo-nextjs/app-router';

export function generateMetadata() {
  return generateSeoMetadata({
    title: '정적 타이틀',
    description: '정적 설명',
    ogImage: 'https://example.com/og.jpg',
  });
}
```

---

### Next.js Pages Router (`@rkddls8138/seo-nextjs/pages-router`)

#### `<SeoHead {...metaTags} />`

Pages Router용 SEO Head 컴포넌트. `next/head`를 래핑합니다.

```tsx
import { SeoHead } from '@rkddls8138/seo-nextjs/pages-router';

export default function Page({ _seoMeta }) {
  return (
    <>
      <SeoHead {..._seoMeta} />
      <main>콘텐츠</main>
    </>
  );
}
```

자동 파생값:
- `ogTitle` 미설정 시 `title` 사용
- `twitterTitle` 미설정 시 `ogTitle` 사용
- `twitterImage` 미설정 시 `ogImage` 사용

#### `withSeoMeta(gssp, getPath, options?)`

`getServerSideProps`를 래핑하여 `_seoMeta` props를 자동 주입합니다.

```typescript
import { withSeoMeta } from '@rkddls8138/seo-nextjs/pages-router';

export const getServerSideProps = withSeoMeta(
  async (context) => {
    const data = await fetchData(context.params.id);
    return { props: { data } };
  },
  (context) => `/product/${context.params.id}`
);
```

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `gssp` | `function` | 원본 getServerSideProps 함수 |
| `getPath` | `(context) => string` | context에서 URL 경로를 추출하는 함수 |
| `options` | `FetchSeoOptions` | API key, 캐시 옵션 |

`redirect`/`notFound` 반환 시 메타 태그 주입 없이 그대로 반환합니다.

#### `fetchSeoMetaForPages(path, options?)`

Pages Router에서 직접 메타 태그를 가져올 때 사용합니다.

```typescript
export const getServerSideProps = async (context) => {
  const meta = await fetchSeoMetaForPages(`/product/${context.params.id}`);
  return { props: { meta } };
};
```

---

## Caching

- **Next.js 환경**: `fetch`의 `next.revalidate` 옵션으로 ISR 스타일 캐싱 (기본 1시간)
- **비-Next.js 환경**: 표준 fetch (CDN Cache-Control에 의존)
- `noCache: true` 옵션으로 캐시 비활성화 가능

---

## 에러 처리

SDK는 절대 에러를 throw하지 않습니다:

- API key 미설정 → 콘솔 경고 + 빈 객체 반환
- 잘못된 API key → 빈 객체 반환
- 매칭되는 URL 없음 → 빈 객체 반환
- 네트워크 오류 → 콘솔 에러 + 빈 객체 반환
- 5초 타임아웃 초과 → 빈 객체 반환

---

## License

MIT
