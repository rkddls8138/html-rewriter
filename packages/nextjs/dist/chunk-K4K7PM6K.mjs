// src/pages-router/SeoHead.tsx
import { memo } from "react";
import Head from "next/head";
import { fetchSeoMeta } from "@rkddls8138/seo-core";
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
var fetchSeoMetaForPages = (path, options) => fetchSeoMeta(path, options);
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
  fetchSeoMetaForPages,
  withSeoMeta
};
