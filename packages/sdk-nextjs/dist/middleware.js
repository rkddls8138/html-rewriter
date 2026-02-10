"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/middleware.ts
var middleware_exports = {};
__export(middleware_exports, {
  createHtmlRewriterMiddleware: () => createHtmlRewriterMiddleware,
  createMatcher: () => createMatcher
});
module.exports = __toCommonJS(middleware_exports);
var import_server = require("next/server");
var import_core = require("@aspect-seo/core");
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
      return import_server.NextResponse.next();
    }
    const userAgent = request.headers.get("user-agent") || "";
    const pathname = request.nextUrl.pathname;
    const url = request.url;
    if (debug) {
      console.log(`[HtmlRewriter] Request: ${pathname}`);
      console.log(`[HtmlRewriter] User-Agent: ${userAgent}`);
    }
    const isBotRequest = (0, import_core.isBot)(userAgent, botUserAgents);
    if (!isBotRequest && !applyToAllUsers) {
      if (debug) {
        console.log(`[HtmlRewriter] Skipping: Not a bot request`);
      }
      return import_server.NextResponse.next();
    }
    const match = (0, import_core.findMatchingRule)(pathname, rules);
    if (!match) {
      if (debug) {
        console.log(`[HtmlRewriter] Skipping: No matching rule for ${pathname}`);
      }
      return import_server.NextResponse.next();
    }
    const { rule, params } = match;
    try {
      const cacheKey = `meta:${pathname}`;
      let metaTags = null;
      if (cache.enabled) {
        metaTags = import_core.metaTagCache.get(cacheKey);
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
          import_core.metaTagCache.set(cacheKey, metaTags, cache.ttl);
        }
      }
      if (!metaTags) {
        return import_server.NextResponse.next();
      }
      const response = await fetch(request.url, {
        headers: {
          ...Object.fromEntries(request.headers),
          "x-html-rewriter-bypass": "true"
        }
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) {
        return import_server.NextResponse.next();
      }
      let html = await response.text();
      html = (0, import_core.injectMetaTags)(html, metaTags, true);
      if (debug) {
        console.log(`[HtmlRewriter] Injected meta tags for ${pathname}`);
      }
      return new import_server.NextResponse(html, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers),
          "x-html-rewriter": "processed"
        }
      });
    } catch (error) {
      console.error(`[HtmlRewriter] Error processing ${pathname}:`, error);
      return import_server.NextResponse.next();
    }
  };
}
function createMatcher(paths) {
  return {
    matcher: paths
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createHtmlRewriterMiddleware,
  createMatcher
});
