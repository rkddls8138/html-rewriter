** HTML REWRITER **

1. 목적: SEO 최적화를 위한 HTML 리팩토링을 위한 라이브러리

AWS Market Place에 등록하기위한 CIS 벤치마크 및 Partner Hosted Foundational Technical Review Self-Assessment

참고 문서1: https://docs.aws.amazon.com/ko_kr/audit-manager/latest/userguide/CIS-1-4.html
참고 문서2: https://docs.aws.amazon.com/marketplace/latest/userguide/saas-product-settings.html#updating-architecture-details
참고 파일: "C:\Users\gi.kim\Downloads\Partner Hosted Foundational Technical Review Self-Assessment (1).xlsx"


** 중요 포인트 **
1. 각 웹 프레임워크별 대응(React, Angular, Vue, Svelte, spring, php 등... 
 - 주로 많이 쓰는 프레임워크별로 나와야 함. 전역으로 적용하는 케이스는 거의 없다고 봐야함(매 요청마다 API 호출시 비용부담 이슈)
 - 특정 페이지나, 특정 경로 이하의 페이지에만 적용하는것이 일반적()

2. 고객사 인프라 설정별 대응(CDN 사용유무, 리버스 프록시 사용유무 등..)

3. CSR, SSR 대응 방법(구글, Bing 두가지 케이스만 대응)

4. 우리는 어떤 서버로 구축하는것이 제일 효율적인지 분석

5. 프레밈워크별 SDK를 통합해서 관리할수있는 효율적인 방법 분석

6. middleware를 통한 효율적인 방법 분석

7. AWS 마켓플레이스 결제시 우리쪽 대쉬보드로 리다이렉트 및 API 사용량 모니터링 로그 기록등 제공

** HTML REWRITER 솔루션을 운영하기위한 AWS 서버 인프라 설정(아래 항목중 저비용 고성능 빠른 속도로 지원가능한 모델 선택) **
1. EC2 인스턴스
2. EKS 클러스터
3. CloudFront
4. Route53
5. S3 버킷
6. RDS