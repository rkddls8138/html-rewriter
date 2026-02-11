/**
 * SEO API Client
 * Edge Function API를 통해 SEO 메타 태그를 가져오는 순수 HTTP 클라이언트
 * Supabase 의존성 제로 - fetch API만 사용
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
}

// ============================================================
// Internal Cache
// ============================================================

interface CacheEntry<T> {
  data: T;
  expires: number;
}

class TtlCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, expires: Date.now() + ttlMs });
  }

  clear(): void {
    this.store.clear();
  }
}

// ============================================================
// Constants
// ============================================================

const SEO_API_URL = 'https://iwoeewimpwdqbunnipol.supabase.co/functions/v1/seo-rules';
const CACHE_TTL_MS = 3600 * 1000; // 1시간

// Singleton cache
const pathCache = new TtlCache<MetaTags>();

// ============================================================
// Public API
// ============================================================

/**
 * 경로에 매칭되는 SEO 메타 태그를 Edge Function API에서 가져오기
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

  // 캐시 확인
  if (!options?.noCache) {
    const cached = pathCache.get(path);
    if (cached) return cached;
  }

  try {
    const response = await fetch(
      `${SEO_API_URL}?path=${encodeURIComponent(path)}`,
      {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) return {};

    const tags: MetaTags = await response.json();

    // 캐시 저장
    if (!options?.noCache) {
      pathCache.set(path, tags, CACHE_TTL_MS);
    }

    return tags;
  } catch (error) {
    console.error('[SeoSDK] Failed to fetch meta:', error);
    return {};
  }
}

/**
 * 캐시 전체 초기화
 */
export function clearSeoCache(): void {
  pathCache.clear();
}
