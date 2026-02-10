# HTML Rewriter SDK

SEO 최적화를 위한 HTML 리라이팅 SDK. 검색엔진 봇에게 동적으로 Meta 태그를 주입합니다.

## 패키지 구조

```
packages/
├── core/           # html-rewriter-seo-core (공통 로직)
└── sdk-nextjs/     # html-rewriter-seo-nextjs (Next.js SDK)
```

## 개발 환경 설정

```bash
# 의존성 설치
pnpm install

# 빌드
pnpm build

# 개발 모드 (watch)
pnpm dev

# 타입 체크
pnpm typecheck
```

## 테스터 배포

### 1. 테스터 초대

1. GitHub 저장소 → Settings → Collaborators
2. 테스터 GitHub 계정 초대
3. 테스터에게 [TESTER_GUIDE.md](./TESTER_GUIDE.md) 공유

### 2. 테스터 설치 방법

```bash
pnpm add github:rkddls8138/html-rewriter#packages/sdk-nextjs
```

## 문서

- [아키텍처 설계](./docs/ARCHITECTURE.md)
- [SDK 설정 가이드](./docs/SDK_SETUP.md)
- [테스터 가이드](./TESTER_GUIDE.md)
- [작업 계획서](./WORK_PLAN.md)

## 라이센스

MIT


GitHub에서 모노레포의 하위 디렉토리를 직접 설치하는 것은 지원되지 않습니다. #packages/sdk-nextjs는 git 브랜치/태그로 해석됩니다.
