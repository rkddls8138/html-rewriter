/**
 * HTML Rewriter SDK for Next.js
 * SEO 최적화를 위한 Meta 태그 관리
 */

// Core types and utilities
export * from '@rkddls8138/seo-core';

// App Router (Next.js 13+) - generateMetadata 지원
export {
  generateSeoMetadata,
  generateDynamicSeoMetadata,
  createMetadataRules,
} from './metadata';
export type { MetadataRule } from './metadata';

// Pages Router - next/head 컴포넌트
export { SeoHead, metaTagsToSeoHeadProps } from './SeoHead';
export type { SeoHeadProps } from './SeoHead';

// Client-side dynamic updates (SPA navigation)
export { HtmlRewriterProvider, useHtmlRewriter, usePageMeta } from './provider';

/**
 * @deprecated Middleware 방식은 하이드레이션 이슈로 인해 사용을 권장하지 않습니다.
 * 대신 generateSeoMetadata (App Router) 또는 SeoHead (Pages Router)를 사용하세요.
 */
export { createHtmlRewriterMiddleware } from './middleware';
export type { HtmlRewriterMiddlewareConfig } from './middleware';
