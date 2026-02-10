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

// src/metadata.ts
var metadata_exports = {};
__export(metadata_exports, {
  createMetadataRules: () => createMetadataRules,
  generateDynamicSeoMetadata: () => generateDynamicSeoMetadata,
  generateSeoMetadata: () => generateSeoMetadata
});
module.exports = __toCommonJS(metadata_exports);
function generateSeoMetadata(tags) {
  const metadata = {};
  if (tags.title) {
    metadata.title = tags.title;
  }
  if (tags.description) {
    metadata.description = tags.description;
  }
  if (tags.keywords) {
    metadata.keywords = tags.keywords;
  }
  if (tags.robots) {
    metadata.robots = tags.robots;
  }
  if (tags.canonical) {
    metadata.alternates = {
      canonical: tags.canonical
    };
  }
  const hasOpenGraph = tags.ogTitle || tags.title || tags.ogDescription || tags.description || tags.ogImage || tags.ogUrl || tags.ogType || tags.ogSiteName;
  if (hasOpenGraph) {
    metadata.openGraph = {
      ...tags.ogTitle || tags.title ? { title: tags.ogTitle || tags.title } : {},
      ...tags.ogDescription || tags.description ? { description: tags.ogDescription || tags.description } : {},
      ...tags.ogImage ? { images: [{ url: tags.ogImage }] } : {},
      ...tags.ogUrl ? { url: tags.ogUrl } : {},
      ...tags.ogType ? { type: tags.ogType } : {},
      ...tags.ogSiteName ? { siteName: tags.ogSiteName } : {}
    };
  }
  const hasTwitter = tags.twitterCard || tags.twitterTitle || tags.ogTitle || tags.title || tags.twitterDescription || tags.ogDescription || tags.description || tags.twitterImage || tags.ogImage || tags.twitterSite;
  if (hasTwitter) {
    metadata.twitter = {
      ...tags.twitterCard ? { card: tags.twitterCard } : {},
      ...tags.twitterTitle || tags.ogTitle || tags.title ? { title: tags.twitterTitle || tags.ogTitle || tags.title } : {},
      ...tags.twitterDescription || tags.ogDescription || tags.description ? { description: tags.twitterDescription || tags.ogDescription || tags.description } : {},
      ...tags.twitterImage || tags.ogImage ? { images: [tags.twitterImage || tags.ogImage] } : {},
      ...tags.twitterSite ? { site: tags.twitterSite } : {}
    };
  }
  if (tags.custom) {
    metadata.other = tags.custom;
  }
  return metadata;
}
async function generateDynamicSeoMetadata(fetcher) {
  const tags = await fetcher();
  return generateSeoMetadata(tags);
}
function createMetadataRules(rules) {
  return async function getMetadataForPath(pathname, params = {}) {
    for (const rule of rules) {
      let matched = false;
      let extractedParams = { ...params };
      if (rule.path instanceof RegExp) {
        const match = pathname.match(rule.path);
        if (match) {
          matched = true;
          if (match.groups) {
            extractedParams = { ...extractedParams, ...match.groups };
          }
        }
      } else {
        const paramNames = [];
        const regexPattern = rule.path.replace(/:([^/]+)/g, (_, name) => {
          paramNames.push(name);
          return "([^/]+)";
        });
        const regex = new RegExp(`^${regexPattern}$`);
        const match = pathname.match(regex);
        if (match) {
          matched = true;
          paramNames.forEach((name, index) => {
            extractedParams[name] = match[index + 1];
          });
        }
      }
      if (matched) {
        let tags;
        if (typeof rule.metadata === "function") {
          tags = await rule.metadata(extractedParams);
        } else {
          tags = rule.metadata;
        }
        return generateSeoMetadata(tags);
      }
    }
    return null;
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createMetadataRules,
  generateDynamicSeoMetadata,
  generateSeoMetadata
});
