import React from 'react';
import { MetaTags, FetchSeoOptions } from '@rkddls8138/seo-core';

/**
 * SEO Head Component for Next.js Pages Router
 * next/head를 래핑하여 일관된 Meta 태그 관리
 */

interface SeoHeadProps extends MetaTags {
}
/**
 * Pages Router용 SEO Head 컴포넌트
 * React.memo로 래핑하여 불필요한 리렌더링 방지
 */
declare const SeoHead: React.NamedExoticComponent<SeoHeadProps>;

/**
 * Pages Router의 getServerSideProps에서 사용할 메타 태그 fetcher
 * API key는 process.env.SEO_REWRITER_API_KEY에서 자동 로드
 */
declare const fetchSeoMetaForPages: (path: string, options?: FetchSeoOptions) => Promise<MetaTags>;
/**
 * getServerSideProps 래퍼 - 메타 태그 자동 주입
 */
declare const withSeoMeta: <P extends Record<string, any>>(getServerSideProps: (context: any) => Promise<{
    props: P;
} | {
    redirect: any;
} | {
    notFound: true;
}>, getPath: (context: any) => string, options?: FetchSeoOptions) => (context: any) => Promise<{
    redirect: any;
} | {
    notFound: true;
} | {
    props: P & {
        _seoMeta: MetaTags;
    };
}>;

export { SeoHead, type SeoHeadProps, fetchSeoMetaForPages, withSeoMeta };
