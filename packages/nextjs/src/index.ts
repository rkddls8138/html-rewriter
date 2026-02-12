/**
 * Next.js SDK for SEO Meta Tag Management
 *
 * 지원:
 * - App Router (Next.js 13+): generateMetadata 통합
 * - Pages Router: next/head + getServerSideProps 통합
 */

// Re-export core types and utilities
export * from '@rkddls8138/seo-core';

// App Router (Next.js 13+)
export {
  generateSeoMetadata,
  fetchAndGenerateMetadata,
  createMetadataFetcher,
} from './app-router';
export type { FetchMetadataOptions } from './app-router';

// Pages Router
export {
  SeoHead,
  fetchSeoMetaForPages,
  withSeoMeta,
} from './pages-router';
export type { SeoHeadProps } from './pages-router';
