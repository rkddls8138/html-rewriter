# HTML Rewriter SDK - 테스터 설치 가이드

## 설치 방법

### 1. 저장소 접근 권한 확인

GitHub 저장소 Collaborator로 초대받아야 설치 가능합니다.

### 2. 패키지 설치

```bash
npm install github:rkddls8138/html-rewriter#pkg/sdk-nextjs
```

---

## Next.js App Router 사용법 (권장)

### generateMetadata 사용

```typescript
// app/page.tsx
import { generateSeoMetadata } from 'html-rewriter-seo-nextjs';

export function generateMetadata() {
  return generateSeoMetadata({
    title: '내 서비스 - SEO 최적화 테스트',
    description: 'HTML Rewriter SDK 테스트 페이지입니다.',
    ogTitle: '내 서비스',
    ogDescription: 'SEO 최적화를 위한 HTML Rewriter',
    ogImage: 'https://example.com/og-image.png',
    ogType: 'website',
  });
}

export default function HomePage() {
  return <main>홈페이지</main>;
}
```

### 동적 경로에서 사용

```typescript
// app/product/[id]/page.tsx
import { generateSeoMetadata } from 'html-rewriter-seo-nextjs';

export async function generateMetadata({ params }: { params: { id: string } }) {
  // API에서 상품 정보 조회
  const product = await fetch(`https://api.example.com/products/${params.id}`).then(r => r.json());

  return generateSeoMetadata({
    title: `${product.name} - 내 쇼핑몰`,
    description: product.description,
    ogType: 'product',
    ogImage: product.image,
  });
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return <main>상품 {params.id}</main>;
}
```

---

## Next.js Pages Router 사용법

### SeoHead 컴포넌트 사용

```typescript
// pages/index.tsx
import { SeoHead } from 'html-rewriter-seo-nextjs';

export default function HomePage() {
  return (
    <>
      <SeoHead
        title="내 서비스 - SEO 최적화 테스트"
        description="HTML Rewriter SDK 테스트 페이지입니다."
        ogTitle="내 서비스"
        ogDescription="SEO 최적화를 위한 HTML Rewriter"
        ogImage="https://example.com/og-image.png"
        ogType="website"
      />
      <main>홈페이지</main>
    </>
  );
}
```

---

## 테스트

```bash
# 개발 서버 실행
npm run dev

# 페이지 소스 보기에서 Meta 태그 확인
# 브라우저에서 http://localhost:3000 접속 후 페이지 소스 보기
```

### 예상 결과

```html
<head>
    <title>내 서비스 - SEO 최적화 테스트</title>
    <meta name="description" content="HTML Rewriter SDK 테스트 페이지입니다.">
    <meta property="og:title" content="내 서비스">
    <meta property="og:description" content="SEO 최적화를 위한 HTML Rewriter">
    <meta property="og:image" content="https://example.com/og-image.png">
    <meta property="og:type" content="website">
</head>
```

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
  ogType?: string;
  ogSiteName?: string;

  // Twitter Card
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;

  // 커스텀
  custom?: Record<string, string>;
}
```

---

## 문제 해결

### GitHub 인증 오류

```bash
ssh -T git@github.com
```

### TypeScript 타입 오류

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 피드백

- 이슈 등록: https://github.com/rkddls8138/html-rewriter/issues
