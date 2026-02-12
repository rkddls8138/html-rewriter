// src/seo-api-client.ts
var SEO_API_URL = "https://iwoeewimpwdqbunnipol.supabase.co/functions/v1/seo-rules";
var DEFAULT_REVALIDATE = 3600;
async function fetchSeoMeta(path, options) {
  const apiKey = options?.apiKey || process.env.SEO_REWRITER_API_KEY;
  if (!apiKey) {
    console.warn("[SeoSDK] SEO_REWRITER_API_KEY not set");
    return {};
  }
  try {
    const fetchOptions = {
      headers: { "Authorization": `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(5e3)
    };
    if (typeof window === "undefined") {
      fetchOptions.next = {
        revalidate: options?.noCache ? 0 : options?.revalidate ?? DEFAULT_REVALIDATE
      };
    }
    const response = await fetch(
      `${SEO_API_URL}?path=${encodeURIComponent(path)}`,
      fetchOptions
    );
    if (!response.ok) return {};
    return await response.json();
  } catch (error) {
    console.error("[SeoSDK] Failed to fetch meta:", error);
    return {};
  }
}
function clearSeoCache() {
}

// src/index.ts
var DEFAULT_BOT_USER_AGENTS = [
  "googlebot",
  "bingbot",
  "yandexbot",
  "duckduckbot",
  "slurp",
  "baiduspider",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegrambot"
];
function isBot(userAgent, customBots) {
  const ua = userAgent.toLowerCase();
  const bots = customBots || DEFAULT_BOT_USER_AGENTS;
  return bots.some((bot) => ua.includes(bot.toLowerCase()));
}
function extractParams(pattern, path) {
  if (pattern instanceof RegExp) {
    const match2 = path.match(pattern);
    if (!match2) return null;
    return match2.groups || {};
  }
  const paramNames = [];
  const regexPattern = pattern.replace(/:([^/]+)/g, (_, name) => {
    paramNames.push(name);
    return "([^/]+)";
  });
  const regex = new RegExp(`^${regexPattern}$`);
  const match = path.match(regex);
  if (!match) return null;
  const params = {};
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1];
  });
  return params;
}
function findMatchingRule(path, rules) {
  for (const rule of rules) {
    const params = extractParams(rule.path, path);
    if (params !== null) {
      return { rule, params };
    }
  }
  return null;
}
function metaTagsToHtml(tags) {
  const lines = [];
  if (tags.title) {
    lines.push(`<title>${escapeHtml(tags.title)}</title>`);
  }
  if (tags.description) {
    lines.push(`<meta name="description" content="${escapeHtml(tags.description)}">`);
  }
  if (tags.keywords) {
    lines.push(`<meta name="keywords" content="${escapeHtml(tags.keywords)}">`);
  }
  if (tags.canonical) {
    lines.push(`<link rel="canonical" href="${escapeHtml(tags.canonical)}">`);
  }
  if (tags.robots) {
    lines.push(`<meta name="robots" content="${escapeHtml(tags.robots)}">`);
  }
  if (tags.ogTitle) {
    lines.push(`<meta property="og:title" content="${escapeHtml(tags.ogTitle)}">`);
  }
  if (tags.ogDescription) {
    lines.push(`<meta property="og:description" content="${escapeHtml(tags.ogDescription)}">`);
  }
  if (tags.ogImage) {
    lines.push(`<meta property="og:image" content="${escapeHtml(tags.ogImage)}">`);
  }
  if (tags.ogUrl) {
    lines.push(`<meta property="og:url" content="${escapeHtml(tags.ogUrl)}">`);
  }
  if (tags.ogType) {
    lines.push(`<meta property="og:type" content="${escapeHtml(tags.ogType)}">`);
  }
  if (tags.ogSiteName) {
    lines.push(`<meta property="og:site_name" content="${escapeHtml(tags.ogSiteName)}">`);
  }
  if (tags.twitterCard) {
    lines.push(`<meta name="twitter:card" content="${escapeHtml(tags.twitterCard)}">`);
  }
  if (tags.twitterTitle) {
    lines.push(`<meta name="twitter:title" content="${escapeHtml(tags.twitterTitle)}">`);
  }
  if (tags.twitterDescription) {
    lines.push(`<meta name="twitter:description" content="${escapeHtml(tags.twitterDescription)}">`);
  }
  if (tags.twitterImage) {
    lines.push(`<meta name="twitter:image" content="${escapeHtml(tags.twitterImage)}">`);
  }
  if (tags.twitterSite) {
    lines.push(`<meta name="twitter:site" content="${escapeHtml(tags.twitterSite)}">`);
  }
  if (tags.custom) {
    for (const [name, content] of Object.entries(tags.custom)) {
      if (name.startsWith("og:") || name.startsWith("article:")) {
        lines.push(`<meta property="${escapeHtml(name)}" content="${escapeHtml(content)}">`);
      } else {
        lines.push(`<meta name="${escapeHtml(name)}" content="${escapeHtml(content)}">`);
      }
    }
  }
  return lines.join("\n    ");
}
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function removeExistingMetaTagsInHead(headContent) {
  headContent = headContent.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, "");
  headContent = headContent.replace(/<meta\s+name=["'](description|keywords|robots)["'][^>]*>/gi, "");
  headContent = headContent.replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, "");
  headContent = headContent.replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, "");
  headContent = headContent.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "");
  return headContent;
}
function removeExistingMetaTags(html) {
  return removeExistingMetaTagsInHead(html);
}
function injectMetaTags(html, metaTags, replace = true) {
  const headRegex = /(<head[^>]*>)([\s\S]*?)(<\/head>)/i;
  const headMatch = html.match(headRegex);
  if (!headMatch) {
    const metaHtml2 = metaTagsToHtml(metaTags);
    const bodyMatch = html.match(/<body[^>]*>/i);
    if (bodyMatch) {
      const insertPosition = bodyMatch.index;
      return html.slice(0, insertPosition) + `<head>
    ${metaHtml2}
</head>
` + html.slice(insertPosition);
    }
    return `<head>
    ${metaHtml2}
</head>
` + html;
  }
  const headOpenTag = headMatch[1];
  let headContent = headMatch[2];
  const headCloseTag = headMatch[3];
  if (replace) {
    headContent = removeExistingMetaTagsInHead(headContent);
  }
  const metaHtml = metaTagsToHtml(metaTags);
  const newHeadContent = `
    ${metaHtml}${headContent}`;
  return html.replace(headRegex, `${headOpenTag}${newHeadContent}${headCloseTag}`);
}
function injectMetaTagsHeadOnly(html, metaTags, replace = true) {
  return injectMetaTags(html, metaTags, replace);
}
var MetaTagCache = class {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
  }
  set(key, tags, ttlSeconds) {
    this.cache.set(key, {
      tags,
      expires: Date.now() + ttlSeconds * 1e3
    });
  }
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    return entry.tags;
  }
  clear() {
    this.cache.clear();
  }
};
var metaTagCache = new MetaTagCache();
export {
  DEFAULT_BOT_USER_AGENTS,
  MetaTagCache,
  clearSeoCache,
  escapeHtml,
  extractParams,
  fetchSeoMeta,
  findMatchingRule,
  injectMetaTags,
  injectMetaTagsHeadOnly,
  isBot,
  metaTagCache,
  metaTagsToHtml,
  removeExistingMetaTags,
  removeExistingMetaTagsInHead
};
