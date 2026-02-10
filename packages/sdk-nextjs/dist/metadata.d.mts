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
/**
 * 동적 메타데이터 생성을 위한 헬퍼
 * API 호출 등 비동기 작업 후 메타데이터 반환
 */
declare function generateDynamicSeoMetadata(fetcher: () => Promise<MetaTags>): Promise<Metadata>;
/**
 * 규칙 기반 메타데이터 생성
 */
interface MetadataRule {
    path: string | RegExp;
    metadata: MetaTags | ((params: Record<string, string>) => MetaTags | Promise<MetaTags>);
}
declare function createMetadataRules(rules: MetadataRule[]): (pathname: string, params?: Record<string, string>) => Promise<Metadata | null>;

export { type MetadataRule, createMetadataRules, generateDynamicSeoMetadata, generateSeoMetadata };
