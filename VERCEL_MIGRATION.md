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

## 계정 소유자가 한 번 해야 하는 외부 단계

1. Vercel Dashboard에서 Marketplace 약관에 동의한다.
2. Turso Starter($0) 리소스 `danielsnote-db`, 리전 `hnd1`을 `danielsnote` 프로젝트에 연결한다.
3. `vercel env pull .env.local` 후 `npm run db:migrate`를 실행한다.
4. `ALLOW_DB_IMPORT=true npm run db:import -- tmp/d1-backup/production-20260723.json`으로 최종 D1 백업을 빈 DB에 한 번만 가져온다.
5. Sites에 있던 Google·카카오·Resend·GA4 환경변수를 Vercel Production/Preview에 등록한다.
6. Preview QA가 끝난 뒤 `danielsnote.com`을 Vercel 프로젝트에 추가하고 Namecheap DNS를 Vercel 안내값으로 바꾼다.

Marketplace 약관은 법적 동의이므로 자동화가 계정 소유자 대신 수락하지 않는다.

## 운영 전 환경변수 묶음

- 인프라: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BLOB_READ_WRITE_TOKEN`
- 사이트: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BUSINESS_PHONE`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- 인증: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_SESSION_SECRET`, `KAKAO_REST_API_KEY`, `KAKAO_CLIENT_SECRET`, `KAKAO_ADMIN_KEY`, `KAKAO_REDIRECT_URI`
- 이메일: `RESEND_API_KEY`, `TRANSACTIONAL_EMAIL_FROM`, `CUSTOMER_SUPPORT_EMAIL`
- 권한: `ADMIN_EMAILS`, `TEST_PURCHASER_EMAILS`
- 결제: 카카오페이·Npay 각 키와 활성화 플래그

## 전환 순서

Preview 배포 → health/로그인/마이페이지/PDF QA → 운영 데이터 최종 동기화 → 결제 플래그 확인 → 커스텀 도메인 연결 → OAuth 콜백 확인 → 검색·분석 확인 순서로 진행한다. 기존 Sites 서비스는 Vercel 운영 확인 전까지 롤백 경로로 유지한다.
