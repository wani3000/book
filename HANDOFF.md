# PHILIP BOOKS 작업 인계서

최종 갱신: 2026-07-20 (KST)

이 문서는 다른 Codex 에이전트가 현재 상태를 다시 조사하지 않고 곧바로 작업을 이어갈 수 있도록 작성한 단일 인계 문서다.

## 1. 프로젝트 목표

실제 경험을 기반으로 만든 전자책 3권을 제작하고, 클래스101과 유사한 탐색·상세·구매 흐름을 가진 판매 사이트 `PHILIP BOOKS`에서 판매한다.

현재 상품은 다음과 같다.

| 상품 키 | 제목 | 저자 표기 | PDF | 판매가 | 상세페이지 |
| --- | --- | --- | ---: | ---: | --- |
| `codex` | 아이디어를 서비스로 바꾸는 Codex 사용법 | 필립 | 258쪽 | 19,000원 | `/codex` |
| `career` | 커리어도 디자인할 수 있습니다 | 필립 | 64쪽 | 19,000원 | `/career` |
| `seonara` | 승무원 다음은 IT였습니다 | 서나라 | 56쪽 | 19,000원 | `/seonara` |

박철완은 공개 콘텐츠에서 가명 `필립`으로 표기한다. 서나라 책은 `서나라` 실명을 사용한다.

## 2. 현재 완료 상태

- 전자책 3권 PDF 생성 완료
- 2권과 3권 본문 글꼴을 나눔명조로 변경 완료
- 세 권을 연결하는 클래스101형 전자책 마켓 메인 구현 완료
- 세 권 각각에 클래스101 상품 상세형 판매페이지 구현 완료
- 데스크톱 우측 구매 카드와 모바일 하단 고정 구매 버튼 구현 완료
- 상품별 소개, 추천 독자, 핵심 효과, 포함 자료, 접이식 목차, 저자, 후기, FAQ 구현 완료
- SEO 메타데이터, 사이트맵, robots.txt, Open Graph 이미지 구현 완료
- 후기 접수 API와 D1 스키마 구현 완료
- 최신 빌드와 자동검사 통과
- 최신 사이트 버전 9 공개 배포 완료

공개 사이트:

- 메인: <https://codex-solo-builder-book.wani3000.chatgpt.site>
- 1권: <https://codex-solo-builder-book.wani3000.chatgpt.site/codex>
- 2권: <https://codex-solo-builder-book.wani3000.chatgpt.site/career>
- 3권: <https://codex-solo-builder-book.wani3000.chatgpt.site/seonara>

최신 배포 기준 커밋은 `fc940bc7ff3f894e18a6bf84a2115844b4d7b8fe`이며 메시지는 `feat: redesign ebook detail pages`다.

## 3. 반드시 먼저 알아야 할 미완료 사항

### P0 — 실제 결제가 아직 열리지 않음

프로덕션 환경변수에는 현재 `NEXT_PUBLIC_SITE_URL`만 설정돼 있다. Paddle 토큰·가격 ID와 외부 판매 URL은 설정되지 않았다. 따라서 공개 사이트의 구매 버튼은 `결제 오픈 준비 중`으로 비활성화된다.

결제 오픈 방법은 둘 중 하나를 선택한다.

