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

// Middleware - HTML 후킹 방식 (핵심 기능)
// <head> 영역만 수정하여 하이드레이션 안전성 보장
export { createHtmlRewriterMiddleware, createMatcher } from './middleware';
export type { HtmlRewriterMiddlewareConfig } from './middleware';
