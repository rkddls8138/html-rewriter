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

// src/app-router/index.ts
var app_router_exports = {};
__export(app_router_exports, {
  createMetadataFetcher: () => createMetadataFetcher,
  fetchAndGenerateMetadata: () => fetchAndGenerateMetadata,
  generateSeoMetadata: () => generateSeoMetadata
});
module.exports = __toCommonJS(app_router_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createMetadataFetcher,
  fetchAndGenerateMetadata,
  generateSeoMetadata
});
