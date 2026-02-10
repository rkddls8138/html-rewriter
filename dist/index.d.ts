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
 * HTML에서 기존 Meta 태그 제거
 */
declare function removeExistingMetaTags(html: string): string;
/**
 * HTML <head>에 Meta 태그 주입
 */
declare function injectMetaTags(html: string, metaTags: MetaTags, replace?: boolean): string;
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

export { DEFAULT_BOT_USER_AGENTS, type HtmlRewriterConfig, MetaTagCache, type MetaTags, type RewriteRule, escapeHtml, extractParams, findMatchingRule, injectMetaTags, isBot, metaTagCache, metaTagsToHtml, removeExistingMetaTags };
