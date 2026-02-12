/**
 * Next.js App Router Metadata Support
 * generateMetadata 함수와 함께 사용
 */

import type { Metadata } from 'next';
import type { MetaTags, FetchSeoOptions } from '@rkddls8138/seo-core';
import { fetchSeoMeta } from '@rkddls8138/seo-core';

/**
 * MetaTags를 Next.js Metadata 형식으로 변환
 */
export function generateSeoMetadata(tags: MetaTags): Metadata {
  const metadata: Metadata = {};

  // 기본 메타데이터
  if (tags.title) metadata.title = tags.title;
  if (tags.description) metadata.description = tags.description;
  if (tags.keywords) metadata.keywords = tags.keywords;
  if (tags.robots) metadata.robots = tags.robots;
  if (tags.canonical) metadata.alternates = { canonical: tags.canonical };

  // Open Graph
  const ogTitle = tags.ogTitle || tags.title;
  const ogDescription = tags.ogDescription || tags.description;

  if (ogTitle || ogDescription || tags.ogImage || tags.ogUrl || tags.ogType || tags.ogSiteName) {
    metadata.openGraph = {
      ...(ogTitle && { title: ogTitle }),
      ...(ogDescription && { description: ogDescription }),
      ...(tags.ogImage && { images: [{ url: tags.ogImage }] }),
      ...(tags.ogUrl && { url: tags.ogUrl }),
      ...(tags.ogType && { type: tags.ogType as 'website' | 'article' }),
      ...(tags.ogSiteName && { siteName: tags.ogSiteName }),
    };
  }

  // Twitter Card
  const twTitle = tags.twitterTitle || ogTitle;
  const twDescription = tags.twitterDescription || ogDescription;
  const twImage = tags.twitterImage || tags.ogImage;

  if (tags.twitterCard || twTitle || twDescription || twImage || tags.twitterSite) {
    metadata.twitter = {
      ...(tags.twitterCard && { card: tags.twitterCard as 'summary' | 'summary_large_image' | 'app' | 'player' }),
      ...(twTitle && { title: twTitle }),
      ...(twDescription && { description: twDescription }),
      ...(twImage && { images: [twImage] }),
      ...(tags.twitterSite && { site: tags.twitterSite }),
    };
  }

  // Custom meta tags
  if (tags.custom) metadata.other = tags.custom;

  return metadata;
}

// ============================================================
// API-based Metadata Functions
// ============================================================

export interface FetchMetadataOptions {
  /** 캐시 비활성화 */
  noCache?: boolean;
  /** API key 직접 전달 */
  apiKey?: string;
}

/**
 * Edge Function API에서 메타 태그를 가져와 Next.js Metadata 형식으로 반환
 * API key는 process.env.SEO_REWRITER_API_KEY에서 자동 로드
 */
export async function fetchAndGenerateMetadata(path: string, options?: FetchMetadataOptions): Promise<Metadata> {
  const tags = await fetchSeoMeta(path, {
    noCache: options?.noCache,
    apiKey: options?.apiKey,
  });
  return generateSeoMetadata(tags);
}

/**
 * 옵션을 미리 구성하여 재사용 가능한 메타데이터 fetcher 생성
 */
export function createMetadataFetcher(options?: FetchMetadataOptions) {
  return (path: string): Promise<Metadata> =>
    fetchAndGenerateMetadata(path, options);
}
