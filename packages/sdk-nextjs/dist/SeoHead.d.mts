import * as react_jsx_runtime from 'react/jsx-runtime';
import { MetaTags } from '@rkddls8138/seo-core';

interface SeoHeadProps extends MetaTags {
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
declare function SeoHead({ title, description, keywords, canonical, robots, ogTitle, ogDescription, ogImage, ogUrl, ogType, ogSiteName, twitterCard, twitterTitle, twitterDescription, twitterImage, twitterSite, custom, }: SeoHeadProps): react_jsx_runtime.JSX.Element;
/**
 * MetaTags 객체를 SeoHead props로 변환하는 헬퍼
 */
declare function metaTagsToSeoHeadProps(tags: MetaTags): SeoHeadProps;

export { SeoHead, type SeoHeadProps, metaTagsToSeoHeadProps };
