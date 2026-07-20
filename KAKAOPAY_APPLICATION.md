# 카카오페이 독립몰 가맹 신청·연동 체크리스트

최종 갱신: 2026-07-20 (KST)

## 결정

국내 판매 및 승인 속도를 최우선으로 비교해 카카오페이 단독 직연동을 선택했다. 카카오페이는 가맹 가능 여부 1차 결과를 통상 영업일 5일 이내 안내하며, 전체 입점에는 보통 2~4주가 걸린다고 안내한다. 네이버페이는 연동 개발 완료 후 기술 검수만 평균 15영업일로 안내해 이번 우선순위에는 불리하다.

## 신청에 사용할 사업자 정보

- 상호: 플로렌스랩(Florence Lab)
- 대표자: 박철완
- 사업자등록번호: 217-26-12405
- 개업일: 2020-01-16
- 통신판매업신고번호: 제 2020-서울구로-0138호
- 사업장 소재지: 서울특별시 구로구 고척로 49, 204동 703호(오류동, 동부골든아파트)
- 전자우편: florencelab@naver.com
- 판매 사이트: https://codex-solo-builder-book.wani3000.chatgpt.site
- 판매 상품: PDF 전자책 3종, 각 19,000원
- 사업자등록증 원본: Google Drive `사업자등록증_플로렌스랩.pdf`

## 신청 전 반드시 사용자가 확정할 항목

- 사이트와 신청서에 표시할 현재 고객센터 전화번호
- 카카오 계정 로그인 및 휴대전화 본인 인증
- 정산받을 사업자 계좌 정보와 통장 사본
- 필요 시 대표자 신분증 등 KYC 서류

비밀번호, 인증번호, 신분증 번호, 계좌 정보는 Git이나 이 문서에 기록하지 않는다.

## 준비된 사이트 심사 항목

- 상품 3종의 제목, 가격, 상세 설명, 분량, PDF 형식
- 회사 정보와 사업자·통신판매업 정보 공통 푸터
- `/terms` 이용약관
- `/privacy` 개인정보처리방침
- `/refund` 교환·환불정책
- 로그인, 마이페이지, 구매 내역, 구매자별 PDF 권한
- 디지털 콘텐츠 즉시 제공 및 청약철회 제한 확인
- 카카오페이 결제 준비·승인·취소·실패 API
- 승인 금액 검증 및 결제 완료 주문 저장

## 카카오페이 승인 후 연결할 값

Sites 런타임 환경변수에만 다음 값을 저장한다.

- `NEXT_PUBLIC_KAKAOPAY_ENABLED=true`
- `KAKAOPAY_CID=발급된 CID`
- `KAKAOPAY_SECRET_KEY=발급된 운영 Secret key`
- `NEXT_PUBLIC_BUSINESS_PHONE=심사에 사용할 고객센터 전화번호`

테스트 단계에서는 개발자센터 애플리케이션의 `Secret key(dev)`와 테스트 CID `TC0ONETIME`을 사용한다. 운영 판매 전에는 반드시 발급된 운영 CID·키로 교체한다.

## 등록할 도메인과 리다이렉트 경로

- 서비스 도메인: `https://codex-solo-builder-book.wani3000.chatgpt.site`
- 승인: `/api/kakaopay/approve`
- 사용자 취소: `/api/kakaopay/cancel`
- 결제 실패: `/api/kakaopay/fail`
- 결제 완료 안내: `/checkout/success`

결제 준비 API가 주문별 `orderId`를 쿼리 문자열로 자동 추가한다. 등록 도메인과 승인·취소·실패 URL은 동일 도메인을 사용한다.

## 외부 신청 상태

카카오페이 비즈니스의 독립몰 가맹 신청 페이지에서 `온라인 결제 신청`을 눌러 카카오 계정 로그인 화면까지 진입했다. 현재 카카오 계정 로그인이 되어 있지 않아 신청서 작성·제출은 시작하지 못했다. 사용자가 로그인하고 공개용 전화번호를 알려주면 이어서 신청서를 작성할 수 있다.

공식 참고:

- 가맹 신청: https://partner.kakaopay.com/partner/online/application-information?mall_type=standalone
- 단건 결제 API: https://developers.kakaopay.com/docs/payment/online/single-payment
- 결제 취소 API: https://developers.kakaopay.com/docs/payment/online/cancellation
