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
export {
  createMetadataFetcher,
  fetchAndGenerateMetadata,
  generateSeoMetadata
};
