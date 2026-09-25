(() => {
  'use strict';

  const commonExclusions = [
    { label: '상품권·기프트·선불카드 구매/충전', keywords: ['상품권', '기프트카드', '선불카드', '선불충전', '사이버머니', '선불전자'] },
    { label: '세금·공과금·공공기관 납부', keywords: ['국세', '지방세', '관세', '세금납부', '공과금', '전기요금', '수도요금', '상하수도', '도시가스', '우편요금', '여권발급', '과태료', '범칙금', '벌금', '공공기관'] },
    { label: '사회보험료', keywords: ['건강보험', '국민연금', '고용보험', '산재보험', '장애인고용부담금', '4대보험'] },
    { label: '관리비·임대료', keywords: ['아파트관리비', '관리비', '부동산임대료', '월세'] },
    { label: '학교 납입금·등록금', keywords: ['학교납입금', '초중고납입금', '대학등록금', '대학교등록금', '대학원등록금'] },
    { label: '카드대출·연회비·연체료·수수료', keywords: ['현금서비스', '단기카드대출', '카드론', '장기카드대출', '연회비', '연체료', '할부수수료', '해외서비스수수료', '국제브랜드수수료', '카드대출이자', 'sms이용수수료'] },
    { label: '취소·환불 거래', keywords: ['취소', '환불'] }
  ];
  const hyundaiBaseExclusions = [
    { label: '카드대출·연회비·수수료·이자', keywords: ['카드론', '장기카드대출', '현금서비스', '단기카드대출', '연회비', '제수수료', '이자'] },
    { label: '국제브랜드·해외서비스 수수료', keywords: ['국제브랜드수수료', '해외서비스수수료'] },
    { label: '세금·공공부담금', keywords: ['국세', '관세', '지방세', '지방세외수입', '상하수도요금', '벌과금', '과태료', '인지세', '송달료', '민원발급수수료'] },
    { label: '상품권·선불카드 구매/충전', keywords: ['상품권', '현금성유가증권', '선불카드', '선불충전'] }
  ];
  const hyundaiZExclusions = [
    { label: '생활요금·관리비·임대료·자동납부 수수료', keywords: ['전기요금', 'tv수신료', '도시가스요금', '아파트관리비', '부동산임대료', '월세', '자동납부서비스이용수수료'] },
    { label: '학교 납입금·등록금', keywords: ['초중고학교납입금', '학교납입금', '사립유치원교육비', '대학등록금', '대학원등록금'] },
    { label: '사회보험료', keywords: ['건강보험', '국민연금', '고용보험', '산재보험', '장애인고용부담금'] },
    { label: '고속도로·하이패스·고속버스', keywords: ['고속도로통행', '후불하이패스', '하이패스', '고속버스'] },
    { label: '무이자 할부 이용금액', keywords: ['무이자할부', '무이자 할부'] }
  ];
  const hyundaiDiscountedTransaction = { label: '해당 카드의 할인 혜택 적용 결제 전체', keywords: ['할인적용', '할인받음', '청구할인', '할인금액'], discountOnly: true };
  const pendingProducts = [
    ...[
      ['bc-ibk-bliss-mileage', '[IBK기업은행] BLISS Mileage', 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=104506&mbkNo=003'],
      ['bc-ibk-bliss-point', '[IBK기업은행] BLISS Point', 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=104561&mbkNo=003'],
      ['bc-ibk-boc', '[IBK기업은행] BOC(福)', 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=104417&mbkNo=003'],
      ['bc-ibk-happymate', '[IBK기업은행] 해피메이트', 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=104376&mbkNo=003'],
      ['bc-ibk-climate', '[IBK기업은행] I-기후동행카드', 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=104073&mbkNo=003'],
      ['bc-ibk-point38', '[IBK기업은행] IBK포인트3.8', 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=103991&mbkNo=003'],
      ['bc-ibk-point', '[IBK기업은행] IBK포인트', 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=103937&mbkNo=003'],
      ['bc-ibk-mileage', '[IBK기업은행] I-Mileage(대한항공마일리지)', 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=103401&mbkNo=003'],
      ['bc-ibk-green', '[IBK기업은행] I-어디로든그린카드', 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=103214&mbkNo=003'],
      ['bc-ibk-kpass', '[IBK기업은행] K-패스(신용)', 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=103105&mbkNo=003']
    ].map(([id, name, source]) => ({ id, name, issuer: 'IBK기업은행 (BC)', source, sourceTitle: 'BC카드 공식 IBK기업은행 신용카드 목록' })),
    ...[
      ['samsung-monimo-pay', '모니모페이카드'],
      ['samsung-id-select-all', '삼성 iD SELECT ALL 카드'],
      ['samsung-id-overseas35', '삼성 iD 해외 3.5 카드'],
      ['samsung-mileage-platinum', '삼성카드 & MILEAGE PLATINUM (스카이패스)'],
      ['samsung-id-select-up', '삼성 iD SELECT UP 카드'],
      ['samsung-taptap-o', '삼성카드 taptap O'],
      ['samsung-id-global', '삼성 iD GLOBAL 카드'],
      ['samsung-id-simple', '삼성 iD SIMPLE 카드'],
      ['samsung-id-select-on', '삼성 iD SELECT ON 카드'],
      ['samsung-id-one', '삼성 iD ONE 카드']
    ].map(([id, name]) => ({ id, name, issuer: '삼성카드', source: 'https://www.samsungcard.com/home/card/cardinfo/pghppdccardcardinforecommendpc001', sourceTitle: '삼성카드 공식 추천 카드 목록' })),
    ...[
      ['woori-standard2', '카드의정석2', '102997'],
      ['woori-daily', '카드의정석2 DAILY', '500058'],
      ['woori-shopper', '카드의정석2 SHOPPER', '104151'],
      ['woori-opus-silver', 'the OPUS silver', '103500'],
      ['woori-7core', '우리카드 7CORE', '103755'],
      ['woori-start-travel', '스타트래블 우리카드', '104171'],
      ['woori-super-20', '카드의정석2 SUPER 2.0%', '500044'],
      ['woori-routine', '카드의정석2 ROUTINE', '500045'],
      ['woori-unimile', '우리카드 UniMile', '104153'],
      ['woori-opus-blue', 'the OPUS blue', '500049']
    ].map(([id, name, code]) => ({ id, name, issuer: '우리카드', source: `https://pc.wooricard.com/dcpc/yh1/crd/crd01/H1CRD101S02.do?cdPrdCd=${code}`, sourceTitle: '우리카드 공식 카드 메인 상품 목록' })),
    ...[
      ['lotte-loca-likit12', 'LOCA LIKIT 1.2'],
      ['lotte-digiloca-london', '디지로카 London'],
      ['lotte-digiloca-lasvegas', '디지로카 Las Vegas'],
      ['lotte-digiloca-paris', '디지로카 Paris'],
      ['lotte-department-store', '롯데백화점 롯데카드'],
      ['lotte-loca-likit-shop', 'LOCA LIKIT Shop'],
      ['lotte-point-plus', '롯데포인트 플러스 카드'],
      ['lotte-lola', '롤라카드'],
      ['lotte-members', '롯데멤버스 카드'],
      ['lotte-loca-likit', 'LOCA LIKIT']
    ].map(([id, name]) => ({ id, name, issuer: '롯데카드', source: 'https://www.lottecard.co.kr/app/LPCDARA_V100.lc', sourceTitle: '롯데카드 공식 카드 한눈에 보기' }))
  ].map((product) => ({
    ...product,
    threshold: 0,
    thresholdLabel: '상품별 실적 규칙 확인 중 · 합산 보류',
    verificationStatus: 'pending',
    useCommonExclusions: false,
    extraExclusions: [],
    conditional: [],
    checkedAt: '2026-09-25'
  }));

  window.CARDPILOT_RULES = {
    checkedAt: '2026-09-25',
    captureCandidateCount: 23,
    products: [
      {
        id: 'bc-kpass', name: 'BC 바로 K-패스 카드', issuer: 'BC 바로카드', threshold: 300000,
        extraExclusions: [], conditional: [],
        source: 'https://bccard.com/down/individual/customer/103112.pdf',
        sourceTitle: 'BC 바로 K-패스 카드 상품 안내장 (2026.05 개정본)', checkedAt: '2026-09-25'
      },
      {
        id: 'bc-kt-my-alttle', name: 'KT 마이알뜰폰 BC 바로카드', issuer: 'BC 바로카드', threshold: 300000,
        extraExclusions: [], conditional: [],
        source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=103127&mbkNo=050',
        sourceTitle: 'BC카드 공식 상품 안내', checkedAt: '2026-09-25'
      },
      {
        id: 'bc-kt-super-dc', name: 'KT SUPER DC BC 바로카드', issuer: 'BC 바로카드', threshold: 400000,
        extraExclusions: [{ label: '무이자·변형무이자 할부', keywords: ['무이자할부', '무이자 할부', '변형무이자'] }], conditional: [],
        source: 'https://www.bccard.com/down/individual/customer/104063.pdf',
        sourceTitle: 'KT SUPER DC BC 바로카드 상품 안내장 (2026.04 개정본)', checkedAt: '2026-09-25'
      },
      {
        id: 'bc-zone', name: 'BC 바로 ZONE 카드', issuer: 'BC 바로카드', threshold: 300000,
        extraExclusions: [
          { label: '교통·통행료', keywords: ['대중교통', '시내버스', '마을버스', '지하철', '고속버스', '시외버스', '고속도로통행', '통행료', '하이패스'] },
          { label: '무이자·변형무이자 할부', keywords: ['무이자할부', '무이자 할부', '변형무이자'] }
        ],
        conditional: [{ label: 'ZONE 1 할인 적용 여부', keywords: ['스타벅스', '투썸', '이디야', '메가mgc', '컴포즈', '맥도날드', '버거킹', '롯데리아', '맘스터치', '써브웨이', '배달의민족', '쿠팡이츠', '쿠팡', '무신사', '지그재그', '오늘의집', '크림', '다이소', '올리브영', '넷플릭스', '유튜브', '네이버플러스', '쿠팡와우', '카카오톡선물', '전통시장'] }],
        source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=104520&exec=cardDetail',
        sourceTitle: 'BC카드 공식 BC 바로 ZONE 상품 안내', checkedAt: '2026-09-25'
      },
      {
        id: 'bc-clear-plus', name: 'BC 바로 클리어 플러스', issuer: 'BC 바로카드', threshold: 150000,
        extraExclusions: [
          { label: '대중교통', keywords: ['대중교통', '시내버스', '마을버스', '지하철', '교통카드'] },
          { label: '통신 카테고리 사용액', keywords: ['통신요금', '휴대폰요금', '휴대전화요금', '이동통신요금', 'skt', 'kt통신', 'lgu'] }
        ], conditional: [],
        source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=101922',
        sourceTitle: 'BC카드 공식 BC 바로 클리어 플러스 상품 안내', checkedAt: '2026-09-25'
      },
      {
        id: 'bc-air-plus', name: 'BC 바로 에어 플러스 스카이패스', issuer: 'BC 바로카드', threshold: 0,
        extraExclusions: [{ label: '무이자 할부 이용금액', keywords: ['무이자할부', '무이자 할부'] }], conditional: [],
        source: 'https://www.bccard.com/app/card/service/CreditCardMain.do?gdsno=1019240000',
        sourceTitle: 'BC카드 공식 BC 바로 에어 플러스 스카이패스 상품 안내', checkedAt: '2026-09-25'
      },
      {
        id: 'kb-my-wesh', name: 'KB국민 My WE:SH 카드', issuer: 'KB국민카드', threshold: 400000,
        thresholdLabel: '40만원 (일상·선택 할인 기준)',
        extraExclusions: [
          { label: 'My WE:SH 할인 적용 거래 전체', keywords: ['할인적용', '할인받음', '청구할인', '할인금액'], discountOnly: true },
          { label: '대중교통', keywords: ['대중교통', '시내버스', '마을버스', '지하철', '교통요금', '교통카드'] }
        ],
        conditional: [
          { label: 'My WE:SH 할인 적용 여부 확인 (KB Pay·음식점·편의점·통신·OTT·배달·커피·택시·영화·미용·스포츠·온라인서점)', keywords: ['kbpay', '음식점', '식당', '한식', '중식', '일식', '양식', 'gs25', 'cu', 'skt', 'kt', 'lgu', 'liivm', '넷플릭스', '유튜브프리미엄', 'wavve', '웨이브', '티빙', '디즈니', '배달의민족', '쿠팡이츠', '요기요', '커피', '스타벅스', '투썸', '이디야', '택시', 'cgv', '롯데시네마', '메가박스', '미용실', '올리브영', '휘트니스', '온라인서점'] }
        ],
        source: 'https://card.kbcard.com/CRD/DVIEW/HCAMCXPRICAC0076?cooperationcode=09923',
        sourceTitle: 'KB국민카드 공식 My WE:SH 상품 안내 (전월 실적 제외 기준)', checkedAt: '2026-09-25'
      },
      {
        id: 'kb-wesh-travel', name: 'KB국민 WE:SH Travel 카드', issuer: 'KB국민카드', threshold: 300000,
        thresholdLabel: '30만원 (국내 할인·라운지; 일부 해외혜택은 실적 무관)',
        extraExclusions: [
          { label: 'WE:SH Travel 할인 적용 거래', keywords: ['할인적용', '할인받음', '청구할인', '할인금액'], discountOnly: true },
          { label: '해외 이용', keywords: ['해외이용', '해외결제', '해외가맹점'] }
        ],
        discountExemptionKeywords: ['여행자보험'],
        conditional: [
          { label: 'WE:SH Travel 할인 적용 여부 확인 (일상·여행 혜택 대상)', keywords: ['11번가', 'g마켓', 'ssg', '무신사', 'w컨셉', '지그재그', '29cm', '커피', '스타벅스', '커피빈', '메가커피', 'gs25', 'cu', '롯데시네마', 'cgv', '메가박스', '대한항공', '아시아나', '면세점', '철도', 'ktx', 'srt', '고속버스', '시외버스'] }
        ],
        source: 'https://card.kbcard.com/CRD/DVIEW/HCAMCXPRICAC0076?cooperationcode=09561&mainCC=a',
        sourceTitle: 'KB국민카드 공식 WE:SH Travel 상품 안내 (전월 실적 제외 기준)', checkedAt: '2026-09-25'
      },
      {
        id: 'kb-wesh-daily', name: 'KB국민 WE:SH Daily 카드', issuer: 'KB국민카드', threshold: 400000,
        thresholdLabel: '40만원 (선택 할인; 기본 0.5% 할인은 실적 무관)',
        extraExclusions: [
          { label: 'WE:SH Daily 선택 할인 적용 거래 전체', keywords: ['할인적용', '할인받음', '청구할인', '할인금액'], discountOnly: true },
          { label: '무승인 교통·RF 교통요금', keywords: ['대중교통', 'rf교통', '교통요금', '교통카드', '시내버스', '마을버스', '지하철', '터널통행료'] },
          { label: '신차 구매 청구(환급) 할인 전표', keywords: ['신차구매', '신차구입'] },
          { label: '해외 이용', keywords: ['해외이용', '해외결제', '해외가맹점'] }
        ],
        conditional: [{ label: 'WE:SH Daily 선택 할인(6개 선택영역) 적용 여부 확인', keywords: ['kbpay', 'g마켓', '11번가', 'ssg', 'gs25', 'cu', '스타벅스', '커피빈', '올리브영', '다이소몰', '제과', '아이스크림', '패스트푸드', '오늘의집', '29cm', '인터파크티켓', '티켓링크'] }],
        source: 'https://card.kbcard.com/CRD/DVIEW/HCAMCXPRICAC0076?cooperationcode=09570&mainCC=a',
        sourceTitle: 'KB국민카드 공식 WE:SH Daily 상품 안내', checkedAt: '2026-09-25'
      },
      {
        id: 'kb-nori2-kbpay', name: 'KB국민 노리2 체크카드(KB Pay)', issuer: 'KB국민카드', threshold: 200000,
        thresholdLabel: '20만원 (일상혜택; KB Pay 혜택은 30만원)',
        extraExclusions: [{ label: '후불교통요금·무승인 교통 거래', keywords: ['후불교통', 'rf교통', '터널통행료', '교통요금', '교통카드'] }],
        conditional: [{ label: '노리2 할인 적용 여부 확인 (일상·KB Pay 혜택)', keywords: ['스타벅스', '커피빈', '구글플레이', '앱스토어', '인터파크티켓', '올리브영', '미용실', 'gs25', 'cu', '넷플릭스', '유튜브프리미엄', '배달의민족', '요기요', 'skt', 'kt', 'lgu', 'cgv', '에버랜드', '롯데월드', 'kbpay'] }],
        source: 'https://card.kbcard.com/CRD/DVIEW/HCAMCXPRICAC0076?cooperationcode=07964&mainCC=a',
        sourceTitle: 'KB국민카드 공식 노리2 체크카드(KB Pay) 상품 안내', checkedAt: '2026-09-25'
      },
      {
        id: 'kb-youth-club', name: 'KB Youth Club 체크카드', issuer: 'KB국민카드', threshold: 200000,
        thresholdLabel: '20만원 (만 18~29세; A/B 선택서비스 확인 필요)',
        extraExclusions: [
          { label: 'Youth Club 할인 적용 거래 전체', keywords: ['할인적용', '할인받음', '청구할인', '할인금액'], discountOnly: true },
          { label: '교통·무승인 거래', keywords: ['후불교통', 'rf교통', '대중교통', '교통요금', '교통카드', '터널통행료', '자판기'] },
          { label: '청소년 지원·등록금 등', keywords: ['정부지원금', '바우처', '대학등록금', '대학교등록금', '대학원등록금', '지방세', '상하수도', '세외수입'] }
        ],
        conditional: [{ label: 'Youth Club 월 선택팩(A/B) 및 할인 적용 여부 확인', keywords: ['쇼핑멤버십', '넷플릭스', '유튜브', '통신요금', '패션', '올리브영', '야놀자', '배달의민족', '요기요', 'gs25', 'cu', '레스토랑', '놀이공원', '스타벅스', '메가커피', '네이버플러스스토어', '쿠팡', '해외이용', '대중교통'] }],
        source: 'https://card.kbcard.com/CRD/DVIEW/HCAMCXPRICAC0076?cooperationcode=04124&mainCC=a',
        sourceTitle: 'KB국민카드 공식 Youth Club 체크카드 상품 안내', checkedAt: '2026-09-25'
      },
      {
        id: 'kb-you-prime', name: 'KB YOU Prime 카드', issuer: 'KB국민카드', threshold: 400000,
        thresholdLabel: '40만원 (일상팩 또는 가족팩 선택 기준)',
        extraExclusions: [
          { label: 'YOU Prime 할인 적용 매출 전체', keywords: ['할인적용', '할인받음', '청구할인', '할인금액'], discountOnly: true },
          { label: '무이자할부 이용금액', keywords: ['무이자할부', '무이자 할부', '부분무이자'] }
        ],
        conditional: [{ label: 'YOU Prime 선택팩과 할인 적용 여부 확인', keywords: ['주유', '배달', '통신요금', '보험', '앱스토어', '온라인쇼핑', '편의점', '자기관리', '생활요금', '온라인장보기', '일상케어', '학원', '대형마트', '카페'] }],
        source: 'https://card.kbcard.com/CRD/DVIEW/HCAMCXPRICAC0076?cooperationcode=09771&mainCC=a',
        sourceTitle: 'KB국민카드 공식 YOU Prime 상품 안내', checkedAt: '2026-09-25'
      },
      {
        id: 'kb-all-point', name: 'KB ALL point 카드', issuer: 'KB국민카드', threshold: 300000,
        thresholdLabel: '30만원 (영화·놀이공원 혜택; 기본 포인트 적립은 실적 무관)',
        extraExclusions: [
          { label: '포인트리·할인 공통 제외 거래', keywords: ['무이자할부', '무이자 할부', '현금서비스', '카드론', '지방세', '정부지원금', '대학등록금', '대학원등록금', '각종 수수료', '연체료', '연회비', '상품권', '선불카드', '취소'] }
        ],
        conditional: [{ label: '영화·놀이공원 할인 적용 여부 확인', keywords: ['cgv', '메가박스', '롯데월드', '에버랜드', '캐리비안베이'] }],
        source: 'https://card.kbcard.com/CRD/DVIEW/HCAMCXPRICAC0076?cooperationcode=09162&mainCC=a',
        sourceTitle: 'KB국민카드 공식 ALL point 상품 안내', checkedAt: '2026-09-25'
      },
      {
        id: 'kb-all', name: 'KB ALL 카드', issuer: 'KB국민카드', threshold: 400000,
        thresholdLabel: '40만원 (쇼핑멤버십·OTT·통신 자동납부; 기본 할인은 실적 무관)',
        extraExclusions: [
          { label: '자동납부 할인 적용 거래 전체', keywords: ['할인적용', '할인받음', '청구할인', '할인금액'], discountOnly: true },
          { label: '무승인 교통 거래', keywords: ['대중교통', '교통요금', '교통카드', '자판기', '터널통행료', '항공기내'] },
          { label: '신차 구매 청구(환급) 할인 전표', keywords: ['신차구매', '신차구입'] }
        ],
        conditional: [{ label: 'ALL 자동납부 할인 적용 여부 확인 (쇼핑멤버십·OTT·통신)', keywords: ['네이버플러스', '쿠팡와우', '로켓와우', '넷플릭스', '유튜브프리미엄', '통신요금', 'skt', 'kt', 'lgu'] }],
        source: 'https://card.kbcard.com/CRD/DVIEW/HCAMCXPRICAC0076?cooperationcode=09922&mainCC=a',
        sourceTitle: 'KB국민카드 공식 ALL 카드 상품 안내', checkedAt: '2026-09-25'
      },
      {
        id: 'kb-you-wish-up', name: 'KB YOU Wish up 카드', issuer: 'KB국민카드', threshold: 400000,
        thresholdLabel: '40만원 (일부 혜택은 80만원 구간)',
        extraExclusions: [
          { label: 'YOU Wish up 할인 적용 거래 전체', keywords: ['할인적용', '할인받음', '청구할인', '할인금액'], discountOnly: true },
          { label: '무승인 교통 거래', keywords: ['후불교통', 'rf교통', '대중교통', '교통요금', '교통카드', '터널통행료'] }
        ],
        conditional: [{ label: 'YOU Wish up 선택혜택·할인 적용 여부 확인', keywords: ['kbpay', '음식점', '식당', 'gs25', 'cu', 'skt', 'kt', 'lgu', '넷플릭스', '유튜브', '웨이브', '티빙', '디즈니', '병원', '약국', '스포츠', '온라인쇼핑', 'g마켓', '11번가', 'ssg', '무신사', '지그재그', '주유', '커피', '주차장', '세차장'] }],
        source: 'https://card.kbcard.com/CRD/DVIEW/HCAMCXPRICAC0076?cooperationcode=09298&mainCC=a',
        sourceTitle: 'KB국민카드 공식 YOU Wish up 상품 안내', checkedAt: '2026-09-25'
      },
      {
        id: 'kb-toss', name: 'Toss KB국민카드', issuer: 'KB국민카드', threshold: 500000,
        thresholdLabel: '50만원 (스타벅스 추가적립; 기본 포인트 적립은 실적 무관)',
        extraExclusions: [{ label: '추가 적립 제외 거래', keywords: ['무이자할부', '무이자 할부', '현금서비스', '카드론', '대학등록금', '대학원등록금', '연체료', '연회비', '각종 수수료', '아파트관리비', '정부지원금', '국세', '지방세', '상품권', '선불카드', '전기요금', '수도요금', '초중고', '4대사회보험', '취소'] }],
        conditional: [{ label: '스타벅스 추가 포인트 적립 여부 확인 (기본 적립은 실적 무관)', keywords: ['스타벅스', 'starbucks'] }],
        source: 'https://card.kbcard.com/CRD/DVIEW/HCAMCXPRICAC0076?cooperationcode=04350&mainCC=a',
        sourceTitle: 'KB국민카드 공식 Toss KB국민카드 상품 안내', checkedAt: '2026-09-25'
      },
      {
        id: 'hyundai-m', name: '현대카드M', issuer: '현대카드', threshold: 500000,
        thresholdLabel: '기본 혜택 50만원 (추가 혜택 100만원)', useCommonExclusions: false,
        extraExclusions: [...hyundaiBaseExclusions], conditional: [],
        source: 'https://www.hyundaicard.com/cpc/cr/CPCCR0201_01.hc?cardWcd=ME4',
        sourceTitle: '현대카드M 공식 상품 안내·혜택 제공 기준', checkedAt: '2026-09-25'
      },
      {
        id: 'hyundai-mm', name: '현대카드MM', issuer: '현대카드', threshold: 500000,
        thresholdLabel: '기본 혜택 50만원 (추가 혜택 100만원)', useCommonExclusions: false,
        extraExclusions: [...hyundaiBaseExclusions], conditional: [],
        source: 'https://www.hyundaicard.com/cpc/cr/CPCCR0201_01.hc?cardWcd=MPE4',
        sourceTitle: '현대카드MM 공식 상품 안내·혜택 제공 기준', checkedAt: '2026-09-25'
      },
      {
        id: 'hyundai-x', name: '현대카드X', issuer: '현대카드', threshold: 500000,
        thresholdLabel: '기본 혜택 50만원 (추가·연간 캐시백 조건 별도)', useCommonExclusions: false,
        extraExclusions: [...hyundaiBaseExclusions], conditional: [],
        source: 'https://www.hyundaicard.com/cpc/cr/CPCCR0201_01.hc?cardWcd=XPE4',
        sourceTitle: '현대카드X 공식 상품 안내·가이드북', checkedAt: '2026-09-25'
      },
      {
        id: 'hyundai-x-cut', name: '현대카드 X Cut', issuer: '현대카드', threshold: 500000,
        thresholdLabel: '기본 혜택 50만원 (추가 혜택 100만원)', useCommonExclusions: false,
        extraExclusions: [...hyundaiBaseExclusions, hyundaiDiscountedTransaction, { label: '무이자 할부 이용금액', keywords: ['무이자할부', '무이자 할부'] }],
        conditional: [{ label: '뷰티·생활·패션·배달·편의점 할인 적용 여부', keywords: ['올리브영', '다이소', '편의점', '배달의민족', '쿠팡이츠', '무신사', '패션', '뷰티'] }],
        source: 'https://www.hyundaicard.com/cpc/cr/CPCCR0201_01.hc?cardWcd=XCUT',
        sourceTitle: '현대카드 X Cut 공식 상품 안내·혜택 제공 기준', checkedAt: '2026-09-25'
      },
      {
        id: 'hyundai-z-everyday', name: '현대카드Z everyday', issuer: '현대카드', threshold: 500000,
        thresholdLabel: '50만원 (100만원 구간에서 할인 한도 상향)', useCommonExclusions: false,
        extraExclusions: [...hyundaiBaseExclusions, ...hyundaiZExclusions.slice(0, 4)], conditional: [],
        source: 'https://www.hyundaicard.com/cpc/cr/CPCCR0201_01.hc?cardWcd=ZWK',
        sourceTitle: '현대카드Z everyday 공식 상품 안내·혜택 제공 기준', checkedAt: '2026-09-25'
      },
      {
        id: 'hyundai-z-family', name: '현대카드Z family Edition2', issuer: '현대카드', threshold: 500000,
        thresholdLabel: '50만원 (100만원 구간에서 할인 한도 상향)', useCommonExclusions: false,
        extraExclusions: [...hyundaiBaseExclusions, ...hyundaiZExclusions, hyundaiDiscountedTransaction],
        conditional: [{ label: '온라인몰·병원·약국·학원·주유·생활요금 할인 적용 여부', keywords: ['네이버쇼핑', '쿠팡', 'g마켓', '옥션', '11번가', 'ssg', '컬리', '병원', '약국', '학원', '주유', '통신요금'] }],
        source: 'https://www.hyundaicard.com/cpc/cr/CPCCR0201_01.hc?cardWcd=ZFE2',
        sourceTitle: '현대카드Z family Edition2 공식 상품 안내·혜택 제공 기준', checkedAt: '2026-09-25'
      },
      {
        id: 'hyundai-z-work', name: '현대카드Z work Edition2', issuer: '현대카드', threshold: 500000,
        thresholdLabel: '50만원 (100만원 구간에서 할인 한도 상향)', useCommonExclusions: false,
        extraExclusions: [...hyundaiBaseExclusions, ...hyundaiZExclusions, hyundaiDiscountedTransaction],
        conditional: [{ label: '온라인몰·편의점·커피·교통·도서 할인 적용 여부', keywords: ['온라인쇼핑', '쿠팡', '네이버쇼핑', '편의점', 'gs25', 'cu', '스타벅스', '커피', '대중교통', '지하철', '버스', '서점', '도서'] }],
        source: 'https://www.hyundaicard.com/cpc/cr/CPCCR0201_01.hc?cardWcd=ZWE2',
        sourceTitle: '현대카드Z work Edition2 공식 상품 안내·혜택 제공 기준', checkedAt: '2026-09-25'
      },
      {
        id: 'hyundai-z-play', name: '현대카드Z play', issuer: '현대카드', threshold: 500000,
        thresholdLabel: '50만원 (100만원 구간에서 할인 한도 상향)', useCommonExclusions: false,
        extraExclusions: [...hyundaiBaseExclusions, ...hyundaiZExclusions, hyundaiDiscountedTransaction],
        conditional: [{ label: '온라인몰·외식·영화·해외·디지털콘텐츠 할인 적용 여부', keywords: ['온라인쇼핑', '쿠팡', '네이버쇼핑', '음식점', '일반음식점', '영화', 'cgv', '메가박스', '해외', '넷플릭스', '유튜브', '디지털콘텐츠'] }],
        source: 'https://www.hyundaicard.com/cpc/cr/CPCCR0201_01.hc?cardWcd=ZOE2',
        sourceTitle: '현대카드Z play 공식 상품 안내·혜택 제공 기준', checkedAt: '2026-09-25'
      },
      {
        id: 'hyundai-zero-up-discount', name: '현대카드 ZERO Up(할인형)', issuer: '현대카드', threshold: 0,
        thresholdLabel: '전월 실적·할인 한도 없음', useCommonExclusions: false,
        extraExclusions: [], conditional: [],
        source: 'https://www.hyundaicard.com/cpc/cr/CPCCR0201_01.hc?cardWcd=ZRUP',
        sourceTitle: '현대카드 ZERO Up(할인형) 공식 상품 안내·혜택 제공 기준', checkedAt: '2026-09-25'
      },
      {
        id: 'hyundai-zero-up-point', name: '현대카드 ZERO Up(포인트형)', issuer: '현대카드', threshold: 0,
        thresholdLabel: '전월 실적·적립 한도 없음', useCommonExclusions: false,
        extraExclusions: [], conditional: [],
        source: 'https://www.hyundaicard.com/cpc/cr/CPCCR0201_01.hc?cardWcd=MZRUP',
        sourceTitle: '현대카드 ZERO Up(포인트형) 공식 상품 안내·혜택 제공 기준', checkedAt: '2026-09-25'
      },
      ...pendingProducts
    ],
    commonExclusions,
    summary: { supportedIssuerCount: 7, supportedCardCount: 26, catalogCardCount: 66, pendingRuleCount: 40, kbCardCount: 10, hyundaiCardCount: 10, bankBcCardCount: 10, samsungCardCount: 10, wooriCardCount: 10, lotteCardCount: 10 }
  };
})();
