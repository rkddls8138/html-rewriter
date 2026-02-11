export * from '@rkddls8138/seo-core';
export { SeoProvider, SeoProviderProps, usePageMeta, useSeoContext, useSeoMeta, useSeoMetaContext } from '@rkddls8138/seo-react';
export { FetchMetadataOptions, createMetadataFetcher, fetchAndGenerateMetadata, generateSeoMetadata } from './app-router/index.js';
export { SeoHead, SeoHeadProps, fetchSeoMetaForPages, withSeoMeta } from './pages-router/index.js';
import 'next';
import 'react';
