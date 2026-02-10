# HTML Rewriter SDK for Next.js - 아키텍처 및 적용 원리

## 목차

1. [개요](#1-개요)
2. [패키지 구조](#2-패키지-구조)
3. [Core 패키지 (`@rkddls8138/seo-core`)](#3-core-패키지)
4. [Next.js SDK (`@rkddls8138/seo-nextjs`)](#4-nextjs-sdk)
5. [4가지 적용 방식 비교](#5-4가지-적용-방식-비교)
6. [렌더링 흐름도](#6-렌더링-흐름도)
7. [권장 사용 패턴](#7-권장-사용-패턴)

---

## 1. 개요

HTML Rewriter SDK는 Next.js 애플리케이션에서 SEO 메타 태그를 효율적으로 관리하기 위한 라이브러리입니다.

### 핵심 목표

- **SSR 호환성**: 서버 사이드 렌더링 시 메타 태그가 초기 HTML에 포함
- **CSR 지원**: 클라이언트 사이드 네비게이션에서도 메타 태그 동적 업데이트
- **하이드레이션 안정성**: React 하이드레이션 에러 방지
- **SEO 정책 준수**: Google Cloaking 정책 준수 (모든 사용자에게 동일한 HTML 제공)

---

## 2. 패키지 구조

```
packages/
├── core/                    # 핵심 유틸리티 (프레임워크 무관)
│   └── src/
│       └── index.ts         # MetaTags 타입, HTML 파싱, 캐시
│
└── sdk-nextjs/              # Next.js 전용 SDK
    └── src/
        ├── index.ts         # 메인 엔트리 (exports)
        ├── metadata.ts      # App Router: generateMetadata 지원
        ├── SeoHead.tsx      # Pages Router: next/head 래퍼
        ├── provider.tsx     # Client: React Context 기반 동적 업데이트
        └── middleware.ts    # [Deprecated] Edge Middleware 방식
```

---

## 3. Core 패키지

### 3.1 MetaTags 타입 정의

```typescript
// packages/core/src/index.ts

export interface MetaTags {
  // 기본 메타
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  robots?: string;

  // Open Graph (소셜 공유)
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

  // 커스텀 메타
  custom?: Record<string, string>;
}
```

### 3.2 핵심 유틸리티

| 함수 | 역할 |
|------|------|
| `isBot(userAgent)` | User-Agent가 검색엔진 봇인지 판별 |
| `extractParams(pattern, path)` | URL에서 동적 파라미터 추출 (`:id` 형식) |
| `findMatchingRule(path, rules)` | 경로와 매칭되는 규칙 탐색 |
| `metaTagsToHtml(tags)` | MetaTags → HTML 문자열 변환 |
| `injectMetaTags(html, tags)` | HTML `<head>`에 메타 태그 주입 |
| `MetaTagCache` | TTL 기반 인메모리 캐시 |

### 3.3 HTML 주입 원리

```typescript
export function injectMetaTags(html: string, metaTags: MetaTags, replace: boolean = true): string {
  // 1. 기존 메타 태그 제거 (replace=true인 경우)
  if (replace) {
    html = removeExistingMetaTags(html);
  }

  // 2. MetaTags → HTML 문자열 변환
  const metaHtml = metaTagsToHtml(metaTags);

  // 3. <head> 태그 직후에 삽입
  const headMatch = html.match(/<head[^>]*>/i);
  if (headMatch) {
    const insertPosition = headMatch.index! + headMatch[0].length;
    return html.slice(0, insertPosition) + '\n    ' + metaHtml + html.slice(insertPosition);
  }

  return html;
}
```

---

## 4. Next.js SDK

### 4.1 App Router: `generateSeoMetadata()`

**파일**: `packages/sdk-nextjs/src/metadata.ts`

**원리**: Next.js 13+ App Router의 `generateMetadata` API와 통합. MetaTags 객체를 Next.js `Metadata` 타입으로 변환합니다.

```typescript
export function generateSeoMetadata(tags: MetaTags): Metadata {
  const metadata: Metadata = {};

  // 기본 메타데이터 매핑
  if (tags.title) metadata.title = tags.title;
  if (tags.description) metadata.description = tags.description;
  if (tags.keywords) metadata.keywords = tags.keywords;
  if (tags.robots) metadata.robots = tags.robots;

  // Canonical URL → alternates 변환
  if (tags.canonical) {
    metadata.alternates = { canonical: tags.canonical };
  }

  // Open Graph 변환
  if (hasOpenGraph) {
    metadata.openGraph = {
      title: tags.ogTitle || tags.title,
      description: tags.ogDescription || tags.description,
      images: tags.ogImage ? [{ url: tags.ogImage }] : undefined,
      // ...
    };
  }

  // Twitter Card 변환
  if (hasTwitter) {
    metadata.twitter = {
      card: tags.twitterCard,
      title: tags.twitterTitle || tags.ogTitle || tags.title,
      // ...
    };
  }

  return metadata;
}
```

**실행 시점**: 서버에서 페이지 렌더링 전에 실행됨

**장점**:
- SSR 시 `<head>`에 메타 태그가 즉시 포함
- React 하이드레이션과 완전히 호환
- Next.js의 메타데이터 병합/상속 기능 활용 가능

---

### 4.2 Pages Router: `SeoHead`

**파일**: `packages/sdk-nextjs/src/SeoHead.tsx`

**원리**: `next/head` 컴포넌트를 래핑하여 MetaTags props를 받아 메타 태그 JSX로 렌더링합니다.

```typescript
export function SeoHead({
  title,
  description,
  ogTitle,
  ogImage,
  // ...
}: SeoHeadProps) {
  return (
    <Head>
      {/* 기본 Meta */}
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}

      {/* Open Graph - Fallback 체인 적용 */}
      {(ogTitle || title) && (
        <meta property="og:title" content={ogTitle || title} />
      )}

      {/* Twitter Card - OG 태그 재사용 */}
      {(twitterImage || ogImage) && (
        <meta name="twitter:image" content={twitterImage || ogImage} />
      )}

      {/* Custom Meta */}
      {custom && Object.entries(custom).map(([name, content]) => (
        <meta key={name} name={name} content={content} />
      ))}
    </Head>
  );
}
```

**실행 시점**: 컴포넌트 렌더링 시 (`next/head`가 `<head>` 관리)

**Fallback 체인**:
```
Twitter Title → OG Title → Title
Twitter Image → OG Image
Twitter Desc  → OG Desc  → Description
```

---

### 4.3 Client Provider: `HtmlRewriterProvider`

**파일**: `packages/sdk-nextjs/src/provider.tsx`

**원리**: React Context를 사용하여 클라이언트에서 메타 태그를 동적으로 업데이트합니다. DOM API를 직접 조작합니다.

```typescript
'use client';  // Next.js 13+ 클라이언트 컴포넌트 표시

function applyMetaTags(tags: MetaTags): void {
  // SSR 환경 체크 (document 객체 존재 여부)
  if (typeof document === 'undefined') return;

  // Title 직접 설정
  if (tags.title) {
    document.title = tags.title;
  }

  // Meta 태그 업데이트/생성
  const updateMeta = (selector: string, content: string, isProperty = false) => {
    let meta = document.querySelector(selector) as HTMLMetaElement | null;

    if (!meta) {
      // 태그가 없으면 새로 생성
      meta = document.createElement('meta');
      if (isProperty) {
        meta.setAttribute('property', /* ... */);
      } else {
        meta.setAttribute('name', /* ... */);
      }
      document.head.appendChild(meta);
    }

    meta.setAttribute('content', content);
  };

  // 각 메타 태그 적용
  if (tags.description) updateMeta('meta[name="description"]', tags.description);
  if (tags.ogTitle) updateMeta('meta[property="og:title"]', tags.ogTitle, true);
  // ...
}
```

**실행 시점**: 클라이언트에서 `useEffect` 내부에서 실행

**하이드레이션 안전 보장**:
```typescript
export function HtmlRewriterProvider({ children, defaultTags }) {
  // useEffect는 클라이언트에서만 실행됨 → 하이드레이션 후 DOM 조작
  useEffect(() => {
    if (defaultTags) {
      applyMetaTags(defaultTags);
    }
  }, [defaultTags]);

  // ...
}
```

---

### 4.4 Middleware (Deprecated)

**파일**: `packages/sdk-nextjs/src/middleware.ts`

**원리**: Next.js Edge Middleware에서 응답 HTML을 가로채 메타 태그를 주입합니다.

```typescript
export function createHtmlRewriterMiddleware(config) {
  return async function htmlRewriterMiddleware(request: NextRequest) {
    // 1. 무한 루프 방지
    if (request.headers.get('x-html-rewriter-bypass')) {
      return NextResponse.next();
    }

    // 2. 봇 판별 (optional)
    const isBotRequest = isBot(userAgent, botUserAgents);

    // 3. 규칙 매칭
    const match = findMatchingRule(pathname, rules);

    // 4. 원본 응답 가져오기 (bypass 헤더로 재귀 방지)
    const response = await fetch(request.url, {
      headers: { 'x-html-rewriter-bypass': 'true' },
    });

    // 5. HTML 변환
    let html = await response.text();
    html = injectMetaTags(html, metaTags, true);

    // 6. 수정된 HTML 반환
    return new NextResponse(html, { /* ... */ });
  };
}
```

**⚠️ Deprecated 사유**:
- **하이드레이션 에러**: 서버가 보낸 HTML과 React가 예상한 HTML이 불일치
- Middleware가 HTML을 수정하면 React는 이를 인식하지 못함
- CSR 네비게이션 시 Middleware를 거치지 않아 메타 태그 미적용

---

## 5. 4가지 적용 방식 비교

| 방식 | 실행 위치 | SSR | CSR | 하이드레이션 | 권장도 |
|------|-----------|-----|-----|-------------|--------|
| `generateSeoMetadata` | Server | ✅ | ✅ | ✅ 안전 | ⭐⭐⭐ (App Router) |
| `SeoHead` | Server+Client | ✅ | ✅ | ✅ 안전 | ⭐⭐⭐ (Pages Router) |
| `HtmlRewriterProvider` | Client Only | ❌ | ✅ | ✅ 안전 | ⭐⭐ (SPA 전용) |
| `Middleware` | Edge | ✅ | ❌ | ❌ 불안정 | ⛔ Deprecated |

### 선택 가이드

```
Next.js 13+ App Router 사용?
├── Yes → generateSeoMetadata() 사용
└── No  → Next.js Pages Router?
          ├── Yes → SeoHead 컴포넌트 사용
          └── No  → HtmlRewriterProvider (순수 React SPA)
```

---

## 6. 렌더링 흐름도

### 6.1 App Router (`generateSeoMetadata`)

```
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER                                    │
├─────────────────────────────────────────────────────────────────┤
│  1. Request: GET /product/123                                   │
│                    ↓                                            │
│  2. generateMetadata() 호출                                     │
│     → generateSeoMetadata({ title: '상품 123', ... })          │
│     → Next.js Metadata 객체 반환                                │
│                    ↓                                            │
│  3. React Server Component 렌더링                               │
│     → <head> 에 메타 태그 포함                                  │
│                    ↓                                            │
│  4. HTML 응답 전송                                              │
│     <html>                                                      │
│       <head>                                                    │
│         <title>상품 123</title>                                │
│         <meta property="og:title" content="상품 123">          │
│       </head>                                                   │
│       <body>...</body>                                          │
│     </html>                                                     │
└─────────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT                                    │
├─────────────────────────────────────────────────────────────────┤
│  5. HTML 파싱 → 검색엔진이 메타 태그 수집                       │
│                    ↓                                            │
│  6. React Hydration                                             │
│     → 서버 HTML과 클라이언트 예상 HTML 일치                     │
│     → ✅ 하이드레이션 성공                                      │
│                    ↓                                            │
│  7. SPA 네비게이션 (Link 클릭)                                 │
│     → 새 페이지의 generateMetadata() 서버에서 실행             │
│     → 메타 태그 자동 업데이트                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Middleware (Deprecated) - 문제점

```
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER                                    │
├─────────────────────────────────────────────────────────────────┤
│  1. Request: GET /product/123                                   │
│                    ↓                                            │
│  2. React SSR 렌더링 (원본)                                     │
│     <head><title>Default</title></head>                         │
│                    ↓                                            │
│  3. Middleware가 HTML 수정                                      │
│     <head><title>상품 123</title></head>  ← 변경됨              │
│                    ↓                                            │
│  4. 수정된 HTML 응답 전송                                       │
└─────────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT                                    │
├─────────────────────────────────────────────────────────────────┤
│  5. React Hydration 시도                                        │
│     서버 HTML: <title>상품 123</title>                          │
│     클라이언트 예상: <title>Default</title>                     │
│     → ❌ 불일치! 하이드레이션 에러 발생                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. 권장 사용 패턴

### 7.1 App Router 정적 메타데이터

```typescript
// app/page.tsx
import { generateSeoMetadata } from '@rkddls8138/seo-nextjs';

export const metadata = generateSeoMetadata({
  title: '홈페이지',
  description: '사이트 설명',
  ogImage: '/og-home.jpg',
});

export default function HomePage() {
  return <main>...</main>;
}
```

### 7.2 App Router 동적 메타데이터

```typescript
// app/product/[id]/page.tsx
import { generateDynamicSeoMetadata } from '@rkddls8138/seo-nextjs';

export async function generateMetadata({ params }) {
  return generateDynamicSeoMetadata(async () => {
    const product = await fetchProduct(params.id);
    return {
      title: product.name,
      description: product.description,
      ogImage: product.image,
      canonical: `https://example.com/product/${params.id}`,
    };
  });
}
```

### 7.3 Pages Router

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
        ogType="product"
      />
      <main>...</main>
    </>
  );
}
```

### 7.4 클라이언트 동적 업데이트 (SPA)

```typescript
'use client';
import { HtmlRewriterProvider, useHtmlRewriter } from '@rkddls8138/seo-nextjs';

function ProductDetail({ product }) {
  const { setMetaTags } = useHtmlRewriter();

  useEffect(() => {
    setMetaTags({
      title: product.name,
      ogTitle: product.name,
    });
  }, [product]);

  return <div>...</div>;
}

export default function App() {
  return (
    <HtmlRewriterProvider defaultTags={{ title: 'My App' }}>
      <ProductDetail product={...} />
    </HtmlRewriterProvider>
  );
}
```

---

## 요약

| 요소 | 설명 |
|------|------|
| **Core 패키지** | 프레임워크 무관 유틸리티 (타입, HTML 파싱, 캐시) |
| **generateSeoMetadata** | App Router용, `Metadata` 타입 변환 |
| **SeoHead** | Pages Router용, `next/head` 래퍼 컴포넌트 |
| **HtmlRewriterProvider** | CSR 전용, React Context + DOM 직접 조작 |
| **Middleware** | ⛔ Deprecated - 하이드레이션 이슈 |

**핵심 원칙**: React의 렌더링 사이클 내에서 메타 태그를 생성하여 SSR/CSR 모두에서 일관된 동작을 보장합니다.
