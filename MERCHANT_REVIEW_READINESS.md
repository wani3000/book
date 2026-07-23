# 카카오페이·Npay 가맹점 심사 제출 패키지

최종 갱신: 2026-07-21 (KST)

## 신청 결론

- 카카오페이: `독립형 온라인 쇼핑몰`의 `온라인 단건결제`
- Npay: `결제형` → `자체 개발 독립몰` → `단건결제`
- 판매 대상: 배송이 없는 PDF 전자책 3종, 각 19,000원
- 판매 주소: `https://danielsnote.com`
- 결제수단은 각각 별도 계약·심사·기술검수를 거쳐 승인된 수단만 공개한다.

Npay 주문형은 실물 상품용이므로 이 사이트에는 사용하지 않는다. 가입 전에는 승인된 것으로 오해할 수 있는 결제사 로고를 공개하지 않고, 계약 및 디자인 검수 단계에서 각 회사가 제공한 공식 자산만 적용한다.

## 신청서 공통 입력값

- 상호: 플로렌스랩(Florence Lab)
- 대표자: 박철완
- 사업자등록번호: 217-26-12405
- 개업일: 2020-01-16
- 통신판매업신고번호: 제 2020-서울구로-0138호
- 사업장 소재지: 서울특별시 구로구 고척로 49
- 전자우편: florencelab@naver.com
- 고객센터 운영시간: 평일 10:00–17:00 (공휴일 제외)
- 업종/상품 설명: 자체 제작한 PDF 전자책을 소비자에게 단건 판매하며 결제 승인 직후 로그인 계정의 마이페이지에서 제공합니다. 별도 배송은 없습니다.
- 평균 결제금액: 19,000원
- 최고 결제금액: 19,000원
- 제공 완료 시점: 결제 승인 직후
- 환불 접수: 로그인 후 마이페이지 또는 고객센터 이메일

## 사용자가 입력해야 하는 한 가지 공개 정보

- `NEXT_PUBLIC_BUSINESS_PHONE`: 사이트, 양사 신청서, 사업자 연락처에 동일하게 사용할 고객센터 전화번호

전화번호는 카카오페이의 공개 사이트 심사 필수 표시 항목이다. 전화번호가 확정되기 전에는 심사 제출을 완료하지 않는다.

## 외부 제출 서류

### 개인사업자 공통

- 사업자등록증 원본
- 대표자 명의 정산계좌 통장 사본
- 대표자 신분증 사본 또는 신청 과정에서 요구하는 본인확인 자료
- 통신판매업 신고증 또는 신고번호 확인 자료
- 고객센터 전화번호
- 판매 사이트 URL

민감정보가 있는 파일은 Git에 저장하지 않는다. 신청 화면에 직접 올린다. 카카오페이는 고객확인 절차에서 주민등록번호 전체가 표시된 신분확인 자료를 별도로 요구할 수 있으므로 접수 화면 안내를 따른다.

## 심사자가 확인할 공개 URL

- 홈/상품 3종: `/`, `/codex`, `/career`, `/jane`
- 결제 및 제공: `/payment`
- 이용약관: `/terms`
- 개인정보처리방침: `/privacy`
- 교환·환불정책: `/refund`
- 로그인·구매내역: `/mypage`
- 결제 성공/실패: `/checkout/success`, `/checkout/fail`

## 카카오페이 신청 체크리스트

- [x] 사업자등록증을 보유한 독립몰
- [x] 공개 HTTPS 판매 사이트
- [x] 상품/서비스 3개 등록
- [x] 각 상품의 가격, 형식, 분량, 목차, 제공 방법 표시
- [x] 상호, 대표자, 사업자번호, 주소, 통신판매업 정보 표시
- [ ] 고객센터 전화번호 표시 — 사용자 번호 필요
- [x] 이용약관과 취소·환불 규정
- [x] 결제 준비, 승인, 사용자 취소, 실패, 전액취소 API
- [x] 주문번호·회원·상품·승인금액 검증
- [x] 디지털 콘텐츠 즉시 제공 동의 시각과 문구 버전 저장
- [x] 이미 구매한 회원의 재구매 차단
- [ ] 발급받은 개발 인증값으로 PC·모바일 결제 테스트
- [ ] 담당자와 협의한 공식 카카오페이 버튼/사이니지 적용
- [ ] 운영 CID·Secret Key 등록 후 운영 검수

카카오페이 신청 페이지 안내상 평균 소요 기간은 2~4주다. 심사에는 기업·상품 검토와 카드사 심사가 포함되며 수수료, 정산 주기와 한도는 계약 과정에서 협의한다.

## Npay 결제형 단건결제 체크리스트

