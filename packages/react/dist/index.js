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
  SeoProvider: () => SeoProvider,
  usePageMeta: () => usePageMeta,
  useSeoContext: () => useSeoContext,
  useSeoMeta: () => useSeoMeta,
  useSeoMetaContext: () => useSeoMetaContext
});
module.exports = __toCommonJS(index_exports);
__reExport(index_exports, require("@rkddls8138/seo-core"), module.exports);

// src/context.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var SeoContext = (0, import_react.createContext)(null);
function SeoProvider({ children, defaultMeta = {} }) {
  const [meta, setMetaState] = (0, import_react.useState)(defaultMeta);
  const setMeta = (0, import_react.useCallback)((tags) => {
    setMetaState(tags);
  }, []);
  const updateMeta = (0, import_react.useCallback)((tags) => {
    setMetaState((prev) => ({ ...prev, ...tags }));
  }, []);
  const clearMeta = (0, import_react.useCallback)(() => {
    setMetaState(defaultMeta);
  }, [defaultMeta]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeoContext.Provider, { value: { meta, setMeta, updateMeta, clearMeta }, children });
}
function useSeoContext() {
  const context = (0, import_react.useContext)(SeoContext);
  if (!context) {
    throw new Error("useSeoContext must be used within a SeoProvider");
  }
  return context;
}

// src/hooks.ts
var import_react2 = require("react");
function applyMetaTagsToDOM(tags) {
  if (typeof document === "undefined") return;
  if (tags.title) {
    document.title = tags.title;
  }
  const updateMeta = (selector, content, isProperty = false) => {
    let meta = document.querySelector(selector);
    if (!meta) {
      meta = document.createElement("meta");
      if (isProperty) {
        const propMatch = selector.match(/property="([^"]+)"/);
        if (propMatch) meta.setAttribute("property", propMatch[1]);
      } else {
        const nameMatch = selector.match(/name="([^"]+)"/);
        if (nameMatch) meta.setAttribute("name", nameMatch[1]);
      }
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  };
  if (tags.description) updateMeta('meta[name="description"]', tags.description);
  if (tags.keywords) updateMeta('meta[name="keywords"]', tags.keywords);
  if (tags.robots) updateMeta('meta[name="robots"]', tags.robots);
  if (tags.canonical) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", tags.canonical);
  }
  if (tags.ogTitle) updateMeta('meta[property="og:title"]', tags.ogTitle, true);
  if (tags.ogDescription) updateMeta('meta[property="og:description"]', tags.ogDescription, true);
  if (tags.ogImage) updateMeta('meta[property="og:image"]', tags.ogImage, true);
  if (tags.ogUrl) updateMeta('meta[property="og:url"]', tags.ogUrl, true);
  if (tags.ogType) updateMeta('meta[property="og:type"]', tags.ogType, true);
  if (tags.ogSiteName) updateMeta('meta[property="og:site_name"]', tags.ogSiteName, true);
  if (tags.twitterCard) updateMeta('meta[name="twitter:card"]', tags.twitterCard);
  if (tags.twitterTitle) updateMeta('meta[name="twitter:title"]', tags.twitterTitle);
  if (tags.twitterDescription) updateMeta('meta[name="twitter:description"]', tags.twitterDescription);
  if (tags.twitterImage) updateMeta('meta[name="twitter:image"]', tags.twitterImage);
  if (tags.twitterSite) updateMeta('meta[name="twitter:site"]', tags.twitterSite);
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
function useSeoMeta(tags, deps = []) {
  (0, import_react2.useEffect)(() => {
    applyMetaTagsToDOM(tags);
  }, deps);
}
function useSeoMetaContext() {
  const { meta, setMeta, updateMeta, clearMeta } = useSeoContext();
  (0, import_react2.useEffect)(() => {
    applyMetaTagsToDOM(meta);
  }, [meta]);
  return { meta, setMeta, updateMeta, clearMeta };
}
function usePageMeta(tags, deps = []) {
  const { setMeta } = useSeoContext();
  (0, import_react2.useEffect)(() => {
    setMeta(tags);
  }, deps);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SeoProvider,
  usePageMeta,
  useSeoContext,
  useSeoMeta,
  useSeoMetaContext,
  ...require("@rkddls8138/seo-core")
});
