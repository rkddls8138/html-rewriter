/**
 * Next.js App Router Metadata Support
 * generateMetadata 함수와 함께 사용
 */

import type { Metadata } from 'next';
import type { MetaTags } from 'html-rewriter-seo-core';

/**
 * MetaTags를 Next.js Metadata 형식으로 변환
 */
export function generateSeoMetadata(tags: MetaTags): Metadata {
  const metadata: Metadata = {};

  // 기본 메타데이터
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

  // Canonical URL
  if (tags.canonical) {
    metadata.alternates = {
      canonical: tags.canonical,
    };
  }

  // Open Graph
  const hasOpenGraph =
    tags.ogTitle ||
    tags.title ||
    tags.ogDescription ||
    tags.description ||
    tags.ogImage ||
    tags.ogUrl ||
    tags.ogType ||
    tags.ogSiteName;

  if (hasOpenGraph) {
    metadata.openGraph = {
      ...(tags.ogTitle || tags.title ? { title: tags.ogTitle || tags.title } : {}),
      ...(tags.ogDescription || tags.description
        ? { description: tags.ogDescription || tags.description }
        : {}),
      ...(tags.ogImage ? { images: [{ url: tags.ogImage }] } : {}),
      ...(tags.ogUrl ? { url: tags.ogUrl } : {}),
      ...(tags.ogType ? { type: tags.ogType as 'website' | 'article' } : {}),
      ...(tags.ogSiteName ? { siteName: tags.ogSiteName } : {}),
    };
  }

  // Twitter Card
  const hasTwitter =
    tags.twitterCard ||
    tags.twitterTitle ||
    tags.ogTitle ||
    tags.title ||
    tags.twitterDescription ||
    tags.ogDescription ||
    tags.description ||
    tags.twitterImage ||
    tags.ogImage ||
    tags.twitterSite;

  if (hasTwitter) {
    metadata.twitter = {
      ...(tags.twitterCard
        ? { card: tags.twitterCard as 'summary' | 'summary_large_image' | 'app' | 'player' }
        : {}),
      ...(tags.twitterTitle || tags.ogTitle || tags.title
        ? { title: tags.twitterTitle || tags.ogTitle || tags.title }
        : {}),
      ...(tags.twitterDescription || tags.ogDescription || tags.description
        ? { description: tags.twitterDescription || tags.ogDescription || tags.description }
        : {}),
      ...(tags.twitterImage || tags.ogImage
        ? { images: [tags.twitterImage || tags.ogImage!] }
        : {}),
      ...(tags.twitterSite ? { site: tags.twitterSite } : {}),
    };
  }

  // Custom meta tags
  if (tags.custom) {
    metadata.other = tags.custom;
  }

  return metadata;
}

/**
 * 동적 메타데이터 생성을 위한 헬퍼
 * API 호출 등 비동기 작업 후 메타데이터 반환
 */
export async function generateDynamicSeoMetadata(
  fetcher: () => Promise<MetaTags>
): Promise<Metadata> {
  const tags = await fetcher();
  return generateSeoMetadata(tags);
}

/**
 * 규칙 기반 메타데이터 생성
 */
export interface MetadataRule {
  path: string | RegExp;
  metadata: MetaTags | ((params: Record<string, string>) => MetaTags | Promise<MetaTags>);
}

export function createMetadataRules(rules: MetadataRule[]) {
  return async function getMetadataForPath(
    pathname: string,
    params: Record<string, string> = {}
  ): Promise<Metadata | null> {
    for (const rule of rules) {
      let matched = false;
      let extractedParams: Record<string, string> = { ...params };

      if (rule.path instanceof RegExp) {
        const match = pathname.match(rule.path);
        if (match) {
          matched = true;
          if (match.groups) {
            extractedParams = { ...extractedParams, ...match.groups };
          }
        }
      } else {
        // Simple path pattern matching with :param syntax
        const paramNames: string[] = [];
        const regexPattern = rule.path.replace(/:([^/]+)/g, (_, name) => {
          paramNames.push(name);
          return '([^/]+)';
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
        let tags: MetaTags;
        if (typeof rule.metadata === 'function') {
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
