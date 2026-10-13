const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const nodes = new Map();
const getNode = (id) => { if (!nodes.has(id)) nodes.set(id, { value: '', textContent: '', hidden: true }); return nodes.get(id); };
const context = vm.createContext({ document: { querySelector: getNode }, window: { CARDPILOT_TOOLS: { getMappings:()=>[{id:'test-card',issuer:'신한카드',last4:'1234',productId:'test'}], detectCardIdentity:()=>({issuer:'신한카드',last4:'1234'}), resolveIdentity:()=>({card:{id:'test-card',issuer:'신한카드',last4:'1234',productId:'test'},reason:''}) }, CARDPILOT_RULES: { products: [{id:'test',issuer:'가상',name:'검증 카드',extraExclusions:[],conditional:[],threshold:0,sourceTitle:'테스트',checkedAt:'2026-10-13'}], summary: {supportedCardCount:1}, commonExclusions: [] }, confirm: () => true }, Intl });
const source = fs.readFileSync(path.join(__dirname,'../cardpilot.js'),'utf8');
const init = source.lastIndexOf('\n  setupProducts();');
assert.ok(init > 0);
vm.runInContext(source.slice(0,init) + '\n renderRows = () => {}; globalThis.api = { parseImageText, classify, parseAmount, parseCsv, detectDelimiter, ingestRows, extractImageRows, updateSummary, state }; })();', context);
const { api } = context;
const fixture = [0,1,2].map((i) => `[Web발신]\n신한카드(1234) 승인\n홍*동님 123\n09/30 12:4${i}\n승인금액 ${[8500,120000,50000][i].toLocaleString('en-US')}원\n가맹점: ${['커피매장','아파트관리비','온라인상품권몰'][i]}\n승인번호 456\n할부 3${i < 2 ? '\n시간 12:40' : ''}\n누계 999,999원`).join('\n');
function legacyRows(text) {
  return text.split(/\r?\n/).filter((line) => {
    const matches = [...line.matchAll(/(?:₩\s*)?(-?\(?\d[\d,]*(?:원)?\)?)(?:\s*원)?/g)];
    if (!matches.length) return false;
    const match = matches.at(-1); const amount = api.parseAmount(match[1]);
    const before = line.slice(0,match.index).trim().replace(/(20\d{2}[./년 -]?\d{1,2}[./월 -]?\d{1,2}일?|\d{1,2}[./-]\d{1,2})/, '').replace(/[|│·•:：]/g,' ').trim();
    return amount > 0 && before && !/합계|총액|누계|이용한도|결제예정|청구금액|잔액/.test(before);
  });
}
function reset() { api.state.transactions = []; nodes.clear(); }
test('synthetic three SMS reproduce legacy 17 candidates; new parser returns three payments', () => {
  assert.equal(legacyRows(fixture).length, 17);
  const rows = api.parseImageText(fixture);
  assert.equal(rows.length,3);
  assert.deepEqual(Array.from(rows, r => r.amount),[8500,120000,50000]);
  assert.deepEqual(Array.from(rows, r => r.merchant),['커피매장','아파트관리비','온라인상품권몰']);
  assert.ok(rows.every(r=>r.date==='09/30'));
});
test('dates, time, card digits and cumulative amounts alone do not make transactions', () => {
  assert.equal(api.parseImageText('09/30 12:40\n카드번호 1234\n시간 12:40\n승인번호 9999\n누적 300,000원').length,0);
});
test('statement rows accept currencies or final amount only with date and merchant', () => {
  const rows=api.parseImageText('2026-09-30 커피매장 8,500원\n2026.10.01 서점 ₩12,000\n10/02 마트 4,000\n합계 24,500원');
  assert.equal(rows.length,3); assert.deepEqual(Array.from(rows,r=>r.amount),[8500,12000,4000]);
});
test('incomplete SMS stay one pending candidate each and do not inflate eligible spend', () => {
  reset(); const rows=api.parseImageText('[Web발신]\n신한카드 승인\n09/30 12:40\n승인금액 8,500원\n[Web발신]\n신한카드 승인\n10/01 13:00\n가맹점: 서점');
  assert.equal(rows.length,2); api.ingestRows(rows,'캡처');
  assert.ok(api.state.transactions.every(r=>r.status==='pending'));
  assert.equal(getNode('#sum-included').textContent,'₩0');
});
test('repeated extraction can exclude duplicates and append CSV without phantom numbers', () => {
  reset(); getNode('#ocr-text').value=fixture; api.extractImageRows(); assert.equal(api.state.transactions.length,3);
  api.extractImageRows(); assert.equal(api.state.transactions.length,3);
  assert.match(getNode('#file-status').textContent,/중복 의심 3건 제외/);
  const csv='이용일,가맹점명,승인금액\n2026-10-02,서점,"12,000"';
  const parsed=api.parseCsv(csv,api.detectDelimiter(csv));
  api.ingestRows(parsed.slice(1).map(r=>({date:r[0],merchant:r[1],amount:r[2]})),'CSV');
  assert.equal(api.state.transactions.length,4); assert.equal(api.state.transactions.at(-1).amount,12000);
});
test('ambiguous multiple amounts and cancellation are not eligible payments', () => {
  reset(); const rows=api.parseImageText('[Web발신]\n신한카드 승인\n09/30\n가맹점: 서점\n승인금액 8,500원 9,000원\n[Web발신]\n신한카드 취소\n10/01\n가맹점: 마트\n승인금액 5,000원');
  api.ingestRows(rows,'캡처'); assert.equal(api.state.transactions.length,2);
  assert.ok(api.state.transactions.every(r=>r.status==='pending'));
});

test('repeat import honors the choice to keep genuine identical payments', () => {
  reset(); api.ingestRows(api.parseImageText(fixture),'캡처');
  context.window.confirm = () => false;
  api.ingestRows(api.parseImageText(fixture),'캡처');
  assert.equal(api.state.transactions.length,6);
  assert.match(getNode('#file-status').textContent,/중복 의심 3건 포함/);
  context.window.confirm = () => true;
});

test('preserve existing explicit-discount exclusion with its product exemption', () => {
  const product={id:'discount-test',name:'검증 카드',useCommonExclusions:false,extraExclusions:[{discountOnly:true,label:'할인 거래',keywords:['할인대상']}],conditional:[],discountExemptionKeywords:['예외매장']};
  for(const discount of ['1000','5%','yes','true','y','예','할인적용','할인받음']){
    const item={merchant:'일반매장',extra:'',amount:10000,discount};api.classify(item,product);assert.equal(item.status,'excluded');
  }
  for(const discount of ['', '0', 'no']){const item={merchant:'일반매장',extra:'',amount:10000,discount};api.classify(item,product);assert.equal(item.status,'included');}
  const exempt={merchant:'예외매장',extra:'',amount:10000,discount:'1000'};api.classify(exempt,product);assert.equal(exempt.status,'included');
});
