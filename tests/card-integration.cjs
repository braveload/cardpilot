const {test}=require('node:test');const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',hidden:true,textContent:''});return nodes.get(id)};
const context=vm.createContext({window:{},document:{querySelector:node},Intl});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../card-rules.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../card-tools.js'),'utf8'),context);
const tools=context.window.CARDPILOT_TOOLS,p=context.window.CARDPILOT_RULES.products;
let cards=[],confirmCount=0;const resolve=tools.resolveIdentity;tools.getMappings=()=>cards;tools.resolveIdentity=identity=>resolve(identity,cards);context.window.confirm=()=>{confirmCount++;return true;};
const source=fs.readFileSync(path.join(__dirname,'../cardpilot.js'),'utf8');
vm.runInContext(source.slice(0,source.lastIndexOf('\n  setupProducts();'))+'\n renderRows=()=>{};globalThis.api={ingestRows,classify,state,updateSummary,parseImageText};})();',context);
const api=context.api;const shinhan=p.find(p=>tools.family(p.issuer)==='신한카드'),samsung=p.find(p=>tools.family(p.issuer)==='삼성카드');
const a={id:'a',issuer:'신한카드',last4:'1234',productId:shinhan.id},b={id:'b',issuer:'삼성카드',last4:'1234',productId:samsung.id};
const sms=(issuer='신한')=>`[Web발신]\n${issuer}카드(1234) 승인\n09/30 12:40\n승인금액 8,500원\n가맹점: 일반매장`;
function reset(){api.state.transactions=[];cards=[];nodes.clear();confirmCount=0;node('#product-select').value='bc-kpass';}
test('unregistered SMS cannot use the selected global product; later registration is not retroactive',()=>{
 reset();api.ingestRows(api.parseImageText(sms()),'캡처');const row=api.state.transactions[0];assert.equal(row.status,'pending');assert.equal(row.productId,'');cards=[a];api.classify(row);assert.equal(row.status,'pending');assert.equal(node('#sum-included').textContent,'₩0');
});
test('matched SMS keeps its card on global product change; edit or release invalidates old binding',()=>{
 reset();cards=[a];api.ingestRows(api.parseImageText(sms()),'캡처');const row=api.state.transactions[0];assert.equal(row.productId,shinhan.id);
 node('#product-select').value=samsung.id;api.classify(row);assert.equal(row.productId,shinhan.id);
 cards=[{...a,productId:p.find(p=>tools.family(p.issuer)==='신한카드'&&p.id!==shinhan.id).id}];api.classify(row);assert.equal(row.status,'pending');assert.equal(row.productId,'');cards=[];api.classify(row);assert.equal(row.status,'pending');
});
test('different issuers with the same ending and payment do not suppress each other',()=>{
 reset();cards=[a,b];api.ingestRows(api.parseImageText(sms()+'\n'+sms('삼성')),'캡처');assert.equal(api.state.transactions.length,2);assert.equal(confirmCount,0);assert.deepEqual(Array.from(api.state.transactions,r=>r.cardMappingId),['a','b']);
 api.ingestRows(api.parseImageText(sms()),'캡처');assert.equal(api.state.transactions.length,2);assert.equal(confirmCount,1);
});
test('per-product progress uses only that product while totals remain combined',()=>{
 reset();cards=[a];api.ingestRows(api.parseImageText(sms()),'캡처');api.updateSummary();assert.match(node('#product-rule-summary').textContent,/선택 상품 거래의 인정 예상 ₩0/);assert.equal(node('#sum-count').textContent,'1건');
});

test('missing card linking module fails closed for OCR rather than using global selection',()=>{
 const safe=vm.createContext({window:{CARDPILOT_RULES:context.window.CARDPILOT_RULES,confirm:()=>true},document:{querySelector:node},Intl});
 vm.runInContext(source.slice(0,source.lastIndexOf('\n  setupProducts();'))+'\n renderRows=()=>{};globalThis.api={ingestRows,state,parseImageText};})();',safe);
 safe.api.ingestRows(safe.api.parseImageText(sms()),'캡처');assert.equal(safe.api.state.transactions[0].status,'pending');assert.equal(safe.api.state.transactions[0].productId,'');
});
