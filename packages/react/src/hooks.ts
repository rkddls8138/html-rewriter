/**
 * React Hooks for SEO Meta Tag Management
 */

'use client';

import { useEffect, useCallback } from 'react';
import type { MetaTags } from '@rkddls8138/seo-core';
import { useSeoContext } from './context';

/**
 * DOM에 Meta 태그 적용
 */
function applyMetaTagsToDOM(tags: MetaTags): void {
  if (typeof document === 'undefined') return;

  // Title 설정
  if (tags.title) {
    document.title = tags.title;
  }

  // Meta 태그 업데이트 또는 생성
  const updateMeta = (selector: string, content: string, isProperty = false) => {
    let meta = document.querySelector(selector) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      if (isProperty) {
        const propMatch = selector.match(/property="([^"]+)"/);
        if (propMatch) meta.setAttribute('property', propMatch[1]);
      } else {
        const nameMatch = selector.match(/name="([^"]+)"/);
        if (nameMatch) meta.setAttribute('name', nameMatch[1]);
      }
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  // 기본 meta 태그
  if (tags.description) updateMeta('meta[name="description"]', tags.description);
  if (tags.keywords) updateMeta('meta[name="keywords"]', tags.keywords);
  if (tags.robots) updateMeta('meta[name="robots"]', tags.robots);

  // Canonical
  if (tags.canonical) {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', tags.canonical);
  }

  // Open Graph
  if (tags.ogTitle) updateMeta('meta[property="og:title"]', tags.ogTitle, true);
  if (tags.ogDescription) updateMeta('meta[property="og:description"]', tags.ogDescription, true);
  if (tags.ogImage) updateMeta('meta[property="og:image"]', tags.ogImage, true);
  if (tags.ogUrl) updateMeta('meta[property="og:url"]', tags.ogUrl, true);
  if (tags.ogType) updateMeta('meta[property="og:type"]', tags.ogType, true);
  if (tags.ogSiteName) updateMeta('meta[property="og:site_name"]', tags.ogSiteName, true);

  // Twitter Card
  if (tags.twitterCard) updateMeta('meta[name="twitter:card"]', tags.twitterCard);
  if (tags.twitterTitle) updateMeta('meta[name="twitter:title"]', tags.twitterTitle);
  if (tags.twitterDescription) updateMeta('meta[name="twitter:description"]', tags.twitterDescription);
  if (tags.twitterImage) updateMeta('meta[name="twitter:image"]', tags.twitterImage);
  if (tags.twitterSite) updateMeta('meta[name="twitter:site"]', tags.twitterSite);

  // Custom tags
  if (tags.custom) {
    for (const [name, content] of Object.entries(tags.custom)) {
      const isProperty = name.startsWith('og:') || name.startsWith('article:');
      if (isProperty) {
        updateMeta(`meta[property="${name}"]`, content, true);
      } else {
        updateMeta(`meta[name="${name}"]`, content);
      }
    }
  }
}

/**
 * 페이지별 Meta 태그 설정 Hook
 * DOM에 직접 메타 태그를 적용합니다 (클라이언트 사이드 전용)
 *
 * @example
 * ```tsx
 * function ProductPage({ product }) {
 *   useSeoMeta({
 *     title: product.name,
 *     description: product.description,
 *     ogImage: product.image,
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useSeoMeta(tags: MetaTags, deps: React.DependencyList = []) {
  useEffect(() => {
    applyMetaTagsToDOM(tags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Context 기반 Meta 태그 설정 Hook
 * SeoProvider 내에서 사용하며, 상태를 공유합니다.
 *
 * @example
 * ```tsx
 * function ProductPage({ product }) {
 *   const { setMeta } = useSeoMetaContext();
 *
 *   useEffect(() => {
 *     setMeta({
 *       title: product.name,
 *       description: product.description,
 *     });
 *   }, [product]);
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useSeoMetaContext() {
  const { meta, setMeta, updateMeta, clearMeta } = useSeoContext();

  // Context 변경 시 DOM에 자동 적용
  useEffect(() => {
    applyMetaTagsToDOM(meta);
  }, [meta]);

  return { meta, setMeta, updateMeta, clearMeta };
}

/**
 * 페이지 Meta 태그 자동 적용 Hook (Context + DOM)
 *
 * @example
 * ```tsx
 * function ProductPage({ product }) {
 *   usePageMeta({
 *     title: product.name,
 *     description: product.description,
 *   }, [product.id]);
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function usePageMeta(tags: MetaTags, deps: React.DependencyList = []) {
  const { setMeta } = useSeoContext();

  useEffect(() => {
    setMeta(tags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
