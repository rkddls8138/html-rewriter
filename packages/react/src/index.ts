/**
 * React SDK for SEO Meta Tag Management
 *
 * 이 패키지는 React 앱에서 사용할 수 있는 공통 hooks와 context를 제공합니다.
 * Next.js를 사용하는 경우 @rkddls8138/seo-nextjs를 사용하세요.
 *
 * @example
 * ```tsx
 * import { SeoProvider, useSeoMeta } from '@rkddls8138/seo-react';
 *
 * // App에서 Provider 설정
 * function App() {
 *   return (
 *     <SeoProvider defaultMeta={{ title: '기본 타이틀' }}>
 *       <MyApp />
 *     </SeoProvider>
 *   );
 * }
 *
 * // 페이지에서 Meta 설정
 * function ProductPage({ product }) {
 *   useSeoMeta({
 *     title: product.name,
 *     description: product.description,
 *   });
 *   return <div>...</div>;
 * }
 * ```
 */

// Re-export core types and utilities
export * from '@rkddls8138/seo-core';

// Context Provider
export { SeoProvider, useSeoContext } from './context';
export type { SeoProviderProps } from './context';

// Hooks
export { useSeoMeta, useSeoMetaContext, usePageMeta } from './hooks';
