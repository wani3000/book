# Vercel 이전 기록

최종 갱신: 2026-07-23 KST

## 목표 구조

- 앱: Vercel 프로젝트 `danielsnote`
- 운영 도메인: `danielsnote.com`
- DB: Turso/libSQL, 도쿄 인접 리전 `hnd1`
- 파일: Private Vercel Blob `danielsnote-books`, `hnd1`
- 소스: GitHub `wani3000/book`, `main`

## 완료

- Vercel 프로젝트 생성·로컬 연결
- vinext/Cloudflare 런타임을 표준 Next.js 빌드로 전환
- D1 Drizzle 어댑터를 libSQL 어댑터로 전환
- R2 PDF 읽기를 Private Vercel Blob `get()` 스트리밍으로 전환
- Blob 저장소 생성과 최신 PDF 3권 업로드
- D1 백업용 migration/import 스크립트 작성
- Vercel용 CSP·HSTS·프레임 차단 등 보안 헤더 이전
- 개인정보처리방침의 호스팅·저장 처리자 최신화
- Vercel Marketplace 약관 동의 및 Turso Starter($0) `danielsnote-db` 생성
- Turso `hnd1`을 Production·Preview·Development에 연결
- migration `0000`~`0009` 적용 및 D1 최종 백업 가져오기
- GitHub `wani3000/book` 연결 및 `main` 자동 배포 설정
- Vercel Authentication 해제, Framework Preset `Next.js` 적용
- 운영 배포 `/api/health` HTTP 200, `database=ok`, `schema=0009` 확인
- Namecheap 루트·`www` A 레코드를 Vercel `76.76.21.21`로 전환
- `danielsnote.com`·`www.danielsnote.com` HTTPS와 인증서 확인
- Google 운영 OAuth 클라이언트 생성, 운영 콜백과 Vercel 비밀 환경변수 등록
- 카카오 로그인 콜백·클라이언트 시크릿·어드민 키 등록
- Resend 도메인 인증 확인, 도메인 제한 운영 발송 키와 발신자 등록
- GA4, 고객지원, 관리자·테스트 구매자 환경변수 등록
- 운영 도메인에서 Google·카카오 로그인 시작 리디렉션과 Google 실제 로그인 확인
- 운영 `/api/health`에서 `notifications=configured` 확인
- 테스트 구매자 주문 3건·내 서재 PDF 3권 권한 확인
- Resend 운영 키를 통한 실제 테스트 메일 발송 성공
- Google Search Console 사이트맵 성공·발견 페이지 9개 확인
- GA4 다니엘의 노트 속성의 측정 태그 로드 확인
- 운영 카카오 계정 2단계 인증·대한민국 외 로그인 제한 활성 확인
- GitHub 공개 이력을 개인정보 없는 단일 기준 커밋으로 재작성하고 과거 공개 작업 브랜치 삭제

## 남은 외부 단계

1. GA4 실시간 보고서의 첫 데이터 반영을 확인한다.
2. 카카오페이·Npay 승인 후에만 각 운영 키를 등록하고 활성화 플래그를 켠다.

## 운영 전 환경변수 묶음

- 인프라: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BLOB_READ_WRITE_TOKEN`
- 사이트: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BUSINESS_PHONE`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- 인증: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_SESSION_SECRET`, `KAKAO_REST_API_KEY`, `KAKAO_CLIENT_SECRET`, `KAKAO_ADMIN_KEY`, `KAKAO_REDIRECT_URI`
- 이메일: `RESEND_API_KEY`, `TRANSACTIONAL_EMAIL_FROM`, `CUSTOMER_SUPPORT_EMAIL`
- 권한: `ADMIN_EMAILS`, `TEST_PURCHASER_EMAILS`
- 결제: 카카오페이·Npay 각 키와 활성화 플래그

## 전환 순서

인프라·도메인·OAuth·이메일·테스트 구매자 PDF 검증은 완료됐다. 이후 순서는 검색·분석 재수집 확인 → 결제사 승인 → 샌드박스 및 운영 결제·취소·환불 E2E → 승인된 결제수단만 활성화다.
