import { NextRequest, NextResponse } from 'next/server';
import { HtmlRewriterConfig } from '@aspect-seo/core';

/**
 * Next.js Middleware for HTML Rewriting
 * 검색엔진 봇 감지 및 Meta 태그 동적 주입
 */

interface HtmlRewriterMiddlewareConfig extends HtmlRewriterConfig {
    /**
     * 미들웨어를 적용할 경로 패턴
     * @default ['/((?!api|_next/static|_next/image|favicon.ico).*)']
     */
    matcher?: string[];
    /**
     * 모든 사용자에게 Meta 태그 주입 여부
     * @default true (Google SEO 정책 준수: Cloaking 방지)
     */
    applyToAllUsers?: boolean;
    /**
     * 디버그 모드
     * @default false
     */
    debug?: boolean;
    /**
     * 원본 HTML을 가져올 base URL (SSR fallback용)
     */
    originUrl?: string;
}
/**
 * Next.js 미들웨어 생성
 */
declare function createHtmlRewriterMiddleware(config: HtmlRewriterMiddlewareConfig): (request: NextRequest) => Promise<NextResponse<unknown>>;
/**
 * 미들웨어 matcher 설정 헬퍼
 */
declare function createMatcher(paths: string[]): {
    matcher: string[];
};

export { type HtmlRewriterMiddlewareConfig, createHtmlRewriterMiddleware, createMatcher };
