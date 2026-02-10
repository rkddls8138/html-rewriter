/**
 * SEO Head Component for Next.js Pages Router
 * next/head를 래핑하여 일관된 Meta 태그 관리
 */

import React from 'react';
import Head from 'next/head';
import type { MetaTags } from '@rkddls8138/seo-core';

export interface SeoHeadProps extends MetaTags {
  /**
   * 기존 meta 태그와 병합할지 여부
   * @default true
   */
  merge?: boolean;
}

/**
 * Pages Router용 SEO Head 컴포넌트
 *
 * @example
 * ```tsx
 * import { SeoHead } from 'html-rewriter-seo-nextjs';
 *
 * export default function ProductPage({ product }) {
 *   return (
 *     <>
 *       <SeoHead
 *         title={product.name}
 *         description={product.description}
 *         ogImage={product.image}
 *         ogType="product"
 *       />
 *       <main>...</main>
 *     </>
 *   );
 * }
 * ```
 */
export function SeoHead({
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
  return (
    <Head>
      {/* 기본 Meta */}
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {robots && <meta name="robots" content={robots} />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      {(ogTitle || title) && <meta property="og:title" content={ogTitle || title} />}
      {(ogDescription || description) && (
        <meta property="og:description" content={ogDescription || description} />
      )}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      {ogType && <meta property="og:type" content={ogType} />}
      {ogSiteName && <meta property="og:site_name" content={ogSiteName} />}

      {/* Twitter Card */}
      {twitterCard && <meta name="twitter:card" content={twitterCard} />}
      {(twitterTitle || ogTitle || title) && (
        <meta name="twitter:title" content={twitterTitle || ogTitle || title} />
      )}
      {(twitterDescription || ogDescription || description) && (
        <meta
          name="twitter:description"
          content={twitterDescription || ogDescription || description}
        />
      )}
      {(twitterImage || ogImage) && (
        <meta name="twitter:image" content={twitterImage || ogImage} />
      )}
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}

      {/* Custom Meta Tags */}
      {custom &&
        Object.entries(custom).map(([name, content]) => {
          if (name.startsWith('og:') || name.startsWith('article:')) {
            return <meta key={name} property={name} content={content} />;
          }
          return <meta key={name} name={name} content={content} />;
        })}
    </Head>
  );
}

/**
 * MetaTags 객체를 SeoHead props로 변환하는 헬퍼
 */
export function metaTagsToSeoHeadProps(tags: MetaTags): SeoHeadProps {
  return { ...tags };
}
