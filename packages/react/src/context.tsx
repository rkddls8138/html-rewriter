/**
 * SEO Context Provider for React
 * 클라이언트 사이드에서 Meta 태그 상태 관리
 */

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { MetaTags } from '@rkddls8138/seo-core';

interface SeoContextValue {
  meta: MetaTags;
  setMeta: (tags: MetaTags) => void;
  updateMeta: (tags: Partial<MetaTags>) => void;
  clearMeta: () => void;
}

const SeoContext = createContext<SeoContextValue | null>(null);

export interface SeoProviderProps {
  children: React.ReactNode;
  defaultMeta?: MetaTags;
}

/**
 * SEO Context Provider
 * 앱 전체에서 메타 태그 상태를 공유할 수 있게 해줍니다.
 *
 * @example
 * ```tsx
 * // app/layout.tsx or _app.tsx
 * import { SeoProvider } from '@rkddls8138/seo-react';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <SeoProvider defaultMeta={{ title: '기본 타이틀' }}>
 *       {children}
 *     </SeoProvider>
 *   );
 * }
 * ```
 */
export function SeoProvider({ children, defaultMeta = {} }: SeoProviderProps) {
  const [meta, setMetaState] = useState<MetaTags>(defaultMeta);

  const setMeta = useCallback((tags: MetaTags) => {
    setMetaState(tags);
  }, []);

  const updateMeta = useCallback((tags: Partial<MetaTags>) => {
    setMetaState((prev) => ({ ...prev, ...tags }));
  }, []);

  const clearMeta = useCallback(() => {
    setMetaState(defaultMeta);
  }, [defaultMeta]);

  return (
    <SeoContext.Provider value={{ meta, setMeta, updateMeta, clearMeta }}>
      {children}
    </SeoContext.Provider>
  );
}

/**
 * SEO Context 사용 Hook
 */
export function useSeoContext(): SeoContextValue {
  const context = useContext(SeoContext);
  if (!context) {
    throw new Error('useSeoContext must be used within a SeoProvider');
  }
  return context;
}
