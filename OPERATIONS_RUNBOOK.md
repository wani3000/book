# 다니엘의 노트 운영 런북

최종 갱신: 2026-07-23 KST

## 배포 원칙

- 운영 대상은 Vercel `oxaz1234-gmailcoms-projects/danielsnote`다.
- 공개 도메인은 `https://danielsnote.com` 하나만 사용한다.
- 비밀값은 Vercel 환경변수에만 저장하고 Git·문서·화면 캡처에 남기지 않는다.
- 운영에서 `QA_LOGIN_ENABLED=false`, `QA_LOGIN_ALLOW_PRODUCTION=false`를 유지한다.
- 결제 승인 전 `NEXT_PUBLIC_KAKAOPAY_ENABLED=false`, `NEXT_PUBLIC_NAVERPAY_ENABLED=false`를 유지한다.

## 배포 전 체크

1. `git status`에서 의도하지 않은 파일이 없는지 확인한다.
2. `npm run lint && npm test`를 통과한다.
3. `NEXT_PUBLIC_BUSINESS_PHONE=070-4715-6450 npm run check:merchant`를 통과한다.
4. Turso 백업을 생성하고 복구 가능 여부를 확인한다.
5. 최신 PDF의 SHA-256·크기·쪽수를 기록하고 Blob 객체와 대조한다.
6. 결제·OAuth·메일 환경변수의 존재 여부만 확인하고 값은 출력하지 않는다.

## 배포 후 체크

1. `/api/health`가 HTTP 200, `database=ok`, `schema=0009`인지 확인한다.
2. `/`, `/codex`, `/career`, `/jane`, 정책 3종을 데스크톱·모바일에서 확인한다.
3. Google·카카오 로그인, 로그아웃, 새로고침 후 세션 유지, 마이페이지 하위 URL을 확인한다.
4. 테스트 구매자 계정으로 세 권 PDF가 열리고, 비로그인·미구매 요청은 401·403인지 확인한다.
5. `/library-assets/*.pdf` 같은 공개 주소가 404인지 확인한다.
6. 활성 결제수단마다 성공·취소·실패·시간초과·중복 콜백·전액 환불을 검증한다.
7. 환불 완료 후 주문 상태가 바뀌고 PDF 권한이 즉시 회수되는지 확인한다.

## 데이터 백업과 복원

- 매일 Turso 논리 백업을 만들고 30일 보관한다.
- 월 1회 별도 테스트 DB로 복원해 테이블별 행 수와 회원·주문·권한·환불 관계를 대조한다.
- migration은 순방향 적용한다. 파괴적 변경은 새 구조 생성 → 데이터 복사 → 검증 → 전환 순서로 진행한다.
- 이전 D1 최종 백업은 Git 제외 경로 `tmp/d1-backup/production-20260723.json`에 있다. 대상 DB가 비어 있을 때만 가져온다.
- 복원 후 `/api/health`와 `members`, `auth_identities`, `orders`, `refund_requests`, `notification_outbox`를 확인한다.

## PDF 운영

- 판매 파일은 Private Vercel Blob `danielsnote-books`의 `ebooks/` 경로에만 둔다.
- 현재 기준은 Codex 230쪽, UI/UX 커리어 90쪽, 제인 커리어 78쪽이다.
- 교체 전후 해시와 쪽수를 대조하고 같은 경로로 덮어쓴 뒤 권한 스트리밍을 다시 검증한다.
- Blob 토큰을 브라우저나 공개 API 응답에 노출하지 않는다.

## 결제·환불

- 운영 키 등록 후 승인된 수단만 개별 활성화한다.
- `reconcile`, `approving`, `refund_pending`, `refund_processing`이 10분 이상 지속되면 `/admin/payments`에서 제공사 상태를 대조한다.
- 장애 시 해당 결제 플래그를 먼저 끄고 기존 구매자의 PDF 권한은 유지한다.
- 전액 취소 성공 후에만 주문을 환불 상태로 바꾸고 권한을 회수한다.

## 이메일과 분석

- `RESEND_API_KEY`, `TRANSACTIONAL_EMAIL_FROM`, `CUSTOMER_SUPPORT_EMAIL`을 설정한다.
- 실패 메일은 `notification_outbox`에서 확인하고 관리자 화면에서 재시도한다.
- GA4는 방문자가 동의한 경우에만 실행한다. `page_view`, `view_item`, `begin_checkout`, 검증된 `purchase`를 확인한다.
- 이벤트에 이메일·이름·전화번호를 넣지 않는다.

## 관리자 보안과 사고 대응

- 관리자 Google·카카오 계정은 2단계 인증을 유지하고 공유 계정을 사용하지 않는다.
- 민감한 관리자 변경은 최근 30분 이내 재인증을 요구하며 `audit_logs`에 남긴다.
- 키 유출 시 결제 비활성화 → 키 폐기 → 로그 확인 → 새 키 등록 → 스모크 테스트 → 필요 시 이용자 통지 순서로 대응한다.
- 사업장 상세 호수와 거주 정보는 어떤 화면·로그·문서에도 공개하지 않는다. 공개 주소는 `서울특별시 구로구 고척로 49`까지만 사용한다.
