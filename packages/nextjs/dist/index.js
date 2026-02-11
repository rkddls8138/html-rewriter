"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  SeoHead: () => SeoHead,
  SeoProvider: () => import_seo_react.SeoProvider,
  createMetadataFetcher: () => createMetadataFetcher,
  fetchAndGenerateMetadata: () => fetchAndGenerateMetadata,
  fetchSeoMetaForPages: () => fetchSeoMetaForPages,
  generateSeoMetadata: () => generateSeoMetadata,
  usePageMeta: () => import_seo_react.usePageMeta,
  useSeoContext: () => import_seo_react.useSeoContext,
  useSeoMeta: () => import_seo_react.useSeoMeta,
  useSeoMetaContext: () => import_seo_react.useSeoMetaContext,
  withSeoMeta: () => withSeoMeta
});
module.exports = __toCommonJS(index_exports);
__reExport(index_exports, require("@rkddls8138/seo-core"), module.exports);
var import_seo_react = require("@rkddls8138/seo-react");

// src/app-router/metadata.ts
var import_seo_core = require("@rkddls8138/seo-core");
function generateSeoMetadata(tags) {
  const metadata = {};
  if (tags.title) metadata.title = tags.title;
  if (tags.description) metadata.description = tags.description;
  if (tags.keywords) metadata.keywords = tags.keywords;
  if (tags.robots) metadata.robots = tags.robots;
  if (tags.canonical) metadata.alternates = { canonical: tags.canonical };
  const ogTitle = tags.ogTitle || tags.title;
  const ogDescription = tags.ogDescription || tags.description;
  if (ogTitle || ogDescription || tags.ogImage || tags.ogUrl || tags.ogType || tags.ogSiteName) {
    metadata.openGraph = {
      ...ogTitle && { title: ogTitle },
      ...ogDescription && { description: ogDescription },
      ...tags.ogImage && { images: [{ url: tags.ogImage }] },
      ...tags.ogUrl && { url: tags.ogUrl },
      ...tags.ogType && { type: tags.ogType },
      ...tags.ogSiteName && { siteName: tags.ogSiteName }
    };
  }
  const twTitle = tags.twitterTitle || ogTitle;
  const twDescription = tags.twitterDescription || ogDescription;
  const twImage = tags.twitterImage || tags.ogImage;
  if (tags.twitterCard || twTitle || twDescription || twImage || tags.twitterSite) {
    metadata.twitter = {
      ...tags.twitterCard && { card: tags.twitterCard },
      ...twTitle && { title: twTitle },
      ...twDescription && { description: twDescription },
      ...twImage && { images: [twImage] },
      ...tags.twitterSite && { site: tags.twitterSite }
    };
  }
  if (tags.custom) metadata.other = tags.custom;
  return metadata;
}
async function fetchAndGenerateMetadata(path, options) {
  const tags = await (0, import_seo_core.fetchSeoMeta)(path, {
    noCache: options?.noCache,
    apiKey: options?.apiKey
  });
  return generateSeoMetadata(tags);
}
function createMetadataFetcher(options) {
  return (path) => fetchAndGenerateMetadata(path, options);
}

// src/pages-router/SeoHead.tsx
var import_react = require("react");
var import_head = __toESM(require("next/head"));
var import_seo_core2 = require("@rkddls8138/seo-core");
var import_jsx_runtime = require("react/jsx-runtime");
var SeoHead = (0, import_react.memo)(function SeoHead2({
  title,
  description,
  keywords,
  canonical,
  robots,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType,
  ogSiteName,
  twitterCard,
  twitterTitle,
  twitterDescription,
  twitterImage,
  twitterSite,
  custom
}) {
  const effectiveOgTitle = ogTitle ?? title;
  const effectiveOgDesc = ogDescription ?? description;
  const effectiveTwTitle = twitterTitle ?? effectiveOgTitle;
  const effectiveTwDesc = twitterDescription ?? effectiveOgDesc;
  const effectiveTwImage = twitterImage ?? ogImage;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_head.default, { children: [
    title ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: title }) : null,
    description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { name: "description", content: description }) : null,
    keywords ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { name: "keywords", content: keywords }) : null,
    robots ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { name: "robots", content: robots }) : null,
    canonical ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("link", { rel: "canonical", href: canonical }) : null,
    effectiveOgTitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { property: "og:title", content: effectiveOgTitle }) : null,
    effectiveOgDesc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { property: "og:description", content: effectiveOgDesc }) : null,
    ogImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { property: "og:image", content: ogImage }) : null,
    ogUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { property: "og:url", content: ogUrl }) : null,
    ogType ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { property: "og:type", content: ogType }) : null,
    ogSiteName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { property: "og:site_name", content: ogSiteName }) : null,
    twitterCard ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { name: "twitter:card", content: twitterCard }) : null,
    effectiveTwTitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { name: "twitter:title", content: effectiveTwTitle }) : null,
    effectiveTwDesc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { name: "twitter:description", content: effectiveTwDesc }) : null,
    effectiveTwImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { name: "twitter:image", content: effectiveTwImage }) : null,
    twitterSite ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { name: "twitter:site", content: twitterSite }) : null,
    custom ? Object.entries(custom).map(([name, content]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "meta",
      {
        ...name.startsWith("og:") || name.startsWith("article:") ? { property: name } : { name },
        content
      },
      name
    )) : null
  ] });
});
var fetchSeoMetaForPages = (path, options) => (0, import_seo_core2.fetchSeoMeta)(path, options);
var withSeoMeta = (getServerSideProps, getPath, options) => async (context) => {
  const [meta, result] = await Promise.all([
    fetchSeoMetaForPages(getPath(context), options),
    getServerSideProps(context)
  ]);
  if (!("props" in result)) return result;
  return { props: { ...result.props, _seoMeta: meta } };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SeoHead,
  SeoProvider,
  createMetadataFetcher,
  fetchAndGenerateMetadata,
  fetchSeoMetaForPages,
  generateSeoMetadata,
  usePageMeta,
  useSeoContext,
  useSeoMeta,
  useSeoMetaContext,
  withSeoMeta,
  ...require("@rkddls8138/seo-core")
});
