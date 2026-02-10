// src/SeoHead.tsx
import Head from "next/head";
import { jsx, jsxs } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs(Head, { children: [
    title && /* @__PURE__ */ jsx("title", { children: title }),
    description && /* @__PURE__ */ jsx("meta", { name: "description", content: description }),
    keywords && /* @__PURE__ */ jsx("meta", { name: "keywords", content: keywords }),
    robots && /* @__PURE__ */ jsx("meta", { name: "robots", content: robots }),
    canonical && /* @__PURE__ */ jsx("link", { rel: "canonical", href: canonical }),
    (ogTitle || title) && /* @__PURE__ */ jsx("meta", { property: "og:title", content: ogTitle || title }),
    (ogDescription || description) && /* @__PURE__ */ jsx("meta", { property: "og:description", content: ogDescription || description }),
    ogImage && /* @__PURE__ */ jsx("meta", { property: "og:image", content: ogImage }),
    ogUrl && /* @__PURE__ */ jsx("meta", { property: "og:url", content: ogUrl }),
    ogType && /* @__PURE__ */ jsx("meta", { property: "og:type", content: ogType }),
    ogSiteName && /* @__PURE__ */ jsx("meta", { property: "og:site_name", content: ogSiteName }),
    twitterCard && /* @__PURE__ */ jsx("meta", { name: "twitter:card", content: twitterCard }),
    (twitterTitle || ogTitle || title) && /* @__PURE__ */ jsx("meta", { name: "twitter:title", content: twitterTitle || ogTitle || title }),
    (twitterDescription || ogDescription || description) && /* @__PURE__ */ jsx(
      "meta",
      {
        name: "twitter:description",
        content: twitterDescription || ogDescription || description
      }
    ),
    (twitterImage || ogImage) && /* @__PURE__ */ jsx("meta", { name: "twitter:image", content: twitterImage || ogImage }),
    twitterSite && /* @__PURE__ */ jsx("meta", { name: "twitter:site", content: twitterSite }),
    custom && Object.entries(custom).map(([name, content]) => {
      if (name.startsWith("og:") || name.startsWith("article:")) {
        return /* @__PURE__ */ jsx("meta", { property: name, content }, name);
      }
      return /* @__PURE__ */ jsx("meta", { name, content }, name);
    })
  ] });
}
function metaTagsToSeoHeadProps(tags) {
  return { ...tags };
}

export {
  SeoHead,
  metaTagsToSeoHeadProps
};
