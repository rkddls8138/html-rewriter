/**
 * SEO API Client
 * Edge Function API를 통해 SEO 메타 태그를 가져오는 순수 HTTP 클라이언트
 * Supabase 의존성 제로 - fetch API만 사용
 * 캐싱: Next.js fetch revalidate
 */

import type { MetaTags } from './index';

// ============================================================
// Types
// ============================================================

export interface FetchSeoOptions {
  /** 캐시 비활성화 @default false */
  noCache?: boolean;
  /** API key 직접 전달 (기본: process.env.SEO_REWRITER_API_KEY) */
  apiKey?: string;
  /** 캐시 revalidate 주기 (초) @default 3600 */
  revalidate?: number;
}

// ============================================================
// Constants
// ============================================================

const SEO_API_URL = 'https://iwoeewimpwdqbunnipol.supabase.co/functions/v1/seo-rules';
const DEFAULT_REVALIDATE = 3600; // 1시간

// ============================================================
// Public API
// ============================================================

/**
 * 경로에 매칭되는 SEO 메타 태그를 Edge Function API에서 가져오기
 *
 * 캐싱 전략:
 * - Next.js SSR: fetch의 next.revalidate 옵션으로 ISR 스타일 캐싱
 * - 비-Next.js 환경: 표준 fetch (캐싱 없음, CDN Cache-Control에 의존)
 *
 * @param path - URL 경로 (예: '/vehicles/tucson')
 * @param options - 캐시 제어 및 API key 옵션
 * @returns MetaTags 객체 (매칭 없으면 빈 객체)
 */
export async function fetchSeoMeta(
  path: string,
  options?: FetchSeoOptions
): Promise<MetaTags> {
  const apiKey = options?.apiKey || process.env.SEO_REWRITER_API_KEY;

  if (!apiKey) {
    console.warn('[SeoSDK] SEO_REWRITER_API_KEY not set');
    return {};
  }

  try {
    const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(5000),
    };

    // Next.js 서버 환경에서만 next.revalidate 적용
    if (typeof window === 'undefined') {
      fetchOptions.next = {
        revalidate: options?.noCache ? 0 : (options?.revalidate ?? DEFAULT_REVALIDATE),
      };
    }

    const response = await fetch(
      `${SEO_API_URL}?path=${encodeURIComponent(path)}`,
      fetchOptions
    );

    if (!response.ok) return {};

    return await response.json() as MetaTags;
  } catch (error) {
    console.error('[SeoSDK] Failed to fetch meta:', error);
    return {};
  }
}

/**
 * SEO 캐시 초기화
 * Next.js 환경에서는 fetch 캐시가 자동 관리되므로 주로 테스트/디버깅용
 */
export function clearSeoCache(): void {
  // Next.js fetch revalidate 기반 캐싱은 프레임워크가 관리
  // 비-Next.js 환경이나 테스트에서 수동 초기화가 필요할 때 사용
}
