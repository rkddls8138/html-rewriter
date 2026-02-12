/**
 * SEO Head Component for Next.js Pages Router
 * next/head를 래핑하여 일관된 Meta 태그 관리
 */

import React, { memo } from 'react';
import Head from 'next/head';
import type { MetaTags, FetchSeoOptions } from '@rkddls8138/seo-core';
import { fetchSeoMeta } from '@rkddls8138/seo-core';

export interface SeoHeadProps extends MetaTags { }

/**
 * Pages Router용 SEO Head 컴포넌트
 * React.memo로 래핑하여 불필요한 리렌더링 방지
 */
export const SeoHead = memo(function SeoHead({
  title,
  description,
  keywords,
  canonical,
  robots,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType,
  ogSiteName,
  twitterCard,
  twitterTitle,
  twitterDescription,
  twitterImage,
  twitterSite,
  custom,
}: SeoHeadProps) {
  // 파생 값 계산
  const effectiveOgTitle = ogTitle ?? title;
  const effectiveOgDesc = ogDescription ?? description;
  const effectiveTwTitle = twitterTitle ?? effectiveOgTitle;
  const effectiveTwDesc = twitterDescription ?? effectiveOgDesc;
  const effectiveTwImage = twitterImage ?? ogImage;

  return (
    <Head>
      {/* 기본 Meta */}
      {title ? <title>{title}</title> : null}
      {description ? <meta name="description" content={description} /> : null}
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      {robots ? <meta name="robots" content={robots} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}

      {/* Open Graph */}
      {effectiveOgTitle ? <meta property="og:title" content={effectiveOgTitle} /> : null}
      {effectiveOgDesc ? <meta property="og:description" content={effectiveOgDesc} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      {ogUrl ? <meta property="og:url" content={ogUrl} /> : null}
      {ogType ? <meta property="og:type" content={ogType} /> : null}
      {ogSiteName ? <meta property="og:site_name" content={ogSiteName} /> : null}

      {/* Twitter Card */}
      {twitterCard ? <meta name="twitter:card" content={twitterCard} /> : null}
      {effectiveTwTitle ? <meta name="twitter:title" content={effectiveTwTitle} /> : null}
      {effectiveTwDesc ? <meta name="twitter:description" content={effectiveTwDesc} /> : null}
      {effectiveTwImage ? <meta name="twitter:image" content={effectiveTwImage} /> : null}
      {twitterSite ? <meta name="twitter:site" content={twitterSite} /> : null}

      {/* Custom Meta Tags */}
      {custom
        ? Object.entries(custom).map(([name, content]) => (
          <meta
            key={name}
            {...(name.startsWith('og:') || name.startsWith('article:')
              ? { property: name }
              : { name })}
            content={content}
          />
        ))
        : null}
    </Head>
  );
});

// ============================================================
// API-based Functions for Pages Router
// ============================================================

export { type FetchSeoOptions } from '@rkddls8138/seo-core';

/**
 * Pages Router의 getServerSideProps에서 사용할 메타 태그 fetcher
 * API key는 process.env.SEO_REWRITER_API_KEY에서 자동 로드
 */
export const fetchSeoMetaForPages = (
  path: string,
  options?: FetchSeoOptions
): Promise<MetaTags> => fetchSeoMeta(path, options);

/**
 * getServerSideProps 래퍼 - 메타 태그 자동 주입
 */
export const withSeoMeta = <P extends Record<string, any>>(
  getServerSideProps: (context: any) => Promise<{ props: P } | { redirect: any } | { notFound: true }>,
  getPath: (context: any) => string,
  options?: FetchSeoOptions
) => async (context: any) => {
  const [meta, result] = await Promise.all([
    fetchSeoMetaForPages(getPath(context), options),
    getServerSideProps(context),
  ]);

  // redirect/notFound는 즉시 반환
  if (!('props' in result)) return result;

  return { props: { ...result.props, _seoMeta: meta } };
};
