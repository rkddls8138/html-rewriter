import { MetaTags } from '@rkddls8138/seo-core';
export * from '@rkddls8138/seo-core';
import * as react_jsx_runtime from 'react/jsx-runtime';
import React$1 from 'react';

interface SeoContextValue {
    meta: MetaTags;
    setMeta: (tags: MetaTags) => void;
    updateMeta: (tags: Partial<MetaTags>) => void;
    clearMeta: () => void;
}
interface SeoProviderProps {
    children: React$1.ReactNode;
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
declare function SeoProvider({ children, defaultMeta }: SeoProviderProps): react_jsx_runtime.JSX.Element;
/**
 * SEO Context 사용 Hook
 */
declare function useSeoContext(): SeoContextValue;

/**
 * React Hooks for SEO Meta Tag Management
 */

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
declare function useSeoMeta(tags: MetaTags, deps?: React.DependencyList): void;
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
declare function useSeoMetaContext(): {
    meta: MetaTags;
    setMeta: (tags: MetaTags) => void;
    updateMeta: (tags: Partial<MetaTags>) => void;
    clearMeta: () => void;
};
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
declare function usePageMeta(tags: MetaTags, deps?: React.DependencyList): void;

export { SeoProvider, type SeoProviderProps, usePageMeta, useSeoContext, useSeoMeta, useSeoMetaContext };
