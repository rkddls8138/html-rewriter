import { Metadata } from 'next';
import { MetaTags } from '@rkddls8138/seo-core';

/**
 * Next.js App Router Metadata Support
 * generateMetadata 함수와 함께 사용
 */

/**
 * MetaTags를 Next.js Metadata 형식으로 변환
 */
declare function generateSeoMetadata(tags: MetaTags): Metadata;
interface FetchMetadataOptions {
    /** 캐시 비활성화 */
    noCache?: boolean;
    /** API key 직접 전달 */
    apiKey?: string;
}
/**
 * Edge Function API에서 메타 태그를 가져와 Next.js Metadata 형식으로 반환
 * API key는 process.env.SEO_REWRITER_API_KEY에서 자동 로드
 */
declare function fetchAndGenerateMetadata(path: string, options?: FetchMetadataOptions): Promise<Metadata>;
/**
 * 옵션을 미리 구성하여 재사용 가능한 메타데이터 fetcher 생성
 */
declare function createMetadataFetcher(options?: FetchMetadataOptions): (path: string) => Promise<Metadata>;

export { type FetchMetadataOptions, createMetadataFetcher, fetchAndGenerateMetadata, generateSeoMetadata };
