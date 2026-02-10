import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';
import { MetaTags } from '@aspect-seo/core';

interface HtmlRewriterContextValue {
    setMetaTags: (tags: MetaTags) => void;
    clearMetaTags: () => void;
}
interface HtmlRewriterProviderProps {
    children: React.ReactNode;
    defaultTags?: MetaTags;
}
declare function HtmlRewriterProvider({ children, defaultTags }: HtmlRewriterProviderProps): react_jsx_runtime.JSX.Element;
declare function useHtmlRewriter(): HtmlRewriterContextValue;
/**
 * 페이지별 Meta 태그 설정 Hook
 */
declare function usePageMeta(tags: MetaTags, deps?: React.DependencyList): void;

export { HtmlRewriterProvider, useHtmlRewriter, usePageMeta };
