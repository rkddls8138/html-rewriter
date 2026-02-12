// src/index.ts
export * from "@rkddls8138/seo-core";

// src/app-router/metadata.ts
import { fetchSeoMeta } from "@rkddls8138/seo-core";
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
  const tags = await fetchSeoMeta(path, {
    noCache: options?.noCache,
    apiKey: options?.apiKey
  });
  return generateSeoMetadata(tags);
}
function createMetadataFetcher(options) {
  return (path) => fetchAndGenerateMetadata(path, options);
}

// src/pages-router/SeoHead.tsx
import { memo } from "react";
import Head from "next/head";
import { fetchSeoMeta as fetchSeoMeta2 } from "@rkddls8138/seo-core";
import { jsx, jsxs } from "react/jsx-runtime";
var SeoHead = memo(function SeoHead2({
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
  return /* @__PURE__ */ jsxs(Head, { children: [
    title ? /* @__PURE__ */ jsx("title", { children: title }) : null,
    description ? /* @__PURE__ */ jsx("meta", { name: "description", content: description }) : null,
    keywords ? /* @__PURE__ */ jsx("meta", { name: "keywords", content: keywords }) : null,
    robots ? /* @__PURE__ */ jsx("meta", { name: "robots", content: robots }) : null,
    canonical ? /* @__PURE__ */ jsx("link", { rel: "canonical", href: canonical }) : null,
    effectiveOgTitle ? /* @__PURE__ */ jsx("meta", { property: "og:title", content: effectiveOgTitle }) : null,
    effectiveOgDesc ? /* @__PURE__ */ jsx("meta", { property: "og:description", content: effectiveOgDesc }) : null,
    ogImage ? /* @__PURE__ */ jsx("meta", { property: "og:image", content: ogImage }) : null,
    ogUrl ? /* @__PURE__ */ jsx("meta", { property: "og:url", content: ogUrl }) : null,
    ogType ? /* @__PURE__ */ jsx("meta", { property: "og:type", content: ogType }) : null,
    ogSiteName ? /* @__PURE__ */ jsx("meta", { property: "og:site_name", content: ogSiteName }) : null,
    twitterCard ? /* @__PURE__ */ jsx("meta", { name: "twitter:card", content: twitterCard }) : null,
    effectiveTwTitle ? /* @__PURE__ */ jsx("meta", { name: "twitter:title", content: effectiveTwTitle }) : null,
    effectiveTwDesc ? /* @__PURE__ */ jsx("meta", { name: "twitter:description", content: effectiveTwDesc }) : null,
    effectiveTwImage ? /* @__PURE__ */ jsx("meta", { name: "twitter:image", content: effectiveTwImage }) : null,
    twitterSite ? /* @__PURE__ */ jsx("meta", { name: "twitter:site", content: twitterSite }) : null,
    custom ? Object.entries(custom).map(([name, content]) => /* @__PURE__ */ jsx(
      "meta",
      {
        ...name.startsWith("og:") || name.startsWith("article:") ? { property: name } : { name },
        content
      },
      name
    )) : null
  ] });
});
var fetchSeoMetaForPages = (path, options) => fetchSeoMeta2(path, options);
var withSeoMeta = (getServerSideProps, getPath, options) => async (context) => {
  const [meta, result] = await Promise.all([
    fetchSeoMetaForPages(getPath(context), options),
    getServerSideProps(context)
  ]);
  if (!("props" in result)) return result;
  return { props: { ...result.props, _seoMeta: meta } };
};
export {
  SeoHead,
  createMetadataFetcher,
  fetchAndGenerateMetadata,
  fetchSeoMetaForPages,
  generateSeoMetadata,
  withSeoMeta
};
