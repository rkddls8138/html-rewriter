// src/middleware.ts
import { NextResponse } from "next/server";
import {
  isBot,
  findMatchingRule,
  injectMetaTags,
  metaTagCache
} from "@aspect-seo/core";
function createHtmlRewriterMiddleware(config) {
  const {
    rules,
    cache = { enabled: true, ttl: 3600 },
    botUserAgents,
    applyToAllUsers = true,
    // 기본값 true: 모든 사용자에게 동일한 HTML 제공 (SEO 정책 준수)
    debug = false
  } = config;
  return async function htmlRewriterMiddleware(request) {
    if (request.headers.get("x-html-rewriter-bypass")) {
      return NextResponse.next();
    }
    const userAgent = request.headers.get("user-agent") || "";
    const pathname = request.nextUrl.pathname;
    const url = request.url;
    if (debug) {
      console.log(`[HtmlRewriter] Request: ${pathname}`);
      console.log(`[HtmlRewriter] User-Agent: ${userAgent}`);
    }
    const isBotRequest = isBot(userAgent, botUserAgents);
    if (!isBotRequest && !applyToAllUsers) {
      if (debug) {
        console.log(`[HtmlRewriter] Skipping: Not a bot request`);
      }
      return NextResponse.next();
    }
    const match = findMatchingRule(pathname, rules);
    if (!match) {
      if (debug) {
        console.log(`[HtmlRewriter] Skipping: No matching rule for ${pathname}`);
      }
      return NextResponse.next();
    }
    const { rule, params } = match;
    try {
      const cacheKey = `meta:${pathname}`;
      let metaTags = null;
      if (cache.enabled) {
        metaTags = metaTagCache.get(cacheKey);
        if (metaTags && debug) {
          console.log(`[HtmlRewriter] Cache hit for ${pathname}`);
        }
      }
      if (!metaTags) {
        if (typeof rule.metaTags === "function") {
          metaTags = await rule.metaTags(url, params);
        } else {
          metaTags = rule.metaTags;
        }
        if (cache.enabled && metaTags) {
          metaTagCache.set(cacheKey, metaTags, cache.ttl);
        }
      }
      if (!metaTags) {
        return NextResponse.next();
      }
      const response = await fetch(request.url, {
        headers: {
          ...Object.fromEntries(request.headers),
          "x-html-rewriter-bypass": "true"
        }
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) {
        return NextResponse.next();
      }
      let html = await response.text();
      html = injectMetaTags(html, metaTags, true);
      if (debug) {
        console.log(`[HtmlRewriter] Injected meta tags for ${pathname}`);
      }
      return new NextResponse(html, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers),
          "x-html-rewriter": "processed"
        }
      });
    } catch (error) {
      console.error(`[HtmlRewriter] Error processing ${pathname}:`, error);
      return NextResponse.next();
    }
  };
}
function createMatcher(paths) {
  return {
    matcher: paths
  };
}

export {
  createHtmlRewriterMiddleware,
  createMatcher
};
