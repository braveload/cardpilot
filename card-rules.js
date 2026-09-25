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
  const bcMemberProducts = (issuer, key, memberNo, entries) => entries.map(([code, name]) => ({
    id: `bc-member-${key}-${code}`, name, issuer: `${issuer} (BC 회원사)`,
    source: `https://www.bccard.com/app/card/CreditCardMain.do?gdsno=${code}&mbkNo=${memberNo}`,
    sourceTitle: `BC카드 공식 ${issuer} 회원사 신용카드 목록`
  }));
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
    ].map(([id, name, source]) => ({ id, name, issuer: 'IBK기업은행 (BC 회원사)', source, sourceTitle: 'BC카드 공식 IBK기업은행 회원사 신용카드 목록' })),
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
    ,...[
      ...bcMemberProducts('우리카드', 'woori', '020', [['227702','[우리] 국민행복카드(신용)'],['242266','[BC공통] 비씨 다이아몬드 골프야드 카드'],['242241','[BC공통] 비씨 다이아몬드 스카이패스 카드'],['000000','[BC공통] 비씨TOP포인트카드'],['225005','[BC공통] 인피니트 TOP 카드'],['225021','[BC공통] 인피니트 아시아나클럽 카드'],['225018','[BC공통] 인피니트 스카이패스 카드'],['220013','[BC공통] TnT카드'],['212526','[BC공통] 레포츠카드'],['222711','[BC공통] 쉬즈 카드']]),
      ...bcMemberProducts('SC제일은행', 'sc', '023', [['100103','[SC제일] 리워드W 신용카드'],['232739','[SC제일] 뉴 타임 카드'],['232124','[SC제일] 국민행복카드(신용)'],['230029','[SC제일] 시그마 카드'],['230977','[SC제일] 리워드 플러스 신용카드(VISA)'],['231002','[SC제일] TIME카드'],['231028','[SC제일] 딜라이트 카드']]),
      ...bcMemberProducts('하나카드', 'hana', '025', [['251066','[하나] 토스신용카드'],['251008','[하나] 카카오T 하나카드'],['250818','[하나] 부자되세요 The Oil카드'],['366663','[하나] kt super DC카드'],['366651','[하나] kt super 할부카드'],['250711','[하나] 하나멤버스 1Q카드 Daily BC'],['373986','[하나] 그린카드'],['000000','[BC공통] 비씨TOP포인트카드'],['112244','[BC공통] 아시아나클럽카드'],['220013','[BC공통] TnT카드']]),
      ...bcMemberProducts('NH농협카드', 'nh', '011', [['103213','[NH농협] 어디로든 그린카드'],['100122','[NH농협] Air Money 카드'],['176565','[NH농협] LCC UniMile 카드'],['176468','[NH농협] 적립조아카드'],['176484','[NH농협] 쇼핑조아카드'],['176471','[NH농협] 할인조아카드'],['176442','[NH농협] NEW 경기 아이플러스카드'],['112422','[NH농협] NH농협 엘포인트 카드(신용)'],['111151','[NH농협] 부자되세요 홈쇼핑카드'],['176222','[NH농협] 국민행복카드(신용)']]),
      ...bcMemberProducts('KB국민카드', 'kb', '006', [['000000','[BC공통] 비씨TOP포인트카드']]),
      ...bcMemberProducts('iM뱅크', 'im', '031', [['103995','[iM뱅크] iM 트래블 카드'],['102328','[iM뱅크] iM i 카드'],['101070','[iM뱅크] iM UntacT 카드'],['311948','[iM뱅크] 세븐캐쉬백카드'],['311744','[iM뱅크] 부자되세요 아파트카드'],['311692','[iM뱅크] 그린카드 v2'],['311689','[iM뱅크] GREIT카드'],['311472','[iM뱅크] olleh Super DC카드'],['311773','[iM뱅크] 국민행복카드(신용)'],['311621','[iM뱅크] 부자되세요 홈쇼핑카드(신용)']]),
      ...bcMemberProducts('BNK부산은행', 'busan', '032', [['103961','[BNK부산] REXⅡ 카드'],['103378','[BNK부산] ZipL 신용카드'],['103192','[BNK부산] 부산체육사랑카드'],['103022','[BNK부산] 팟(pod) 카드'],['102332','[BNK부산] SK OIL＆LPG카드_부산'],['771291','[BNK부산] 오늘은e 신용카드'],['771012','[BNK부산] BNK프렌즈카드(신용)'],['770534','[BNK부산] 국민행복카드(신용)'],['770518','[BNK부산] 부자되세요 홈쇼핑카드'],['323761','[BNK부산] 딩딩 신용카드']]),
      ...bcMemberProducts('BNK경남은행', 'gyeongnam', '039', [['104511','[BNK경남] 경남은행 K-패스 카드'],['104239','[BNK경남] REXⅡ 카드'],['103676','[BNK경남] 키스해링 신용카드'],['103211','[BNK경남] 어디로든 그린카드'],['103035','[BNK경남] AIR Mile(대한항공) 카드'],['102331','[BNK경남] SK OIL＆LPG카드'],['102355','[BNK경남] The Art Card(할인형)'],['102465','[BNK경남] The Art Card(캐시백형)'],['102356','[BNK경남] The Gallery Card'],['397344','[BNK경남] ANY카드']]),
      ...bcMemberProducts('신한카드', 'shinhan', '021', [['211378','[신한] 부자되세요 홈쇼핑카드'],['000000','[BC공통] 비씨TOP포인트카드']]),
      ...bcMemberProducts('Sh수협은행', 'suhyup', '007', [['104474','[Sh수협] 더 아우름 카드'],['104068','[Sh수협] All드림카드'],['103581','[Sh수협] 樂SEA카드'],['103185','[Sh수협] Real Real 1.0'],['100644','[Sh수협] Real?Real! 2 카드']]),
      ...bcMemberProducts('광주은행', 'gwangju', '034', [['104281','[광주] 대한항공 SKYPASS 카드(일반형)'],['104282','[광주] 대한항공 SKYPASS 카드(플래티늄형)'],['104081','[광주] 기아챔피언스카드'],['103880','[광주] 오일모아카드'],['103881','[광주] 에듀플러스카드'],['103367','[광주] 다자녀행복카드'],['103119','[광주] K-패스 그린카드V2'],['101497','[광주] 광주전남愛사랑 HONORS V2 CARD'],['340294','[광주] 1st카드']]),
      ...[
        ['hana-jade-classic','JADE Classic'],['hana-wonder-t','원더카드 T'],['hana-wonder-free-plus','원더카드 FREE+'],['hana-wonder-happy-plus','원더카드 HAPPY+'],['hana-wonder-daily','원더카드 DAILY'],['hana-wonder-living','원더카드 LIVING'],['hana-wonder-free','원더카드 FREE'],['hana-wonder-happy','원더카드 HAPPY'],['hana-multi-living','MULTI Living 모바일카드'],['hana-multi-oil','MULTI Oil 모바일카드']
      ].map(([id,name])=>({id,name,issuer:'하나카드',source:'https://m.hanacard.co.kr/MKCA2P1000M.web?BRANCH_CD=8',sourceTitle:'하나카드 공식 카드 상품 목록'})),
      ...[
        ['shinhan-mrlife','신한카드 Mr.Life'],['shinhan-deep-oil','신한카드 Deep Oil'],['shinhan-coway','코웨이 신한카드'],['shinhan-discount-plan','신한카드 Discount Plan'],['shinhan-first-anniverse','신한카드 처음 ANNIVERSE'],['shinhan-simple-plan','신한카드 Simple Plan'],['shinhan-kpass','신한카드 K-패스 신용'],['shinhan-mycar','신한카드 MY CAR'],['shinhan-everywhere','신한카드 EVerywhere'],['shinhan-edu-plan','신한카드 Edu Plan+']
      ].map(([id,name])=>({id,name,issuer:'신한카드',source:'https://www.shinhancard.com/pconts/html/landing/2013506_2424.html',sourceTitle:'신한카드 공식 인기카드 TOP 10'})),
      ...[
        ['nh-zgm-shopping','zgm shopping카드','90010505'],['nh-zgm-play','zgm.play++카드','90010468'],['nh-zgm-thepay','zgm.the pay카드','90010178'],['nh-zgm-discount','zgm 할인카드','90010515'],['nh-zgm-vacation','zgm.휴가중카드','90010184'],['nh-zgm-rounding','zgm.rounding카드','90010213'],['nh-zgm-home','zgm.고향으로카드','90010216'],['nh-kpass','K-패스카드(신용)','90010471'],['nh-self','zgm 스스로카드','90010575'],['nh-goodnew','올바른NEW HAVE+카드','90010034']
      ].map(([id,name,code])=>({id,name,issuer:'NH농협카드',source:`https://card.nonghyup.com/servlet/IpCc2021R.act?CD_WRS_SQNO=${code}`,sourceTitle:'NH농협카드 공식 카드 상세 목록'}))
    ]
  ].map((product) => ({
    ...product,
    threshold: 0,
    thresholdLabel: '상품별 실적 규칙 확인 중 · 합산 보류',
    verificationStatus: 'pending',
    useCommonExclusions: false,
    extraExclusions: [],
    conditional: [],
    checkedAt: '2026-09-25'
  })).map((product) => product.id === 'shinhan-mrlife' ? {
    ...product,
    threshold: 300000,
    thresholdLabel: '전월 이용금액 30만원 이상 (공과금·TIME·주말 할인 최소 구간)',
    verificationStatus: 'verified',
    useCommonExclusions: false,
    extraExclusions: [
      { label: '장·단기 카드대출', keywords: ['장기카드대출', '단기카드대출', '카드론', '현금서비스'] },
      { label: '연회비·수수료·이자', keywords: ['연회비', '수수료', '이자'] },
      { label: '기프트카드 구매·선불카드 충전', keywords: ['기프트카드', '선불카드충전', '선불카드 충전'] },
      { label: '거래 취소 금액', keywords: ['거래취소', '거래 취소', '취소금액'] }
    ],
    source: 'https://www.shinhancard.com/pconts/html/card/apply/credit/1187937_2207.html?btnApp=dp01&empSeq=87',
    sourceTitle: '신한카드 Mr.Life 공식 상품 안내 (전월 이용금액 및 제외 기준)',
    checkedAt: '2026-09-25'
  } : product);

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
    summary: { supportedIssuerCount: 21, supportedCardCount: 27, catalogCardCount: 180, pendingRuleCount: 153, kbCardCount: 10, hyundaiCardCount: 10, bankBcIssuerCount: 12, bankBcCardCount: 94, samsungCardCount: 10, wooriCardCount: 10, lotteCardCount: 10, hanaCardCount: 10, shinhanCardCount: 10, nhCardCount: 10 }
  };
})();