1. Paddle Checkout 사용
   - `NEXT_PUBLIC_PADDLE_ENV=production`
   - `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
   - `NEXT_PUBLIC_CODEX_PRICE_ID`
   - `NEXT_PUBLIC_CAREER_PRICE_ID`
   - `NEXT_PUBLIC_SEONARA_PRICE_ID`
2. 외부 판매 페이지 사용
   - `NEXT_PUBLIC_CODEX_PURCHASE_URL`
   - `NEXT_PUBLIC_CAREER_PURCHASE_URL`
   - `NEXT_PUBLIC_SEONARA_PURCHASE_URL`

환경변수의 실제 값은 저장소나 인계 문서에 쓰지 말고 Sites 런타임 설정에만 저장한다. 결제 설정 뒤에는 새 빌드·버전 저장·공개 배포가 필요하다.

### P1 — 디지털 파일 전달 자동화가 없음

현재 구매 버튼은 결제창 또는 외부 링크까지만 담당한다. 결제 성공 후 구매자에게 PDF를 안전하게 전달하는 이메일·다운로드 권한·만료 링크 흐름은 구현되지 않았다. Paddle을 쓸 경우 웹훅, 주문 확인, 파일 전달, 재다운로드 정책을 별도 설계해야 한다.

### P1 — 후기 운영자 승인 화면이 없음

`POST /api/reviews`는 후기를 `pending`, `purchase_verified=0`으로 저장한다. 공개 API는 `approved`이면서 `purchase_verified=1`인 후기만 반환한다. 현재 이를 승인하는 관리자 UI는 없으므로 D1을 직접 관리하거나 관리자 기능을 추가해야 한다.

후기 컴포넌트에는 각 책별 샘플 독자 반응이 포함되어 있으며, 화면에서 실제 구매 후기가 아니라는 안내와 배지가 붙는다. 판매 오픈 전에는 샘플을 제거하거나 실제 검증 후기만 표시하는 편이 바람직하다. 샘플을 실제 후기처럼 위장해서는 안 된다.

### P2 — 상세페이지 시각 QA 추가 필요

메인 페이지는 데스크톱·모바일 스크린샷 비교와 상호작용 검증을 완료했다. 최신 세 상세페이지는 빌드와 구조 테스트는 통과했지만 별도의 브라우저 스크린샷 기반 시각 QA 기록은 아직 없다. 결제 오픈 전에 1440px와 390px에서 다음을 확인한다.

- 표지 이미지 비율과 선명도
- 우측 고정 구매 카드
- 탭 메뉴의 sticky 동작
- 모바일 하단 구매 바
- 목차와 FAQ 열기·닫기
- 긴 한국어 제목 줄바꿈
- 결제 버튼 활성·실제 체크아웃 진입

## 4. 디렉터리와 핵심 파일

워크스페이스 루트:

`/Users/chulwan/Documents/Codex/2026-07-18/pc`

웹사이트 Git 저장소:

`/Users/chulwan/Documents/Codex/2026-07-18/pc/website`

워크스페이스 루트 자체는 Git 저장소가 아니며 `website/`만 별도 Git 저장소다.

### 전자책 원문과 산출물

- 1권 원문: `codex-practical-manuscript.md`
- 1권 워크북: `codex-practical-workbook.md`
- 2권 원문: `career-book/manuscript.md`
- 3권 원문: `seonara-book/manuscript.md`
- 전체 Mac 자료 보강 기록: `research/full-mac-augmentation-2026-07-19.md`
- PDF 생성 스크립트: `scripts/build_*.py`
- 최종 PDF: `output/pdf/`

최종 판매용 PDF:

- `output/pdf/codex-solo-service-playbook.pdf`
- `output/pdf/career-design-philip.pdf`
- `output/pdf/flight-attendant-to-it-seonara.pdf`

### 웹사이트

- 메인 마켓: `website/app/page.tsx`
- 공통 상세페이지 UI: `website/app/components/ClassDetailPage.tsx`
- 상품별 데이터: `website/app/codex/page.tsx`, `website/app/career/page.tsx`, `website/app/seonara/page.tsx`
- 전역 스타일: `website/app/globals.css`
- 구매 처리: `website/app/components/PurchaseButton.tsx`
- 후기 UI: `website/app/components/ReviewSection.tsx`
- 후기 API: `website/app/api/reviews/route.ts`
- 후기 DB 스키마: `website/db/schema.ts`
- SEO 공통 메타데이터: `website/app/layout.tsx`
- 테스트: `website/tests/rendered-html.test.mjs`
- 호스팅 설정: `website/.openai/hosting.json`
- 환경변수 예시: `website/.env.example`
- 메인 화면 QA: `website/design-qa.md`

상세페이지는 하나의 공통 컴포넌트를 사용한다. 구조를 바꾸려면 `ClassDetailPage.tsx`와 상세페이지용 CSS를 수정하고, 책별 문구만 바꿀 때는 각 상품의 `page.tsx` 안 `book` 객체를 수정한다.

## 5. 개발과 검증

필수 환경은 Node.js 22.13 이상이다.

```bash
cd /Users/chulwan/Documents/Codex/2026-07-18/pc/website
npm install
npm run dev
```

검증:

```bash
npm run build
node --test tests/rendered-html.test.mjs
git status --short
```

2026-07-20 인계 시점 상태:

- 빌드 성공
- 자동검사 6개 통과
- Git 작업 트리 깨끗함(인계 문서 커밋 전 기준)
- `dist/server/index.js` 존재

## 6. 배포 상태와 절차

Sites 프로젝트 ID는 `website/.openai/hosting.json`에 저장돼 있다. 현재 사이트 접근 모드는 `public`이다.

사이트 변경 후 표준 순서:

1. `npm run build`
2. 테스트 실행
3. 의도한 파일만 커밋
4. Sites 소스 저장소로 push
5. 배포 아카이브 생성
6. 새 사이트 버전 저장
7. 공개 사이트이므로 사용자에게 공개 배포 승인을 받은 뒤 배포
8. 배포 상태가 `succeeded`인지 확인

기존 프로젝트에 새 사이트를 만들지 말고 `.openai/hosting.json`의 `project_id`를 재사용한다. 배포 토큰과 쓰기 자격 증명은 파일, Git remote 또는 문서에 저장하지 않는다.

## 7. 디자인 기준

- 클래스101의 정보 구조와 구매 동선을 참고한다.
- 클래스101 로고·문구·고유 브랜드 자산을 복제하지 않는다.
- 메인은 흰색 기반의 조밀한 마켓 UI다.
- 상세페이지 공통 구조는 이미지 갤러리, 상품 요약, 가격 카드, 탭, 소개, 추천 독자, 학습 효과, 포함 자료, 목차, 저자, 후기, FAQ 순서다.
- 1권은 오렌지, 2권은 보라, 3권은 청록 포인트 컬러를 사용한다.
- 모든 화면은 모바일을 함께 검증한다.
- 표지 이미지는 `website/public/`의 실제 최종 표지를 재사용한다.

참고 이미지:

- `reference/class101-ref-1.png`
- `reference/class101-ref-2.png`
- `reference/class101-ref-3.png`

## 8. 콘텐츠 원칙

- 박철완 실명은 공개 원문과 판매페이지에서 `필립`으로 바꾼다.
- 확인하지 못한 경력, 수치, 회사 기여를 새로 만들어 쓰지 않는다.
- 서나라의 위시켓 시스템 화면은 본인이 만든 시스템이 아니다. 기존 시스템을 활용한 운영 경험과 Codex로 직접 만든 HTML 대시보드를 명확히 구분한다.
- 취업, 합격, 수익을 보장하는 표현을 사용하지 않는다.
- 실제 구매자가 아닌 후기나 추천사를 실제 후기처럼 표시하지 않는다.
- 2권과 3권 PDF 본문은 나눔명조를 유지한다. 표지와 큰 제목은 기존 고딕체를 유지한다.

## 9. 다음 에이전트 권장 작업 순서

1. 사용자에게 Paddle과 외부 판매 페이지 중 결제 방식을 확정받는다.
2. 상품 3개의 실제 결제 정보와 PDF 전달 정책을 준비한다.
3. 샌드박스에서 세 상품의 결제 성공·취소·오류 흐름을 검증한다.
4. 결제 완료 후 안전한 PDF 전달을 구현한다.
5. 상세페이지 데스크톱·모바일 시각 QA를 수행한다.
6. 샘플 후기 처리 방식을 확정하고 실제 후기 승인 운영 방식을 만든다.
7. 프로덕션 결제 설정 후 새 버전을 배포한다.
8. Google Search Console과 네이버 서치어드바이저 등록 및 전환 추적을 연결한다.

## 10. 현재 사이트의 알려진 제약

- 검색과 카테고리 필터는 메인 화면 안에서만 동작한다.
- 로그인 표시는 UI 요소이며 실제 구매자 계정 기능은 없다.
- 구매 후 라이브러리와 재다운로드 페이지가 없다.
- 환불 정책 전문과 판매자 법적 고지는 체크아웃 또는 별도 정책 페이지로 아직 분리돼 있지 않다.
- 후기 작성자는 구매 번호를 입력하지만 자동 결제 검증은 하지 않는다.
- 사이트 분석·광고 전환 태그는 아직 연결되지 않았다.
