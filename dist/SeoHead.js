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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/SeoHead.tsx
var SeoHead_exports = {};
__export(SeoHead_exports, {
  SeoHead: () => SeoHead,
  metaTagsToSeoHeadProps: () => metaTagsToSeoHeadProps
});
module.exports = __toCommonJS(SeoHead_exports);
var import_head = __toESM(require("next/head"));
var import_jsx_runtime = require("react/jsx-runtime");
function SeoHead({
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_head.default, { children: [
    title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: title }),
    description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { name: "description", content: description }),
    keywords && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { name: "keywords", content: keywords }),
    robots && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { name: "robots", content: robots }),
    canonical && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("link", { rel: "canonical", href: canonical }),
    (ogTitle || title) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { property: "og:title", content: ogTitle || title }),
    (ogDescription || description) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { property: "og:description", content: ogDescription || description }),
    ogImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { property: "og:image", content: ogImage }),
    ogUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { property: "og:url", content: ogUrl }),
    ogType && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { property: "og:type", content: ogType }),
    ogSiteName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { property: "og:site_name", content: ogSiteName }),
    twitterCard && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { name: "twitter:card", content: twitterCard }),
    (twitterTitle || ogTitle || title) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { name: "twitter:title", content: twitterTitle || ogTitle || title }),
    (twitterDescription || ogDescription || description) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "meta",
      {
        name: "twitter:description",
        content: twitterDescription || ogDescription || description
      }
    ),
    (twitterImage || ogImage) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { name: "twitter:image", content: twitterImage || ogImage }),
    twitterSite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { name: "twitter:site", content: twitterSite }),
    custom && Object.entries(custom).map(([name, content]) => {
      if (name.startsWith("og:") || name.startsWith("article:")) {
        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { property: name, content }, name);
      }
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { name, content }, name);
    })
  ] });
}
function metaTagsToSeoHeadProps(tags) {
  return { ...tags };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SeoHead,
  metaTagsToSeoHeadProps
});
