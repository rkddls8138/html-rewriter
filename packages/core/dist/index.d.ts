/**
 * SEO API Client
 * Edge Function API를 통해 SEO 메타 태그를 가져오는 순수 HTTP 클라이언트
 * Supabase 의존성 제로 - fetch API만 사용
 */

interface FetchSeoOptions {
    /** 캐시 비활성화 @default false */
    noCache?: boolean;
    /** API key 직접 전달 (기본: process.env.SEO_REWRITER_API_KEY) */
    apiKey?: string;
}
/**
 * 경로에 매칭되는 SEO 메타 태그를 Edge Function API에서 가져오기
 *
 * @param path - URL 경로 (예: '/vehicles/tucson')
 * @param options - 캐시 제어 및 API key 옵션
 * @returns MetaTags 객체 (매칭 없으면 빈 객체)
 */
declare function fetchSeoMeta(path: string, options?: FetchSeoOptions): Promise<MetaTags>;
/**
 * 캐시 전체 초기화
 */
declare function clearSeoCache(): void;

/**
 * HTML Rewriter Core Library
 * SEO 최적화를 위한 HTML 파싱 및 Meta 태그 조작
 */

interface MetaTags {
    title?: string;
    description?: string;
    keywords?: string;
    canonical?: string;
    robots?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogUrl?: string;
    ogType?: string;
    ogSiteName?: string;
    twitterCard?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    twitterSite?: string;
    custom?: Record<string, string>;
}
interface RewriteRule {
    path: string | RegExp;
    metaTags: MetaTags | ((url: string, params: Record<string, string>) => MetaTags | Promise<MetaTags>);
}
interface HtmlRewriterConfig {
    apiKey?: string;
    rules: RewriteRule[];
    cache?: {
        enabled: boolean;
        ttl: number;
    };
    botUserAgents?: string[];
}
declare const DEFAULT_BOT_USER_AGENTS: string[];
/**
 * User-Agent가 검색엔진 봇인지 확인
 */
declare function isBot(userAgent: string, customBots?: string[]): boolean;
/**
 * URL 경로에서 동적 파라미터 추출
 * 예: /product/:id -> { id: '123' }
 */
declare function extractParams(pattern: string | RegExp, path: string): Record<string, string> | null;
/**
 * 매칭되는 규칙 찾기
 */
declare function findMatchingRule(path: string, rules: RewriteRule[]): {
    rule: RewriteRule;
    params: Record<string, string>;
} | null;
/**
 * Meta 태그를 HTML 문자열로 변환
 */
declare function metaTagsToHtml(tags: MetaTags): string;
/**
 * HTML 이스케이프
 */
declare function escapeHtml(text: string): string;
/**
 * <head> 영역 내에서만 기존 Meta 태그 제거
 * React 하이드레이션 이슈 방지: <body>는 절대 수정하지 않음
 */
declare function removeExistingMetaTagsInHead(headContent: string): string;
/**
 * @deprecated Use removeExistingMetaTagsInHead instead
 */
declare function removeExistingMetaTags(html: string): string;
/**
 * HTML <head>에만 Meta 태그 주입 (하이드레이션 안전)
 *
 * 핵심 원리:
 * 1. <head>...</head> 영역만 추출
 * 2. 해당 영역 내에서만 메타 태그 교체/추가
 * 3. <body>는 절대 수정하지 않음 → React 하이드레이션 에러 방지
 */
declare function injectMetaTags(html: string, metaTags: MetaTags, replace?: boolean): string;
/**
 * HTML <head>에만 Meta 태그 주입 (명시적 함수명)
 * injectMetaTags의 별칭으로, 하이드레이션 안전성을 강조
 */
declare function injectMetaTagsHeadOnly(html: string, metaTags: MetaTags, replace?: boolean): string;
/**
 * Simple in-memory cache
 */
declare class MetaTagCache {
    private cache;
    set(key: string, tags: MetaTags, ttlSeconds: number): void;
    get(key: string): MetaTags | null;
    clear(): void;
}
declare const metaTagCache: MetaTagCache;

export { DEFAULT_BOT_USER_AGENTS, type FetchSeoOptions, type HtmlRewriterConfig, MetaTagCache, type MetaTags, type RewriteRule, clearSeoCache, escapeHtml, extractParams, fetchSeoMeta, findMatchingRule, injectMetaTags, injectMetaTagsHeadOnly, isBot, metaTagCache, metaTagsToHtml, removeExistingMetaTags, removeExistingMetaTagsInHead };
