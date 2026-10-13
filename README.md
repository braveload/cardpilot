# 카드파일럿

CSV와 문자/거래내역 캡처를 브라우저에서 분석하고 카드 상품의 예상 실적 및 구매 전 혜택을 비교하는 정적 웹앱입니다.

운영 사이트: https://cardpilot-k5y7.onrender.com/
기존 배포 경로: 이 저장소의 `render-deploy` 브랜치를 Render 정적 사이트에 연결합니다.

## 제공 기능

- 한국어 Tesseract OCR 후 사용자가 교정한 문자를 거래 단위로 추출합니다. 날짜·시간·카드 끝자리·누적액은 결제금액으로 취급하지 않습니다. 불완전 후보는 확인 필요로 보류합니다.
- 카드사·끝 4자리·보유 상품을 직접 연결하여 문자 거래를 구분합니다. 끝자리로 상품을 추측하지 않으며 미등록·모호한 연결은 보류합니다. 연결 수정·해제 시 기존 거래를 임의로 재배정하지 않습니다.
- 상품별 실적 판정과 거래 검토, 중복 확인, CSV 입출력, 동일 내역의 실적 규칙 비교를 제공합니다. 기존 명시적 할인 적용 판정을 보존합니다.
- BC 바로카드 12종의 공식 자료에서 확인한 국내 혜택 영역을 `bc-benefits.js`로 자동 적용합니다. 원화 할인·포인트·머니·마일은 단위별로 비교하며 임의 현금 환산하지 않습니다. 전월 확정 실적·이미 사용한 혜택과 횟수·적용 약관 버전은 사용자 확인이 필요합니다.
- 사용자 확인 조건의 정률 원화 할인 비교는 별도 수동 보조 모드입니다. 수동 입력값이 공식 자동 조건을 덮어쓰지 않습니다.
- 입력과 결과 양쪽에 큰 굵은 붉은 경고를 표시합니다: **누락된 사용 내역이나 혜택 한도 정보가 있으면 실제 결과와 달라질 수 있습니다.**

## 범위와 개인정보

공식 상품의 실적 판정 규칙과 출처는 `card-rules.js`에 있습니다. 자동 혜택의 출처·확인일·문서 표기·실적 구간·그룹/통합/건별/횟수 제한·지원 제외 영역은 `bc-benefits.js`의 상품별 catalog에 기록했습니다. BC 12종의 모든 부가서비스나 186개 전체의 혜택 추천을 구현한 것은 아닙니다.

해외 결제·단말기 장기할부·별도 제휴/프로모션·약관 차이·모호한 간편결제 가맹점 처리 및 문구 경계는 자동 계산에서 제외하거나 확인 필요로 보류합니다. 현재 분석 합계를 전월 실적으로 대신하지 않으며 카드사의 업종코드·실제 할인·최종 정산을 확정하지 않습니다. 최적 카드나 절약액을 보장하지 않습니다.

카드사·끝 4자리·상품 연결의 최소 정보만 같은 브라우저/사이트의 localStorage에 저장하고 연결 해제로 삭제합니다. 전체 카드번호·CVC·비밀번호·로그인/인증정보를 입력받지 않습니다. 거래·OCR 원문·금액·실적·개인 혜택 조건은 화면 메모리에서만 처리하고 새로고침/분석 초기화 시 지웁니다. CSV와 이미지는 서버에 전송하지 않습니다. OCR 엔진과 한국어 모델은 CDN에서 내려받습니다.

## 로컬 실행 및 검증

Node.js에서 `node tools/serve-local.cjs`를 실행한 뒤 `http://127.0.0.1:8080/`을 엽니다. `CARDPILOT_PORT`로 포트를 바꿀 수 있습니다. 서버는 로컬 컴퓨터에만 열리고 업로드 API는 없습니다.

```text
node --test tests/bc-benefits.cjs tests/ocr-regression.cjs tests/wallet-recommendation.cjs tests/card-integration.cjs
```

59개 단위·통합 검사는 가상 거래·조건만 사용합니다. 브라우저 검사에는 별도로 설치한 `playwright-core` 및 Chromium이 필요합니다. 별도 설치 폴더를 사용하는 경우 `NODE_PATH`를 해당 `node_modules`로 설정하고, `CARDPILOT_CHROMIUM_PATH`를 실행 파일 경로로 설정합니다. `CARDPILOT_TEST_OUTPUT`은 화면/JSON 출력 위치이며 기본값은 시스템 임시 폴더입니다.

```text
node tests/bc-browser.cjs
node tests/wallet-purchase-browser.cjs
node tests/browser-regression.cjs
node tests/image-ocr-regression.cjs
```

마지막 OCR 검사는 앞의 browser-regression이 생성한 가상 이미지를 사용하며 엔진·모델 다운로드를 위한 CDN 연결이 필요합니다. 실제 사용자 캡처는 테스트 자료에 포함하지 않습니다. 결과 이미지/JSON, 개인 거래 파일, 원본 백업, 로컬 도구 설치 폴더는 저장소 게시 파일에 포함하지 않습니다.

게시 앱 파일: `index.html`, `cardpilot.js`, `card-tools.js`, `bc-benefits.js`, `card-rules.js`, `download-guide.html`.
