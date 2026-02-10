// src/metadata.ts
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

export {
  generateSeoMetadata,
  generateDynamicSeoMetadata,
  createMetadataRules
};