- [x] 배송되지 않는 PDF에 맞는 결제형 선택
- [x] 공식 JavaScript SDK URL에서 결제창 호출
- [x] 페이지 이동 방식 결제창 사용
- [x] 비식별 `merchantUserKey`
- [x] 가맹점 주문번호 `merchantPayKey`
- [x] 결제 트랜잭션 키 `merchantPayTransactionKey`
- [x] 상품명, 수량, 과세·면세 금액, 상품 항목 전달
- [x] returnUrl에서 resultCode와 paymentId 처리
- [x] 실패 시 resultMessage를 구매자에게 표시
- [x] 승인 60초 타임아웃
- [x] 승인 응답의 paymentId, 주문번호, 회원키, 금액, 성공 상태 검증
- [x] 승인·취소 API 멱등성 키
- [x] 전액취소 시 과세·면세 금액과 예상 잔액 비교
- [x] `CancelNotComplete` 상태 분리
- [x] 결제 내역 조회를 이용한 보류 환불의 관리자 대사·종결
- [ ] 고객센터 전화번호 표시 — 사용자 번호 필요
- [ ] 가맹 승인 후 공식 Npay BI 자산 적용
- [ ] 네이버페이센터의 단건결제 체크리스트 다운로드·작성
- [ ] 개발환경 결제/실패/취소 테스트
- [ ] 기술지원 서비스 환경 및 결제로직 취약성 검수
- [ ] 운영 Client ID·Secret·Chain ID 등록

Npay 공식 FAQ는 기술검수 시작부터 완료까지 평균 15영업일을 안내한다. 검수 전에는 네이버페이센터에서 최신 단건결제 체크리스트를 다시 내려받아 이 문서와 대조한다.

## 기술검수 계정과 시나리오

심사 담당자에게 비밀번호를 공유하지 않는다. Google 로그인 방식과 테스트 가능한 담당자 계정을 사전에 협의하거나, 제공사가 지정한 테스트 계정만 임시 허용한다.

반드시 확인할 시나리오:

1. PC 결제 성공 → 마이페이지 주문 1건 → PDF 권한 생성
2. 모바일 결제 성공 → 동일한 결과
3. 결제창 사용자 취소 → 실패 안내 → 주문·권한 미생성
4. 결제 실패/시간초과 → 제공사 사유 안내 → 재시도 가능
5. 콜백 새로고침/재전송 → 중복 주문 미생성
6. 이미 구매한 책 재구매 시도 → 내 서재 안내
7. 미열람 7일 이내 환불 → 결제 취소 → PDF 권한 회수
8. 열람 후 단순 변심 → 정책에 따른 제한 안내
9. Npay 취소 보류 → 결제 내역 조회 후 최종 상태 반영
10. 결제 제공사 승인과 내부 주문 상태 일일 대사

관리자는 `/admin/payments`에서 승인·취소 상태를 다시 조회해 결제 완료 주문과 PDF 권한을 복구할 수 있다.

## 운영 환경변수

비밀값은 Sites 런타임 환경에만 넣고 Git, 신청 문서, 화면 캡처에 기록하지 않는다.

- 공통: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BUSINESS_PHONE`
- 카카오페이: `NEXT_PUBLIC_KAKAOPAY_ENABLED`, `KAKAOPAY_CID`, `KAKAOPAY_SECRET_KEY`
- Npay: `NEXT_PUBLIC_NAVERPAY_ENABLED`, `NAVERPAY_MODE`, `NAVERPAY_CLIENT_ID`, `NAVERPAY_CLIENT_SECRET`, `NAVERPAY_CHAIN_ID`

초기 가입심사에서는 두 활성화 값을 `false`로 유지한다. 개발/기술검수 인증값을 받은 뒤 검수 환경에서만 `true`로 바꾸고, 운영 승인이 끝난 뒤 운영 인증값과 `production` 모드로 전환한다.

## 자동 사전 점검

- 가입심사 공개정보: `npm run check:merchant`
- 기술검수 환경정보: `npm run check:merchant:technical`
- 전체 빌드·회귀 테스트: `npm test`

자동 점검은 서류의 유효성, 실제 정산계좌 명의, 외부 가맹 승인 상태를 확인할 수 없다. 이 항목은 신청자가 양사 화면에서 직접 확인해야 한다.

## 공식 기준

- 카카오페이 온라인 가맹점 신청 안내: https://partner.kakaopay.com/partner/online/application-information
- 카카오페이 온라인 결제 API: https://developers.kakaopay.com/docs/payment/online/common
- Npay 결제형 가입·연동 절차: https://developers.pay.naver.com/introduce/process
- Npay 기술검수: https://developers.pay.naver.com/support/inspection/payment
- Npay 결제창 호출: https://docs.pay.naver.com/docs/onetime-payment/payment/payment-auth-window/
- Npay 단건결제 승인: https://docs.pay.naver.com/docs/onetime-payment/payment/apply/
- Npay 단건결제 취소: https://docs.pay.naver.com/docs/onetime-payment/payment/cancel/
- Npay API 멱등성: https://docs.pay.naver.com/docs/common/idempotency/
