# 네이버페이 결제형 가맹 신청·연동 체크리스트

최종 갱신: 2026-07-23 (KST)

## 결정

카카오페이와 네이버페이를 동일 쇼핑몰에서 함께 제공한다. 양사는 각각 별도 가맹 계약·심사·정산을 진행한다. 네이버페이는 주문형이 아니라 자사 주문서에 결제수단으로 추가하는 `결제형` 단건결제를 신청한다. PDF 같은 비실물 콘텐츠도 결제형 지원 대상이다.

## 신청에 사용할 사업자 정보

- 상호: 플로렌스랩(Florence Lab)
- 대표자: 박철완
- 사업자등록번호: 217-26-12405
- 개업일: 2020-01-16
- 통신판매업신고번호: 제2026-서울구로-1222호
- 사업장 소재지: 서울특별시 구로구 고척로 49
- 전자우편: florencelab@naver.com
- 판매 사이트: https://danielsnote.com
- 판매 상품: PDF 전자책 3종, 각 19,000원
- 사업자등록증 원본: Google Drive `사업자등록증_플로렌스랩.pdf`

## 신청 전 사용자가 완료할 항목

- 담당자 휴대전화 번호와 SMS 인증
- 사이트와 신청서에 표시할 현재 고객센터 전화번호
- 정산받을 사업자 계좌 정보와 통장 사본
- 대표자 또는 사업자 확인에 필요한 추가 서류

비밀번호, 인증번호, 주민등록번호, 계좌번호와 인증키는 Git이나 이 문서에 기록하지 않는다.

## 신청 유형과 현재 상태

- 신청 유형: `결제형 가맹점` → `자체 개발 독립몰` → `단건결제`
- 네이버 로그인과 필수 약관 동의 완료
- `결제형 가맹점`을 선택하고 사업자 정보·대표자 정보·공개 사업장 주소 입력 완료
- 신청서 47.5% 단계에서 담당자 이름·휴대전화 번호·SMS 인증과 대표자 권한 동의를 기다리는 중
- 매출 관련 사전 질문은 실제 상태대로 답했으며, 공식 `확인없이 바로 가입하기` 경로로 신청을 이어감

네이버 공식 안내상 가입 비용은 무료다. 가입심사 후 시스템 연동과 기술검수를 거쳐 오픈한다. 공식 독립몰 가이드는 기술검수 완료까지 평균 15영업일을 안내한다.

## 준비된 사이트·개발 항목

- 사업자·통신판매업 정보와 정책 페이지
- 전자책 3종 상품 상세, 가격, 형식, 즉시 제공 안내
- 카카오페이·네이버페이 선택 UI
- 네이버페이 JavaScript SDK 결제창 호출
- 로그인 회원 기준 주문 생성과 비식별 `merchantUserKey`
- 결제 결과 `returnUrl`, 단건결제 승인 API
- 서버 금액·주문번호·결제번호 검증
- 결제 완료 주문 저장과 마이페이지 PDF 권한
- 실패·취소 안내와 승인 응답 미수신 시 대사 필요 상태 분리
- 관리자 전액 환불 API와 `CancelNotComplete` 대사 필요 상태 처리
- 공식 최신 `pay.paygate.naver.com` API 주소와 `naverpay-partner` 경로
- 승인·취소 API의 `X-NaverPay-Idempotency-Key`
- 승인 응답의 결제번호·주문번호·회원키·금액·성공 상태 검증
- 전액취소 시 과세·면세 금액과 예상 잔액 비교
- 동일 전자책 중복 구매 차단
- 결제 전 디지털 콘텐츠 제공 동의 시각·문구 버전 저장

## 가입 승인 후 연결할 값

Sites 런타임 환경변수에만 저장한다.

- `NEXT_PUBLIC_NAVERPAY_ENABLED=true`
- `NAVERPAY_MODE=development` 또는 `production`
- `NAVERPAY_CLIENT_ID`
- `NAVERPAY_CLIENT_SECRET`
- `NAVERPAY_CHAIN_ID`
- `NEXT_PUBLIC_BUSINESS_PHONE`

개발 인증값으로 결제·실패·취소를 검증한 뒤 운영 인증값과 `production` 모드로 전환한다.

## 등록·검수 경로

- 결제 결과: `/api/naverpay/return`
- 결제 완료 안내: `/checkout/success`
- 결제 실패 안내: `/checkout/fail`
- 판매 사이트 도메인: `https://danielsnote.com`

공식 참고:

- 가입: https://admin.pay.naver.com/front/m/v1/join/step/intro
- 결제형 소개: https://developers.pay.naver.com/introduce/naverpay
- 오픈 절차: https://developers.pay.naver.com/introduce/process
- 기술검수: https://developers.pay.naver.com/support/inspection/payment
- FAQ: https://developers.pay.naver.com/support/faq/payment
