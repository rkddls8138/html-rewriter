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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  DEFAULT_BOT_USER_AGENTS: () => DEFAULT_BOT_USER_AGENTS,
  MetaTagCache: () => MetaTagCache,
  escapeHtml: () => escapeHtml,
  extractParams: () => extractParams,
  findMatchingRule: () => findMatchingRule,
  injectMetaTags: () => injectMetaTags,
  isBot: () => isBot,
  metaTagCache: () => metaTagCache,
  metaTagsToHtml: () => metaTagsToHtml,
  removeExistingMetaTags: () => removeExistingMetaTags
});
module.exports = __toCommonJS(index_exports);
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
function removeExistingMetaTags(html) {
  html = html.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, "");
  html = html.replace(/<meta\s+name=["'](description|keywords|robots)["'][^>]*>/gi, "");
  html = html.replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, "");
  html = html.replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, "");
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "");
  return html;
}
function injectMetaTags(html, metaTags, replace = true) {
  if (replace) {
    html = removeExistingMetaTags(html);
  }
  const metaHtml = metaTagsToHtml(metaTags);
  const headMatch = html.match(/<head[^>]*>/i);
  if (headMatch) {
    const insertPosition = headMatch.index + headMatch[0].length;
    return html.slice(0, insertPosition) + "\n    " + metaHtml + html.slice(insertPosition);
  }
  const bodyMatch = html.match(/<body[^>]*>/i);
  if (bodyMatch) {
    return `<head>
    ${metaHtml}
</head>
` + html;
  }
  return `<head>
    ${metaHtml}
</head>
` + html;
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_BOT_USER_AGENTS,
  MetaTagCache,
  escapeHtml,
  extractParams,
  findMatchingRule,
  injectMetaTags,
  isBot,
  metaTagCache,
  metaTagsToHtml,
  removeExistingMetaTags
});
