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
  const nhPointUseExclusion = { label: '포인트 결제 이용분', keywords: ['포인트사용', '포인트 사용', '포인트결제', '포인트 결제'] };
  const nhCryptoExclusion = { label: '가상화폐 거래소 이용금액', keywords: ['가상화폐', '가상자산'] };
  const nhTransitTaxiExclusion = { label: '후불교통·택시 이용금액', keywords: ['후불교통', '교통카드', '시내버스', '마을버스', '지하철', '택시'] };
  const wooriCoreExclusions = [
    { label: '무이자할부 이용금액', keywords: ['무이자할부', '무이자 할부'] },
    { label: '정부지원금·바우처', keywords: ['정부지원금', '보육료', '유치원보조비', '바우처'] },
    { label: '세금·공과금·등록금', keywords: ['국세', '지방세', '관세', '공공요금', '공과금', '대학등록금', '대학원등록금'] },
    { label: '상품권·선불·기프트카드 구매/충전', keywords: ['상품권', '선불카드', '기프트카드', '선물카드', '사이버머니', '게임머니'] },
    { label: '교통카드 충전·고속/시외버스', keywords: ['교통카드충전', '교통카드 충전', '고속버스', '시외버스'] },
    { label: '수수료·이자·연회비·카드대출', keywords: ['수수료', '이자', '연회비', '현금서비스', '단기카드대출', '카드론', '장기카드대출'] },
    { label: '매출 취소 금액', keywords: ['매출취소', '매출 취소', '취소금액'] }
  ];
  const bcIbkPerformanceExclusions = [
    { label: '세금·공과금·공공기관 가맹점', keywords: ['국세', '지방세', '관세', '전기요금', '우편요금', '도시가스요금', '상하수도요금', '여권발급', '과태료', '범칙금', '벌금', '장애인고용부담금', '공공기관', '공공단체'] },
    { label: '사회보험료', keywords: ['건강보험', '국민연금', '고용보험', '산재보험', '4대보험'] },
    { label: '학교 납입금·등록금', keywords: ['대학등록금', '대학원등록금', '초중고학부모부담금', '학교납입금'] },
    { label: '수수료·이자·연회비·연체료', keywords: ['수수료', '이자', '연회비', '연체료'] },
    { label: '관리비·후불교통', keywords: ['아파트관리비', '후불교통', '대중교통'] },
    { label: '카드대출', keywords: ['현금서비스', '단기카드대출', '카드론', '장기카드대출'] },
    { label: '무이자할부', keywords: ['무이자할부', '무이자 할부', '라이트할부', '변형무이자'] },
    { label: '상품권·포인트/선불카드 구입·충전', keywords: ['상품권', '포인트충전', '선불카드', '선불교통카드'] },
    { label: '매출 취소 금액', keywords: ['매출취소', '매출 취소', '취소금액'] }
  ];
  const bcScTimeExclusions = [
    { label: '카드대출·연회비·수수료', keywords: ['현금서비스', '단기카드대출', '카드론', '장기카드대출', '연회비', '수수료', '해외사용수수료'] },
    { label: '세금·공과금·공공요금·사회보험', keywords: ['국세', '지방세', '세금', '공과금', '공공요금', '도시가스', '수도요금', '전기요금', '고용보험', '산재보험', '장애인고용부담금', '과태료'] },
    { label: '상품권·기프트카드·포인트 사용', keywords: ['상품권', '기프트카드', '포인트사용', '포인트충전'] },
    { label: '등록금·개인보험·아파트관리비', keywords: ['등록금', '대학등록금', '초중고', '개인보험', '4대보험', '아파트관리비'] },
    { label: '취소 매출·무이자할부', keywords: ['매출취소', '취소매출', '취소금액', '무이자할부', '무이자 할부'] },
    { label: '택시·시외/고속버스·철도·통행료', keywords: ['택시', '시외버스', '고속버스', 'srt', 'ktx', '고속도로통행료'] }
  ];
  const lotteCoreExclusions = [
    { label: '세금·공과금·사회보험·공공임대료', keywords: ['국세', '지방세', '관세', '공과금', '전기요금', '수도요금', '도시가스', '건강보험', '국민연금', '고용보험', '산재보험', '공공임대료', '장애인고용부담금', '과태료', '범칙금', '벌금'] },
    { label: '학교 납입금·등록금', keywords: ['초중고교납입금', '초중고학교납입금', '학교납입금', '대학등록금', '대학원등록금'] },
    { label: '관리비·임대료', keywords: ['아파트관리비', '부동산임대료', '임대료', '월세'] },
    { label: '상품권·선불·포인트 충전', keywords: ['상품권', '기프트카드', '선불카드', '선불충전', '포인트충전'] },
    { label: '교통·택시·통행료', keywords: ['대중교통', '시내버스', '지하철', '택시', '고속버스', '고속도로통행료'] },
    { label: '수수료·이자·연회비·카드대출', keywords: ['수수료', '이자', '연회비', '현금서비스', '단기카드대출', '카드론', '장기카드대출'] },
    { label: '무이자할부·취소', keywords: ['무이자할부', '무이자 할부', '매출취소', '취소금액'] }
  ];
  const lotteLikitExclusions = [
    { label: 'LOCA LIKIT 할인 적용 이용금액 전체', keywords: ['할인적용', '할인받음', '청구할인', '할인금액'], discountOnly: true },
    { label: '세금·공과금·사회보험·공공/부동산 임대료', keywords: ['국세', '지방세', '공과금', '도시가스', '건강보험', '국민연금', '고용보험', '산재보험', '공공임대료', '부동산임대료', '월세', '장애인고용부담금'] },
    { label: '학교 납입금·등록금·아파트관리비', keywords: ['초중고교납입금', '초중고학교납입금', '대학등록금', '아파트관리비'] },
    { label: '기프트·선불·상품권·포인트 충전', keywords: ['기프트카드', '선불카드', '선불카드충전', '상품권', '모바일상품권', '포인트충전'] },
    { label: '교통·택시·고속버스·통행료', keywords: ['대중교통', '시내버스', '지하철', '택시', '고속버스', '고속도로통행료'] },
    { label: '오토·스마트 캐시백 및 무승인전표', keywords: ['오토캐시백', '스마트캐시백', '무승인전표', '자판기', '터널통행료', '항공기내'] },
    { label: '벌금·과태료·민원·관세·인지·송달료', keywords: ['벌금', '과태료', '민원발급수수료', '관세', '인지세', '송달료'] },
    { label: '무이자할부·카드대출·연회비·이자·수수료', keywords: ['무이자할부', '무이자 할부', '현금서비스', '단기카드대출', '카드론', '장기카드대출', '연회비', '이자', '수수료'] }
  ];
  const hanaBaseExclusions = [
    { label: '세금·공과금·공공기관 부담금', keywords: ['국세', '지방세', '공과금', '우편요금', '과태료', '범칙금', '벌금', '공공기관', '공공단체'] },
    { label: '사회보험료', keywords: ['국민연금', '고용보험', '산재보험', '건강보험'] },
    { label: '상품권·기프트·선불/하나머니 충전', keywords: ['상품권', '기프트카드', '선불카드', '선불전자', '하나머니충전'] },
    { label: '수도·전기·도시가스 요금', keywords: ['수도요금', '전기요금', '도시가스'] },
    { label: '등록금·학교납입금·스쿨뱅킹·부동산임대료', keywords: ['대학등록금', '대학원등록금', '초중고학교납입금', '학교납입금', '스쿨뱅킹', '부동산임대료'] }
  ];
  const hanaWonderBenefitExclusion = { label: '원더카드 할인·적립 서비스를 받은 매출 전체 (무이자할부는 실적 포함, 서비스 제공 제외)', keywords: ['서비스할인적립받은매출'], discountOnly: true };
  const hanaMultiLivingDiscountExemptionKeywords = ['하나페이', '삼성페이', '네이버페이', '쿠페이', '11pay', 'l.pay', '카카오페이', 'ssg페이', '페이코', 'skt통신요금', 'kt통신요금', 'lgu통신요금', '전기요금자동이체', '도시가스자동이체'];
  const hanaMultiOilDiscountExemptionKeywords = ['하나페이', '삼성페이', '네이버페이', '페이코', '11pay', '카카오페이', 'ssg페이'];
  const officialSpendRules = {
    'bc-member-woori-242266': {
      threshold: 0, thresholdLabel: '전월 실적 기준 없음 (국내 가맹점 2,000원당 Yard 적립)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '매출 취소·단기카드대출', keywords: ['매출취소', '카드이용매출취소', '단기카드대출', '현금서비스'] },
        { label: '해외 이용금액', keywords: ['해외이용금액', '해외매출', '해외이용'] },
        { label: '국세·지방세 등 세금 업종', keywords: ['국세', '지방세', '세금업종', '세금납부'] }
      ], conditional: [],
      source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=242266&mbkNo=020',
      sourceTitle: 'BC카드·우리카드 발급 비씨 다이아몬드 골프야드 공식 상세·Yard 적립 제외 기준', checkedAt: '2026-09-25'
    },
    'bc-member-woori-242241': {
      threshold: 0, thresholdLabel: '전월 실적 기준 없음 (개인회원 국내외 이용액 1,500원당 2마일)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '매출 취소·단기카드대출', keywords: ['카드이용매출취소', '매출취소', '단기카드대출', '현금서비스'] },
        { label: '해외 이용금액', keywords: ['해외이용금액', '해외매출', '해외이용'] },
        { label: '국세·지방세 등 세금 업종', keywords: ['국세', '지방세', '세금업종', '세금납부'] }
      ], conditional: [],
      source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=242241&mbkNo=020',
      sourceTitle: 'BC카드·우리카드 발급 비씨 다이아몬드 스카이패스 공식 상세·마일리지 적립 제외 기준', checkedAt: '2026-09-25'
    },
    'bc-member-woori-225005': {
      threshold: 0, thresholdLabel: '전월 실적 기준 없음 (국내 일시불·할부 기본 TOP포인트 1% 적립)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '해외 이용금액·단기카드대출·수수료·지방세', keywords: ['해외이용액', '해외매출', '해외이용', '단기카드대출', '현금서비스', '각종수수료', '수수료', '지방세'] },
        { label: '매출 취소금액', keywords: ['매출취소', '취소금액', '거래취소'] }
      ], conditional: [],
      source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=225005&mbkNo=020',
      sourceTitle: 'BC카드·우리카드 발급 비씨 인피니트 TOP 공식 상세·포인트 적립 제외 기준', checkedAt: '2026-09-25'
    },
    'bc-member-woori-225021': {
      threshold: 0, thresholdLabel: '전월 실적 기준 없음 (개인회원 국내외 이용액 1,500원당 2마일)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '매출 취소·단기카드대출', keywords: ['카드이용매출취소', '매출취소', '단기카드대출', '현금서비스'] },
        { label: '국세·지방세 등 세금 업종', keywords: ['국세', '지방세', '세금업종', '세금납부'] }
      ], conditional: [],
      source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=225021&mbkNo=020',
      sourceTitle: 'BC카드·우리카드 발급 비씨 인피니트 아시아나클럽 공식 상세·마일리지 적립 제외 기준', checkedAt: '2026-09-25'
    },
    'bc-member-woori-225018': {
      threshold: 0, thresholdLabel: '전월 실적 기준 없음 (개인회원 국내외 이용액 1,500원당 2마일)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '매출 취소·단기카드대출', keywords: ['카드이용매출취소', '매출취소', '단기카드대출', '현금서비스'] },
        { label: '국세·지방세 등 세금 업종', keywords: ['국세', '지방세', '세금업종', '세금납부'] }
      ], conditional: [],
      source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=225018&mbkNo=020',
      sourceTitle: 'BC카드·우리카드 발급 비씨 인피니트 스카이패스 공식 상세·마일리지 적립 제외 기준', checkedAt: '2026-09-25'
    },
    'bc-member-woori-220013': {
      threshold: 200000, thresholdLabel: '전월 국내 일시불·할부 20만원 이상 (카드 등록 후 1개월은 실적 무관 제공)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '해외 이용금액 (전월 국내 실적 산정 대상 아님)', keywords: ['해외이용', '해외매출', '해외사용', '해외결제'] },
        { label: '취소 매출표 접수 월의 취소 금액', keywords: ['매출취소', '취소매출', '취소금액', '거래취소'] }
      ], conditional: [],
      source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=220013&mbkNo=020',
      sourceTitle: 'BC카드 공식 TnT카드 상세 (우리카드 발급 기준·국내 실적 및 취소 처리)', checkedAt: '2026-09-25'
    },
    'bc-member-woori-212526': {
      threshold: 300000, thresholdLabel: '최근 3개월 국내 일시불·할부 30만원 이상 (카드 수령 후 3개월은 실적 무관 제공)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '해외 이용금액 (국내 실적 기준)', keywords: ['해외이용', '해외매출', '해외사용', '해외결제'] },
        { label: '취소 금액', keywords: ['취소금액', '매출취소', '취소매출', '거래취소'] }
      ], conditional: [],
      source: 'https://www.bccard.com/down/individual/customer/07_leports_220810.pdf',
      sourceTitle: 'BC카드 레포츠·쉬즈카드 공식 안내장 (최근 3개월 국내 실적 및 취소 제외)', checkedAt: '2026-09-25'
    },
    'bc-member-woori-222711': {
      threshold: 300000, thresholdLabel: '최근 3개월 국내 일시불·할부 30만원 이상 (카드 수령 후 3개월은 실적 무관 제공)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '해외 이용금액 (국내 실적 기준)', keywords: ['해외이용', '해외매출', '해외사용', '해외결제'] },
        { label: '취소 금액', keywords: ['취소금액', '매출취소', '취소매출', '거래취소'] }
      ], conditional: [],
      source: 'https://www.bccard.com/down/individual/customer/07_leports_220810.pdf',
      sourceTitle: 'BC카드 레포츠·쉬즈카드 공식 안내장 (최근 3개월 국내 실적 및 취소 제외)', checkedAt: '2026-09-25'
    },
    'bc-member-hana-220013': {
      threshold: 300000, thresholdLabel: '전월 국내 일시불·할부 30만원 이상 (카드 등록 후 1개월은 실적 무관 제공)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '해외 이용금액 (전월 국내 실적 산정 대상 아님)', keywords: ['해외이용', '해외매출', '해외사용', '해외결제'] },
        { label: '취소 매출표 접수 월의 취소 금액', keywords: ['매출취소', '취소매출', '취소금액', '거래취소'] }
      ], conditional: [],
      source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=220013&mbkNo=020',
      sourceTitle: 'BC카드 공식 TnT카드 상세 (하나은행 발급 시 30만원 기준·국내 실적 및 취소 처리)', checkedAt: '2026-09-25'
    },
    'bc-member-hana-112244': {
      threshold: 0, thresholdLabel: '전월 실적 조건 없음 (개인회원 국내외 일시불·할부 1,000원당 1마일)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '무이자할부 이용액', keywords: ['무이자할부', '무이자 할부'] },
        { label: '취소 매출', keywords: ['매출취소', '취소매출', '취소금액', '거래취소'] },
        { label: '대학 등록금', keywords: ['대학등록금', '대학교등록금', '대학원등록금'] },
        { label: '국세·지방세', keywords: ['국세', '지방세', '세금납부'] }
      ], conditional: [],
      source: 'https://www.bccard.com/down/individual/customer/25_asianaclub_220208.pdf',
      sourceTitle: 'BC카드 아시아나클럽카드 공식 상품안내장 (마일리지 적립 및 제외 항목)', checkedAt: '2026-09-25'
    },
    'bc-member-hana-000000': {
      threshold: 0, thresholdLabel: '전월 최소실적 조건 없음 (기본 적립률: 월 이용액 30만원 미만 0.1% · 30~100만원 미만 0.2% · 100만원 이상 0.3%; 특별 적립 별도)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '해외 이용금액', keywords: ['해외사용', '해외이용', '해외매출', '해외결제'] },
        { label: '국세·지방세 등 세금 납부', keywords: ['국세', '지방세', '세금납부', '제세공과금', '관세'] },
        { label: '단기카드대출(현금서비스)', keywords: ['현금서비스', '단기카드대출'] },
        { label: '각종 수수료·이자', keywords: ['각종수수료', '수수료', '이자', '연회비'] },
        { label: '매출 취소 (취소 접수 월 이용금액에서 차감)', keywords: ['매출취소', '취소매출', '취소금액', '거래취소'] }
      ], conditional: [],
      source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=000000&mbkNo=025',
      sourceTitle: 'BC카드 하나회원사 비씨TOP포인트카드 공식 상세·적립 구간·취소 처리', checkedAt: '2026-09-25',
      supportingSources: [
        { url: 'https://m.hanacard.co.kr/leaflet/BC/BCPT1_20260129.pdf', title: '하나카드 2026 BC 플래티늄 TOP포인트 기준 (국내 일시불·할부, 해외·세금·현금서비스 제외)' },
        { url: 'https://www.bccard.com/down/individual/customer/500348.pdf', title: 'BC카드 TOP포인트 제공 기준 (해외·현금서비스·수수료·지방세 제외)' }
      ]
    },
    'bc-member-kb-000000': {
      threshold: 0, thresholdLabel: '전월 이용실적 구간별 TOP 적립률 (30만원 미만 0.1% · 100만원 미만 0.2% · 100만원 이상 0.3%)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '해외 이용금액', keywords: ['해외사용', '해외이용', '해외매출', '해외결제'] },
        { label: '단기·장기 카드대출', keywords: ['현금서비스', '단기카드대출', '카드론', '장기카드대출'] },
        { label: '세금·공과금·정부지원금', keywords: ['세금', '국세', '지방세', '공과금', '전기요금', '수도요금', '도시가스', '정부지원금'] },
        { label: '아파트 관리비·대학/대학원 등록금', keywords: ['아파트관리비', '아파트 관리비', '대학등록금', '대학원등록금'] },
        { label: '수수료·이자·연체료·연회비', keywords: ['수수료', '이자', '연체료', '연회비'] },
        { label: '선불카드·상품권 구매 및 충전', keywords: ['선불카드', '선불충전', '상품권'] },
        { label: '대중교통·항공기내 등 무승인 전표', keywords: ['대중교통', '시내버스', '지하철', '항공기내', '무승인전표'] },
        { label: '매출 취소금액', keywords: ['취소금액', '매출취소', '취소매출', '거래취소'] }
      ], conditional: [],
      source: 'https://card.kbcard.com/CRD/DVIEW/HCAMCXPRICAC0076?cooperationcode=08001',
      sourceTitle: 'KB국민카드 공식 KB국민 비씨TOP카드 안내 (전월 적립구간·실적 제외대상)', checkedAt: '2026-09-25'
    },
    'bc-member-shinhan-000000': {
      threshold: 0, thresholdLabel: '전월 최소실적 기준 없음 (TOP포인트 적립률은 월 결제액 구간별 0.1~0.3%)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '지방세 납부', keywords: ['지방세', '지방세납부'] },
        { label: '해외 매출', keywords: ['해외매출', '해외이용', '해외사용'] },
        { label: '단기카드대출·각종 수수료', keywords: ['단기카드대출', '현금서비스', '각종수수료', '수수료'] }
      ], conditional: [],
      source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=000000&mbkNo=021',
      sourceTitle: 'BC카드·신한카드 발급 BC TOP포인트카드 공식 상세·적립 구간 및 제외 항목', checkedAt: '2026-09-25'
    },
    'bc-member-woori-000000': {
      threshold: 0, thresholdLabel: '전월 최소실적 기준 없음 (TOP포인트 적립률은 월 이용금액 구간별 차등)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '아파트관리비·임대료·정부지원금', keywords: ['아파트관리비', '임대료', '보육료', '유치원보조비', '정부지원금', '바우처'] },
        { label: '등록금·세금·공공요금·사회보험·공공기관 이용', keywords: ['대학등록금', '대학원등록금', '국세', '지방세', '공공요금', '공과금', '건강보험', '국민연금', '고용보험', '산재보험', '전기요금', '우편요금', '도시가스요금', '상하수도요금', '과태료', '범칙금', '벌금', '여권발급비용', '국가공공기관', '공공단체'] },
        { label: '상품권·기프트·선불카드 구매/충전·교통카드 구매/충전', keywords: ['상품권', '기프트카드', '선불카드', '교통카드충전', '교통카드 충전', '교통카드구매', '교통카드 구매'] },
        { label: '고속버스·수수료·이자·카드대출·무이자할부·취소·정산용 가맹점', keywords: ['고속버스', '수수료', '이자', '단기카드대출', '현금서비스', '무이자할부', '무이자 할부', '매출취소', '취소금액', '정산용가맹점'] }
      ], conditional: [],
      source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=000000&mbkNo=020',
      sourceTitle: 'BC카드·우리카드 발급 비씨TOP포인트카드 공식 상세·포인트 적립 및 제외 기준', checkedAt: '2026-09-25'
    },
    'bc-member-shinhan-211378': {
      threshold: 200000, thresholdLabel: '20만원 (6대 홈쇼핑·생활 할인 서비스 기준)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '6대 홈쇼핑 이용금액', keywords: ['cj오쇼핑', 'gs홈쇼핑', '현대홈쇼핑', '롯데홈쇼핑', '홈앤쇼핑', 'ns홈쇼핑', '홈쇼핑'] },
        { label: '카드대출·수수료·이자·연회비', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론', '수수료', '이자', '연회비'] },
        { label: '기프트카드·선불카드 구매 및 충전', keywords: ['기프트카드', '선불카드', '선불충전'] },
        { label: '거래 취소금액', keywords: ['거래취소', '취소금액', '매출취소'] }
      ], conditional: [],
      source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=211378&mbkNo=021',
      sourceTitle: 'BC카드·신한 부자되세요 홈쇼핑카드 공식 상세·전월 실적 기준 및 제외 항목', checkedAt: '2026-09-25'
    },
    'bc-member-hana-251066': {
      threshold: 0, thresholdLabel: '전월 실적 기준 명시 없음 (해외 2% 적립; ATM 수수료 우대는 전월 사용액·횟수 무관)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [], conditional: [],
      source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=251066&mbkNo=025',
      sourceTitle: 'BC카드·하나 토스신용카드 공식 상품 상세·해외 적립 및 ATM 우대 기준', checkedAt: '2026-09-25'
    },
    'bc-member-hana-251008': {
      threshold: 300000, thresholdLabel: '30만원 (카카오T·주유·철도·영화 등 할인 최소 실적; 60만원 구간은 일부 한도 상향)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '세금·공과금·사회보험', keywords: ['국세', '지방세', '공과금', '국민연금', '고용보험', '산재보험', '건강보험', '수도요금', '전기요금', '도시가스'] },
        { label: '상품권·기프트카드·선불 충전', keywords: ['상품권', '기프트카드', '선불카드', '선불전자지급수단', '하나머니충전', '포인트충전'] },
        { label: '아파트관리비·등록금·초중고 납입금', keywords: ['아파트관리비', '대학교등록금', '대학등록금', '초중고', '학교납입금'] }
      ],
      source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=251008&mbkNo=025',
      sourceTitle: 'BC카드·하나 카카오T 카드 공식 상세·전월 실적 산정 제외 기준', checkedAt: '2026-09-25'
    },
    'bc-member-hana-366663': {
      threshold: 300000, thresholdLabel: '30만원 (KT 통신요금 할인 최소 실적; 콘텐츠 쿠폰은 70만원 기준)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '세금·공과금·사회보험·공공기관', keywords: ['국세', '지방세', '공과금', '건강보험', '국민연금', '고용보험', '산재보험', '상하수도', '전기요금', '도시가스', '과태료', '벌금', '범칙금', '공공기관'] },
        { label: '상품권·선불/기프트 충전·무이자할부', keywords: ['상품권', '선불카드', '선불충전', '기프트카드', '무이자할부'] },
        { label: '등록금·관리비·정부지원금·카드대출·수수료', keywords: ['대학교등록금', '대학등록금', '아파트관리비', '아이행복정부지원금', '현금서비스', '단기카드대출', '카드론', '장기카드대출', '연회비', '연체료', '수수료', '이자'] }
      ],
      source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=366663&mbkNo=025',
      sourceTitle: 'BC카드·하나 KT SUPER DC 카드 공식 상세·전월 실적 제외 기준', checkedAt: '2026-09-25'
    },
    'bc-member-hana-366651': {
      threshold: 300000, thresholdLabel: '30만원 (KT 통신요금 할인 최소 실적; 라이트할부 할인은 70만원 구간 상향)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '세금·공과금·사회보험·공공기관', keywords: ['국세', '지방세', '공과금', '건강보험', '국민연금', '고용보험', '산재보험', '상하수도', '전기요금', '도시가스', '과태료', '벌금', '범칙금', '공공기관'] },
        { label: '상품권·선불/기프트 충전·무이자할부', keywords: ['상품권', '선불카드', '선불충전', '기프트카드', '무이자할부'] },
        { label: '등록금·관리비·정부지원금·카드대출·수수료', keywords: ['대학교등록금', '대학등록금', '아파트관리비', '아이행복정부지원금', '현금서비스', '단기카드대출', '카드론', '장기카드대출', '연회비', '연체료', '수수료', '이자'] }
      ],
      source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=366651&mbkNo=025',
      sourceTitle: 'BC카드·하나 KT SUPER 할부카드 공식 상세·전월 실적 제외 기준', checkedAt: '2026-09-25'
    },
    'samsung-id-global': {
      threshold: 500000, thresholdLabel: '50만원 (인앱결제·디지털콘텐츠·멤버십 등 국내 할인 최소 실적; 해외 혜택은 실적 무관)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '해외 전체 이용금액', keywords: ['해외이용', '해외 매출', '해외결제'] },
        { label: '사회보험·장애인 고용부담금·세금·공과금', keywords: ['건강보험', '국민연금', '고용보험', '산재보험', '장애인 고용부담금', '국세', '지방세', '공과금', '전기요금', '우편요금', '도시가스', '상하수도', '여권 발급', '과태료', '범칙금', '벌금', '공공기관'] },
        { label: '아파트관리비·부동산 임대료', keywords: ['아파트관리비', '아파트 관리비', '부동산임대료', '임대료'] },
        { label: '유치원·초중고 납입금·대학 등록금', keywords: ['유치원 납입금', '학교납입금', '초중고', '대학등록금', '대학 등록금'] },
        { label: '대중교통·택시', keywords: ['대중교통', '후불교통', '택시'] },
        { label: '기프트·선불카드·전자지급수단 구매/충전·상품권', keywords: ['기프트카드', '선불카드', '전자지급수단', '사이버머니', '상품권', '포인트충전'] },
        { label: '카드대출·수수료·이자·연체료·연회비', keywords: ['현금서비스', '단기카드대출', '카드론', '장기카드대출', '수수료', '이자', '연체료', '연회비'] }
      ],
      source: 'https://www.samsungcard.com/home/card/cardinfo/PGHPPCCCardCardinfoDetails001?click=UHPPCO0101M0_card_PGHPPCCCardCardinfoDetails001_PRD_AAP1824&code=AAP1824',
      sourceTitle: '삼성카드 iD GLOBAL 공식 상세·전월 이용금액 기준 및 제외 대상', checkedAt: '2026-09-25'
    },
    'samsung-id-one': {
      threshold: 500000, thresholdLabel: '50만원 (생활영역·관리비·이동통신·교육 적립 등 주요 혜택 기준)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '사회보험·장애인 고용부담금·세금·공과금', keywords: ['건강보험', '국민연금', '고용보험', '산재보험', '장애인 고용부담금', '국세', '지방세', '공과금', '전기요금', '우편요금', '도시가스', '상하수도', '여권 발급', '과태료', '범칙금', '벌금', '공공기관'] },
        { label: '아파트관리비·부동산 임대료', keywords: ['아파트관리비', '아파트 관리비', '부동산임대료', '임대료'] },
        { label: '유치원·초중고 납입금·대학 등록금', keywords: ['유치원 납입금', '학교납입금', '초중고', '대학등록금', '대학 등록금'] },
        { label: '대중교통·택시', keywords: ['대중교통', '후불교통', '모바일교통', '택시'] },
        { label: '기프트·선불카드·전자지급수단 구매/충전·상품권', keywords: ['기프트카드', '선불카드', '전자지급수단', '사이버머니', '상품권', '포인트충전'] },
        { label: '카드대출·수수료·이자·연체료·연회비', keywords: ['현금서비스', '단기카드대출', '카드론', '장기카드대출', '수수료', '이자', '연체료', '연회비'] }
      ],
      source: 'https://www.samsungcard.com/home/card/cardinfo/PGHPPCCCardCardinfoDetails001?click=UHPPCO0101M0_card_PGHPPCCCardCardinfoDetails001_PRD_AAP1837&code=AAP1837',
      sourceTitle: '삼성카드 iD ONE 공식 상세·전월 이용금액 기준 및 제외 대상', checkedAt: '2026-09-25'
    },
    'lotte-point-plus': {
      threshold: 0, thresholdLabel: '전월 실적 조건 없음 (공식 상품 상세 기준; 기본 현장 적립분의 더블 적립은 별도 서비스 제외조건 적용)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [],
      source: 'https://jiwon3.lottecard.co.kr/app/LPCDADB_V100.lc?vtCdKndC=P00276-A00276',
      sourceTitle: '롯데카드 롯데포인트 플러스 공식 상세·더블 적립 제외조건', checkedAt: '2026-09-25'
    },
    'samsung-id-select-all': {
      threshold: 400000, thresholdLabel: '전월 이용금액 40만원 이상 (선택 할인서비스 기준; 국내 기본 0.7% 할인은 실적 무관)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '삼성카드 할인 적용 전체 이용금액', keywords: ['할인적용', '할인받음', '청구할인'], discountOnly: true },
        { label: '건강보험·국민연금·고용보험·산재보험·장애인 고용부담금', keywords: ['건강보험', '국민연금', '고용보험', '산재보험', '4대보험', '장애인고용부담금'] },
        { label: '국세·지방세·공과금', keywords: ['국세', '지방세', '공과금', '전기요금', '우편요금', '도시가스', '수도요금', '상하수도', '여권발급', '과태료', '범칙금', '벌금', '공공기관', '공공단체'] },
        { label: '아파트 관리비·부동산 임대료', keywords: ['아파트관리비', '부동산임대료', '월세', '임대료'] },
        { label: '유치원·초중고 학교납입금·대학등록금', keywords: ['유치원', '초중고', '학교납입금', '대학등록금', '대학원등록금'] },
        { label: '기프트·선불·전자지급수단·상품권 구매 및 충전', keywords: ['기프트카드', '선불카드', '포인트충전', '사이버머니', '전자지급수단', '상품권'] }
      ],
      source: 'https://www.samsungcard.com/home/card/cardinfo/PGHPPCCCardCardinfoDetails001?code=AAP1875',
      sourceTitle: '삼성 iD SELECT ALL 공식 상세 팝업 (선택 서비스 할인기준·전월 이용금액 제외)', checkedAt: '2026-09-25'
    },
    'samsung-id-select-up': {
      threshold: 500000, thresholdLabel: '전월 이용금액 50만원 이상 (SELECT 의료/생활 할인 기준; 국내 가맹점 0.5%·쇼핑 1% 기본 할인은 실적 무관)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '의료 20% 또는 생활영역 10% 할인 제공 이용금액', keywords: ['의료할인', '생활영역할인'], discountOnly: true },
        { label: '건강보험·국민연금·고용보험·산재보험·장애인 고용부담금', keywords: ['건강보험', '국민연금', '고용보험', '산재보험', '4대보험', '장애인고용부담금'] },
        { label: '국세·지방세·공과금', keywords: ['국세', '지방세', '공과금', '전기요금', '우편요금', '도시가스', '수도요금', '상하수도', '여권발급', '과태료', '범칙금', '벌금', '공공기관', '공공단체'] },
        { label: '아파트 관리비·부동산 임대료', keywords: ['아파트관리비', '부동산임대료', '월세', '임대료'] },
        { label: '유치원·초중고 학교납입금·대학등록금', keywords: ['유치원', '초중고', '학교납입금', '대학등록금', '대학원등록금'] },
        { label: '기프트·선불·전자지급수단·상품권 구매 및 충전', keywords: ['기프트카드', '선불카드', '포인트충전', '사이버머니', '전자지급수단', '상품권'] }
      ],
      source: 'https://www.samsungcard.com/home/card/cardinfo/PGHPPCCCardCardinfoDetails001?code=AAP1913',
      sourceTitle: '삼성 iD SELECT UP 공식 상세 팝업 (SELECT 서비스 할인기준·전월 이용금액 제외)', checkedAt: '2026-09-25'
    },
    'samsung-id-select-on': {
      threshold: 300000, thresholdLabel: '전월 이용금액 30만원 이상 (음식점·온라인 패션/쇼핑 할인 기준; 온라인 간편결제 1% 기본 할인은 실적 무관)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '음식점·온라인패션몰·온라인쇼핑몰 5%/10% 할인 제공 이용금액', keywords: ['음식점할인', '온라인패션몰할인', '온라인쇼핑몰할인'], discountOnly: true },
        { label: '건강보험·국민연금·고용보험·산재보험·장애인 고용부담금', keywords: ['건강보험', '국민연금', '고용보험', '산재보험', '4대보험', '장애인고용부담금'] },
        { label: '국세·지방세·공과금', keywords: ['국세', '지방세', '공과금', '전기요금', '우편요금', '도시가스', '수도요금', '상하수도', '여권발급', '과태료', '범칙금', '벌금', '공공기관', '공공단체'] },
        { label: '아파트 관리비·부동산 임대료', keywords: ['아파트관리비', '부동산임대료', '월세', '임대료'] },
        { label: '유치원·초중고 학교납입금·대학등록금', keywords: ['유치원', '초중고', '학교납입금', '대학등록금', '대학원등록금'] },
        { label: '기프트·선불·전자지급수단·상품권 구매 및 충전', keywords: ['기프트카드', '선불카드', '포인트충전', '사이버머니', '전자지급수단', '상품권'] }
      ],
      source: 'https://www.samsungcard.com/home/card/cardinfo/PGHPPCCCardCardinfoDetails001?code=AAP1877',
      sourceTitle: '삼성 iD SELECT ON 공식 상세 팝업 (SELECT 서비스 할인기준·전월 이용금액 제외)', checkedAt: '2026-09-25'
    },
    'samsung-id-simple': {
      threshold: 0, thresholdLabel: '전월 실적 조건 없음 (일부 할인은 건별 결제금액 조건 적용)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '건강보험·국민연금·고용보험·산재보험·장애인 고용부담금', keywords: ['건강보험', '국민연금', '고용보험', '산재보험', '4대보험', '장애인고용부담금'] },
        { label: '국세·지방세·공과금', keywords: ['국세', '지방세', '공과금', '전기요금', '우편요금', '도시가스', '수도요금', '상하수도', '여권발급', '과태료', '범칙금', '벌금', '공공기관', '공공단체'] },
        { label: '아파트 관리비·부동산 임대료', keywords: ['아파트관리비', '부동산임대료', '월세', '임대료'] },
        { label: '초중고 학교납입금·대학등록금', keywords: ['초중고', '학교납입금', '대학등록금', '대학원등록금'] },
        { label: '대중교통·택시', keywords: ['대중교통', '후불교통', '모바일교통', '시내버스', '지하철', '택시'] },
        { label: '기프트·선불·전자지급수단·상품권 구매 및 충전', keywords: ['기프트카드', '선불카드', '포인트충전', '사이버머니', '전자지급수단', '상품권'] }
      ],
      source: 'https://www.samsungcard.com/home/card/cardinfo/PGHPPCCCardCardinfoDetails001?code=AAP1767',
      sourceTitle: '삼성 iD SIMPLE 공식 상세 팝업 (국내외 1% 서비스 및 전월 이용금액 제외)', checkedAt: '2026-09-25'
    },
    'lotte-lola': {
      threshold: 400000, thresholdLabel: '전월 이용금액 40만원 이상 (롤라머니 적립 기준; 롯데그룹 가맹점 이용액은 해당 적립 실적에서 제외)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '롯데그룹 가맹점 이용금액 (7% 롤라머니 적립 실적 제외)', keywords: ['롯데백화점', '롯데아울렛', '롯데마트', '롯데빅마켓', '토이저러스', '롯데하이마트', '롯데홈쇼핑', '롯데슈퍼', '롯데면세점', '롯데몰', '롯데피트인', '롯데on', '롯데리아', '엔제리너스', '크리스피크림', 'tgif', '나뚜루', '빌라드샬롯', '세븐일레븐', '바이더웨이', '롯데시네마', '롯데월드', '롯데자이언츠', '롯데호텔', '시그니엘', '롯데시티호텔', 'l7호텔', '롯데리조트', '롯데스카이힐', '롯데렌터카', '그린카', '묘미', '롭스', '유니클로', '무인양품', '롯데jtb'] },
        { label: '무이자 할부', keywords: ['무이자할부', '무이자 할부'] },
        { label: '국세·지방세·공과금·사회보험료', keywords: ['국세', '지방세', '관세', '공과금', '도시가스', '건강보험', '국민연금', '고용보험', '산재보험', '장애인고용부담금'] },
        { label: '학교 납입금·등록금·공공임대료·부동산 임대료·관리비', keywords: ['초중고교납입금', '학교납입금', '대학등록금', 'lh공공임대료', 'sh공공임대료', '공공임대료', '월세', '부동산임대료', '아파트관리비'] },
        { label: '교통·택시·통행료·무승인전표', keywords: ['대중교통', '시내버스', '지하철', '고속버스', '택시', '고속도로통행료', '자판기', '터널통행료', '항공기내'] },
        { label: '기프트·선불·포인트 충전·상품권 구매', keywords: ['기프트카드', '선불카드', '포인트충전', '상품권'] },
        { label: '카드대출·연회비·이자·수수료·캐시백 신청', keywords: ['현금서비스', '단기카드대출', '카드론', '장기카드대출', '연회비', '이자', '수수료', '오토캐시백', '스마트캐시백'] },
        { label: '벌금·과태료·민원수수료·인지세·송달료', keywords: ['벌금', '과태료', '민원발급수수료', '인지세', '송달료'] }
      ],
      source: 'https://image.lottecard.co.kr/UploadFiles/cardProvisionPath/P13474-A13474.pdf',
      sourceTitle: '롯데카드 롤라카드 공식 상품설명서 (실적기준·제외 항목, 2021년 6월 기준)', checkedAt: '2026-09-25'
    },
    'samsung-taptap-o': {
      threshold: 300000, thresholdLabel: '전월 일시불·할부 이용금액 30만원 이상 (할인 서비스 기준; 적립 옵션은 실적 조건 없음)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '삼성카드 할인 혜택 적용 전체 이용금액', keywords: ['할인적용', '할인받음', '청구할인', '할인금액'], discountOnly: true },
        { label: '국세·지방세·공과금·보험료·장애인 고용부담금', keywords: ['국세', '지방세', '공과금', '전기요금', '수도요금', '도시가스', '고용보험', '산재보험', '장애인고용부담금'] },
        { label: '아파트 관리비·대학등록금', keywords: ['아파트관리비', '대학등록금', '대학원등록금'] },
        { label: '대중교통·택시·고속버스·고속도로 통행료·모바일 티머니', keywords: ['대중교통', '후불교통', '모바일교통', '시내버스', '지하철', '택시', '고속버스', '고속도로통행료', '모바일티머니'] },
        { label: '무이자·다이어트할부', keywords: ['무이자할부', '무이자 할부', '다이어트할부'] },
        { label: '법인공용카드·선불카드 충전·상품권 구매·문자알림·스마트오토', keywords: ['법인공용카드', '선불카드충전', '선불카드 충전', '상품권', 'sms이용수수료', '문자알림', '스마트오토'] }
      ],
      source: 'https://www.samsungcard.com/home/card/cardinfo/PGHPPCCCardCardinfoDetails001?code=AAP1483',
      sourceTitle: '삼성카드 taptap O 공식 상세 팝업 (라이프스타일 패키지 실적·제외 기준)', checkedAt: '2026-09-25'
    },
    'samsung-monimo-pay': {
      threshold: 300000, thresholdLabel: '전월 이용금액 30만원 이상 (모니모페이 할인 최소 실적; 할인율은 모니모 앱 로그인 인정 일수에 따라 달라짐)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '모니모페이·디지털콘텐츠/멤버십 할인 제공 전체 이용금액', keywords: ['모니모페이할인', '디지털콘텐츠할인', '멤버십할인'], discountOnly: true },
        { label: '건강보험·국민연금·고용보험·산재보험·장애인 고용부담금', keywords: ['건강보험', '국민연금', '고용보험', '산재보험', '4대보험', '장애인고용부담금'] },
        { label: '국세·지방세·공과금', keywords: ['국세', '지방세', '공과금', '전기요금', '우편요금', '도시가스', '수도요금', '상하수도', '여권발급', '과태료', '범칙금', '벌금', '공공기관', '공공단체'] },
        { label: '아파트 관리비·부동산 임대료', keywords: ['아파트관리비', '부동산임대료', '월세', '임대료'] },
        { label: '유치원·초중고 학교납입금·대학등록금', keywords: ['유치원', '초중고', '학교납입금', '대학등록금', '대학원등록금'] },
        { label: '기프트·선불·전자지급수단·상품권 구매 및 충전', keywords: ['기프트카드', '선불카드', '포인트충전', '사이버머니', '전자지급수단', '상품권'] }
      ],
      conditional: [{ label: '모니모 앱 로그인 인정 일수에 따라 할인율이 달라짐', keywords: ['모니모페이'] }],
      source: 'https://www.samsungcard.com/home/card/cardinfo/PGHPPCCCardCardinfoDetails001?code=AAP1918',
      sourceTitle: '삼성 모니모페이카드 공식 상세 팝업 (모니모페이 할인·전월 실적 제외 기준)', checkedAt: '2026-09-25'
    },
    'samsung-id-overseas35': {
      threshold: 0, thresholdLabel: '전월 실적 조건 없음 (국내 0.7%·해외 3.5% 기본 할인)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '무이자할부·삼성카드 행사 혜택 적용 이용금액', keywords: ['무이자할부', '무이자 할부', '행사혜택적용'], discountOnly: true },
        { label: '건강보험·국민연금·고용보험·산재보험·장애인 고용부담금', keywords: ['건강보험', '국민연금', '고용보험', '산재보험', '4대보험', '장애인고용부담금'] },
        { label: '국세·지방세·공과금', keywords: ['국세', '지방세', '공과금', '전기요금', '우편요금', '도시가스', '수도요금', '상하수도', '여권발급', '과태료', '범칙금', '벌금', '공공기관', '공공단체'] },
        { label: '아파트 관리비·부동산 임대료', keywords: ['아파트관리비', '부동산임대료', '월세', '임대료'] },
        { label: '유치원·초중고 학교납입금·대학등록금', keywords: ['유치원', '초중고', '학교납입금', '대학등록금', '대학원등록금'] },
        { label: '대중교통·택시·고속버스·고속도로 통행료', keywords: ['대중교통', '후불교통', '모바일교통', '시내버스', '지하철', '택시', '고속버스', '고속도로통행료'] },
        { label: '기프트·선불·전자지급수단·상품권 구매 및 충전', keywords: ['기프트카드', '선불카드', '포인트충전', '사이버머니', '전자지급수단', '상품권'] },
        { label: '문자알림·스마트오토·일부 의약품/유류 구매한도 결제', keywords: ['문자알림', 'sms이용수수료', '스마트오토', '구매캐시백', '유류구매한도'] }
      ],
      source: 'https://www.samsungcard.com/home/card/cardinfo/PGHPPCCCardCardinfoDetails001?code=AAP1921',
      sourceTitle: '삼성 iD 해외 3.5 공식 상세 팝업 (국내 가맹점 할인 및 이용 제외 기준)', checkedAt: '2026-09-25'
    },
    'shinhan-deep-oil': {
      threshold: 300000, thresholdLabel: '전월 이용금액 30만원 이상 (모든 주유소 주유·LPG 이용금액 제외)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '단기·장기 카드대출', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론'] },
        { label: '연회비·수수료·이자', keywords: ['연회비', '각종수수료', '수수료', '이자'] },
        { label: '취소·기프트카드·선불카드 충전', keywords: ['거래취소', '취소금액', '기프트카드', '선불카드충전', '선불카드 충전'] },
        { label: '모든 주유소 주유 및 LPG 이용금액', keywords: ['주유소', 'lpg', '엘피지'] }
      ],
      source: 'https://www.shinhancard.com/pconts/html/card/apply/credit/1188274_2207.html',
      sourceTitle: '신한카드 Deep Oil 공식 상품 상세 (전월 이용금액 제외 기준)', checkedAt: '2026-09-25'
    },
    'shinhan-kpass': {
      threshold: 300000, thresholdLabel: '전월 이용금액 30만원 이상 (60만원 이상 할인한도 상향)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '단기·장기 카드대출', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론'] },
        { label: '연회비·수수료·이자·취소', keywords: ['연회비', '각종수수료', '수수료', '이자', '거래취소', '취소금액'] },
        { label: '기프트·선불·상품권·선불전자지급수단 구매·충전', keywords: ['기프트카드', '선불카드', '상품권', '선불전자지급수단'] },
        { label: '지방세외수입·환경개선부담금·TV수신료', keywords: ['지방세외수입', '환경개선부담금', 'tv수신료'] },
        { label: '국세·지방세·4대보험', keywords: ['국세', '지방세', '국민연금', '고용보험', '건강보험', '산재보험'] },
        { label: '학교납입금·대학등록금', keywords: ['유치원', '초중고학교납입금', '학교납입금', '스쿨뱅킹', '대학등록금', '대학원등록금'] },
        { label: '아파트관리비·도시가스·전기·수도요금', keywords: ['아파트관리비', '도시가스', '전기요금', '수도요금'] }
      ],
      source: 'https://www.shinhancard.com/pconts/html/card/apply/credit/1225543_2207.html',
      sourceTitle: 'K-패스 신한카드 공식 상품 상세 (지난달 이용금액 기준)', checkedAt: '2026-09-25'
    },
    'shinhan-mycar': {
      threshold: 400000, thresholdLabel: '전월 신용결제 이용금액 40만원 이상 (자동차 구매금액 제외)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '단기·장기 카드대출', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론'] },
        { label: '연회비·수수료·이자·취소', keywords: ['연회비', '각종수수료', '수수료', '이자', '거래취소', '취소금액'] },
        { label: '기프트·선불·상품권·선불전자지급수단 구매·충전', keywords: ['기프트카드', '선불카드', '상품권', '선불전자지급수단'] },
        { label: '세금·수도요금·4대보험', keywords: ['지방세', '수도요금', '국세', '국민연금', '고용보험', '건강보험', '산재보험'] },
        { label: '초중고 학교납입금·대학등록금', keywords: ['초중고학교납입금', '학교납입금', '스쿨뱅킹', '대학등록금'] },
        { label: '도시가스·전기요금', keywords: ['도시가스', '전기요금'] },
        { label: '자동차 구매 및 장기렌터카 렌트료', keywords: ['자동차구매', '자동차 구매', '신차구입', '장기렌터카', '렌트료'] }
      ],
      source: 'https://www.shinhancard.com/pconts/html/card/apply/credit/1197177_2207.html',
      sourceTitle: '신한카드 MY CAR 공식 상품 상세 (전월 신용결제 이용금액 제외 기준)', checkedAt: '2026-09-25'
    },
    'shinhan-edu-plan': {
      threshold: 300000, thresholdLabel: '전월 이용금액 30만원 이상 (학원비 캐시백 최소 구간)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '학원비 캐시백 대상 학원·학습지·유치원 결제', keywords: ['일반전문학원', '학습지', '유치원', '학원비전용pg', '학원비결제'] },
        { label: '단기·장기 카드대출', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론'] },
        { label: '연회비·수수료·이자·취소', keywords: ['연회비', '각종수수료', '수수료', '이자', '거래취소', '취소금액'] },
        { label: '기프트·선불·상품권·선불전자지급수단 구매·충전', keywords: ['기프트카드', '선불카드', '상품권', '선불전자지급수단'] },
        { label: '국세·지방세·수도요금·4대보험', keywords: ['국세', '지방세', '수도요금', '국민연금', '건강보험', '고용보험', '산재보험'] },
        { label: '아파트관리비·도시가스·전기·TV수신료', keywords: ['아파트관리비', '도시가스', '전기요금', 'tv수신료'] },
        { label: '학교납입금·대학등록금', keywords: ['초중고학교납입금', '학교납입금', '스쿨뱅킹', '대학등록금'] },
        { label: '지방세외수입·환경개선부담금·신차구입·통신요금·제약/약국/철도 업종', keywords: ['지방세외수입', '환경개선부담금', '신차구입', '통신요금', '이동통신', '제약', '약국', '철도'] },
        { label: '신한카드 할인서비스 적용 거래 전체', keywords: ['신한카드할인서비스적용', '할인서비스적용거래'], discountOnly: true }
      ],
      source: 'https://www.shinhancard.com/pconts/html/card/apply/credit/1228598_2207.html',
      sourceTitle: '신한카드 Edu Plan+ 공식 상품 상세 (전월 이용금액 제외 기준)', checkedAt: '2026-09-25'
    },
    'shinhan-coway': {
      threshold: 300000, thresholdLabel: '전월 이용금액 30만원 이상 (코웨이 렌탈요금 할인 최소 구간)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '단기·장기 카드대출', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론'] },
        { label: '연회비·수수료·이자·취소', keywords: ['연회비', '각종수수료', '수수료', '이자', '거래취소', '취소금액'] },
        { label: '기프트·선불·상품권·선불전자지급수단 구매·충전', keywords: ['기프트카드', '선불카드', '상품권', '선불전자지급수단'] },
        { label: '세금·환경개선부담금·4대보험', keywords: ['지방세', '국세', '지방세외수입', '환경개선부담금', '국민연금', '고용보험', '건강보험', '산재보험'] },
        { label: '학교납입금·대학등록금', keywords: ['유치원', '초중고학교납입금', '학교납입금', '스쿨뱅킹', '대학등록금', '대학원등록금'] },
        { label: '아파트관리비·도시가스·전기·TV수신료·수도요금', keywords: ['아파트관리비', '도시가스', '전기요금', 'tv수신료', '수도요금'] },
        { label: '코웨이 렌탈요금 할인 적용 전체 금액', keywords: ['코웨이렌탈', '렌탈요금할인'], discountOnly: true },
        { label: '무이자할부·부동산임대료·후불교통', keywords: ['무이자할부', '부동산임대료', '후불교통', '시내버스', '광역버스', '시외버스', '고속버스', '지하철'] }
      ],
      source: 'https://www.shinhancard.com/pconts/html/card/apply/credit/1234723_2207.html',
      sourceTitle: '코웨이 신한카드 공식 상품 상세 (전월 이용금액 제외 기준)', checkedAt: '2026-09-25'
    },
    'shinhan-discount-plan': {
      threshold: 400000, thresholdLabel: '전월 이용금액 40만원 이상 (할인 최소 구간)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '단기·장기 카드대출', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론'] },
        { label: '연회비·수수료·이자·취소', keywords: ['연회비', '각종수수료', '수수료', '이자', '거래취소', '취소금액'] },
        { label: '기프트·선불·상품권·선불전자지급수단 구매·충전', keywords: ['기프트카드', '선불카드', '상품권', '선불전자지급수단'] },
        { label: '세금·지방세외수입·환경개선부담금', keywords: ['국세', '지방세', '지방세외수입', '환경개선부담금'] },
        { label: '4대보험·학교납입금·대학등록금', keywords: ['국민연금', '고용보험', '건강보험', '산재보험', '유치원', '초중고학교납입금', '학교납입금', '스쿨뱅킹', '대학등록금', '대학원등록금'] },
        { label: '아파트관리비·공과금·TV수신료·수도요금', keywords: ['아파트관리비', '도시가스', '전기요금', 'tv수신료', '수도요금'] },
        { label: '포인트 등 전자지급수단 구매·충전', keywords: ['포인트충전', '캐시충전', '사이버머니', '예치금충전', '전자지급수단'] },
        { label: '철도 업종', keywords: ['철도', 'ktx', 'srt'] }
      ],
      source: 'https://www.shinhancard.com/pconts/html/card/apply/credit/1232369_2207.html',
      sourceTitle: '신한카드 Discount Plan 공식 상품 상세 (전월 이용금액 제외 기준)', checkedAt: '2026-09-25'
    },
    'shinhan-simple-plan': {
      threshold: 0, thresholdLabel: '전월 실적 조건 없음 (국내외 기본 할인 기준)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [],
      source: 'https://www.shinhancard.com/pconts/html/card/apply/credit/1237253_2207.html',
      sourceTitle: '신한카드 Simple Plan 공식 상품 상세 (실적 조건 없음 확인)', checkedAt: '2026-09-25'
    },
    'shinhan-everywhere': {
      threshold: 400000, thresholdLabel: '전월 이용금액 40만원 이상 (전기차·생활·주차 서비스 기준)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '단기·장기 카드대출', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론'] },
        { label: '연회비·수수료·이자·취소', keywords: ['연회비', '각종수수료', '수수료', '이자', '거래취소', '취소금액'] },
        { label: '세금·수도요금·4대보험', keywords: ['국세', '지방세', '수도요금', '국민연금', '고용보험', '건강보험', '산재보험'] },
        { label: '기프트·상품권·선불전자지급수단 구매·충전', keywords: ['기프트카드', '상품권', '선불전자지급수단', '선불카드'] },
        { label: '아파트관리비·전기요금·도시가스', keywords: ['아파트관리비', '전기요금', '도시가스'] }
      ],
      source: 'https://www.shinhancard.com/pconts/html/card/apply/credit/1219683_2207.html',
      sourceTitle: '신한카드 EVerywhere 공식 상품 상세 (전월 이용금액 제외 기준)', checkedAt: '2026-09-25'
    },
    'shinhan-mrlife': {
      threshold: 300000, thresholdLabel: '전월 이용금액 30만원 이상 (공과금·TIME·주말 할인 최소 구간)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '장·단기 카드대출', keywords: ['장기카드대출', '단기카드대출', '카드론', '현금서비스'] },
        { label: '연회비·수수료·이자', keywords: ['연회비', '수수료', '이자'] },
        { label: '기프트카드 구매·선불카드 충전', keywords: ['기프트카드', '선불카드충전', '선불카드 충전'] },
        { label: '거래 취소 금액', keywords: ['거래취소', '거래 취소', '취소금액'] }
      ],
      source: 'https://www.shinhancard.com/pconts/html/card/apply/credit/1187937_2207.html?btnApp=dp01&empSeq=87',
      sourceTitle: '신한카드 Mr.Life 공식 상품 안내 (전월 이용금액 및 제외 기준)', checkedAt: '2026-09-25'
    },
    'shinhan-first-anniverse': {
      threshold: 300000, thresholdLabel: '30만원 (포인트 적립 및 소비관리 보너스 최소 구간)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '카드대출·연회비·수수료·이자', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론', '연회비', '수수료', '이자'] },
        { label: '기프트·선불·상품권 구매/충전', keywords: ['기프트카드', '선불카드', '선불전자지급수단', '상품권', '선불충전'] },
        { label: '세금·공공요금·사회보험', keywords: ['국세', '지방세', '수도요금', '지방세외수입', '환경개선부담금', '도시가스', '전기요금', '아파트관리비', 'tv수신료', '국민연금', '고용보험', '건강보험', '산재보험'] },
        { label: '유치원·초중고 납입금 및 대학(원) 등록금', keywords: ['유치원', '초중고납입금', '초중고학교납입금', '학교납입금', '스쿨뱅킹', '대학등록금', '대학교등록금', '대학원등록금'] },
        { label: '거래 취소금액', keywords: ['거래취소', '취소금액'] }
      ],
      source: 'https://www.shinhancard.com/pconts/html/card/apply/credit/1229296_2207.html',
      sourceTitle: '신한카드 처음 공식 상세·전월 이용금액 산정 및 포인트 적립 제외 기준', checkedAt: '2026-09-25'
    },
    'bc-member-hana-250818': {
      threshold: 300000, thresholdLabel: '30만원 (GS칼텍스 주유·영화·생활 적립 서비스 기준)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '전 주유소 이용금액', keywords: ['주유', '주유소', 'gs칼텍스', 'lpg충전'] },
        { label: '세금·공과금·정부지원금', keywords: ['국세', '지방세', '공과금', '아이행복정부지원금', '정부지원금'] },
        { label: '상품권·선불·기프트카드 구매/충전', keywords: ['상품권', '선불카드충전', '선불카드 충전', '기프트카드구매', '기프트카드 구매'] },
        { label: '도시가스·아파트관리비·대학등록금', keywords: ['도시가스', '도시가스요금', '아파트관리비', '대학등록금'] }
      ],
      source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=250818&mbkNo=025',
      sourceTitle: 'BC카드·하나 부자되세요 The Oil 공식 상품 상세·전월 실적 제외 안내 (신규발급 중단 안내 포함)', checkedAt: '2026-09-25'
    },
    'bc-member-hana-250711': {
      threshold: 300000, thresholdLabel: '30만원 (하나머니·TOP포인트·리프레시 서비스 기준)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '상품권·선불카드 충전·기프트카드 구매', keywords: ['상품권', '선불카드충전', '선불카드 충전', '기프트카드구매', '기프트카드 구매'] }
      ],
      source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=250711&mbkNo=025',
      sourceTitle: 'BC카드·하나멤버스 1Q카드 Daily BC 공식 상세·지난달 실적 산정 기준', checkedAt: '2026-09-25'
    },
    'bc-member-hana-373986': {
      threshold: 200000, thresholdLabel: '20만원 (국내 기본 적립·생활 서비스 최소 실적; 구간별 적립률 상향)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '카드대출·수수료·이자·연회비', keywords: ['현금서비스', '단기카드대출', '카드론', '장기카드대출', '수수료', '이자', '연회비'] },
        { label: '해외 매출·공과금', keywords: ['해외이용', '해외매출', '국세', '지방세', '공과금', '제세공과금'] },
        { label: '상품권·선불 충전·대학등록금·관리비·후불교통', keywords: ['상품권', '선불카드', '기프트카드', '포인트충전', '대학등록금', '아파트관리비', '후불교통', '대중교통'] }
      ],
      source: 'https://www.bccard.com/app/card/CardIntdMain.do?gdsno=373986',
      sourceTitle: 'BC카드·하나 그린카드 공식 상세·전월 실적 산정 제외 기준', checkedAt: '2026-09-25'
    },
    'bc-member-suhyup-100644': {
      threshold: 300000, thresholdLabel: '30만원 (국내 청구할인 최소 실적; 70만원 이상 할인율 상향)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '관리비·등록금·후불교통', keywords: ['아파트관리비', '대학교등록금', '대학원등록금', '후불교통', '버스', '지하철'] },
        { label: '카드대출·세금·공과금·사회보험·범칙금', keywords: ['현금서비스', '단기카드대출', '카드론', '장기카드대출', '국세', '지방세', '제세공과금', '4대보험', '과태료'] },
        { label: '상품권·선불 충전·취소·임대료·교육비·무이자할부', keywords: ['상품권', '선불카드', '기프트카드', '매출취소', '취소금액', 'LH토지공사', '임대료', '초중고교 학부모 부담금', '무이자할부'] },
        { label: '타 카드 매출·해외이용·신차구매·생활요금·이자·연회비·수수료', keywords: ['다른 카드 매출', '해외가맹점', '해외이용', '신차구매', '도시가스', '전기요금', 'TV수신료', '이자', '연회비', '수수료'] }
      ],
      source: 'https://www.bccard.com/app/card/CardIntdMain.do?gdsno=100644',
      sourceTitle: 'BC카드·Sh수협 Real?Real! 2 공식 상세·전월 실적 산정 제외 기준', checkedAt: '2026-09-25'
    },
    'bc-member-gwangju-103881': {
      threshold: 300000, thresholdLabel: '30만원 (학원·교육·서점 등 캐시백 서비스 최소 실적; 실적 구간별 통합한도 상향)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '무이자할부·카드대출·세금·공과금·사회보험', keywords: ['무이자할부', '현금서비스', '단기카드대출', '카드론', '장기카드대출', '제세공과금', '국세', '지방세', '관세', '과태료', '건강보험', '국민연금', '고용보험', '장애인 고용부담금'] },
        { label: '관리비·등록금·이자·상품권·선불 충전·취소', keywords: ['아파트관리비', '대학교등록금', '대학원등록금', '이자', '기프트카드', '선불카드', '전자지급수단', '상품권', '모바일상품권', '거래취소', '취소금액'] },
        { label: '연회비·제수수료', keywords: ['연회비', '제수수료', 'sms수수료', '할부수수료', '해외사용수수료'] }
      ],
      source: 'https://www.bccard.com/app/card/CardIntdMain.do?gdsno=103881',
      sourceTitle: 'BC카드·광주은행 에듀플러스카드 공식 상세·전월 실적 및 제외 기준', checkedAt: '2026-09-25'
    },
    'bc-member-gwangju-101497': {
      threshold: 300000, thresholdLabel: '30만원 (생활·특별 적립 최소 실적; 기본 적립은 실적 무관, 일부 놀이공원 혜택은 20만원)', verificationStatus: 'verified', useCommonExclusions: false,
      extraExclusions: [
        { label: '무이자할부·카드대출·세금·공과금·사회보험', keywords: ['무이자할부', '현금서비스', '단기카드대출', '카드론', '장기카드대출', '제세공과금', '국세', '지방세', '관세', '과태료', '건강보험', '국민연금', '고용보험', '장애인 고용부담금'] },
        { label: '관리비·등록금·이자·상품권·선불 충전·취소·후불교통', keywords: ['아파트관리비', '대학교등록금', '대학원등록금', '이자', '기프트카드', '선불카드', '전자지급수단', '상품권', '모바일상품권', '거래취소', '취소금액', '후불교통'] },
        { label: '연회비·제수수료', keywords: ['연회비', '제수수료', 'sms수수료', '할부수수료', '해외사용수수료'] }
      ],
      source: 'https://www.bccard.com/app/card/CardIntdMain.do?gdsno=101497',
      sourceTitle: 'BC카드·광주은행 HONORS V2 공식 카드 상세·전월 실적 및 제외 조건', checkedAt: '2026-09-25'
    },
    'nh-zgm-shopping': { threshold: 500000, thresholdLabel: '50만원 (쇼핑 적립 최소 구간)', verificationStatus: 'verified', extraExclusions: [nhPointUseExclusion, nhCryptoExclusion, nhTransitTaxiExclusion], sourceTitle: 'NH농협카드 zgm shopping 공식 카드 상세·서비스 이용조건', checkedAt: '2026-09-25' },
    'nh-zgm-play': {
      threshold: 300000, thresholdLabel: '30만원 (할인 서비스 최소 구간; 70만원 구간은 한도 상향)', verificationStatus: 'verified',
      extraExclusions: [nhPointUseExclusion, nhCryptoExclusion, { label: '할인 적용 이용금액 전체', keywords: ['할인적용', '할인받음', '청구할인', '할인금액'], discountOnly: true }],
      conditional: [{ label: 'PLAY 선택·공통 할인 대상 거래의 실제 할인 적용 여부', keywords: ['googleplay', '구글플레이', 'appstore', '앱스토어', '원스토어', '넥슨', 'nc소프트', '카카오게임즈', '게임방', 'pc방', '통신요금', '휴대폰요금', '골프연습장', '테니스장', '볼링장', '수영장', '스포츠센터', '헬스장', '요가', '필라테스', '시내버스', '마을버스', '지하철', '고속버스', '시외버스', 'ktx', 'srt', '택시', '롯데월드', '에버랜드', '서울랜드', '캐리비안베이', 'cgv', '롯데시네마', '메가박스', '스타벅스', '투썸플레이스', '커피빈', '패스트푸드', '미용실', '올리브영', 'cu', 'gs25', '쿠팡', '티몬', '교보문고', '영풍문고', 'yes24', '알라딘', '인터파크도서', '서점'] }],
      sourceTitle: 'NH농협카드 zgm.play++ 공식 카드 상세·서비스 이용조건', checkedAt: '2026-09-25'
    },
    'nh-zgm-thepay': { threshold: 0, thresholdLabel: '기본 전 가맹점 할인 실적 조건 없음 (간편결제 우대 조건 별도)', verificationStatus: 'verified', extraExclusions: [nhPointUseExclusion, nhCryptoExclusion], sourceTitle: 'NH농협카드 zgm.the pay 공식 카드 상세·서비스 이용조건', checkedAt: '2026-09-25' },
    'nh-zgm-discount': { threshold: 400000, thresholdLabel: '40만원 (기본·생활 할인, 라운지 기준)', verificationStatus: 'verified', extraExclusions: [nhPointUseExclusion], sourceTitle: 'NH농협카드 zgm 할인카드 공식 카드 상세·서비스 이용조건', checkedAt: '2026-09-25' },
    'nh-zgm-vacation': { threshold: 400000, thresholdLabel: '40만원 (공항라운지 기준; 호텔스닷컴·기본 적립은 실적 무관)', verificationStatus: 'verified', extraExclusions: [nhPointUseExclusion, nhCryptoExclusion, nhTransitTaxiExclusion], sourceTitle: 'NH농협카드 zgm.휴가중 공식 카드 상세·서비스 이용조건', checkedAt: '2026-09-25' },
    'nh-zgm-rounding': { threshold: 300000, thresholdLabel: '30만원 (주요 할인 서비스 기준)', verificationStatus: 'verified', extraExclusions: [nhPointUseExclusion, nhCryptoExclusion, nhTransitTaxiExclusion], sourceTitle: 'NH농협카드 zgm.rounding 공식 카드 상세·서비스 이용조건', checkedAt: '2026-09-25' },
    'nh-zgm-home': { threshold: 400000, thresholdLabel: '40만원 (주요 할인 서비스 기준)', verificationStatus: 'verified', extraExclusions: [nhPointUseExclusion, nhCryptoExclusion], sourceTitle: 'NH농협카드 zgm.고향으로 공식 카드 상세·서비스 이용조건', checkedAt: '2026-09-25' },
    'nh-kpass': { threshold: 400000, thresholdLabel: '40만원 (대중교통·생활 할인 최소 구간)', verificationStatus: 'verified', extraExclusions: [nhPointUseExclusion, nhCryptoExclusion, nhTransitTaxiExclusion], sourceTitle: 'NH농협카드 K-패스 신용 공식 카드 상세·서비스 이용조건', checkedAt: '2026-09-25' },
    'nh-self': { threshold: 100000, thresholdLabel: '10만원 (2% 할인 구간; 미만 구간도 0.5% 할인)', verificationStatus: 'verified', extraExclusions: [nhPointUseExclusion, nhCryptoExclusion], sourceTitle: 'NH농협카드 zgm 스스로 공식 카드 상세·서비스 이용조건', checkedAt: '2026-09-25' },
    'nh-goodnew': { threshold: 400000, thresholdLabel: '40만원 (스마트 추가 적립 한도 기준; 기본 0.7% 적립은 실적 무관)', verificationStatus: 'verified', extraExclusions: [nhPointUseExclusion], sourceTitle: 'NH농협카드 올바른NEW HAVE+ 공식 카드 상세·서비스 이용조건', checkedAt: '2026-09-25' },
    'woori-standard2': { threshold: 500000, thresholdLabel: '50만원 (국내외 가맹점 할인 최소 구간)', verificationStatus: 'verified', extraExclusions: [...wooriCoreExclusions, { label: '아파트 관리비', keywords: ['아파트관리비', '아파트 관리비'] }, { label: '신차·의약품 전문몰/제약회사 이용금액', keywords: ['신차구매', '의약품전용몰', '제약회사'] }], source: 'https://pc.wooricard.com/ai-data/card_102997.html', sourceTitle: '우리카드 카드의정석2 공식 상세·실적 산정 안내', checkedAt: '2026-09-25' },
    'woori-shopper': { threshold: 500000, thresholdLabel: '50만원 (쇼핑 할인 최소 구간)', verificationStatus: 'verified', extraExclusions: [...wooriCoreExclusions, { label: '공공·부동산 임대료 및 보험료', keywords: ['공공임대료', '부동산임대료', '보험료'] }, { label: '수도·가스·전기요금(아파트 제외)', keywords: ['수도요금', '가스요금', '전기요금'] }, { label: '신차·의약품 전문몰/제약회사 이용금액', keywords: ['신차구매', '의약품전용몰', '제약회사'] }], source: 'https://pc.wooricard.com/ai-data/card_104151.html', sourceTitle: '우리카드 카드의정석2 SHOPPER 공식 상세·실적 산정 안내', checkedAt: '2026-09-25' },
    'woori-opus-silver': { threshold: 500000, thresholdLabel: '50만원 (특별 적립·라운지·할인 서비스 기준; 기본 1% 적립은 실적 무관)', verificationStatus: 'verified', extraExclusions: [...wooriCoreExclusions, { label: '아파트 관리비·등록금', keywords: ['아파트관리비', '아파트 관리비'] }, { label: '교육비·신차·의약품 전문몰/제약회사 이용금액', keywords: ['교육비', '신차구매', '의약품전용', '제약회사'] }], source: 'https://pc.wooricard.com/ai-data/card_103500.html', sourceTitle: '우리카드 the OPUS silver 공식 상세·실적 산정 안내', checkedAt: '2026-09-25' },
    'woori-7core': { threshold: 500000, thresholdLabel: '50만원 (7대 생활영역 할인 최소 구간)', verificationStatus: 'verified', extraExclusions: [...wooriCoreExclusions, { label: '아파트 관리비·임대료', keywords: ['아파트관리비', '아파트 관리비', '임대료'] }, { label: '신차·의약품 전문몰/제약회사 이용금액', keywords: ['신차구매', '의약품전용', '제약회사'] }], source: 'https://pc.wooricard.com/ai-data/card_103755.html', sourceTitle: '우리카드 7CORE 공식 상세·실적 산정 안내', checkedAt: '2026-09-25' },
    'woori-start-travel': { threshold: 300000, thresholdLabel: '30만원 (스타벅스 별·일상 포인트 적립 기준)', verificationStatus: 'verified', extraExclusions: [...wooriCoreExclusions, { label: '아파트 관리비·임대료', keywords: ['아파트관리비', '아파트 관리비', '임대료'] }, { label: '고속도로 통행료·신차·의약품 이용금액', keywords: ['고속도로통행료', '고속도로 통행료', '신차구매', '의약품전용', '제약회사'] }], source: 'https://pc.wooricard.com/ai-data/card_104171.html', sourceTitle: '우리카드 스타트래블 공식 상세·실적 산정 안내', checkedAt: '2026-09-25' },
    'woori-super-20': { threshold: 0, thresholdLabel: '전월 실적 조건 없음 (공식 안내 서비스 기준)', verificationStatus: 'verified', extraExclusions: [...wooriCoreExclusions, { label: '아파트 관리비·임대료·등록금', keywords: ['아파트관리비', '아파트 관리비', '임대료', '대학등록금'] }, { label: '신차·의약품 전문몰/제약회사 이용금액', keywords: ['신차구매', '의약품전용', '제약회사'] }], source: 'https://pc.wooricard.com/ai-data/card_500044.html', sourceTitle: '우리카드 카드의정석2 SUPER 공식 상세·할인 제외 안내', checkedAt: '2026-09-25' },
    'woori-routine': { threshold: 500000, thresholdLabel: '50만원 (생활·통신 할인 최소 구간)', verificationStatus: 'verified', extraExclusions: [...wooriCoreExclusions, { label: '공공·부동산 임대료·학교 납입금', keywords: ['공공임대료', '부동산임대료', '학교납입금', '학교 납입금'] }, { label: '보험료·신차·의약품 전문몰/제약회사 이용금액', keywords: ['보험료', '신차구매', '의약품전용', '제약회사'] }], source: 'https://pc.wooricard.com/ai-data/card_500045.html', sourceTitle: '우리카드 카드의정석2 ROUTINE 공식 상세·실적 산정 안내', checkedAt: '2026-09-25' },
    'woori-unimile': { threshold: 500000, thresholdLabel: '50만원 (여행 적립·간편결제 할인·라운지 최소 구간)', verificationStatus: 'verified', extraExclusions: [...wooriCoreExclusions, { label: '아파트 관리비·공공/부동산 임대료', keywords: ['아파트관리비', '아파트 관리비', '공공이용료', '공공임대료', '부동산임대료'] }, { label: '신차·의약품 전문몰/제약회사 이용금액', keywords: ['신차구매', '의약품전용', '제약회사'] }], source: 'https://pc.wooricard.com/ai-data/card_104153.html', sourceTitle: '우리카드 UniMile 공식 상세·실적 산정 안내', checkedAt: '2026-09-25' },
    'woori-daily': { threshold: 500000, thresholdLabel: '50만원 (고정소비·정기결제 할인 기준; 국내외 기본 1% 할인은 실적 무관)', verificationStatus: 'verified', extraExclusions: [...wooriCoreExclusions, { label: '관리비·공공/부동산 임대료', keywords: ['아파트관리비', '아파트 관리비', '공공임대료', '부동산임대료'] }, { label: '환금성·신차·의약품 전문몰/제약회사', keywords: ['환금성', '신차구매', '의약품전용몰', '제약회사'] }], source: 'https://m.wooricard.com/ai-data/cardDetail_standard2Daily.html', sourceTitle: '우리카드 카드의정석2 DAILY 공식 상세·실적 제외 안내', checkedAt: '2026-09-25' },
    'woori-opus-blue': { threshold: 500000, thresholdLabel: '50만원 (일상·특별 적립, 라이프·라운지 기준; 기본 1% 적립은 실적 무관)', verificationStatus: 'verified', extraExclusions: [...wooriCoreExclusions, { label: '공공임대료·부동산임대료·사회보험료', keywords: ['공공임대료', '부동산임대료', '건강보험', '국민연금', '고용보험', '산재보험'] }, { label: '신차·의약품 전문몰/제약회사', keywords: ['신차구매', '의약품전용몰', '제약회사'] }], source: 'https://m.wooricard.com/ai-data/cardDetail_theOpusBlue.html', sourceTitle: '우리카드 the OPUS blue 공식 상세·실적 산정 안내', checkedAt: '2026-09-25' },
    'bc-ibk-bliss-mileage': { threshold: 500000, thresholdLabel: '50만원 (기본 마일리지 적립 기준; 특화 적립 80만원)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: bcIbkPerformanceExclusions, source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=104506&exec=cardDetail', sourceTitle: 'BC카드·IBK기업은행 BLISS Mileage 공식 상세·전월 실적 제외 안내', checkedAt: '2026-09-25' },
    'bc-ibk-bliss-point': { threshold: 500000, thresholdLabel: '50만원 (기본 포인트 적립 기준; 특화 적립 80만원)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: bcIbkPerformanceExclusions, source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=104561&exec=cardDetail', sourceTitle: 'BC카드·IBK기업은행 BLISS Point 공식 상세·전월 실적 제외 안내', checkedAt: '2026-09-25' },
    'bc-ibk-climate': { threshold: 500000, thresholdLabel: '50만원 (LIVING·MEMBERSHIP 일반 구간; 우대는 3개월 연속 각 50만원)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [...bcIbkPerformanceExclusions.filter((rule) => !rule.label.startsWith('무이자할부')), { label: '아파트 관리비·후불교통', keywords: ['아파트관리비', '후불교통'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=104073&exec=cardDetail', sourceTitle: 'BC카드·IBK기업은행 I-기후동행카드 공식 상세·전월 실적 제외 안내', checkedAt: '2026-09-25' },
    'bc-ibk-point38': { threshold: 500000, thresholdLabel: '50만원 (기본·특별 포인트 적립 기준)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: bcIbkPerformanceExclusions, source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=103991&exec=cardDetail', sourceTitle: 'BC카드·IBK기업은행 IBK포인트3.8 공식 상세·전월 실적 제외 안내', checkedAt: '2026-09-25' },
    'bc-ibk-green': { threshold: 300000, thresholdLabel: '30만원 (일부 적립 기준; 60만원 구간에서 한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [...bcIbkPerformanceExclusions, { label: '아파트 관리비·후불교통', keywords: ['아파트관리비', '후불교통'] }], source: 'https://www.bccard.com/app/card/CardIntdMain.do?gdsno=103214', sourceTitle: 'BC카드·IBK기업은행 I-어디로든그린카드 공식 상품 안내 및 전월 실적 제외 기준', checkedAt: '2026-09-25' },
    'bc-ibk-boc': { threshold: 500000, thresholdLabel: '50만원 (기본 서비스 기준)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [...bcIbkPerformanceExclusions, { label: '학원비·군관사 관리비', keywords: ['학원비', '군관사', '아파트관리비'] }], source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=104417&mbkNo=003', sourceTitle: 'BC카드·IBK기업은행 BOC(福) 공식 상품 안내 및 전월 실적 제외 기준', checkedAt: '2026-09-25' },
    'bc-ibk-happymate': { threshold: 400000, thresholdLabel: '40만원 (SPC·해피포인트앱·온라인쇼핑 적립 기준)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [...bcIbkPerformanceExclusions, { label: '이동통신요금', keywords: ['이동통신요금', '통신요금', '휴대폰요금'] }, { label: 'SPC·해피포인트앱·온라인쇼핑 적립영역 이용금액', keywords: ['spc', '해피포인트app', '해피포인트 앱', '온라인쇼핑몰'] }], source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=104376&mbkNo=003', sourceTitle: 'BC카드·IBK기업은행 해피메이트 공식 상품 안내 및 전월 실적 제외 기준', checkedAt: '2026-09-25' },
    'bc-ibk-point': { threshold: 500000, thresholdLabel: '50만원 (국내외 가맹점 포인트 적립 기준)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: bcIbkPerformanceExclusions, source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=103937&mbkNo=003', sourceTitle: 'BC카드·IBK기업은행 IBK포인트 공식 상품 안내 및 전월 실적 제외 기준', checkedAt: '2026-09-25' },
    'bc-ibk-mileage': { threshold: 500000, thresholdLabel: '50만원 (마일리지·스타벅스 서비스 기준; 신규 등록 후 유예기간 별도)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: bcIbkPerformanceExclusions, source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=103401&mbkNo=003', sourceTitle: 'BC카드·IBK기업은행 I-Mileage 공식 상품 안내 및 전월 실적 제외 기준', checkedAt: '2026-09-25' },
    'bc-ibk-kpass': { threshold: 200000, thresholdLabel: '20만원 (국내 가맹점 기준; 교통특화 이용금액·아파트관리비 제외)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '교통특화 서비스 이용금액', keywords: ['교통특화', '후불교통', '대중교통', '버스', '지하철', '유료도로'] }, { label: '아파트 관리비', keywords: ['아파트관리비', 'apt관리비', 'apt 관리비'] }], source: 'https://sms.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=1031050000&exec=cardDetail', sourceTitle: 'BC카드·IBK기업은행 K-패스(신용) 공식 상품 안내 및 전월 실적 제외 기준', checkedAt: '2026-09-25' },
    'bc-member-sc-100103': { threshold: 500000, thresholdLabel: '50만원 (최저 포인트 적립·할인 구간)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [...bcIbkPerformanceExclusions, { label: '개인보험료·임대료·우편료·포인트 사용', keywords: ['개인보험료', '보험료', '임대료', '우편료', '우편요금', '포인트사용'] }, { label: '고속철도·고속도로 이용금액', keywords: ['srt', 'ktx', '고속도로통행료'] }], source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=100103', sourceTitle: 'BC카드·SC제일은행 리워드W 공식 상품 안내 및 전월 실적 제외 기준', checkedAt: '2026-09-25' },
    'lotte-loca-likit12': { threshold: 0, thresholdLabel: '전월 실적 조건 없음 (할인 한도도 없음; 신규·추가·교체 발급 중단 안내)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [], source: 'https://www.lottecard.co.kr/app/LPCDADB_V100.lc?vtCdKndC=P13937-A13937', sourceTitle: '롯데카드 LOCA LIKIT 1.2 공식 상세·서비스 이용조건', checkedAt: '2026-09-25' },
    'lotte-digiloca-london': { threshold: 0, thresholdLabel: '전월 실적 조건 없음 (기본·추가 캐시백)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [], source: 'https://www.lottecard.co.kr/app/LPCDADB_V100.lc?vtCdKndC=P14718-A14718', sourceTitle: '롯데카드 디지로카 London 공식 상세·서비스 이용조건', checkedAt: '2026-09-25' },
    'lotte-digiloca-lasvegas': { threshold: 0, thresholdLabel: '전월 실적 조건 없음 (결제 건별 구간 할인)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [...lotteCoreExclusions, { label: '다른 롯데카드 이용금액·TV수신료·오토할부·티머니 인증', keywords: ['다른 롯데카드', 'tv수신료', '오토할부', '티머니 인증'] }, { label: '무승인전표·취소', keywords: ['자판기', '터널통행료', '항공기내', '거래취소'] }], source: 'https://www.lottecard.co.kr/app/LPCDADB_V100.lc?vtCdKndC=P15584-A15584', sourceTitle: '롯데카드 디지로카 Las Vegas 공식 상세·서비스 이용조건·할인 제외 기준', checkedAt: '2026-09-25' },
    'lotte-digiloca-paris': { threshold: 500000, thresholdLabel: '50만원 (온라인 쇼핑 추가 할인 기준; 기본 0.7% 할인은 실적 무관)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [...lotteCoreExclusions, { label: '온라인쇼핑 이용금액', keywords: ['쿠팡', '네이버페이', '네이버쇼핑', '11번가', 'g마켓', '옥션', 'ssg.com', '롯데on', '롯데홈쇼핑'] }, { label: '수도·가스·오토캐시백·무승인 전표', keywords: ['수도요금', '도시가스', '오토캐시백', '스마트캐시백', '무승인전표', '자판기', '터널통행료', '항공기내'] }], source: 'https://www.lottecard.co.kr/app/LPCDADB_V100.lc?bId=92383&vtCdKndC=P14728-A14728', sourceTitle: '롯데카드 디지로카 Paris 공식 상세·전월 실적 제외 기준', checkedAt: '2026-09-25' },
    'lotte-loca-likit-shop': { threshold: 400000, thresholdLabel: '40만원 (할인 혜택 적용 이용금액은 전액 실적 제외)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [...lotteCoreExclusions, { label: '할인 혜택이 적용된 전체 이용금액', keywords: ['할인적용', '할인받음', '청구할인', '할인금액'], discountOnly: true }, { label: '오토·스마트 캐시백 및 무승인전표', keywords: ['오토캐시백', '스마트캐시백', '무승인전표', '자판기', '터널통행료', '항공기내'] }], source: 'https://www.lottecard.co.kr/app/LPCDADB_V100.lc?vtCdKndC=P13955-A13955', sourceTitle: '롯데카드 LOCA LIKIT Shop 공식 상세·전월 실적 제외 기준', checkedAt: '2026-09-25' },
    'samsung-mileage-platinum': { threshold: 0, thresholdLabel: '전월 실적 조건 없이 기본 마일리지 적립', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [], source: 'https://www.samsungcard.com/home/Card/Cardinfo/PGHPPCCCardCardinfoDetails001?click=themesearch_mileagecard_mileageplatinum&code=AAP1452&webViewFirstPage=true', sourceTitle: '삼성카드 & MILEAGE PLATINUM (스카이패스) 공식 상품 안내', checkedAt: '2026-09-25' },
    'bc-member-woori-227702': { threshold: 300000, thresholdLabel: '30만원 (최저 할인 구간; 상위 할인한도 구간 50·100·200만원)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '병·의원·조산원·산후조리원·어린이집·유치원·유아원', keywords: ['병원', '의원', '조산원', '산후조리원', '어린이집', '유치원', '유아원'] }, { label: '제세공과금·상품권·대학등록금·정부지원금', keywords: ['제세공과금', '국세', '지방세', '공과금', '상품권', '기프트카드', '대학등록금', '정부지원금'] }], source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=227702&mbkNo=020', sourceTitle: 'BC카드·우리카드 국민행복카드(신용) 공식 서비스 제공 조건 및 전월 실적 제외 안내', checkedAt: '2026-09-25' },
    'bc-member-sc-232739': { threshold: 300000, thresholdLabel: '30만원 (기본 월 할인한도 구간; 50·70만원 이상에서 한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: bcScTimeExclusions, source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=232739&exec=cardDetail', sourceTitle: 'BC카드·SC제일은행 뉴 타임 카드 공식 서비스 제공 조건 및 전월 실적 제외 안내', checkedAt: '2026-09-25' },
    'bc-member-nh-176442': { threshold: 300000, thresholdLabel: '30만원 (주요 서비스 최소 구간; 70·100·150만원 이상 한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '세금·공과금·사회보험·과태료', keywords: ['국세', '지방세', '사회보험', '건강보험', '국민연금', '고용보험', '산재보험', '과태료'] }, { label: '학교 납입금·등록금·아파트관리비·임대료', keywords: ['초중고등학교납입금', '교육경비', '대학등록금', '아파트관리비', '임대료'] }, { label: '공공요금·우편요금·후불교통·통신요금', keywords: ['도시가스', '전기요금', '우체국우편요금', '후불교통', '통신요금'] }, { label: '무이자할부·상품권·선불카드', keywords: ['무이자할부', '무이자 할부', '상품권', '선불카드'] }, { label: '카드대출·수수료·이자·연체료·연회비·취소', keywords: ['카드론', '장기카드대출', '수수료', '이자', '연체료', '연회비', '거래취소', '취소금액'] }], source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=176442&mbkNo=011', sourceTitle: 'BC카드·NH농협 NEW 경기 아이플러스카드 공식 서비스 제공 조건 및 전월 실적 제외 안내', checkedAt: '2026-09-25' },
    'bc-member-nh-176468': { threshold: 500000, thresholdLabel: '50만원 (국내·해외 포인트 적립 상향 구간)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '대학등록금·교육비·임대료', keywords: ['대학등록금', '교육비', '학부모부담금', '임대료'] }, { label: '세금·공과금·우편료·사회보험', keywords: ['국세', '지방세', '공과금', '우체국우편요금', '사회보험', '건강보험', '국민연금', '고용보험', '산재보험'] }, { label: '아파트관리비·도시가스·전기요금', keywords: ['아파트관리비', '도시가스', '전기요금'] }, { label: '상품권·선불카드·포인트 사용/충전', keywords: ['상품권', '선불카드', '포인트사용', '포인트 사용', '포인트충전'] }, { label: '카드대출·수수료·이자·연체료·연회비·취소·무이자할부', keywords: ['카드대출', '현금서비스', '카드론', '수수료', '이자', '연체료', '연회비', '취소금액', '무이자할부', '무이자 할부'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=176468&exec=cardDetail', sourceTitle: 'BC카드·NH농협카드 적립조아카드 공식 포인트 적립 기준 및 제외 안내', checkedAt: '2026-09-25' },
    'bc-member-nh-100122': { threshold: 300000, thresholdLabel: '30만원 (생활영역 추가적립·공항라운지 기준; 기본 적립은 실적 무관)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '대학(원)등록금·교육비·임대료', keywords: ['대학등록금', '대학원등록금', '교육비', '학부모부담금', '임대료'] }, { label: '세금·공과금·사회보험', keywords: ['국세', '지방세', '공과금', '건강보험', '국민건강', '국민연금', '고용보험', '산재보험'] }, { label: '아파트관리비·도시가스·전기요금', keywords: ['아파트관리비', '도시가스요금', '전기요금'] }, { label: '상품권·선불카드 구매/충전', keywords: ['상품권구매', '상품권', '선불카드류구매', '선불카드구매', '선불카드충전'] }, { label: '카드대출·할부/SMS 수수료·이자·연체료·연회비·취소', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론', '할부수수료', 'sms수수료', 'sms이용수수료', '이자', '연체료', '연회비', '거래취소', '취소금액'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=100122&exec=cardDetail', sourceTitle: 'BC카드·NH농협 Air Money 카드 공식 전월 실적 산정 제외 및 서비스 기준', checkedAt: '2026-09-25' },
    'bc-member-nh-176565': { threshold: 300000, thresholdLabel: '30만원 (LCC·일반 적립·통신/택시 할인·라운지 서비스 기준)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '대학(원)등록금·교육비·임대료', keywords: ['대학등록금', '대학원등록금', '교육비', '학부모부담금', '임대료'] }, { label: '세금·공과금·우편요금·사회보험', keywords: ['국세', '지방세', '공과금', '우체국우편요금', '사회보험', '국민건강', '국민연금', '고용보험', '산재보험'] }, { label: '아파트관리비·도시가스·전기요금', keywords: ['아파트관리비', '도시가스요금', '전기요금'] }, { label: '상품권·선불카드 구매/충전', keywords: ['상품권', '선불카드', '충전'] }, { label: '카드대출·수수료·이자·연체료·연회비·취소·포인트 결제분', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론', '할부수수료', 'sms수수료', '이자', '연체료', '연회비', '거래취소', '취소금액', '포인트사용', '포인트 사용'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=176565&exec=cardDetail', sourceTitle: 'BC카드·NH농협 LCC UniMile 카드 공식 전월 실적 산정 제외 및 서비스 기준', checkedAt: '2026-09-25' },
    'bc-member-nh-176484': { threshold: 400000, thresholdLabel: '40만원 (페이·쇼핑 할인 최소 구간; 기본 0.5% 할인은 실적 무관)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '대학(원)등록금·교육비·임대료', keywords: ['대학등록금', '대학원등록금', '교육비', '학부모부담금', '임대료'] }, { label: '세금·공과금·우편요금·사회보험', keywords: ['국세', '지방세', '공과금', '우체국우편요금', '사회보험', '국민건강', '국민연금', '고용보험', '산재보험'] }, { label: '아파트관리비·도시가스·전기요금', keywords: ['아파트관리비', '도시가스요금', '전기요금'] }, { label: '상품권·선불카드 구매/충전', keywords: ['상품권', '선불카드', '충전'] }, { label: '카드대출·수수료·이자·연체료·연회비·취소·포인트 결제분', keywords: ['장기카드대출', '단기카드대출', '카드론', '현금서비스', '할부수수료', 'sms수수료', '이자', '연체료', '연회비', '거래취소', '취소금액', '포인트사용', '포인트 사용'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=176484&exec=cardDetail', sourceTitle: 'BC카드·NH농협 쇼핑조아카드 공식 전월 실적 산정 제외 및 서비스 기준', checkedAt: '2026-09-25' },
    'bc-member-nh-176471': { threshold: 400000, thresholdLabel: '40만원 (7대 업종 생활할인 최소 구간; 80·120만원 이상 한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '대학(원)등록금·교육비·임대료', keywords: ['대학등록금', '대학원등록금', '교육비', '학부모부담금', '임대료'] }, { label: '세금·공과금·우편요금·사회보험', keywords: ['국세', '지방세', '공과금', '우체국우편요금', '사회보험', '국민건강', '국민연금', '고용보험', '산재보험'] }, { label: '아파트관리비·도시가스·전기요금', keywords: ['아파트관리비', '도시가스요금', '전기요금'] }, { label: '상품권·선불카드 구매/충전', keywords: ['상품권', '선불카드', '충전'] }, { label: '카드대출·수수료·이자·연체료·연회비·취소·포인트 결제분', keywords: ['장기카드대출', '단기카드대출', '카드론', '현금서비스', '할부수수료', 'sms수수료', '이자', '연체료', '연회비', '거래취소', '취소금액', '포인트사용', '포인트 사용'] }], source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=176471&mbkNo=011', sourceTitle: 'BC카드·NH농협 할인조아카드 공식 전월 실적 산정 제외 및 서비스 기준', checkedAt: '2026-09-25' },
    'bc-member-nh-103213': { threshold: 300000, thresholdLabel: '30만원 (에코머니 적립한도 구간; 60만원 이상 한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '대학(원)등록금·교육비·임대료', keywords: ['대학등록금', '대학원등록금', '교육비', '학부모부담금', '임대료'] }, { label: '세금·공과금·우편요금·사회보험', keywords: ['세금', '공과금', '상하수도요금', '과태료', '범칙금', '우체국우편요금', '국민건강', '국민연금', '고용보험', '산재보험'] }, { label: '아파트관리비·도시가스·전기요금', keywords: ['아파트관리비', '도시가스요금', '전기요금'] }, { label: '선불·기프트카드·상품권 구매/충전', keywords: ['선불카드류', '선불전자지급수단', '기프트카드', '상품권', '모바일상품권', '모바일쿠폰', '선불카드충전', '상품권충전'] }, { label: '가상화폐 거래소', keywords: ['가상화폐', '가상자산'] }, { label: '카드대출·수수료·이자·연체료·연회비·취소·교통·택시·포인트 결제분', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론', '수수료', '이자', '연체', '연회비', '거래취소', '취소금액', '후불교통', '버스', '지하철', '택시', '포인트사용', '포인트 사용'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=1032130000&exec=cardDetail', sourceTitle: 'BC카드·NH농협 어디로든 그린카드 공식 전월 실적 제외 및 적립 기준', checkedAt: '2026-09-25' },
    'bc-member-nh-112422': { threshold: 500000, thresholdLabel: '50만원 (롯데쇼핑·생활편의 적립 최소 구간; 놀이공원 할인은 30만원 이상)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '대학(원)등록금·교육비·임대료', keywords: ['대학등록금', '대학원등록금', '교육비', '학부모분담금', '임대료'] }, { label: '세금·공과금·우편요금·사회보험', keywords: ['세금', '공과금', '우체국우편요금', '국민건강', '국민연금', '고용보험', '산재보험'] }, { label: '아파트관리비·도시가스·전기요금', keywords: ['아파트관리비', '도시가스요금', '전기요금'] }, { label: '상품권·선불카드 구매/충전·포인트 사용', keywords: ['상품권', '선불카드', '포인트사용', '포인트 사용', '선불카드충전', '상품권충전'] }, { label: '카드대출·수수료·이자·연체료·연회비·취소', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론', '수수료', '이자', '연체료', '연회비', '거래취소', '취소금액'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=112422&exec=cardDetail', sourceTitle: 'BC카드·NH농협 엘포인트 카드 공식 전월 실적 제외 및 서비스 기준', checkedAt: '2026-09-25' },
    'bc-member-nh-111151': { threshold: 200000, thresholdLabel: '20만원 (홈쇼핑 할인 기준; 생활 할인은 30만원부터)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '6대 홈쇼핑 이용금액', keywords: ['cj오쇼핑', 'gs홈쇼핑', '현대홈쇼핑', '롯데홈쇼핑', '홈앤쇼핑', 'ns홈쇼핑', '홈쇼핑'] }, { label: '상품권·기프트카드 구매/충전', keywords: ['상품권', '기프트카드', '상품권충전', '기프트카드충전', '선불카드충전'] }, { label: '대학등록금·제세공과금', keywords: ['대학등록금', '제세공과금', '국세', '지방세', '우체국우편요금'] }, { label: '카드대출', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=111151&exec=cardDetail', sourceTitle: 'BC카드·NH농협 부자되세요 홈쇼핑카드 공식 전월 실적 제외 및 서비스 기준', checkedAt: '2026-09-25' },
    'bc-member-nh-176222': { threshold: 300000, thresholdLabel: '30만원 (생활 할인 최소 실적 구간)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '병·의원·조산원·산후조리원·어린이집·유치원·유아원', keywords: ['병원', '의원', '조산원', '산후조리원', '어린이집', '유치원', '유아원'] }, { label: '제세공과금·상품권·대학등록금·정부지원금', keywords: ['제세공과금', '국세', '지방세', '공과금', '상품권', '기프트카드', '대학등록금', '정부지원금'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=176222&exec=cardDetail', sourceTitle: 'BC카드·NH농협 국민행복카드(신용) 공식 서비스 제공 조건 및 전월 실적 제외 안내', checkedAt: '2026-09-25' },
    'bc-member-sc-100103': { threshold: 500000, thresholdLabel: '50만원 (우대 적립·할인 시작; 미만 구간도 기본 0.5% 적립)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '카드대출·연회비·수수료', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론', '연회비', '수수료'] }, { label: '세금·사회보험·장애인고용부담금', keywords: ['국세', '지방세', '세금', '고용보험', '산재보험', '장애인고용부담금'] }, { label: '상품권·기프트카드·포인트 사용', keywords: ['상품권', '기프트카드', '포인트사용', '포인트 사용'] }, { label: '교육비·보험료·공과금·공공요금·과태료', keywords: ['초중고등록금', '대학교등록금', '스쿨뱅킹', '학부모부담금', '보험료', '4대보험', '공과금', '도시가스', '수도요금', '전기요금', '과태료'] }, { label: '취소·무이자할부·교통·관리비·임대료·우편료', keywords: ['매출취소', '취소금액', '무이자할부', '무이자 할부', '시외버스', '고속버스', '지하철', '고속도로통행료', 'srt', 'ktx', '아파트관리비', '임대료', '우편료'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=100103&exec=cardDetail', sourceTitle: 'BC카드·SC제일 리워드W 신용카드 공식 전월 실적 산정 제외 및 혜택 기준', checkedAt: '2026-09-25' },
    'bc-member-sc-232124': { threshold: 200000, thresholdLabel: '20만원 (에코머니 적립 최저 실적 구간; 할인은 30만원부터)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '병·의원·조산원·산후조리원·어린이집·유치원·유아원', keywords: ['병원', '의원', '조산원', '산후조리원', '어린이집', '유치원', '유아원'] }, { label: '제세공과금·상품권·대학등록금·정부지원금', keywords: ['제세공과금', '세금', '공과금', '상품권', '대학등록금', '정부지원금'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=232124&exec=cardDetail', sourceTitle: 'BC카드·SC제일 국민행복카드(신용) 공식 전월 실적 산정 제외 및 서비스 기준', checkedAt: '2026-09-25' },
    'bc-member-sc-230029': { threshold: 0, thresholdLabel: '전월 실적 조건 없이 기본 포인트 적립 (일부 부가서비스는 연간 이용액 조건 별도)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=230029&exec=cardDetail', sourceTitle: 'BC카드·SC제일 시그마 카드 공식 포인트 적립 조건 (전월 실적 조건 없음)', checkedAt: '2026-09-25' },
    'bc-member-sc-230977': { threshold: 300000, thresholdLabel: '30만원 (특별적립 최소 구간; 기본 0.7% 적립은 실적 무관)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '카드대출·연회비·수수료', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론', '연회비', '수수료', '해외사용수수료'] }, { label: '세금·사회보험·장애인고용부담금', keywords: ['세금', '지방세', '고용보험', '산재보험', '장애인고용부담금'] }, { label: '상품권·기프트카드·포인트 사용', keywords: ['상품권', '기프트카드', '포인트사용', '포인트 사용'] }, { label: '아파트관리비·대중교통·주유·택시', keywords: ['아파트관리비', '대중교통', '후불교통', '버스', '지하철', '주유', '택시'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=230977&exec=cardDetail', sourceTitle: 'BC카드·SC제일 리워드 플러스 신용카드 공식 전월 실적 산정 제외 및 적립 기준', checkedAt: '2026-09-25' },
    'bc-member-sc-231002': { threshold: 300000, thresholdLabel: '30만원 (TIME카드 할인한도 최소 구간; 50·100·200만원 이상 한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '대중교통 이용금액', keywords: ['대중교통', '후불교통', '시내버스', '마을버스', '지하철'] }, { label: 'S-Oil 주유 이용금액', keywords: ['s-oil', '에쓰오일', '주유'] }, { label: '제세공과금 납부금액', keywords: ['제세공과금', '국세', '지방세', '공과금'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=231002&exec=cardDetail', sourceTitle: 'BC카드·SC제일 TIME카드 공식 전월 실적 산정 제외 및 할인한도 기준', checkedAt: '2026-09-25' },
    'bc-member-sc-231028': { threshold: 0, thresholdLabel: '전월 실적 조건 없음 (영화·CJ 일부 혜택은 직전 3개월 국내 신판 30만원 이상)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=231028&exec=cardDetail', sourceTitle: 'BC카드·SC제일 딜라이트 카드 공식 혜택 기준 (전월 실적 조건 없음)', checkedAt: '2026-09-25' },
    'bc-member-im-103995': { threshold: 300000, thresholdLabel: '30만원 (청구할인·공항라운지 서비스 기준)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '카드대출·연회비·수수료·이자', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론', '연회비', '수수료', '이자'] }, { label: '세금·공과금·사회보험·범칙금', keywords: ['국세', '지방세', '세금', '상하수도', '전기요금', '도시가스', '범칙금', '벌금', '과태료', '국민연금', '건강보험', '고용보험', '산재보험'] }, { label: '관리비·등록금·교육비·사립유치원 납입금', keywords: ['아파트관리비', '대학등록금', '대학원등록금', '초중고교납입금', '사립유치원', '학교납입금'] }, { label: '상품권·선불카드 구매/충전·무이자할부', keywords: ['기프트카드', '선불카드', '상품권', '충전금액', '무이자할부', '무이자 할부'] }, { label: '해외 가맹점·페이북 외화머니·취소', keywords: ['해외가맹점', '해외이용', '외화머니', '매출취소', '취소금액'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=103995&exec=cardDetail', sourceTitle: 'BC카드·iM뱅크 iM 트래블 카드 공식 전월 이용금액 제외 및 서비스 기준', checkedAt: '2026-09-25' },
    'bc-member-im-102328': { threshold: 300000, thresholdLabel: '30만원 (청구할인 서비스 기준)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '카드대출·연회비·연체료·수수료·이자', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론', '연회비', '연체료', '수수료', '이자'] }, { label: '세금·공과금·공공요금·범칙금·벌금·과태료', keywords: ['공과금', '국세', '지방세', '수도요금', '전기요금', '도시가스', '범칙금', '벌금', '과태료'] }, { label: '아파트관리비·사회보험', keywords: ['아파트관리비', '국민연금', '건강보험', '고용보험', '산재보험'] }, { label: '학교 납입금·등록금', keywords: ['대학등록금', '대학원등록금', '초중고학교납입금'] }, { label: '상품권·선불카드 구매/충전·무이자할부·취소', keywords: ['상품권', '선불카드', '상품권구입', '상품권구매', '상품권충전', '선불카드구입', '선불카드충전', '무이자할부', '무이자 할부', '매출취소', '취소금액'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=102328&exec=cardDetail', sourceTitle: 'BC카드·iM뱅크 DGB i 카드 공식 전월 이용금액 제외 및 서비스 기준', checkedAt: '2026-09-25' },
    'bc-member-im-101070': { threshold: 300000, thresholdLabel: '30만원 (할인 서비스 기준)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '카드대출·연회비·수수료·이자', keywords: ['장기카드대출', '카드론', '단기카드대출', '현금서비스', '연회비', '수수료', '이자'] }, { label: '세금·공과금·공공요금', keywords: ['공과금', '국세', '지방세', '수도요금', '전기요금', '도시가스'] }, { label: '아파트관리비·사회보험', keywords: ['아파트관리비', '국민연금', '건강보험', '고용보험', '산재보험'] }, { label: '학교 납입금·등록금', keywords: ['대학등록금', '대학원등록금', '초중고학교납입금'] }, { label: '상품권·선불카드 구매/충전·취소·무이자할부', keywords: ['상품권', '선불카드', '상품권구입', '상품권구매', '상품권충전', '선불카드구입', '선불카드충전', '매출취소', '취소금액', '무이자할부', '무이자 할부'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=101070&exec=cardDetail', sourceTitle: 'BC카드·iM뱅크 DGB UntacT 카드 공식 전월 이용금액 제외 및 서비스 기준', checkedAt: '2026-09-25' },
    'bc-member-im-311948': { threshold: 300000, thresholdLabel: '30만원 (월간 캐시백 최소 구간; 60·120만원 이상 한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '할부·후불교통·제세공과금·상품권', keywords: ['할부', '후불교통', '제세공과금', '상품권'] }, { label: '대학등록금·관리비·임대료', keywords: ['대학등록금', '아파트관리비', '임대료'] }, { label: '카드대출·수수료·이자·연회비', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론', '수수료', '이자', '연회비'] }, { label: '매출 취소 금액', keywords: ['매출취소', '취소금액'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=311948&exec=cardDetail', sourceTitle: 'BC카드·iM뱅크 세븐캐쉬백카드 공식 전월 실적 제외 및 서비스 기준', checkedAt: '2026-09-25' },
    'bc-member-im-311744': { threshold: 300000, thresholdLabel: '30만원 (할인 서비스 최소 구간; 60만원 이상 할인한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '아파트관리비', keywords: ['아파트관리비'] }, { label: '등록금·제세공과금·후불교통', keywords: ['대학등록금', '제세공과금', '국세', '지방세', '후불교통'] }, { label: '상품권·해외이용 금액', keywords: ['상품권', '해외이용', '해외매출'] }, { label: '카드대출·수수료·이자·연회비', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론', '수수료', '이자', '연회비'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=311744&exec=cardDetail', sourceTitle: 'BC카드·iM뱅크 부자되세요 아파트카드 공식 전월 실적 제외 및 서비스 기준', checkedAt: '2026-09-25' },
    'bc-member-im-311692': { threshold: 200000, thresholdLabel: '20만원 (대중교통·KTX 적립 최저 구간; 온라인·생활 특화서비스는 40만원부터)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '카드대출·수수료·이자·연회비', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론', '수수료', '이자', '연회비'] }, { label: '해외매출·무이자할부·제세공과금', keywords: ['해외매출', '해외이용', '무이자할부', '무이자 할부', '제세공과금', '국세', '지방세', '공과금'] }, { label: '상품권·등록금·아파트관리비·후불교통', keywords: ['상품권', '대학등록금', '아파트관리비', '후불교통'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=311692&exec=cardDetail', sourceTitle: 'BC카드·iM뱅크 그린카드 v2 공식 전월 실적 제외 및 에코머니 적립 기준', checkedAt: '2026-09-25' },
    'bc-member-im-311689': { threshold: 500000, thresholdLabel: '50만원 (GREIT 생활서비스 및 금융서비스 기준)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '아파트관리비·후불교통', keywords: ['아파트관리비', '후불교통'] }, { label: '대학등록금·제세공과금·상품권', keywords: ['대학등록금', '제세공과금', '공과금', '상품권'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=311689&exec=cardDetail', sourceTitle: 'BC카드·iM뱅크 GREIT카드 공식 전월 실적 제외 및 서비스 기준', checkedAt: '2026-09-25' },
    'bc-member-im-311773': { threshold: 200000, thresholdLabel: '20만원 (에코머니 포인트 적립 최저 구간; 할인서비스 별도 구간 적용)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '병·의원·조산원·산후조리원·어린이집·유치원·유아원', keywords: ['병원', '의원', '조산원', '산후조리원', '어린이집', '유치원', '유아원'] }, { label: '제세공과금·상품권·대학등록금·정부지원금', keywords: ['제세공과금', '공과금', '세금', '상품권', '대학등록금', '정부지원금'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=311773&exec=cardDetail', sourceTitle: 'BC카드·iM뱅크 국민행복카드(신용) 공식 전월 실적 제외 및 서비스 기준', checkedAt: '2026-09-25' },
    'bc-member-im-311472': { threshold: 300000, thresholdLabel: '30만원 (통신·커피·교통 혜택 기준; 연간 캐시백 조건 별도)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '상품권·제세공과금·공과금', keywords: ['상품권', '기프트카드', '제세공과금', '국세', '지방세', '공과금'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=311472&exec=cardDetail', sourceTitle: 'BC카드·iM뱅크 olleh Super DC카드 공식 이용실적 및 혜택 기준', checkedAt: '2026-09-25' },
    'bc-member-im-311621': { threshold: 200000, thresholdLabel: '20만원 (홈쇼핑 할인 최저 구간; 생활 할인은 30만원부터)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '6대 홈쇼핑 이용금액', keywords: ['cj오쇼핑', 'gs홈쇼핑', '현대홈쇼핑', '롯데홈쇼핑', '홈앤쇼핑', 'ns홈쇼핑', '홈쇼핑'] }, { label: '공과금·대학등록금·상품권·후불교통', keywords: ['공과금', '제세공과금', '국세', '지방세', '대학등록금', '상품권', '기프트카드', '후불교통'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=311621&exec=cardDetail', sourceTitle: 'BC카드·iM뱅크 부자되세요 홈쇼핑카드 공식 전월 실적 및 제외 기준', checkedAt: '2026-09-25' },
    'bc-member-busan-102332': { threshold: 300000, thresholdLabel: '30만원 (주유·생활 할인 기준; 주유 횟수는 60만원 이상 시 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '주유·해외매출·제세공과금', keywords: ['주유', '충전소', '해외매출', '제세공과금', '국세', '지방세', '4대보험', '과태료'] }, { label: '학교 납입금·관리비·공공요금·상품권', keywords: ['초중고학교납입금', '교육경비', '대학등록금', '아파트관리비', '도시가스요금', '전기요금', '상품권', '기프트카드'] }, { label: 'LH임대료·카드대출·연회비·취소·자동차·후불교통', keywords: ['lh한국토지공사', '임대료', '단기카드대출', '장기카드대출', '카드대출이자', '연회비', '취소금액', '자동차구매', '후불교통'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=102332&exec=cardDetail', sourceTitle: 'BC카드·BNK부산 SK OIL＆LPG카드_부산 공식 전월 실적 제외 및 혜택 기준', checkedAt: '2026-09-25' },
    'bc-member-busan-771291': { threshold: 300000, thresholdLabel: '30만원 (간편결제·학원·통신·커피·교통·영화·생활 할인 기준)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '제세공과금·학교납입금·등록금', keywords: ['제세공과금', '국세', '지방세', '4대보험', '과태료', '초중고학교납입금', '교육경비', '대학등록금'] }, { label: '아파트관리비·공공요금·상품권·LH임대료', keywords: ['아파트관리비', '도시가스요금', '전기요금', '상품권', '기프트카드', 'lh한국토지공사', '임대료'] }, { label: '카드대출·무이자할부·수수료·이자·연회비·취소', keywords: ['단기카드대출', '장기카드대출', '카드론', '현금서비스', '무이자할부', '수수료', '이자', '연회비', '취소금액'] }, { label: '페이북 내 외화머니', keywords: ['내 외화 머니', '외화머니'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=771291&exec=cardDetail', sourceTitle: 'BC카드·BNK부산 오늘은e 신용카드 공식 전월 실적 제외 및 혜택 기준', checkedAt: '2026-09-25' },
    'bc-member-busan-771012': { threshold: 400000, thresholdLabel: '40만원 (생활필수 할인 기준; 연간 캐시백 조건은 별도)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '해외매출·세금·공과금·학교 납입금', keywords: ['해외매출', '제세공과금', '국세', '지방세', '4대보험', '과태료', '초중고학교납입금', '교육경비', '대학등록금'] }, { label: '관리비·공공요금·상품권·LH임대료', keywords: ['아파트관리비', '도시가스요금', '전기요금', '상품권', '기프트카드', 'lh한국토지공사', '임대료'] }, { label: '자동차·후불교통·카드대출·통신요금', keywords: ['자동차업종', '후불교통', '단기카드대출', '장기카드대출', '통신요금'] }, { label: '무이자할부·연회비·수수료·이자·취소', keywords: ['무이자할부', '연회비', '수수료', '이자', '취소금액'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=771012&exec=cardDetail', sourceTitle: 'BC카드·BNK부산 BNK프렌즈카드(신용) 공식 전월·연간 실적 제외 및 혜택 기준', checkedAt: '2026-09-25' },
    'bc-member-busan-770534': { threshold: 300000, thresholdLabel: '30만원 (통합 월 할인한도 최소 구간; 50·100·200만원 이상 한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '병원·의원·조산원·산후조리원·어린이집·유치원·유아원', keywords: ['병원', '의원', '조산원', '산후조리원', '어린이집', '유치원', '유아원'] }, { label: '제세공과금·상품권·등록금·정부지원금·취소', keywords: ['제세공과금', '국세', '지방세', '4대보험', '과태료', '상품권', '기프트카드', '대학등록금', '정부지원금', '취소매출', '취소금액'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=770534&exec=cardDetail', sourceTitle: 'BC카드·BNK부산 국민행복카드(신용) 공식 전월 실적 제외 및 할인한도 기준', checkedAt: '2026-09-25' },
    'bc-member-busan-770518': { threshold: 200000, thresholdLabel: '20만원 (6대 홈쇼핑 할인 기준; 쇼핑 서비스는 30만원부터, 70만원 구간 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '6대 홈쇼핑 이용금액·제세공과금·대학등록금', keywords: ['cj오쇼핑', 'gs홈쇼핑', '현대홈쇼핑', '롯데홈쇼핑', '홈앤쇼핑', 'ns홈쇼핑', '홈쇼핑', '제세공과금', '국세', '지방세', '대학등록금'] }, { label: '상품권 구매·교통 이용금액', keywords: ['상품권', '기프트카드', '교통 이용금액', '후불교통', '교통카드'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=770518&exec=cardDetail', sourceTitle: 'BC카드·BNK부산 부자되세요 홈쇼핑카드 공식 전월 실적 제외 및 서비스 구간', checkedAt: '2026-09-25' },
    'bc-member-busan-323761': { threshold: 300000, thresholdLabel: '30만원 (월간 통합 할인한도 최소 구간; 70·120만원 이상 한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '조세서비스·등록금·상품권·주유·단기카드대출·취소', keywords: ['조세서비스', '제세공과금', '국세', '지방세', '등록금', '대학등록금', '상품권', '기프트카드', '주유', '단기카드대출', '현금서비스', '취소금액', '취소매출'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=323761&exec=cardDetail', sourceTitle: 'BC카드·BNK부산 딩딩 신용카드 공식 전월 실적 제외 및 할인한도 기준', checkedAt: '2026-09-25' },
    'bc-member-gyeongnam-397344': { threshold: 400000, thresholdLabel: '전월 실적 조건 없음 (기본 할인) / 40만원 (이동통신 5% 할인); 연간 캐시백은 12개월 500만원 별도', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '기본 국내 할인 제외: 무이자할부·공공요금·학교 납입금·수수료·상품권·대출·LH 임대료', keywords: ['무이자할부', '제세공과금', '초중고교납입금', '대학등록금', '수수료', '이자', '연회비', '상품권', '기프트카드', '현금서비스', '카드론', 'lh임대료'] }, { label: '전월 이용실적 제외: 관리비·교통·통신·세금·할부·취소 등', keywords: ['제세공과금', '초중고교납입금', '대학등록금', '아파트관리비', '후불교통', '도시가스요금', '전기요금', '상품권', '기프트카드', '단기카드대출', '장기카드대출', 'lh임대료', '통신요금', '무이자할부', '수수료', '연회비', '이자', '취소금액'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=3973440000&exec=cardDetail', sourceTitle: 'BC카드·BNK경남 ANY카드 공식 상세·전월 실적 제외 안내', checkedAt: '2026-09-25' },
    'bc-member-busan-103961': { threshold: 400000, thresholdLabel: '40만원 (월 통합 할인한도 2만원) / 70만원 (4만원); 바우처는 연간 이용조건 별도', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '해외이용·관리비·공과금·주유·학교·상품권·교통·자동차 이용금액', keywords: ['해외이용', '아파트관리비', '도시가스', '전기요금', '주유', '제세공과금', '국세', '지방세', '상하수도', '4대보험', '초중고학부모분담금', '유치원', '대학등록금', '상품권', '기프트카드', 'lh한국토지공사', '자동차판매', '후불교통'] }, { label: '취소·연회비·수수료·카드대출·무이자할부', keywords: ['카드취소', '연회비', '수수료', '이자', '단기카드대출', '현금서비스', '장기카드대출', '카드론', '무이자할부'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=103961&exec=cardDetail', sourceTitle: 'BC카드·BNK부산 REXⅡ 공식 상세·전월 실적 제외 안내', checkedAt: '2026-09-25' },
    'bc-member-gyeongnam-104239': { threshold: 400000, thresholdLabel: '40만원 (월 할인한도 2만원) / 70만원 (4만원); 바우처는 1년차 40만원·이후 전년도 600만원 별도', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '주유·후불교통·학교 납입금·관리비·공과금·임대료', keywords: ['주유', '후불교통', '초중고교', '학교납입금', '교육경비', '유치원', '대학등록금', '아파트관리비', '제세공과금', '전화요금', '전기요금', '도시가스', '상하수도', '우체국', '주차료', '과태료', '지방세', '국세', '관세', '4대보험', 'lh한국토지공사임대료'] }, { label: '상품권·취소·무이자할부·차량·대출·연회비', keywords: ['상품권', '기프트카드', '취소금액', '무이자할부', '오토서비스', '신차', '중고차', '단기카드대출', '현금서비스', '장기카드대출', '카드론', '연회비', '수수료', '이자'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=104239&exec=cardDetail', sourceTitle: 'BC카드·BNK경남 REXⅡ 공식 상세·전월 실적 제외 안내', checkedAt: '2026-09-25' },
    'bc-member-suhyup-104474': { threshold: 500000, thresholdLabel: '50만원 (패키지 할인·라운지 기준; 바우처는 1년차 100만원·이후 전년도 1,200만원 별도)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '할인 적용 매출 전체', keywords: ['할인적용', '할인받음', '청구할인', '할인금액'], discountOnly: true }, { label: '세금·공과금·보험·수수료·이자·연회비·대출', keywords: ['국세', '지방세', '4대보험', '국민연금', '고용보험', '건강보험', '산재보험', '우편요금', '공공기관', '과태료', '수수료', '이자', '연체료', '연회비', '카드론', '현금서비스'] }, { label: '공공요금·관리비·임대료·상품권·등록금', keywords: ['도시가스', '전기요금', '수도요금', '아파트관리비', 'tv수신료', 'lh토지공사임대료', '상품권', '기프트카드', '선불카드', '포인트충전', '유치원', '초중고', '대학등록금', '대학원등록금'] }, { label: '교통·해외·무이자할부·취소·포인트 이용', keywords: ['rf교통', '후불교통', '해외가맹점', '해외이용', '무이자할부', '취소금액', '거래취소', '포인트사용', '체크결제'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=1044740000&exec=cardDetail', sourceTitle: 'BC카드·Sh수협 더 아우름 공식 상세·전월 실적 제외 안내', checkedAt: '2026-09-25' },
    'bc-member-gwangju-103880': { threshold: 300000, thresholdLabel: '30만원 (주유·자동차정비·생활 캐시백 기준; 70·100만원 이상 한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '주유소·LPG 이용금액', keywords: ['주유소', '주유', 'lpg', '충전소'] }, { label: '무이자할부·카드대출·공과금·세금·보험·등록금', keywords: ['무이자할부', '현금서비스', '단기카드대출', '카드론', '장기카드대출', '제세공과금', '국세', '지방세', '관세', '과태료', '건강보험', '국민연금', '고용보험', '장애인고용부담금', '대학교등록금', '대학원등록금'] }, { label: '관리비·상품권·취소·연회비·수수료·이자', keywords: ['아파트관리비', '기프트카드', '선불카드', '상품권', '전자지급수단', '취소금액', '연회비', '제수수료', 'sms수수료', '할부수수료', '해외사용수수료', '이자'] }], source: 'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=103880', sourceTitle: 'BC카드·광주은행 오일모아카드 공식 상세·전월 실적 제외 안내', checkedAt: '2026-09-25' },
    'bc-member-gyeongnam-104511': { threshold: 300000, thresholdLabel: '30만원 (모빌리티·생활 할인 기준; 60만원 이상 한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '교통·모빌리티·공공요금·세금·교육비', keywords: ['후불교통', '누비자', '따릉이', '어울링', '전기차충전', '초중고학교납입금', '교육경비', '대학등록금', '제세공과금', '국세', '지방세', '관세', '4대보험', '과태료'] }, { label: '관리비·임대료·상품권·할부·차량·대출·해외', keywords: ['전화요금', '전기요금', '아파트관리비', '도시가스요금', '상하수도요금', 'lh한국토지공사', '임대료', '상품권', '기프트카드', '사이버머니', '취소금액', '무이자할부', '오토서비스', '자동차', '단기카드대출', '현금서비스', '장기카드대출', '카드론', '연회비', '해외이용', '연체료', '수수료', '이자'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=104511&exec=cardDetail', sourceTitle: 'BC카드·BNK경남 경남은행 K-패스 카드 공식 전월 실적·제외 업종', checkedAt: '2026-09-25' },
    'bc-member-gyeongnam-103676': { threshold: 300000, thresholdLabel: '30만원 (할인형·캐시백형 기본 서비스 기준; 일부 혜택은 별도 확인 필요)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '후불교통·교육비·세금·공공요금·관리비', keywords: ['후불교통', '대학등록금', '초중고학교납입금', '교육경비', '제세공과금', '조세업종', '국세', '지방세', '전기요금', '도시가스요금', '아파트관리비'] }, { label: '상품권·주유·해외·취소·카드대출', keywords: ['기프트카드', '상품권', '주유', '해외이용', '취소금액', '단기카드대출', '현금서비스', '장기카드대출', '카드론'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=103676&exec=cardDetail', sourceTitle: 'BC카드·BNK경남 키스해링 신용카드 공식 할인형·캐시백형 전월 실적 기준', checkedAt: '2026-09-25' },
    'bc-member-gyeongnam-103211': { threshold: 300000, thresholdLabel: '30만원 (에코머니 적립 서비스 기준; 60만원 이상 적립한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '교통·교육비·세금·공공요금·관리비', keywords: ['후불교통', '초중고학교납입금', '교육경비', '대학등록금', '제세공과금', '국세', '지방세', '관세', '4대보험', '전화요금', '전기요금', '아파트관리비', '도시가스요금', '상하수도요금'] }, { label: '상품권·임대료·취소·해외·카드대출', keywords: ['상품권', '기프트카드', 'lh한국토지공사', '임대료', '취소금액', '해외이용', '단기카드대출', '현금서비스', '장기카드대출', '카드론'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=103211&exec=cardDetail', sourceTitle: 'BC카드·BNK경남 어디로든 그린카드 공식 전월 실적 제외·적립 기준', checkedAt: '2026-09-25' },
    'bc-member-gyeongnam-103035': { threshold: 0, thresholdLabel: '전월 실적 조건 없음 (대한항공 마일리지 적립)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '주유·교통·교육비·세금·공공요금·관리비', keywords: ['주유', '후불교통', '초중고학교납입금', '교육경비', '대학등록금', '제세공과금', '국세', '지방세', '관세', '4대보험', '전화요금', '전기요금', '아파트관리비', 'lh한국토지공사', '임대료', '도시가스요금', '상하수도요금'] }, { label: '상품권·차량·할부·취소·카드대출', keywords: ['상품권', '기프트카드', '무이자할부', '오토서비스', '자동차', '취소금액', '단기카드대출', '현금서비스', '장기카드대출', '카드론'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=103035&exec=cardDetail', sourceTitle: 'BC카드·BNK경남 AIR Mile(대한항공) 카드 공식 무실적 마일리지·적립 제외 기준', checkedAt: '2026-09-25' },
    'bc-member-gyeongnam-102331': { threshold: 300000, thresholdLabel: '30만원 (주유·생활 할인 기준; 60만원 이상 구간별 한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '주유·교통·교육비·세금·공공요금·관리비', keywords: ['주유', '충전소', '후불교통', '초중고학교납입금', '교육경비', '대학등록금', '제세공과금', '국세', '지방세', '관세', '4대보험', '과태료', '전화요금', '전기요금', '아파트관리비', '도시가스요금', '상하수도요금'] }, { label: '임대료·상품권·취소·해외', keywords: ['lh한국토지공사', '임대료', '상품권', '기프트카드', '취소금액', '해외이용'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=102331&exec=cardDetail', sourceTitle: 'BC카드·BNK경남 SK OIL＆LPG카드 공식 전월 실적 제외 및 할인 구간', checkedAt: '2026-09-25' },
    'bc-member-gyeongnam-102355': { threshold: 300000, thresholdLabel: '30만원 (The Art 할인형 서비스 기준)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '후불교통·대학등록금·세금·공공요금·관리비', keywords: ['후불교통', '대학등록금', '제세공과금', '국세', '지방세', '부가세', '관세', '전화요금', '전기요금', '아파트관리비', '도시가스요금', '상하수도요금'] }, { label: '상품권·취소·해외·주유', keywords: ['상품권', '기프트카드', '취소금액', '해외이용', '주유'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=102355&exec=cardDetail', sourceTitle: 'BC카드·BNK경남 The Art Card 할인형 공식 전월 실적 제외·할인 조건', checkedAt: '2026-09-25' },
    'bc-member-gyeongnam-102465': { threshold: 300000, thresholdLabel: '30만원 (The Art 캐시백형 서비스 기준)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '후불교통·대학등록금·세금·공공요금·관리비', keywords: ['후불교통', '대학등록금', '제세공과금', '국세', '지방세', '부가세', '관세', '전화요금', '전기요금', '아파트관리비', '도시가스요금', '상하수도요금'] }, { label: '상품권·취소·해외', keywords: ['상품권', '기프트카드', '취소금액', '해외이용'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=102465&exec=cardDetail', sourceTitle: 'BC카드·BNK경남 The Art Card 캐시백형 공식 전월 실적 제외·캐시백 조건', checkedAt: '2026-09-25' },
    'bc-member-gyeongnam-102356': { threshold: 200000, thresholdLabel: '20만원 (생활·레저 서비스 기준; TOP포인트 적립은 실적 무관)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '후불교통·대학등록금·세금·공공요금·관리비', keywords: ['후불교통', '대학등록금', '제세공과금', '국세', '지방세', '부가세', '관세', '전화요금', '전기요금', '아파트관리비', '도시가스요금', '상하수도요금'] }, { label: '상품권·주유·취소·해외·무이자할부', keywords: ['상품권', '기프트카드', '주유', '취소금액', '해외이용', '무이자할부'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=102356&exec=cardDetail', sourceTitle: 'BC카드·BNK경남 The Gallery Card 공식 전월 실적 제외 및 서비스 기준', checkedAt: '2026-09-25' },
    'bc-member-suhyup-104068': { threshold: 300000, thresholdLabel: '30만원 (월 할인 서비스 최저 구간; 50·100만원 이상 한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '할인받은 이용금액·카드대출·수수료·연회비', keywords: ['할인받은', '할인 적용', '단기카드대출', '현금서비스', '장기카드대출', '카드론', '수수료', '이자', '연체료', '연회비'] }, { label: '세금·공공요금·관리비·임대료', keywords: ['제세공과금', '국세', '지방세', '4대보험', '우체국', '공공기관', '과태료', '도시가스', '전기요금', '수도요금', '아파트관리비', 'tv수신료', 'lh토지공사', '임대료'] }, { label: '상품권·교육비·교통·해외·무이자할부·취소·체크매출', keywords: ['상품권', '기프트카드', '선불카드', '선불전자지급수단', '유치원', '초중고학교납입금', '대학등록금', '대학원등록금', 'rf교통', '후불교통', '해외가맹점', '해외이용', '무이자할부', '취소금액', '체크결제', '즉시불결제', '포인트사용'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=104068&exec=cardDetail', sourceTitle: 'BC카드·Sh수협 All드림카드 공식 전월 실적·제외 대상', checkedAt: '2026-09-25' },
    'bc-member-suhyup-103581': { threshold: 500000, thresholdLabel: '50만원 (승선·주유·편의점·통신 할인 기준; 낚시 제휴점 혜택은 실적·한도 없음)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '할인받은 이용금액·카드대출·수수료·연회비', keywords: ['할인받은', '할인 적용', '단기카드대출', '현금서비스', '장기카드대출', '카드론', '수수료', '이자', '연체료', '연회비'] }, { label: '세금·공공요금·관리비·임대료', keywords: ['제세공과금', '국세', '지방세', '4대보험', '과태료', '도시가스', '전기요금', '수도요금', '아파트관리비', 'lh토지공사', '임대료'] }, { label: '상품권·교육비·교통·해외·무이자할부·취소·체크매출', keywords: ['상품권', '기프트카드', '선불카드', '선불전자지급수단', '초중고학교납입금', '대학등록금', '대학원등록금', '후불교통', '해외가맹점', '무이자할부', '취소금액', '체크결제', '즉시불결제', '포인트사용'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=103581&exec=cardDetail', sourceTitle: 'BC카드·Sh수협 樂SEA카드 공식 전월 50만원 기준·실적 제외 대상', checkedAt: '2026-09-25' },
    'bc-member-suhyup-103185': { threshold: 500000, thresholdLabel: '50만원 (통신요금 할인 기준; 기본 캐시백은 무실적, 분기 캐시백은 분기별 500만원)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '카드대출·수수료·세금·공공요금·관리비·임대료', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론', '수수료', '이자', '연체료', '연회비', '제세공과금', '국세', '지방세', '4대보험', '과태료', '도시가스', '전기요금', '수도요금', '아파트관리비', 'lh토지공사', '임대료'] }, { label: '상품권·교육비·교통·할인받은 통신·해외·무이자할부·취소·체크매출', keywords: ['기프트카드', '선불카드', '상품권', '선불전자지급수단', '초중고학교납입금', '대학등록금', '대학원등록금', '후불교통', '통신요금 할인', '해외가맹점', '무이자할부', '취소금액', '체크결제', '즉시불결제', '포인트사용'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=103185&exec=cardDetail', sourceTitle: 'BC카드·Sh수협 Real Real 1.0 공식 캐시백·통신 할인 실적 및 제외 기준', checkedAt: '2026-09-25' },
    'bc-member-gwangju-104281': { threshold: 0, thresholdLabel: '마일리지 적립 무실적; 연간 보너스는 첫해 500만원·이후 전년도 1,000만원 사용 조건', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '무이자할부·카드대출·세금·공공요금·관리비', keywords: ['무이자할부', '단기카드대출', '현금서비스', '장기카드대출', '카드론', '제세공과금', '국세', '지방세', '관세', '과태료', '건강보험', '국민연금', '고용보험', '장애인고용부담금', '아파트관리비', '대학등록금'] }, { label: '이자·상품권·취소·연회비·수수료', keywords: ['이자', '기프트카드', '선불카드', '전자지급수단', '상품권', '취소금액', '연회비', '수수료', '해외사용수수료'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=104281&exec=cardDetail', sourceTitle: 'BC카드·광주은행 대한항공 SKYPASS 카드 일반형 공식 마일리지·전월 실적 제외 기준', checkedAt: '2026-09-25' },
    'bc-member-gwangju-104282': { threshold: 0, thresholdLabel: '마일리지 적립 무실적; 연간 보너스는 첫해 500만원·이후 전년도 1,000만원 사용 조건', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '무이자할부·카드대출·세금·공공요금·관리비', keywords: ['무이자할부', '단기카드대출', '현금서비스', '장기카드대출', '카드론', '제세공과금', '국세', '지방세', '관세', '과태료', '건강보험', '국민연금', '고용보험', '장애인고용부담금', '아파트관리비', '대학등록금'] }, { label: '이자·상품권·취소·연회비·수수료', keywords: ['이자', '기프트카드', '선불카드', '전자지급수단', '상품권', '취소금액', '연회비', '수수료', '해외사용수수료'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=104282&exec=cardDetail', sourceTitle: 'BC카드·광주은행 대한항공 SKYPASS 카드 플래티늄형 공식 마일리지·전월 실적 제외 기준', checkedAt: '2026-09-25' },
    'bc-member-gwangju-104081': { threshold: 200000, thresholdLabel: '20만원 (일부 레저·패밀리레스토랑); 경기장·생활 캐시백은 30만원부터', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '무이자할부·카드대출·세금·공공요금·관리비·주유', keywords: ['무이자할부', '단기카드대출', '현금서비스', '장기카드대출', '카드론', '제세공과금', '국세', '지방세', '관세', '과태료', '건강보험', '국민연금', '고용보험', '장애인고용부담금', '아파트관리비', '대학등록금', '주유', 'lpg'] }, { label: '이자·상품권·취소·연회비·수수료', keywords: ['이자', '기프트카드', '선불카드', '전자지급수단', '상품권', '취소금액', '연회비', '수수료', '해외사용수수료'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=104081&exec=cardDetail', sourceTitle: 'BC카드·광주은행 기아챔피언스카드 공식 전월 20·30만원 기준 및 실적 제외', checkedAt: '2026-09-25' },
    'bc-member-gwangju-103367': { threshold: 300000, thresholdLabel: '30만원 (월간 통합 캐시백 기본서비스 기준; 70·100만원 이상 한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '무이자할부·카드대출·세금·공공요금·관리비', keywords: ['무이자할부', '단기카드대출', '현금서비스', '장기카드대출', '카드론', '제세공과금', '국세', '지방세', '관세', '과태료', '건강보험', '국민연금', '고용보험', '장애인고용부담금', '아파트관리비', '대학등록금'] }, { label: '이자·상품권·취소·연회비·수수료', keywords: ['이자', '기프트카드', '선불카드', '전자지급수단', '상품권', '취소금액', '연회비', '수수료', '해외사용수수료'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=103367&exec=cardDetail', sourceTitle: 'BC카드·광주은행 다자녀행복카드 공식 전월 30만원 실적·제외 기준', checkedAt: '2026-09-25' },
    'bc-member-gwangju-103119': { threshold: 300000, thresholdLabel: '30만원 (에코머니 포인트 적립 기준)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '무이자할부·카드대출·세금·공공요금·관리비', keywords: ['무이자할부', '단기카드대출', '현금서비스', '장기카드대출', '카드론', '제세공과금', '국세', '지방세', '관세', '과태료', '건강보험', '국민연금', '고용보험', '장애인고용부담금', '아파트관리비', '대학등록금'] }, { label: '이자·상품권·취소·연회비·수수료', keywords: ['이자', '기프트카드', '선불카드', '전자지급수단', '상품권', '취소금액', '연회비', '수수료', '해외사용수수료'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=103119&exec=cardDetail', sourceTitle: 'BC카드·광주은행 K-패스 그린카드V2 공식 전월 30만원 실적·제외 기준', checkedAt: '2026-09-25' },
    'bc-member-gwangju-340294': { threshold: 100000, thresholdLabel: '10만원 (영화·ATM 혜택 기준; 기본·선택업종 적립은 실적 무관)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '카드대출·연회비·수수료·이자·무이자할부', keywords: ['단기카드대출', '현금서비스', '장기카드대출', '카드론', '연회비', '수수료', '이자', '무이자할부'] }, { label: '상품권·등록금·공과금·세금·교통·일부 영화/선택업종', keywords: ['기프트카드', '상품권', '대학등록금', '대학원등록금', '공과금', '지방세', '국세', '대중교통', '영화관', '선택업종'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=340294&exec=cardDetail', sourceTitle: 'BC카드·광주은행 1st카드 공식 전월 10만원 서비스 기준 및 적립 제외', checkedAt: '2026-09-25' },
    'bc-member-busan-103378': { threshold: 400000, thresholdLabel: '40만원 (월간 통합할인 최소 실적; 80·120만원 이상 한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '생활요금·보험·통신', keywords: ['아파트관리비', '도시가스', '전기요금', '보험업종', '보험료', '통신요금'] }, { label: '교육비·제세공과금', keywords: ['초중고학부모부담금', '초중고학교납입금', '유치원', '대학등록금', '제세공과금', '국세', '지방세', '상하수도요금', '4대보험', '과태료'] }, { label: '상품권·임대료·자동차·후불교통', keywords: ['상품권', '기프트카드', 'lh한국토지공사', '임대료', '자동차업종', '후불교통'] }, { label: '해외이용·취소·연회비·수수료·이자·카드대출', keywords: ['해외이용금액', '해외매출', '카드취소', '연회비', '수수료', '이자', '단기카드대출', '현금서비스', '장기카드대출', '카드론'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=103378&exec=cardDetail', sourceTitle: 'BC카드·BNK부산 ZipL 신용카드 공식 전월 실적 제외 및 할인한도 기준', checkedAt: '2026-09-25' },
    'bc-member-busan-103192': { threshold: 400000, thresholdLabel: '40만원 (월간 통합할인 최소 실적; 80·120만원 이상 한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '해외매출·세금·공과금·학교 납입금', keywords: ['해외매출', '제세공과금', '국세', '지방세', '4대보험', '과태료', '초중고학교납입금', '교육경비', '유치원', '대학등록금'] }, { label: '아파트관리비·도시가스·전기요금·상품권', keywords: ['아파트관리비', '도시가스요금', '전기요금', '상품권', '기프트카드'] }, { label: 'LH임대료·카드대출·연회비·취소·자동차·후불교통', keywords: ['lh한국토지공사', '임대료', '단기카드대출', '장기카드대출', '카드대출이자', '연회비', '취소금액', '자동차구매', '후불교통'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=103192&exec=cardDetail', sourceTitle: 'BC카드·BNK부산 부산체육사랑카드 공식 전월 실적 제외 및 할인한도 기준', checkedAt: '2026-09-25' },
    'bc-member-busan-103022': { threshold: 400000, thresholdLabel: '40만원 (월간 통합할인 최소 실적; 80만원 이상 한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '해외매출·세금·공과금·학교 납입금', keywords: ['해외매출', '제세공과금', '국세', '지방세', '4대보험', '과태료', '초중고학교납입금', '교육경비', '대학등록금'] }, { label: '아파트관리비·도시가스·전기요금·상품권', keywords: ['아파트관리비', '도시가스요금', '전기요금', '상품권', '기프트카드'] }, { label: 'LH임대료·카드대출·연회비·취소·자동차·후불교통', keywords: ['lh한국토지공사', '임대료', '단기카드대출', '장기카드대출', '카드대출이자', '연회비', '취소금액', '자동차구매', '후불교통'] }, { label: '페이북 내 외화머니 이용금액', keywords: ['내 외화 머니', '외화머니'] }], source: 'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=103022&exec=cardDetail', sourceTitle: 'BC카드·BNK부산 팟 카드 공식 전월 실적 제외 및 할인한도 기준', checkedAt: '2026-09-25' },
    'lotte-department-store': { threshold: 300000, thresholdLabel: '30만원 (롯데백화점 15% 할인 최소 구간; 50·100·200만원 구간별 한도 상향)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '롯데백화점 이용금액', keywords: ['롯데백화점'] }, { label: '연회비·수수료', keywords: ['연회비', '수수료'] }, { label: '단기·장기 카드대출', keywords: ['현금서비스', '단기카드대출', '카드론', '장기카드대출'] }], source: 'https://www.lottecard.co.kr/app/IHCDAAA_V200.do?vt_cd_knd_c=P11714-A11714', sourceTitle: '롯데카드 롯데백화점 롯데카드 공식 상세·지난달 실적 산정 기준', checkedAt: '2026-09-25' },
    'lotte-loca-likit': { threshold: 400000, thresholdLabel: '40만원 (스타벅스·영화·대중교통·통신·배달 할인 기준)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [...lotteLikitExclusions, { label: '택시·고속도로 통행료·공과금·의료·교육·아파트관리비·무이자할부', keywords: ['택시', '고속도로통행료', '공과금', '건강보험', '국민연금', '고용보험', '산재보험', '초중고교납입금', '대학등록금', '아파트관리비', '무이자할부'] }, { label: '기프트·선불카드·포인트 충전·상품권·벌금·카드대출', keywords: ['기프트카드', '선불카드', '포인트충전', '상품권', '벌금', '과태료', '민원발급수수료', '관세', '인지세', '송달료', '무승인전표', '자판기', '터널통행료', '항공기내', '현금서비스', '연회비', '이자', '수수료'] }], source: 'https://www.lottecard.co.kr/app/LPCDADB_V100.lc?vtCdKndC=P13746-A13746', sourceTitle: '롯데카드 LOCA LIKIT 공식 상세·전월 실적 제외 안내', checkedAt: '2026-09-25' },
    'lotte-members': { threshold: 500000, thresholdLabel: '50만원 (기본·특별 포인트 적립 기준)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [{ label: '롯데멤버스 카드가 아닌 롯데카드 이용금액', keywords: ['다른 롯데카드'] }, { label: '무이자할부·취소', keywords: ['무이자할부', '무이자 할부', '거래취소', '취소금액'] }, { label: '세금·공과금·사회보험·공공/부동산 임대료', keywords: ['국세', '지방세', '공과금', '도시가스', '전기요금', '수도요금', '건강보험', '국민연금', '고용보험', '산재보험', '공공임대료', '부동산임대료', '장애인고용부담금'] }, { label: '학교 납입금·등록금·아파트 관리비·TV 수신료', keywords: ['초중고교납입금', '초중고학교납입금', '대학등록금', '아파트관리비', 'tv수신료'] }, { label: '오토·스마트 캐시백·오토할부', keywords: ['오토캐시백', '스마트캐시백', '오토할부'] }, { label: '기프트·선불·상품권·포인트 충전', keywords: ['기후동행카드', '기프트카드', '선불카드', '상품권', '모바일상품권', '포인트충전'] }, { label: '교통·택시·고속버스·통행료·티머니 인증', keywords: ['택시', '고속버스', '고속도로통행료', '대중교통', '시내버스', '광역버스', '시외버스', '지하철', '티머니인증'] }, { label: '무승인전표·관세·벌금·과태료·민원·인지·송달료', keywords: ['무승인전표', '자판기', '터널통행료', '항공기내', '관세', '벌금', '과태료', '민원발급수수료', '인지세', '송달료'] }, { label: '카드대출·연회비·이자·수수료·미리적립 상환금액', keywords: ['현금서비스', '단기카드대출', '카드론', '장기카드대출', '연회비', '이자', '수수료', '미리적립상환'] }], source: 'https://www.lottecard.co.kr/app/LPCDADB_V100.lc?vtCdKndC=P15648-A15648', sourceTitle: '롯데카드 롯데멤버스 카드 공식 상세·전월 실적 산정 제외 안내', checkedAt: '2026-09-25' },
    'hana-jade-classic': { threshold: 500000, thresholdLabel: '50만원 (특별 적립·라운지·프리미엄 혜택 기준; 기본 적립은 실적 무관)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [...hanaBaseExclusions, { label: '아파트 관리비·무이자할부·외화 하나머니', keywords: ['아파트관리비', '아파트 관리비', '무이자할부', '무이자 할부', '외화하나머니'] }], source: 'https://m.hanacard.co.kr/MKCDCM1000M.web?CD_PD_SEQ=17503', sourceTitle: '하나카드 JADE Classic 공식 카드 상세·실적 제외 안내', checkedAt: '2026-09-25' },
    'hana-wonder-t': { threshold: 400000, thresholdLabel: '40만원 (선택형 서비스 최저 구간; 전가맹점 서비스는 실적 무관)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [...hanaBaseExclusions, hanaWonderBenefitExclusion], source: 'https://m.hanacard.co.kr/ONETHEINTROM.web', sourceTitle: '하나카드 원더카드 T 공식 서비스 실적·제외 안내', checkedAt: '2026-09-25' },
    'hana-wonder-free-plus': { threshold: 400000, thresholdLabel: '40만원 (선택형 서비스 최저 구간; 전가맹점 기본 할인은 실적 무관)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [...hanaBaseExclusions, hanaWonderBenefitExclusion], source: 'https://m.hanacard.co.kr/MKCDCM1010M.web?CD_PD_SEQ=17568', sourceTitle: '하나카드 원더카드 FREE+ 공식 카드 상세·실적 제외 안내', checkedAt: '2026-09-25' },
    'hana-wonder-happy-plus': { threshold: 400000, thresholdLabel: '40만원 (선택형 서비스 최저 구간; 전가맹점 기본 할인은 실적 무관)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [...hanaBaseExclusions, hanaWonderBenefitExclusion], source: 'https://m.hanacard.co.kr/MKCDCM1010M.web?CD_PD_SEQ=17001', sourceTitle: '하나카드 원더카드 HAPPY+ 공식 카드 상세·실적 제외 안내', checkedAt: '2026-09-25' },
    'hana-wonder-daily': { threshold: 400000, thresholdLabel: '40만원 (영상 스트리밍·생활 서비스 최저 구간)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [...hanaBaseExclusions, hanaWonderBenefitExclusion], source: 'https://m.hanacard.co.kr/ONETHEINTROM.web', sourceTitle: '하나카드 원더카드 DAILY 공식 서비스 실적·제외 안내', checkedAt: '2026-09-25' },
    'hana-wonder-living': { threshold: 400000, thresholdLabel: '40만원 (생활요금·병원·약국 서비스 최저 구간)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [...hanaBaseExclusions, hanaWonderBenefitExclusion], source: 'https://m.hanacard.co.kr/MKCDCM1010M.web?CD_PD_SEQ=16778', sourceTitle: '하나카드 원더카드 LIVING 공식 카드 상세·실적 제외 안내', checkedAt: '2026-09-25' },
    'hana-wonder-free': { threshold: 0, thresholdLabel: '전월 실적 조건 없음 (기본 혜택 기준)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [...hanaBaseExclusions, hanaWonderBenefitExclusion], source: 'https://m.hanacard.co.kr/MKCDCM1010M.web?CD_PD_SEQ=15860', sourceTitle: '하나카드 원더카드 FREE 공식 카드 상세·실적 제외 안내', checkedAt: '2026-09-25' },
    'hana-wonder-happy': { threshold: 400000, thresholdLabel: '40만원 (간편결제·생활 선택 서비스 최저 구간)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [...hanaBaseExclusions, hanaWonderBenefitExclusion], source: 'https://m.hanacard.co.kr/MKCDCM1010M.web?CD_PD_SEQ=16227', sourceTitle: '하나카드 원더카드 HAPPY 공식 카드 상세·실적 제외 안내', checkedAt: '2026-09-25' },
    'hana-multi-living': { threshold: 400000, thresholdLabel: '40만원 (주중·주말 할인 및 자동납부 할인 기준; 페이 결제 할인은 실적 무관)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [...hanaBaseExclusions, { label: '아파트 관리비·부동산임대료', keywords: ['아파트관리비', '아파트 관리비', '부동산임대료'] }, { label: '초·중·고 납입금·무이자할부', keywords: ['초중고학교납입금', '학교납입금', '무이자할부', '무이자 할부'] }, { label: '주중·주말 할인 적용 매출', keywords: ['주중할인', '주말할인'], discountOnly: true }], discountExemptionKeywords: hanaMultiLivingDiscountExemptionKeywords, source: 'https://m.hanacard.co.kr/leaflet/13/13059_20251224.pdf', sourceTitle: '하나카드 MULTI Living 공식 상품안내장 (2025.12 개정)', checkedAt: '2026-09-25' },
    'hana-multi-oil': { threshold: 400000, thresholdLabel: '40만원 (주유·생활 할인 기준; 페이 결제 할인은 실적 무관)', verificationStatus: 'verified', useCommonExclusions: false, extraExclusions: [...hanaBaseExclusions, { label: '아파트 관리비·부동산임대료·통신요금·학교납입금·무이자할부', keywords: ['아파트관리비', '아파트 관리비', '부동산임대료', '통신요금', '초중고학교납입금', '학교납입금', '무이자할부', '무이자 할부'] }, { label: '국내외 ATM 이용금액 및 Multi Oil 할인 적용 매출', keywords: ['atm', 'multi oil 할인'], discountOnly: true }], discountExemptionKeywords: hanaMultiOilDiscountExemptionKeywords, source: 'https://m.hanacard.co.kr/leaflet/13/13060_20251224.pdf', sourceTitle: '하나카드 MULTI Oil 공식 상품안내장 (2025.12 개정)', checkedAt: '2026-09-25' }
  };
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
  } : product).map((product) => officialSpendRules[product.id] ? {
    ...product, ...officialSpendRules[product.id],
    useCommonExclusions: officialSpendRules[product.id].useCommonExclusions ?? true,
    source: officialSpendRules[product.id].source || product.source
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
    summary: { supportedIssuerCount: 11, supportedCardCount: 180, catalogCardCount: 180, pendingRuleCount: 0, kbCardCount: 10, hyundaiCardCount: 10, bankBcIssuerCount: 12, bankBcCardCount: 94, samsungCardCount: 10, wooriCardCount: 10, lotteCardCount: 10, hanaCardCount: 10, shinhanCardCount: 10, nhCardCount: 10 }
  };
})();
