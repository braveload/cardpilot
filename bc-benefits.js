(() => {
  'use strict';
  const checkedAt = '2026-10-13';
  const products = window.CARDPILOT_RULES.products;
  const clean = (s) => String(s || '').toLowerCase().replace(/[\s()（）·&-]/g, '');
  const rule = (id, label, categories, rate, limits = [], extra = {}) => ({ id, label, categories, rate, limits, ...extra });
  const cafes = ['스타벅스','투썸플레이스','커피빈','이디야','메가MGC커피','매머드커피'];
  const convenience = ['CU','GS25','세븐일레븐','이마트24'];
  const telecom = ['KT','SKT','LGU+'];
  const stream = ['넷플릭스','유튜브프리미엄','티빙','웨이브','왓챠','디즈니플러스','멜론','지니뮤직'];
  const delivery = ['배달의민족','쿠팡이츠','요기요'];
  const onsite = ['onsite','official-app'];
  const online = ['online','official-app'];
  const recurring = ['recurring','pc-recurring'];
  const payProviders = ['페이북','삼성페이','카카오페이','네이버페이','PAYCO','토스페이','쿠페이','스마일페이','SSGPAY','11pay'];
  const catalog = [
    { id:'bc-kpass', version:'PDF 심의 2026.05.18 / 2026.05 개정본', unit:'원', thresholds:[300000,600000,1000000],
      limits:{total:[10000,20000,30000],transit:[7000,12000,15000]}, limitLabels:{total:'통합 할인(모든 영역)',transit:'대중교통 할인'},
      rules:[rule('coffee','카페',['cafe'],5,['total'],{brands:cafes,channels:onsite,min:3000}),rule('store','편의점',['convenience'],5,['total'],{brands:convenience,channels:['onsite'],min:5000}),rule('mobile','이동통신 자동납부',['mobile'],5,['total'],{brands:telecom,channels:['autopay']}),rule('ott','OTT 정기결제',['ott'],15,['total'],{brands:stream,channels:recurring}),rule('transit','후불 버스·지하철',['bus','subway'],15,['total','transit'],{channels:['postpaid']})],
      review:'해외 3%·USD 최소금액·K-패스 정부 환급은 이 국내 결제 비교 범위 밖입니다.' },
    { id:'bc-kt-my-alttle', version:'공식 상품 페이지 심의 2026.05.08', unit:'원', thresholds:[300000,700000],
      limits:{mobile:[7000,13000],fuel:[1000,1000]},limitLabels:{mobile:'KT 알뜰폰 통합 할인',fuel:'SK 주유 할인'},
      rules:[rule('mvno','KT 알뜰폰 자동납부',['kt-mvno'],null,['mobile'],{fixed:true,channels:['autopay']}),rule('fuel','SK 주유소(LPG 제외)',['sk-fuel'],1,['fuel'],{channels:['onsite']})],review:'실제 KT 알뜰폰 대상 사업자·자동납부와 SK 주유소(LPG/충전소 제외)를 확인해야 합니다.' },
    { id:'bc-kt-super-dc', version:'공식 PDF 2026.04 개정본 / 조회 2026.10.13', unit:'원',thresholds:[400000,800000,1200000],
      limits:{mobile:[5000,7000,9000]},limitLabels:{mobile:'KT 통신요금 통합 할인'},rules:[rule('mobile','KT 유무선 자동납부',['kt-telecom'],null,['mobile'],{fixed:true,channels:['autopay']})],review:'단말기 장기할부는 이자·계약·월/연 횟수 조건이 있어 추천 계산 제외. 해외 2%는 최종 청구·브랜드 확인 미지원.' },
    { id:'bc-zone',version:'공식 모바일 안내 심의 2025.11.07',unit:'원',thresholds:[300000,600000],
      limits:{eat:[5000,10000],life:[5000,10000],play:[5000,10000],market:[5000,10000]},limitLabels:{eat:'EAT ZONE',life:'LIFE ZONE',play:'PLAY ZONE',market:'전통시장 ZONE'},
      rules:[rule('coffee','EAT 카페',['cafe'],7,['eat'],{brands:['스타벅스','투썸플레이스','이디야','메가MGC커피','컴포즈커피'],channels:onsite}),rule('fast','EAT 간식',['fastfood'],7,['eat'],{brands:['맥도날드','버거킹','롯데리아','맘스터치','써브웨이'],channels:onsite}),rule('delivery','EAT 배달',['delivery'],7,['eat'],{brands:['배달의민족','쿠팡이츠'],channels:online}),rule('online','LIFE 온라인몰',['online-shopping'],7,['life'],{brands:['쿠팡','무신사','지그재그','오늘의집','크림'],channels:online}),rule('shop','LIFE 오프라인샵',['beauty','general'],7,['life'],{brands:['다이소','올리브영'],channels:['onsite']}),rule('netflix','PLAY 넷플릭스',['ott'],7,['play'],{brands:['넷플릭스'],channels:recurring}),rule('youtube','PLAY 유튜브 PC 정기결제',['ott'],7,['play'],{brands:['유튜브프리미엄'],channels:['pc-recurring']}),rule('member','PLAY 쇼핑멤버십',['membership'],7,['play'],{brands:['네이버플러스멤버십','쿠팡와우멤버십'],channels:recurring}),rule('gift','PLAY 카카오톡 선물하기',['app-gift'],7,['play'],{brands:['카카오톡선물하기'],channels:online}),rule('market','온누리 등록 전통시장',['traditional'],7,['market'],{channels:['onsite']})],review:'해외 ZONE은 최종 원화 청구·해외 가맹점·브랜드 확인이 필요해 자동 계산 제외. 임대매장/PG명/다른 할인 중복 제외 확인.' },
    { id:'bc-clear-plus',version:'공식 상품 페이지 심의 2026.04.20',unit:'원',thresholds:[150000,300000,500000],
      limits:{total:[5000,10000,20000],daily:[2500,5000,10000],life:[2500,5000,10000]},limitLabels:{total:'월 통합 할인(본인·가족 합산)',daily:'매일 할인',life:'라이프스타일 할인'},
      rules:[rule('lunch','점심 식당(주류 업종 제외)',['food'],7,['total','daily'],{min:10000,channels:['onsite'],time:[660,840]}),rule('delivery','배달앱',['delivery'],7,['total','daily'],{brands:delivery,channels:online}),rule('transit','후불교통',['bus','subway'],7,['total','daily'],{channels:['postpaid']}),rule('store','편의점',['convenience'],10,['total','life'],{brands:convenience,channels:['onsite']}),rule('online','온라인몰',['online-shopping'],10,['total','life'],{brands:['쿠팡','티몬','롯데홈쇼핑','G마켓','옥션','11번가','SSG.COM'],channels:online}),rule('beauty','올리브영',['beauty'],10,['total','life'],{brands:['올리브영'],channels:['onsite']}),rule('mobile','통신 자동납부',['mobile'],10,['total','life'],{brands:telecom,channels:['autopay']}),rule('ott','직접 신청 스트리밍',['ott'],10,['total','life'],{brands:['넷플릭스','유튜브프리미엄','멜론','지니뮤직'],channels:recurring})],review:'11:00~14:00 점심 시간 중 정확한 14:00 경계는 확인 필요로 보류. 임대매장·무이자·선불 제외.' },
    { id:'bc-air-plus',version:'공식 상품 페이지 심의 2023.09.11',unit:'스카이패스 마일',thresholds:[],limits:{},limitLabels:{},rules:[],billing:true,
      source:'https://www.bccard.com/app/card/CreditCardMain.do?gdsno=101924',review:'기본은 결제월 대상합계 1,000원당 1마일 반올림; 보너스는 별도 대상합계 100만원당 200마일 버림. 대상 제외 항목과 결제월 합계가 달라 단일 거래금액만으로 계산하지 않습니다.' },
    { id:'bc-kapick',version:'공식 상품 페이지 심의 2024.05.27',unit:'KaPick 포인트',thresholds:[150000,300000,600000,1000000],
      limits:{shop:[1500,4000,8000,15000],eat:[1500,4000,8000,15000],life:[3000,3000,6000,6000]},limitLabels:{shop:'쇼픽 그룹',eat:'먹픽 그룹',life:'생픽 그룹'},
      rules:[rule('onshop','쇼픽 온라인몰',['online-shopping'],7,['shop'],{brands:['쿠팡','G마켓','올리브영','오늘의집'],channels:online}),rule('offshop','쇼픽 현장매장',['general','beauty'],7,['shop'],{brands:['스타필드','올리브영','다이소'],channels:['onsite']}),rule('fashion','쇼픽 패션',['fashion'],7,['shop'],{brands:['자라','무신사','에이블리','29CM'],channels:['onsite',...online]}),rule('coffee','먹픽 카페',['cafe'],7,['eat'],{brands:['스타벅스','이디야','메가MGC커피','빽다방','컴포즈커피','매머드커피'],channels:onsite}),rule('store','먹픽 편의점',['convenience'],7,['eat'],{brands:convenience,channels:['onsite']}),rule('delivery','먹픽 배달',['delivery'],7,['eat'],{brands:delivery,channels:online}),rule('mobile','생픽 통신',['mobile'],7,['life'],{brands:telecom,channels:['autopay']}),rule('transit','생픽 후불교통',['bus','subway'],7,['life'],{channels:['postpaid']}),rule('taxi','생픽 카카오T',['taxi'],7,['life'],{brands:['카카오T'],channels:['app-autopay']}),rule('movie','생픽 영화',['movie'],7,['life'],{brands:['CGV','롯데시네마','메가박스'],channels:['onsite',...online]}),rule('pay','비 Pick 일반 가맹점 카카오페이',['general','cafe','food','fastfood','bookstore','clinic','pharmacy','fitness','beauty-salon','bakery','golf'],1,[],{threshold:0,channels:['simplepay'],providers:['카카오페이'],excludeBrands:['쿠팡','G마켓','올리브영','오늘의집','스타필드','다이소','자라','무신사','에이블리','29CM','스타벅스','이디야','메가MGC커피','빽다방','컴포즈커피','매머드커피',...convenience,...delivery,...telecom,'카카오T','CGV','롯데시네마','메가박스']})],review:'Pick 한도 초과분은 기본 카카오페이 적립으로 전환하지 않음. 해외 2%는 최종 청구·해외 처리 확인 미지원.' },
    { id:'bc-on-off',version:'공식 모바일 안내 심의 2025.02.10',unit:'원',thresholds:[300000,600000,900000],source:'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=103203&exec=cardDetail',
      limits:{total:[10000,20000,35000],online:[5000,10000,15000],food:[5000,10000,15000],transport:[5000,10000,15000],bus:[2000,2000,2000],subway:[2000,2000,2000]},limitLabels:{total:'국내 통합(본인·가족 합산)',online:'온라인/간편결제 영역',food:'음식점/커피 영역',transport:'교통 영역',bus:'버스 하위 한도',subway:'지하철 하위 한도'},
      rules:[rule('online','국내 온라인',['general','online-shopping','fashion','cafe','food','beauty'],10,['total','online'],{channels:online,perTransaction:1000}),rule('pay','국내 대상 간편결제',['general','online-shopping','fashion','cafe','food','beauty','taxi'],10,['total','online'],{channels:['simplepay'],providers:payProviders,perTransaction:1000}),rule('food','현장 음식점/커피',['food','cafe'],10,['total','food'],{channels:['onsite'],perTransaction:1000}),rule('bus','후불 버스',['bus'],10,['total','transport','bus'],{channels:['postpaid']}),rule('subway','후불 지하철',['subway'],10,['total','transport','subway'],{channels:['postpaid']}),rule('taxi','카카오T 앱 자동결제',['taxi'],10,['total','transport'],{brands:['카카오T'],channels:['app-autopay'],perTransaction:1000})],review:'해외 할인 10%·월 5천원은 해외 최종 청구·가맹점 확인 미지원. 국내는 건당 1천원, 버스/지하철 각각 월 2천원 제한.' },
    { id:'bc-reward-plus',version:'공식 상품 페이지 심의 2026.05.08',unit:'페이북 머니',thresholds:[300000,700000,1000000,2000000],rounding:'round',
      limits:{total:[10000,20000,20000,30000],shopping:[10000,10000,10000,10000],entertainment:[10000,10000,10000,10000],life:[10000,10000,10000,10000],golf:[10000,10000,10000,10000]},limitLabels:{total:'통합 특별적립(본인·가족 포함)',shopping:'쇼핑 특별적립',entertainment:'엔터테인먼트 특별적립',life:'생활 특별적립',golf:'골프 특별적립'},baseRates:[0.5,0.75,1.25,1.5],
      rules:[rule('dept','특별 백화점 현장',['department'],5,['total','shopping'],{brands:['신세계백화점','현대백화점','롯데백화점'],channels:['onsite'],fallbackBase:true}),rule('shop','특별 쇼핑',['online-shopping'],5,['total','shopping'],{brands:['신세계백화점','현대백화점','롯데백화점','이마트','홈플러스','롯데마트','SSG.COM','쿠팡','G마켓','옥션','11번가','마켓컬리'],channels:['onsite',...online],fallbackBase:true}),rule('movie','특별 영화',['movie'],30,['total','entertainment'],{brands:['CGV','롯데시네마'],channels:['onsite',...online],fallbackBase:true}),rule('outback','특별 아웃백',['food'],30,['total','entertainment'],{brands:['아웃백'],channels:['onsite'],fallbackBase:true}),rule('subscription','특별 스트리밍/멤버십',['ott','membership'],30,['total','entertainment'],{brands:['넷플릭스','유튜브프리미엄','멜론','지니뮤직','네이버플러스멤버십','쿠팡로켓와우멤버십'],channels:recurring,fallbackBase:true}),rule('fuel','생활 주유·충전',['fuel','sk-fuel','charging'],5,['total','life'],{channels:['onsite','official-app'],fallbackBase:true}),rule('mobile','생활 통신',['mobile'],5,['total','life'],{brands:telecom,channels:['autopay'],fallbackBase:true}),rule('transit','생활 후불교통',['bus','subway'],5,['total','life'],{channels:['postpaid'],fallbackBase:true}),rule('academy','생활 학원/유치원',['academy'],5,['total','life'],{channels:['onsite'],fallbackBase:true}),rule('books','생활 서점',['bookstore'],5,['total','life'],{brands:['교보문고','영풍문고','YES24'],channels:['onsite',...online],fallbackBase:true}),rule('management','생활 아파트관리비',['management'],5,['total','life'],{channels:['autopay'],fallbackBase:true}),rule('golf','골프 업종',['golf'],5,['total','golf'],{channels:['onsite'],fallbackBase:true}),rule('base','기본 적립(특별대상 아닌 일반 가맹점)',['general','cafe','food','fastfood','convenience','beauty','pharmacy','clinic','fitness','bakery','department','online-shopping','fashion','movie','ott','membership','fuel','sk-fuel','charging','mobile','bus','subway','academy','bookstore','management','golf','pharmaceutical'],null,[],{base:true})],review:'제약 업종(약국 아님)은 기본적립 최대 1% 별도: 이 영역은 보류. 특별대상은 초과 사용액에만 기본율 적용, 중복 합산 안 함.' },
    { id:'bc-lost-ark',version:'공식 상품 페이지 심의 2022.01.04',unit:'원',thresholds:[300000,500000,700000],
      limits:{game:[10000,20000,25000],offline:[5000,5000,5000],online:[15000,15000,15000]},limitLabels:{game:'로열 크리스탈 통합 할인',offline:'국내외 일반 할인',online:'국내 온라인 할인'},
      rules:[rule('game','로스트아크 로열 크리스탈',['lostark'],10,['game'],{brands:['로스트아크','로열크리스탈'],channels:online}),rule('offline','일반 현장 가맹점',['general','cafe','food','convenience'],0.5,['offline'],{threshold:0,channels:['onsite']}),rule('online','국내 온라인 가맹점',['general','online-shopping','cafe','food'],1.5,['online'],{threshold:0,channels:online,excludeBrands:['로스트아크','로열크리스탈']})],review:'모험가 전용과 기본은 중복 불가. 기본 조건 중복 시 높은 할인율만 적용. 별도 해외 수수료는 할인액과 합산하지 않음.' },
    { id:'bc-shinsegae-seven-flex',version:'공식 모바일 안내 심의 2026.07.24',unit:'원',thresholds:[300000,600000,900000,1200000],source:'https://m.bccard.com/app/mobileweb/CardDetail.do?cardGdsNo=101883&exec=cardDetail',
      limits:{total:[10000,20000,30000,50000],flex:[10000,20000,20000,20000],pay:[10000,15000,15000,15000],health:[10000,20000,20000,20000],yummy:[10000,20000,20000,20000],daily:[10000,20000,20000,20000]},limitLabels:{total:'통합 할인(본인·가족 합산)',flex:'FLEX',pay:'PAY',health:'HEALTH & BEAUTY',yummy:'YUMMY',daily:'DAILY'},
      rules:[rule('dept','FLEX 신세계 현장',['department'],7,['total','flex'],{brands:['신세계백화점','신세계아울렛','신세계면세점'],channels:['onsite']}),rule('wconcept','FLEX W Concept',['fashion','online-shopping'],7,['total','flex'],{brands:['WConcept'],channels:online}),rule('pay','PAY 온라인 간편결제',['general','online-shopping','fashion','cafe','food','beauty'],7,['total','pay'],{channels:['online-pay'],providers:['네이버페이','카카오페이','스마일페이','삼성페이','SSGPAY']}),rule('health','HEALTH 현장 업종',['clinic','pharmacy','golf','fitness','beauty-salon'],7,['total','health'],{channels:['onsite']}),rule('coffee','YUMMY 카페',['cafe'],7,['total','yummy'],{brands:['스타벅스','커피빈','폴바셋','투썸플레이스','이디야','할리스','아티제'],channels:onsite}),rule('store','YUMMY 편의점',['convenience'],7,['total','yummy'],{brands:convenience,channels:['onsite']}),rule('bakery','YUMMY 제과 업종',['bakery'],7,['total','yummy'],{channels:['onsite']}),rule('mobile','DAILY 통신 월 1회',['mobile'],7,['total','daily'],{brands:telecom,channels:['autopay'],countKey:'mobile',monthlyCount:1}),rule('transit','DAILY 후불교통',['bus','subway'],7,['total','daily'],{channels:['postpaid']}),rule('taxi','DAILY 카카오T 자동결제',['taxi'],7,['total','daily'],{brands:['카카오T'],channels:['app-autopay']}),rule('ott','DAILY 직접 스트리밍',['ott'],7,['total','daily'],{brands:['넷플릭스','유튜브프리미엄'],channels:recurring})],review:'한 거래에서 대상 중복 시 높은 할인금액 하나만 적용. 신세계 문화센터 및 제휴 포인트/부가 서비스는 계산 제외.' },
    { id:'bc-anywhere-green-v3',version:'PDF 2026.08.19 개정본 / 심의 2026.08.03',unit:'에코머니 포인트',thresholds:[300000,600000],graceBoundaryReview:600000,
      limits:{total:[30000,40000],charging:[20000,20000],transit:[5000,5000],coffee:[5000,5000],mobility:[5000,5000],express:[5000,5000]},limitLabels:{total:'에코머니 통합',charging:'전기차/수소차 충전',transit:'버스/지하철',coffee:'카페',mobility:'공유 모빌리티',express:'고속버스'},
      rules:[rule('charging','그린카드 제휴 충전소',['charging'],[20,40],['total','charging'],{channels:['onsite','official-app']}),rule('transit','후불 대중교통',['bus','subway'],10,['total','transit'],{channels:['postpaid']}),rule('coffee','대상 카페',['cafe'],10,['total','coffee'],{brands:['스타벅스','폴바셋','이디야'],channels:onsite}),rule('mobility','대상 공유 모빌리티',['mobility'],10,['total','mobility'],{brands:['쏘카','투루카','카카오T바이크','따릉이','누비자','어울링'],channels:['onsite',...online]}),rule('express','공식 경로 고속버스',['expressbus'],10,['total','express'],{channels:['onsite','official-app','online']}),rule('base','국내 일반 가맹점',['general'],0.2,['total'],{excludeBrands:['스타벅스','폴바셋','이디야','쏘카','투루카','따릉이','누비자','어울링']})],review:'충전소 제휴·분리 결제, 간편결제 제외 확인. 환경제품·공공시설·에너지 절약 서비스는 결제 추천 밖. 신규유예의 정확한 60만원 경계 문구는 보류.' }
  ].map((entry) => { const product=products.find((p)=>p.id===entry.id); return {...entry,name:product.name,source:entry.source||product.source,checkedAt,versionKey:entry.id+'@'+checkedAt,scope:'국내 확인 영역만',performanceBasis:entry.billing?'결제월 기본·보너스 별도 대상합계':entry.id==='bc-lost-ark'?'전월 국내 실적(전용 혜택); 기본 할인 실적 무관':'전월 국내외 확정 실적(제외·매입 기준은 안내장 확인)',newMember:entry.thresholds.length?'최초 사용 등록일부터 다음달 말일까지 최소 실적 구간; 실제 유예 대상과 적용 여부를 사용자 확인':'실적 조건 없음; 신규 실적 유예 계산 없음'}; });
  const categories = {general:'일반 가맹점',cafe:'카페',food:'식당(주류 업종 제외)',fastfood:'패스트푸드',convenience:'편의점',delivery:'배달앱', 'online-shopping':'온라인 쇼핑',fashion:'패션',beauty:'올리브영 등 뷰티샵',mobile:'이동통신 3사', 'kt-mvno':'KT 알뜰폰','kt-telecom':'KT 유무선 통신',ott:'OTT/스트리밍',membership:'쇼핑 멤버십',bus:'시내버스',subway:'지하철',taxi:'카카오T', 'sk-fuel':'SK 주유(LPG 제외)',fuel:'주유(LPG 포함)',charging:'전기차/수소차 충전',mobility:'공유 모빌리티',expressbus:'고속버스',department:'백화점',traditional:'온누리 등록 전통시장','app-gift':'카카오톡 선물하기',movie:'영화관',golf:'골프',clinic:'병원/동물병원',pharmacy:'약국',pharmaceutical:'제약 업종(약국 아님)',fitness:'헬스/운동','beauty-salon':'이/미용',bakery:'제과점',bookstore:'서점',academy:'학원/유치원',management:'아파트관리비',lostark:'로스트아크 로열 크리스탈'};
  const channels = {onsite:'현장 일반 카드결제',online:'공식 국내 온라인 결제','official-app':'공식 앱 직접결제',recurring:'공식 사이트/앱 정기결제','pc-recurring':'공식 PC 정기결제',autopay:'통신/관리비 자동납부',postpaid:'후불 교통','app-autopay':'카카오T 앱 자동결제',simplepay:'간편결제(현장 포함)','online-pay':'온라인 간편결제'};
  function number(v) { const s=String(v??'').trim(); if(!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(s))return NaN;const n=Number(s.replace(/,/g,''));return Number.isSafeInteger(n)&&n<=1e12?n:NaN; }
  function previousMonth(month) { if(!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month))return '';const [y,m]=month.split('-').map(Number);return m===1?`${y-1}-12`:`${y}-${String(m-1).padStart(2,'0')}`; }
  function evaluate(purchase,card,input) {
    const model=catalog.find((m)=>m.id===card.productId);
    const unknown=(reason)=>({card,benefit:null,unit:model?.unit||'',status:'unknown',reason,source:model?.source||'',version:model?.version||''});
    if(!model)return unknown('자동 조건 미등록 상품: 수동 보조 모드에서 확인한 조건으로 비교하세요.');
    const c=input||{};const amount=number(purchase.amount);
    if((c.productId&&c.productId!==card.productId)||(c.identityKey&&c.identityKey!==card.issuer+'|'+card.last4))return unknown('카드 연결이 변경되어 개인 확인 정보를 다시 입력해야 합니다.');
    if(!Number.isFinite(amount)||amount<=0||amount>1e9||!previousMonth(purchase.month)||!purchase.merchant?.trim())return unknown('결제금액·사용처·월을 정확히 입력해 주세요.');
    if(!purchase.categoryConfirmed||!categories[purchase.category]||!channels[purchase.channel])return unknown('실제 업종/혜택 영역과 결제 방식을 확인해 주세요.');
    if(!c.versionConfirmed||c.versionKey!==model.versionKey||!c.exclusionsConfirmed)return unknown('보유 카드에 적용되는 안내장 버전·가맹점·제외조건·선택 옵션을 확인해 주세요.');
    if(!['standard','grace'].includes(c.memberStatus))return unknown('신규회원 유예 대상 여부를 확인해 주세요.');
    if(c.memberStatus==='grace'&&!c.graceConfirmed)return unknown('최초 등록일부터 다음달 말일까지 유예 대상임을 확인해 주세요.');
    const calc=(benefit,reason,details={})=>({card,benefit,unit:model.unit,status:'calculated',reason,source:model.source,version:model.version,details});
    if(/상품권|기프트|선불|무이자|취소|환불|현금서비스|카드론/.test(purchase.merchant))return model.billing?unknown('기본·보너스 대상이 다른 거래: 결제월 대상합계와 제외 규정 확인 필요'):calc(0,'확인된 제외 거래 키워드: 혜택에 합산하지 않습니다.');
    if(model.billing){
      if(!['general','cafe','food','fastfood','convenience','online-shopping','fashion','beauty','bookstore','clinic','pharmacy','golf','bakery'].includes(purchase.category))return unknown('마일리지 기본·보너스의 별도 대상 여부를 자동 확정할 수 없는 업종입니다.');
      const base=number(c.billingBase),bonus=number(c.billingBonus);
      if(c.billingMonth!==purchase.month||!c.billingConfirmed||!Number.isFinite(base)||!Number.isFinite(bonus))return unknown('같은 결제월의 기본·보너스 적립 대상합계와 결제월을 확인해 주세요.');
      const basic=Math.round((base+amount)/1000)-Math.round(base/1000);const extra=(Math.floor((bonus+amount)/1e6)-Math.floor(bonus/1e6))*200;
      return calc(basic+extra,`결제월 대상합계의 증가분: 기본 ${basic}마일 + 보너스 ${extra}마일. 원화로 환산하지 않습니다.`,{basic,bonus:extra});
    }
    const scoped=model.rules.filter((r)=>r.categories.includes(purchase.category));
    if(!scoped.length)return unknown('이 업종은 이번에 확인·구현한 자동 혜택 영역 밖입니다. '+model.review);
    let matches=scoped.filter((r)=>(!r.brands||r.brands.some((b)=>clean(purchase.merchant).startsWith(clean(b))))&&(!r.channels||r.channels.includes(purchase.channel)||(r.channels.includes('simplepay')&&purchase.channel==='online-pay'))&&(!r.providers||r.providers.some((b)=>clean(b)===clean(purchase.provider)))&&(!r.excludeBrands||!r.excludeBrands.some((b)=>clean(purchase.merchant).startsWith(clean(b)))));
    if(model.baseRates&&matches.some((r)=>!r.base))matches=matches.filter((r)=>!r.base);
    if(!matches.length&&['bc-kapick','bc-zone','bc-anywhere-green-v3','bc-shinsegae-seven-flex'].includes(model.id)&&['simplepay','online-pay'].includes(purchase.channel)&&scoped.some((r)=>!r.brands||r.brands.some((b)=>clean(purchase.merchant).startsWith(clean(b)))))return unknown('간편결제의 실제 가맹점번호/조건을 자동 확정하지 못해 보류합니다.');
    if(!matches.length)return calc(0,'공식 대상 가맹점/결제 방식과 일치하지 않습니다.');
    const spend=number(c.previousSpend);let effective=spend;
    const needsTier=matches.some((r)=>r.threshold!==0);
    if(needsTier){if(!c.previousConfirmed||c.previousMonth!==previousMonth(purchase.month)||!Number.isFinite(spend))return unknown('결제 월의 바로 전월 확정 실적을 입력·확인하세요. 이번 달 누적액은 대체하지 않습니다.');
      if(c.memberStatus==='grace'){if(model.graceBoundaryReview===spend)return unknown('신규유예의 해당 실적 경계 문구는 추가 확인이 필요합니다.');effective=Math.max(spend,model.thresholds[0]);}}
    const tier=model.thresholds.reduce((at,n,i)=>effective>=n?i:at,-1);
    const values=[];let missing='';
    for(const r of matches){
      if(r.threshold!==0&&tier<0){values.push({value:0,reason:'전월 확정 실적 미달',rule:r.id});continue;}
      if(r.min&&amount<r.min){values.push({value:0,reason:`건별 최소 ${r.min.toLocaleString('ko-KR')}원 미달`,rule:r.id});continue;}
      if(r.time){if(!/^\d{2}:\d{2}$/.test(purchase.time||'')){missing='점심 승인 시간을 확인해 주세요.';continue;}const [h,m]=purchase.time.split(':').map(Number);const minute=h*60+m;if(h>23||m>59){missing='승인 시간이 잘못되었습니다.';continue;}if(minute===r.time[1]){missing='점심 14:00 경계 조건 확인 필요';continue;}if(minute<r.time[0]||minute>=r.time[1]){values.push({value:0,reason:'점심 할인 시간 외',rule:r.id});continue;}}
      if(r.countKey){const count=number(c.counts?.[r.countKey]);if(!Number.isFinite(count)){missing='이번 달 통신 할인 사용 횟수를 확인해 주세요.';continue;}if(count>=r.monthlyCount){values.push({value:0,reason:'월 할인 횟수 소진',rule:r.id});continue;}}
      let rate=r.base?model.baseRates[tier]:Array.isArray(r.rate)?r.rate[tier]:r.rate;
      if(model.id==='bc-reward-plus'&&purchase.category==='pharmaceutical')rate=Math.min(rate,1);
      let proposed=r.fixed?amount:amount*rate/100;let available=Infinity;let invalid=false;const limits=[];
      for(const key of r.limits){const cap=model.limits[key][Math.max(0,tier)];const used=number(c.used?.[key]);if(!Number.isFinite(used)||used>cap){missing=`${model.limitLabels[key]}의 이미 사용한 혜택(0 포함)을 확인해 주세요.`;invalid=true;break;}available=Math.min(available,cap-used);limits.push({key,cap,used});}
      if(invalid)continue;
      if(limits.length>1&&limits.some((limit)=>limit.key!=='total'&&limit.used>limits.find((x)=>x.key==='total')?.used)){missing='영역 사용 혜택이 통합 사용 혜택보다 큽니다. 합산값을 확인해 주세요.';continue;}
      let value=Math.min(proposed,available,r.perTransaction??Infinity);
      if(r.fallbackBase){const baseRate=model.baseRates[tier];value+=Math.max(0,amount-value/(rate/100))*baseRate/100;}
      value=model.rounding==='round'?Math.round(value):Math.floor(value);
      values.push({value,rule:r.id,reason:`${r.label} · ${r.fixed?'월 정액 한도':`${rate}%`}${r.perTransaction?` · 건당 최대 ${r.perTransaction}원`:''} · ${limits.map((l)=>`${model.limitLabels[l.key]} 잔여 ${(l.cap-l.used).toLocaleString('ko-KR')}`).join(' / ')}${r.fallbackBase?' · 특별한도 초과 사용액만 기본율 적용':''}`});
    }
    if(missing)return unknown(missing);
    if(!values.length)return unknown('적용 조건 확인 필요');
    const best=values.reduce((a,b)=>b.value>a.value?b:a);
    return calc(best.value,best.reason+' · 안내장 조건 기반 예상, 최종 정산·반올림과 다를 수 있습니다.',{tier,rule:best.rule});
  }
  let profiles={},getCards=()=>[],invalidate=()=>{};
  function compare(purchase,cards=getCards(),inputs=profiles){
    if(!Number.isFinite(number(purchase.amount))||number(purchase.amount)<=0||number(purchase.amount)>1e9||!previousMonth(purchase.month)||!purchase.merchant?.trim())return {error:'결제금액·사용처·월을 정확히 입력해 주세요.',rows:[],winners:[]};
    const rows=cards.map((card)=>evaluate(purchase,card,inputs[card.id]));const groups={};
    for(const row of rows.filter((r)=>r.benefit!==null)){groups[row.unit] ||= [];groups[row.unit].push(row);}
    const winnersByUnit=Object.fromEntries(Object.entries(groups).map(([unit,entries])=>{const max=Math.max(0,...entries.map((r)=>r.benefit));return [unit,max>0?entries.filter((r)=>r.benefit===max).map((r)=>r.card.id):[]];}));
    return {error:'',rows,winners:[],winnersByUnit,incomplete:rows.some((r)=>r.benefit===null),official:true};
  }
  const $=(s)=>document.querySelector(s);
  function fillOptions(select,items,placeholder){select.replaceChildren();const none=document.createElement('option');none.value='';none.textContent=placeholder;select.append(none);items.forEach(([value,label])=>{const o=document.createElement('option');o.value=value;o.textContent=label;select.append(o);});}
  function selectedModel(){return catalog.find((m)=>m.id===getCards().find((c)=>c.id===$('#official-card').value)?.productId);}
  function fillProfile(){
    const model=selectedModel(),card=getCards().find((c)=>c.id===$('#official-card').value),c=profiles[card?.id]||{};
    const detail=$('#official-detail');detail.replaceChildren();
    if(!model){detail.textContent='이 상품은 BC 바로카드 자동 조건 대상이 아닙니다. 수동 보조 비교를 선택하거나 보유 상품을 확인하세요.';$('#official-inputs').hidden=true;return;}
    $('#official-inputs').hidden=false;
    const p=document.createElement('p');p.textContent=`${model.name} · ${model.version} · 확인 ${checkedAt} · ${model.scope} · 표시 단위 ${model.unit}`;detail.append(p);
    const a=document.createElement('a');a.href=model.source;a.target='_blank';a.rel='noopener';a.textContent='공식 안내장/상품 조건 확인 ↗';detail.append(a);
    const notes=document.createElement('p');notes.className='muted';notes.textContent=model.review;detail.append(notes);
    const list=document.createElement('ul');for(const r of model.rules){const li=document.createElement('li');li.textContent=`${r.label}: ${r.fixed?'정액 한도':r.base?`${model.baseRates.join('/')}%`:Array.isArray(r.rate)?r.rate.join('/')+'%':r.rate+'%'}${r.min?' · 건당 '+r.min+'원 이상':''}${r.perTransaction?' · 건당 '+r.perTransaction+'원 상한':''}${r.monthlyCount?' · 월 '+r.monthlyCount+'회':''}`;list.append(li);}detail.append(list);
    for(const f of ['previousSpend','previousMonth','memberStatus','billingBase','billingBonus','billingMonth'])$(`#official-${f}`).value=c[f]||'';
    for(const f of ['previousConfirmed','versionConfirmed','graceConfirmed','exclusionsConfirmed','billingConfirmed'])$(`#official-${f}`).checked=Boolean(c[f]);
    $('#official-billing').hidden=!model.billing;
    const used=$('#official-used');used.replaceChildren();
    for(const [key,values] of Object.entries(model.limits)){const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='official-used-'+key;label.textContent=`${model.limitLabels[key]}: 이번 달 사용한 혜택 (${model.unit}, 0 포함)`;const input=document.createElement('input');input.id='official-used-'+key;input.dataset.usedKey=key;input.inputMode='numeric';input.value=c.used?.[key]??'';field.append(label,input);used.append(field);}
    const count=$('#official-counts');count.replaceChildren();
    if(model.rules.some((r)=>r.countKey==='mobile')){const label=document.createElement('label');label.htmlFor='official-mobileCount';label.textContent='이번 달 DAILY 통신 할인 사용 횟수 (0 포함)';const input=document.createElement('input');input.id='official-mobileCount';input.inputMode='numeric';input.value=c.counts?.mobile??'';count.append(label,input);}
  }
  function refreshCards(){
    if(!$('#official-card'))return;const selected=$('#official-card').value;
    profiles=Object.fromEntries(Object.entries(profiles).filter(([id,c])=>getCards().some((card)=>card.id===id&&card.productId===c.productId&&c.identityKey===card.issuer+'|'+card.last4)));
    fillOptions($('#official-card'),getCards().map((c)=>[c.id,window.CARDPILOT_TOOLS.cardLabel(c)]),'보유 카드 선택');
    if(getCards().some((c)=>c.id===selected))$('#official-card').value=selected;fillProfile();
  }
  function setup(options){getCards=options.getCards;invalidate=options.invalidate;refreshCards();fillOptions($('#purchase-category'),Object.entries(categories),'혜택 영역/업종 확인');fillOptions($('#purchase-channel'),Object.entries(channels),'결제 방식 확인');
    $('#official-card').addEventListener('change',fillProfile);
    $('#official-form').addEventListener('input',invalidate);
    $('#official-form').addEventListener('submit',(e)=>{e.preventDefault();const model=selectedModel(),card=getCards().find((c)=>c.id===$('#official-card').value);if(!model||!card){$('#official-status').textContent='BC 바로카드 보유 상품을 선택하세요.';return;}
      const c={productId:card.productId,identityKey:card.issuer+'|'+card.last4,versionKey:model.versionKey,used:{},counts:{}};
      for(const f of ['previousSpend','previousMonth','memberStatus','billingBase','billingBonus','billingMonth'])c[f]=$(`#official-${f}`).value;
      for(const f of ['previousConfirmed','versionConfirmed','graceConfirmed','exclusionsConfirmed','billingConfirmed'])c[f]=$(`#official-${f}`).checked;
      $('#official-used').querySelectorAll('[data-used-key]').forEach((n)=>{c.used[n.dataset.usedKey]=n.value;});if($('#official-mobileCount'))c.counts.mobile=$('#official-mobileCount').value;
      profiles[card.id]=c;invalidate();$('#official-status').textContent='개인별 확인 정보를 이번 화면에 보관했습니다. 혜택률·한도는 공식 조건을 자동 적용하며, 누락된 값은 비교 시 보류합니다.';
    });
    $('#purchase-mode').addEventListener('change',()=>{const automatic=$('#purchase-mode').value==='official';$('#official-benefits').hidden=!automatic;$('.benefit-details').hidden=automatic;$('#purchase-official-context').hidden=!automatic;invalidate();});
  }
  window.CARDPILOT_BC={catalog,categories,channels,evaluate,compare,setup,refreshCards,clearSession:()=>{profiles={};if($('#official-card'))fillProfile();}};
})();
