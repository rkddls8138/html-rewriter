/**
 * HTML Rewriter SDK for Next.js
 * CSR 환경에서 검색엔진 봇에게 SEO 최적화된 HTML 제공
 */

export * from '@aspect-seo/core';

export { createHtmlRewriterMiddleware } from './middleware';
export { HtmlRewriterProvider, useHtmlRewriter, usePageMeta } from './provider';
export type { HtmlRewriterMiddlewareConfig } from './middleware';
