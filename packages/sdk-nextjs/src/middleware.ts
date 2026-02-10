/**
 * Next.js Middleware for HTML Rewriting
 * 검색엔진 봇 감지 및 Meta 태그 동적 주입
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  isBot,
  findMatchingRule,
  injectMetaTags,
  metaTagCache,
  type RewriteRule,
  type MetaTags,
  type HtmlRewriterConfig,
} from 'html-rewriter-seo-core';

export interface HtmlRewriterMiddlewareConfig extends HtmlRewriterConfig {
  /**
   * 미들웨어를 적용할 경로 패턴
   * @default ['/((?!api|_next/static|_next/image|favicon.ico).*)']
   */
  matcher?: string[];

  /**
   * 봇이 아닌 일반 사용자에게도 Meta 태그 주입 여부
   * @default false
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
export function createHtmlRewriterMiddleware(config: HtmlRewriterMiddlewareConfig) {
  const {
    rules,
    cache = { enabled: true, ttl: 3600 },
    botUserAgents,
    applyToAllUsers = false,
    debug = false,
  } = config;

  return async function htmlRewriterMiddleware(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || '';
    const pathname = request.nextUrl.pathname;
    const url = request.url;

    // 디버그 로깅
    if (debug) {
      console.log(`[HtmlRewriter] Request: ${pathname}`);
      console.log(`[HtmlRewriter] User-Agent: ${userAgent}`);
    }

    // 봇 여부 확인
    const isBotRequest = isBot(userAgent, botUserAgents);

    if (!isBotRequest && !applyToAllUsers) {
      if (debug) {
        console.log(`[HtmlRewriter] Skipping: Not a bot request`);
      }
      return NextResponse.next();
    }

    // 매칭되는 규칙 찾기
    const match = findMatchingRule(pathname, rules);

    if (!match) {
      if (debug) {
        console.log(`[HtmlRewriter] Skipping: No matching rule for ${pathname}`);
      }
      return NextResponse.next();
    }

    const { rule, params } = match;

    try {
      // 캐시 확인
      const cacheKey = `meta:${pathname}`;
      let metaTags: MetaTags | null = null;

      if (cache.enabled) {
        metaTags = metaTagCache.get(cacheKey);
        if (metaTags && debug) {
          console.log(`[HtmlRewriter] Cache hit for ${pathname}`);
        }
      }

      // 캐시 미스시 Meta 태그 생성
      if (!metaTags) {
        if (typeof rule.metaTags === 'function') {
          metaTags = await rule.metaTags(url, params);
        } else {
          metaTags = rule.metaTags;
        }

        // 캐시 저장
        if (cache.enabled && metaTags) {
          metaTagCache.set(cacheKey, metaTags, cache.ttl);
        }
      }

      if (!metaTags) {
        return NextResponse.next();
      }

      // 원본 응답 가져오기
      const response = await fetch(request.url, {
        headers: {
          ...Object.fromEntries(request.headers),
          'x-html-rewriter-bypass': 'true', // 무한 루프 방지
        },
      });

      // x-html-rewriter-bypass 헤더가 있으면 스킵
      if (request.headers.get('x-html-rewriter-bypass')) {
        return NextResponse.next();
      }

      const contentType = response.headers.get('content-type') || '';

      // HTML이 아니면 스킵
      if (!contentType.includes('text/html')) {
        return NextResponse.next();
      }

      // HTML 변환
      let html = await response.text();
      html = injectMetaTags(html, metaTags, true);

      if (debug) {
        console.log(`[HtmlRewriter] Injected meta tags for ${pathname}`);
      }

      // 새 응답 반환
      return new NextResponse(html, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers),
          'x-html-rewriter': 'processed',
        },
      });
    } catch (error) {
      console.error(`[HtmlRewriter] Error processing ${pathname}:`, error);
      return NextResponse.next();
    }
  };
}

/**
 * 미들웨어 matcher 설정 헬퍼
 */
export function createMatcher(paths: string[]): { matcher: string[] } {
  return {
    matcher: paths,
  };
}
