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
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  HtmlRewriterProvider: () => HtmlRewriterProvider,
  createHtmlRewriterMiddleware: () => createHtmlRewriterMiddleware,
  useHtmlRewriter: () => useHtmlRewriter,
  usePageMeta: () => usePageMeta
});
module.exports = __toCommonJS(index_exports);
__reExport(index_exports, require("@rkddls8138/seo-core"), module.exports);

// src/middleware.ts
var import_server = require("next/server");
var import_seo_core = require("@rkddls8138/seo-core");
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
    const isBotRequest = (0, import_seo_core.isBot)(userAgent, botUserAgents);
    if (!isBotRequest && !applyToAllUsers) {
      if (debug) {
        console.log(`[HtmlRewriter] Skipping: Not a bot request`);
      }
      return import_server.NextResponse.next();
    }
    const match = (0, import_seo_core.findMatchingRule)(pathname, rules);
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
        metaTags = import_seo_core.metaTagCache.get(cacheKey);
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
          import_seo_core.metaTagCache.set(cacheKey, metaTags, cache.ttl);
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
      html = (0, import_seo_core.injectMetaTags)(html, metaTags, true);
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

// src/provider.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var HtmlRewriterContext = (0, import_react.createContext)(null);
function applyMetaTags(tags) {
  if (typeof document === "undefined") return;
  if (tags.title) {
    document.title = tags.title;
  }
  const updateMeta = (selector, content, isProperty = false) => {
    let meta = document.querySelector(selector);
    if (!meta) {
      meta = document.createElement("meta");
      if (isProperty) {
        meta.setAttribute("property", selector.match(/property="([^"]+)"/)?.[1] || "");
      } else {
        meta.setAttribute("name", selector.match(/name="([^"]+)"/)?.[1] || "");
      }
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  };
  if (tags.description) {
    updateMeta('meta[name="description"]', tags.description);
  }
  if (tags.keywords) {
    updateMeta('meta[name="keywords"]', tags.keywords);
  }
  if (tags.robots) {
    updateMeta('meta[name="robots"]', tags.robots);
  }
  if (tags.canonical) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", tags.canonical);
  }
  if (tags.ogTitle) {
    updateMeta('meta[property="og:title"]', tags.ogTitle, true);
  }
  if (tags.ogDescription) {
    updateMeta('meta[property="og:description"]', tags.ogDescription, true);
  }
  if (tags.ogImage) {
    updateMeta('meta[property="og:image"]', tags.ogImage, true);
  }
  if (tags.ogUrl) {
    updateMeta('meta[property="og:url"]', tags.ogUrl, true);
  }
  if (tags.ogType) {
    updateMeta('meta[property="og:type"]', tags.ogType, true);
  }
  if (tags.ogSiteName) {
    updateMeta('meta[property="og:site_name"]', tags.ogSiteName, true);
  }
  if (tags.twitterCard) {
    updateMeta('meta[name="twitter:card"]', tags.twitterCard);
  }
  if (tags.twitterTitle) {
    updateMeta('meta[name="twitter:title"]', tags.twitterTitle);
  }
  if (tags.twitterDescription) {
    updateMeta('meta[name="twitter:description"]', tags.twitterDescription);
  }
  if (tags.twitterImage) {
    updateMeta('meta[name="twitter:image"]', tags.twitterImage);
  }
  if (tags.twitterSite) {
    updateMeta('meta[name="twitter:site"]', tags.twitterSite);
  }
  if (tags.custom) {
    for (const [name, content] of Object.entries(tags.custom)) {
      const isProperty = name.startsWith("og:") || name.startsWith("article:");
      if (isProperty) {
        updateMeta(`meta[property="${name}"]`, content, true);
      } else {
        updateMeta(`meta[name="${name}"]`, content);
      }
    }
  }
}
function HtmlRewriterProvider({ children, defaultTags }) {
  (0, import_react.useEffect)(() => {
    if (defaultTags) {
      applyMetaTags(defaultTags);
    }
  }, [defaultTags]);
  const setMetaTags = (0, import_react.useCallback)((tags) => {
    applyMetaTags(tags);
  }, []);
  const clearMetaTags = (0, import_react.useCallback)(() => {
    if (defaultTags) {
      applyMetaTags(defaultTags);
    }
  }, [defaultTags]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HtmlRewriterContext.Provider, { value: { setMetaTags, clearMetaTags }, children });
}
function useHtmlRewriter() {
  const context = (0, import_react.useContext)(HtmlRewriterContext);
  if (!context) {
    throw new Error("useHtmlRewriter must be used within HtmlRewriterProvider");
  }
  return context;
}
function usePageMeta(tags, deps = []) {
  const { setMetaTags } = useHtmlRewriter();
  (0, import_react.useEffect)(() => {
    setMetaTags(tags);
  }, deps);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HtmlRewriterProvider,
  createHtmlRewriterMiddleware,
  useHtmlRewriter,
  usePageMeta,
  ...require("@rkddls8138/seo-core")
});
