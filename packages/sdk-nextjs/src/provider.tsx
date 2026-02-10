/**
 * React Context Provider for HTML Rewriter
 * 클라이언트 사이드에서 Meta 태그 관리
 */

'use client';

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import type { MetaTags } from '@aspect-seo/core';

interface HtmlRewriterContextValue {
  setMetaTags: (tags: MetaTags) => void;
  clearMetaTags: () => void;
}

const HtmlRewriterContext = createContext<HtmlRewriterContextValue | null>(null);

interface HtmlRewriterProviderProps {
  children: React.ReactNode;
  defaultTags?: MetaTags;
}

/**
 * Meta 태그를 DOM에 적용
 */
function applyMetaTags(tags: MetaTags): void {
  if (typeof document === 'undefined') return;

  // Title 설정
  if (tags.title) {
    document.title = tags.title;
  }

  // 기존 meta 태그 업데이트 또는 생성
  const updateMeta = (selector: string, content: string, isProperty = false) => {
    let meta = document.querySelector(selector) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      if (isProperty) {
        meta.setAttribute('property', selector.match(/property="([^"]+)"/)?.[1] || '');
      } else {
        meta.setAttribute('name', selector.match(/name="([^"]+)"/)?.[1] || '');
      }
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  // 기본 meta 태그
  if (tags.description) {
    updateMeta('meta[name="description"]', tags.description);
  }
  if (tags.keywords) {
    updateMeta('meta[name="keywords"]', tags.keywords);
  }
  if (tags.robots) {
    updateMeta('meta[name="robots"]', tags.robots);
  }

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
  if (tags.ogTitle) {
    updateMeta('meta[property="og:title"]', tags.ogTitle, true);
  }
  if (tags.ogDescription) {
    updateMeta('meta[property="og:description"]', tags.ogDescription, true);
  }
  if (tags.ogImage) {
    updateMeta('meta[property="og:image"]', tags.ogImage, true);
  }
  if (tags.ogUrl) {
    updateMeta('meta[property="og:url"]', tags.ogUrl, true);
  }
  if (tags.ogType) {
    updateMeta('meta[property="og:type"]', tags.ogType, true);
  }
  if (tags.ogSiteName) {
    updateMeta('meta[property="og:site_name"]', tags.ogSiteName, true);
  }

  // Twitter Card
  if (tags.twitterCard) {
    updateMeta('meta[name="twitter:card"]', tags.twitterCard);
  }
  if (tags.twitterTitle) {
    updateMeta('meta[name="twitter:title"]', tags.twitterTitle);
  }
  if (tags.twitterDescription) {
    updateMeta('meta[name="twitter:description"]', tags.twitterDescription);
  }
  if (tags.twitterImage) {
    updateMeta('meta[name="twitter:image"]', tags.twitterImage);
  }
  if (tags.twitterSite) {
    updateMeta('meta[name="twitter:site"]', tags.twitterSite);
  }

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

export function HtmlRewriterProvider({ children, defaultTags }: HtmlRewriterProviderProps) {
  useEffect(() => {
    if (defaultTags) {
      applyMetaTags(defaultTags);
    }
  }, [defaultTags]);

  const setMetaTags = useCallback((tags: MetaTags) => {
    applyMetaTags(tags);
  }, []);

  const clearMetaTags = useCallback(() => {
    // 기본값으로 리셋하거나 태그 제거
    if (defaultTags) {
      applyMetaTags(defaultTags);
    }
  }, [defaultTags]);

  return (
    <HtmlRewriterContext.Provider value={{ setMetaTags, clearMetaTags }}>
      {children}
    </HtmlRewriterContext.Provider>
  );
}

export function useHtmlRewriter(): HtmlRewriterContextValue {
  const context = useContext(HtmlRewriterContext);
  if (!context) {
    throw new Error('useHtmlRewriter must be used within HtmlRewriterProvider');
  }
  return context;
}

/**
 * 페이지별 Meta 태그 설정 Hook
 */
export function usePageMeta(tags: MetaTags, deps: React.DependencyList = []) {
  const { setMetaTags } = useHtmlRewriter();

  useEffect(() => {
    setMetaTags(tags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
