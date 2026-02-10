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
  const openGraph = {};
  let hasOpenGraph = false;
  if (tags.ogTitle || tags.title) {
    openGraph.title = tags.ogTitle || tags.title;
    hasOpenGraph = true;
  }
  if (tags.ogDescription || tags.description) {
    openGraph.description = tags.ogDescription || tags.description;
    hasOpenGraph = true;
  }
  if (tags.ogImage) {
    openGraph.images = [{ url: tags.ogImage }];
    hasOpenGraph = true;
  }
  if (tags.ogUrl) {
    openGraph.url = tags.ogUrl;
    hasOpenGraph = true;
  }
  if (tags.ogType) {
    openGraph.type = tags.ogType;
    hasOpenGraph = true;
  }
  if (tags.ogSiteName) {
    openGraph.siteName = tags.ogSiteName;
    hasOpenGraph = true;
  }
  if (hasOpenGraph) {
    metadata.openGraph = openGraph;
  }
  const twitter = {};
  let hasTwitter = false;
  if (tags.twitterCard) {
    twitter.card = tags.twitterCard;
    hasTwitter = true;
  }
  if (tags.twitterTitle || tags.ogTitle || tags.title) {
    twitter.title = tags.twitterTitle || tags.ogTitle || tags.title;
    hasTwitter = true;
  }
  if (tags.twitterDescription || tags.ogDescription || tags.description) {
    twitter.description = tags.twitterDescription || tags.ogDescription || tags.description;
    hasTwitter = true;
  }
  if (tags.twitterImage || tags.ogImage) {
    twitter.images = [tags.twitterImage || tags.ogImage];
    hasTwitter = true;
  }
  if (tags.twitterSite) {
    twitter.site = tags.twitterSite;
    hasTwitter = true;
  }
  if (hasTwitter) {
    metadata.twitter = twitter;
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
