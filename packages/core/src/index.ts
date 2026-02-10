/**
 * HTML Rewriter Core Library
 * SEO 최적화를 위한 HTML 파싱 및 Meta 태그 조작
 */

export interface MetaTags {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  robots?: string;
  // Open Graph
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  ogSiteName?: string;
  // Twitter Card
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  // Custom meta tags
  custom?: Record<string, string>;
}

export interface RewriteRule {
  path: string | RegExp;
  metaTags: MetaTags | ((url: string, params: Record<string, string>) => MetaTags | Promise<MetaTags>);
}

export interface HtmlRewriterConfig {
  apiKey?: string;
  rules: RewriteRule[];
  cache?: {
    enabled: boolean;
    ttl: number; // seconds
  };
  botUserAgents?: string[];
}

// Default bot user agents for major search engines
export const DEFAULT_BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'slurp',
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
];

/**
 * User-Agent가 검색엔진 봇인지 확인
 */
export function isBot(userAgent: string, customBots?: string[]): boolean {
  const ua = userAgent.toLowerCase();
  const bots = customBots || DEFAULT_BOT_USER_AGENTS;
  return bots.some(bot => ua.includes(bot.toLowerCase()));
}

/**
 * URL 경로에서 동적 파라미터 추출
 * 예: /product/:id -> { id: '123' }
 */
export function extractParams(pattern: string | RegExp, path: string): Record<string, string> | null {
  if (pattern instanceof RegExp) {
    const match = path.match(pattern);
    if (!match) return null;
    return match.groups || {};
  }

  // Convert path pattern to regex
  const paramNames: string[] = [];
  const regexPattern = pattern.replace(/:([^/]+)/g, (_, name) => {
    paramNames.push(name);
    return '([^/]+)';
  });

  const regex = new RegExp(`^${regexPattern}$`);
  const match = path.match(regex);

  if (!match) return null;

  const params: Record<string, string> = {};
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1];
  });

  return params;
}

/**
 * 매칭되는 규칙 찾기
 */
export function findMatchingRule(path: string, rules: RewriteRule[]): { rule: RewriteRule; params: Record<string, string> } | null {
  for (const rule of rules) {
    const params = extractParams(rule.path, path);
    if (params !== null) {
      return { rule, params };
    }
  }
  return null;
}

/**
 * Meta 태그를 HTML 문자열로 변환
 */
export function metaTagsToHtml(tags: MetaTags): string {
  const lines: string[] = [];

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

  // Open Graph
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

  // Twitter Card
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

  // Custom meta tags
  if (tags.custom) {
    for (const [name, content] of Object.entries(tags.custom)) {
      if (name.startsWith('og:') || name.startsWith('article:')) {
        lines.push(`<meta property="${escapeHtml(name)}" content="${escapeHtml(content)}">`);
      } else {
        lines.push(`<meta name="${escapeHtml(name)}" content="${escapeHtml(content)}">`);
      }
    }
  }

  return lines.join('\n    ');
}

/**
 * HTML 이스케이프
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * <head> 영역 내에서만 기존 Meta 태그 제거
 * React 하이드레이션 이슈 방지: <body>는 절대 수정하지 않음
 */
export function removeExistingMetaTagsInHead(headContent: string): string {
  // Remove title
  headContent = headContent.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');

  // Remove meta description, keywords, robots
  headContent = headContent.replace(/<meta\s+name=["'](description|keywords|robots)["'][^>]*>/gi, '');

  // Remove Open Graph tags
  headContent = headContent.replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '');

  // Remove Twitter Card tags
  headContent = headContent.replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '');

  // Remove canonical link
  headContent = headContent.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '');

  return headContent;
}

/**
 * @deprecated Use removeExistingMetaTagsInHead instead
 */
export function removeExistingMetaTags(html: string): string {
  return removeExistingMetaTagsInHead(html);
}

/**
 * HTML <head>에만 Meta 태그 주입 (하이드레이션 안전)
 *
 * 핵심 원리:
 * 1. <head>...</head> 영역만 추출
 * 2. 해당 영역 내에서만 메타 태그 교체/추가
 * 3. <body>는 절대 수정하지 않음 → React 하이드레이션 에러 방지
 */
export function injectMetaTags(html: string, metaTags: MetaTags, replace: boolean = true): string {
  // <head> 태그 매칭 (열림/닫힘 태그 포함)
  const headRegex = /(<head[^>]*>)([\s\S]*?)(<\/head>)/i;
  const headMatch = html.match(headRegex);

  if (!headMatch) {
    // <head>가 없으면 <body> 앞에 새로 생성
    const metaHtml = metaTagsToHtml(metaTags);
    const bodyMatch = html.match(/<body[^>]*>/i);
    if (bodyMatch) {
      const insertPosition = bodyMatch.index!;
      return html.slice(0, insertPosition) + `<head>\n    ${metaHtml}\n</head>\n` + html.slice(insertPosition);
    }
    return `<head>\n    ${metaHtml}\n</head>\n` + html;
  }

  const headOpenTag = headMatch[1];   // <head> or <head ...>
  let headContent = headMatch[2];      // <head> 내부 컨텐츠
  const headCloseTag = headMatch[3];   // </head>

  // <head> 내부에서만 기존 메타 태그 제거
  if (replace) {
    headContent = removeExistingMetaTagsInHead(headContent);
  }

  // 새 메타 태그 생성 및 삽입
  const metaHtml = metaTagsToHtml(metaTags);
  const newHeadContent = `\n    ${metaHtml}${headContent}`;

  // <head> 영역만 교체하여 반환 (<body>는 그대로 유지)
  return html.replace(headRegex, `${headOpenTag}${newHeadContent}${headCloseTag}`);
}

/**
 * HTML <head>에만 Meta 태그 주입 (명시적 함수명)
 * injectMetaTags의 별칭으로, 하이드레이션 안전성을 강조
 */
export function injectMetaTagsHeadOnly(html: string, metaTags: MetaTags, replace: boolean = true): string {
  return injectMetaTags(html, metaTags, replace);
}

/**
 * Simple in-memory cache
 */
export class MetaTagCache {
  private cache: Map<string, { tags: MetaTags; expires: number }> = new Map();

  set(key: string, tags: MetaTags, ttlSeconds: number): void {
    this.cache.set(key, {
      tags,
      expires: Date.now() + ttlSeconds * 1000,
    });
  }

  get(key: string): MetaTags | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.tags;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Export singleton cache instance
export const metaTagCache = new MetaTagCache();
