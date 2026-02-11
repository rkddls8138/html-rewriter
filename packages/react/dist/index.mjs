// src/index.ts
export * from "@rkddls8138/seo-core";

// src/context.tsx
import { createContext, useContext, useState, useCallback } from "react";
import { jsx } from "react/jsx-runtime";
var SeoContext = createContext(null);
function SeoProvider({ children, defaultMeta = {} }) {
  const [meta, setMetaState] = useState(defaultMeta);
  const setMeta = useCallback((tags) => {
    setMetaState(tags);
  }, []);
  const updateMeta = useCallback((tags) => {
    setMetaState((prev) => ({ ...prev, ...tags }));
  }, []);
  const clearMeta = useCallback(() => {
    setMetaState(defaultMeta);
  }, [defaultMeta]);
  return /* @__PURE__ */ jsx(SeoContext.Provider, { value: { meta, setMeta, updateMeta, clearMeta }, children });
}
function useSeoContext() {
  const context = useContext(SeoContext);
  if (!context) {
    throw new Error("useSeoContext must be used within a SeoProvider");
  }
  return context;
}

// src/hooks.ts
import { useEffect } from "react";
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
  useEffect(() => {
    applyMetaTagsToDOM(tags);
  }, deps);
}
function useSeoMetaContext() {
  const { meta, setMeta, updateMeta, clearMeta } = useSeoContext();
  useEffect(() => {
    applyMetaTagsToDOM(meta);
  }, [meta]);
  return { meta, setMeta, updateMeta, clearMeta };
}
function usePageMeta(tags, deps = []) {
  const { setMeta } = useSeoContext();
  useEffect(() => {
    setMeta(tags);
  }, deps);
}
export {
  SeoProvider,
  usePageMeta,
  useSeoContext,
  useSeoMeta,
  useSeoMetaContext
};
