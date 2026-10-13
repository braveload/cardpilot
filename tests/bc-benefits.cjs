const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const c=vm.createContext({window:{}});vm.runInContext(fs.readFileSync(path.join(__dirname,'../card-rules.js'),'utf8'),c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../bc-benefits.js'),'utf8'),c);const api=c.window.CARDPILOT_BC;
const card=id=>({id,productId:id});const model=id=>api.catalog.find(m=>m.id===id);
const purchase=(category='cafe',merchant='스타벅스',amount='10000',channel='onsite')=>({category,merchant,amount,channel,month:'2026-10',categoryConfirmed:true});
function profile(id,spend='1500000'){const m=model(id);return {versionKey:m.versionKey,versionConfirmed:true,exclusionsConfirmed:true,memberStatus:'standard',previousSpend:spend,previousMonth:'2026-09',previousConfirmed:true,used:Object.fromEntries(Object.keys(m.limits).map(k=>[k,'0'])),counts:{mobile:'0'},billingMonth:'2026-10',billingBase:'0',billingBonus:'0',billingConfirmed:true};}
function value(id,p=purchase(),c=profile(id)){return api.evaluate(p,card(id),c).benefit;}
test('catalog covers exactly all 12 registered BC baro products with source, version and scope',()=>{const ids=c.window.CARDPILOT_RULES.products.filter(p=>p.issuer==='BC 바로카드').map(p=>p.id).sort();assert.deepEqual(Array.from(api.catalog,m=>m.id).sort(),Array.from(ids));assert.ok(api.catalog.every(m=>/^https:\/\/(?:www\.|m\.)?bccard\.com\//.test(m.source)&&m.version&&m.checkedAt==='2026-10-13'&&m.review));});
const smoke=[['bc-kpass',purchase(),500],['bc-kt-my-alttle',purchase('kt-mvno','KT 알뜰폰','10000','autopay'),10000],['bc-kt-super-dc',purchase('kt-telecom','KT','10000','autopay'),9000],['bc-zone',purchase(),700],['bc-clear-plus',purchase('convenience','CU','10000'),1000],['bc-air-plus',purchase(),10],['bc-kapick',purchase(),700],['bc-on-off',purchase(),1000],['bc-reward-plus',purchase(),125],['bc-lost-ark',purchase(),50],['bc-shinsegae-seven-flex',purchase(),700],['bc-anywhere-green-v3',purchase(),1000]];
for(const [id,p,expected] of smoke)test(id+' confirmed domestic scope arithmetic',()=>assert.equal(value(id,p),expected));
for(const [spend,cap] of [['299999',0],['300000',10000],['599999',10000],['600000',20000],['999999',20000],['1000000',30000]])test('K-pass table boundary '+spend,()=>assert.equal(value('bc-kpass',purchase('cafe','스타벅스','1000000'),profile('bc-kpass',spend)),cap));
test('minimum per transaction and bus sublimit enforce both columns of official table',()=>{
 assert.equal(value('bc-kpass',purchase('cafe','스타벅스','2999')),0);assert.equal(value('bc-kpass',purchase('cafe','스타벅스','3000')),150);assert.equal(value('bc-kpass',purchase('convenience','CU','4999')),0);
 assert.equal(value('bc-kpass',purchase('bus','시내버스','100000','postpaid'),profile('bc-kpass','300000')),7000);
});
test('cap exhaustion and contradictory totals do not fabricate remaining allowance',()=>{
 const c=profile('bc-kpass','300000');c.used.total='9999';assert.equal(value('bc-kpass',purchase(),c),1);c.used.total='10000';assert.equal(value('bc-kpass',purchase(),c),0);
 c.used.total='0';c.used.transit='1';assert.equal(value('bc-kpass',purchase('bus','시내버스','10000','postpaid'),c),null);
});
test('fixed telecom amounts follow tiers and never exceed the bill',()=>{
 assert.equal(value('bc-kt-my-alttle',purchase('kt-mvno','KT 알뜰폰','100000','autopay'),profile('bc-kt-my-alttle','699999')),7000);
 assert.equal(value('bc-kt-my-alttle',purchase('kt-mvno','KT 알뜰폰','100000','autopay'),profile('bc-kt-my-alttle','700000')),13000);
 for(const [spend,expected] of [['399999',0],['400000',5000],['800000',7000],['1200000',9000]])assert.equal(value('bc-kt-super-dc',purchase('kt-telecom','KT','100000','autopay'),profile('bc-kt-super-dc',spend)),expected);
 assert.equal(value('bc-kt-super-dc',purchase('kt-telecom','KT','1000','autopay')),1000);
});
test('On&Off has per-transaction and separate bus/subway ceilings',()=>{
 assert.equal(value('bc-on-off',purchase('cafe','스타벅스','20000')),1000);
 assert.equal(value('bc-on-off',purchase('bus','시내버스','50000','postpaid')),2000);
});
test('seven flex monthly mobile count zero, exhausted and unknown are distinguished',()=>{
 const p=purchase('mobile','KT','10000','autopay');const c=profile('bc-shinsegae-seven-flex');assert.equal(value('bc-shinsegae-seven-flex',p,c),700);c.counts.mobile='1';assert.equal(value('bc-shinsegae-seven-flex',p,c),0);delete c.counts.mobile;assert.equal(value('bc-shinsegae-seven-flex',p,c),null);
});
test('scope mismatch, unsupported area and excluded payment handled separately',()=>{
 assert.equal(value('bc-kpass',purchase('cafe','동네카페')),0);assert.equal(value('bc-kpass',purchase('cafe','스타벅스','10000','simplepay')),0);
 assert.equal(value('bc-kpass',purchase('general','일반매장')),null);assert.equal(value('bc-kpass',purchase('cafe','스타벅스 상품권')),0);
});
test('grace requires confirmation and is not silently inferred; standard underperformance stays zero',()=>{
 const c=profile('bc-kpass','0');assert.equal(value('bc-kpass',purchase(),c),0);c.memberStatus='grace';assert.equal(value('bc-kpass',purchase(),c),null);c.graceConfirmed=true;assert.equal(value('bc-kpass',purchase(),c),500);
 const green=profile('bc-anywhere-green-v3','600000');green.memberStatus='grace';green.graceConfirmed=true;assert.equal(value('bc-anywhere-green-v3',purchase(),green),null);
});
test('missing version, actual prior month, category, allowance and exceptions remain uncalculated',()=>{
 for(const changed of [{versionConfirmed:false},{versionKey:'other-version'},{exclusionsConfirmed:false},{previousMonth:'2026-10'},{previousSpend:''},{previousConfirmed:false},{used:{}}])assert.equal(value('bc-kpass',purchase(),{...profile('bc-kpass'),...changed}),null);
 assert.equal(value('bc-kpass',{...purchase(),categoryConfirmed:false}),null);assert.equal(value('bc-kpass',{...purchase(),amount:'-1'}),null);
});
test('official rates cannot be overridden by manual assistance input',()=>{
 assert.equal(value('bc-kpass',purchase(),{...profile('bc-kpass'),rate:'99',cap:'999999999',minimum:'0'}),500);
});
test('Green tiered EV points, category cap and combined cap use native units',()=>{
 assert.equal(value('bc-anywhere-green-v3',purchase('charging','제휴충전소','20000','official-app'),profile('bc-anywhere-green-v3','599999')),4000);
 assert.equal(value('bc-anywhere-green-v3',purchase('charging','제휴충전소','20000','official-app'),profile('bc-anywhere-green-v3','600000')),8000);
 const c=profile('bc-anywhere-green-v3','600000');c.used.total='39000';assert.equal(value('bc-anywhere-green-v3',purchase('charging','제휴충전소','100000','official-app'),c),1000);
});
test('special reward excess earns only base on remaining spend and no duplicate rates',()=>{
 const c=profile('bc-reward-plus','1000000');c.used.shopping='9900';c.used.total='9900';assert.equal(value('bc-reward-plus',purchase('online-shopping','쿠팡','10000','online'),c),200);
 c.used.shopping='10000';c.used.total='10000';assert.equal(value('bc-reward-plus',purchase('online-shopping','쿠팡','10000','online'),c),125);
});
test('lunch needs exact time and holds ambiguous endpoint instead of inventing it',()=>{
 const p=purchase('food','일반식당','10000');assert.equal(value('bc-clear-plus',p),null);assert.equal(value('bc-clear-plus',{...p,time:'11:00'}),700);assert.equal(value('bc-clear-plus',{...p,time:'13:59'}),700);assert.equal(value('bc-clear-plus',{...p,time:'14:00'}),null);assert.equal(value('bc-clear-plus',{...p,time:'15:00'}),0);
});
test('air calculates marginal miles from separate billing sums, not a cash conversion',()=>{
 const c=profile('bc-air-plus');c.billingBase='999000';c.billingBonus='999000';assert.equal(value('bc-air-plus',purchase('general','일반매장','1000'),c),201);c.billingConfirmed=false;assert.equal(value('bc-air-plus',purchase('general','일반매장','1000'),c),null);
});
test('ties retained within unit; points, miles and won never ranked against one another',()=>{
 const a={id:'a',productId:'bc-kpass'},b={id:'b',productId:'bc-kpass'},p={id:'p',productId:'bc-kapick'};
 const r=api.compare(purchase(),[a,b,p],{a:profile(a.productId),b:profile(b.productId),p:profile(p.productId)});assert.deepEqual(Array.from(r.winnersByUnit['원']),['a','b']);assert.deepEqual(Array.from(r.winnersByUnit['KaPick 포인트']),['p']);assert.equal(r.winners.length,0);
});

test('non-Pick cafés can earn KakaoPay basic points; Pick stores never fall back after cap exhaustion',()=>{
 const p={...purchase('cafe','투썸플레이스','10000','simplepay'),provider:'카카오페이'};assert.equal(value('bc-kapick',p),100);
 assert.equal(value('bc-kapick',{...p,merchant:'스타벅스'}),null);
});
test('department online uses only reward basic rate; pharmaceutical base rate has 1% ceiling',()=>{
 assert.equal(value('bc-reward-plus',purchase('department','신세계백화점','10000','online')),125);
 assert.equal(value('bc-reward-plus',purchase('pharmaceutical','제약업체','10000')),100);
});

test('personal confirmation belongs to the exact owned-card mapping',()=>{
 const owned={id:'a',issuer:'BC 바로카드',last4:'1234',productId:'bc-kpass'};const c={...profile('bc-kpass'),productId:'bc-kpass',identityKey:'BC 바로카드|9999'};assert.equal(api.evaluate(purchase(),owned,c).benefit,null);
});
