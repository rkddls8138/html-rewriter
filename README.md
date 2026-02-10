# HTML Rewriter SDK

SEO 최적화를 위한 HTML 리라이팅 SDK. CSR 애플리케이션에 동적으로 Meta 태그를 주입합니다.

## 패키지

| 패키지 | 설명 | 버전 |
|--------|------|------|
| `@aspect-seo/core` | 공통 로직 (봇 감지, Meta 태그 주입) | 0.1.0 |
| `@aspect-seo/nextjs` | Next.js 미들웨어 SDK | 0.1.1 |

## 설치

### 1. GitHub Package Registry 인증

프로젝트에 `.npmrc` 파일 생성:

```
@aspect-seo:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

### 2. 패키지 설치

```bash
npm install @aspect-seo/core @aspect-seo/nextjs
```

### 3. 버전 업데이트

```bash
# 최신 버전으로 업데이트
npm update @aspect-seo/nextjs

# 특정 버전 설치
npm install @aspect-seo/nextjs@0.1.1
```

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 빌드
npm run build

# 개발 모드 (watch)
npm run dev

# 타입 체크
npm run typecheck
```

## 문서

- [아키텍처 설계](./docs/ARCHITECTURE.md)
- [SDK 설정 가이드](./docs/SDK_SETUP.md)
- [테스터 가이드](./TESTER_GUIDE.md)

## 라이센스

MIT
