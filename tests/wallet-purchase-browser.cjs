const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const root=path.resolve(__dirname,'..');
const out=process.env.CARDPILOT_TEST_OUTPUT || path.join(require('node:os').tmpdir(),'cardpilot-browser-check'); fs.mkdirSync(out,{recursive:true});
const fixture=[0,1,2].map(i=>`[Web발신]\nBC바로카드(1234) 승인\n홍*동님 123\n09/30 12:4${i}\n승인금액 ${[8500,120000,50000][i].toLocaleString('en-US')}원\n가맹점: ${['커피매장','아파트관리비','온라인상품권몰'][i]}\n승인번호 456\n할부 3\n누계 999,999원`).join('\n');
(async()=>{
 const server=http.createServer((req,res)=>{const name=req.url.split('?')[0]==='/'?'index.html':req.url.split('?')[0].slice(1);if(!['index.html','cardpilot.js','card-tools.js','bc-benefits.js','card-rules.js','download-guide.html'].includes(name)){res.writeHead(404).end();return;}res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8');res.end(fs.readFileSync(path.join(root,name)));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.CARDPILOT_CHROMIUM_PATH,headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1100}});const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR: '+e.stack)});
 try{

 await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:')?route.continue():route.abort());
 await page.goto('http://127.0.0.1:'+server.address().port+'/');
 await page.selectOption('#purchase-mode','manual');
 const ps=await page.evaluate(()=>window.CARDPILOT_RULES.products.map(p=>({id:p.id,name:p.name,issuer:window.CARDPILOT_TOOLS.family(p.issuer)})));
 const shinhan=ps.find(p=>p.issuer==='신한카드'),samsung=ps.find(p=>p.issuer==='삼성카드');
 const firstText='[Web발신]\n신한카드(1234) 승인\n09/30 12:40\n승인금액 8,500원\n가맹점: 커피매장';
 await page.evaluate(()=>document.querySelector('#ocr-review').hidden=false);
 await page.fill('#ocr-text',firstText);await page.click('#extract-images');
 assert.equal(await page.locator('#transaction-rows select[data-status]').inputValue(),'pending');
 async function register(issuer,product,last4){await page.selectOption('#wallet-issuer',issuer);await page.selectOption('#wallet-product',product);await page.fill('#wallet-last4',last4);await page.click('#wallet-save');}
 await register(shinhan.issuer,shinhan.id,'1234');assert.equal(await page.locator('#wallet-list li').count(),1);
 assert.equal(await page.locator('#transaction-rows select[data-status]').inputValue(),'pending','saving mapping must not silently attach previous unresolved transactions');
 const a=await page.evaluate(()=>window.CARDPILOT_TOOLS.getMappings()[0].id);
 await page.selectOption('#transaction-rows select[data-card]',a);assert.notEqual(await page.locator('#transaction-rows select[data-status]').inputValue(),'pending');
 await register(shinhan.issuer,shinhan.id,'1234');assert.equal(await page.locator('#wallet-list li').count(),1);assert.match(await page.textContent('#wallet-status'),/이미/);
 await register(samsung.issuer,samsung.id,'1234');assert.equal(await page.locator('#wallet-list li').count(),2);
 const b=await page.evaluate(()=>window.CARDPILOT_TOOLS.getMappings().find(c=>c.issuer==='삼성카드').id);
 await page.click('#clear-analysis');await page.evaluate(()=>document.querySelector('#ocr-review').hidden=false);
 await page.fill('#ocr-text',firstText+'\n[Web발신]\n삼성카드(1234) 승인\n10/01 13:00\n승인금액 10,000원\n가맹점: 서점\n[Web발신]\nBC카드(1234) 승인\n10/02 14:00\n승인금액 5,000원\n가맹점: 마트');
 await page.click('#extract-images');assert.equal(await page.textContent('#sum-count'),'3건');
 assert.deepEqual(await page.locator('#transaction-rows select[data-card]').evaluateAll(ns=>ns.map(n=>n.value)),[a,b,'']);
 assert.equal(await page.locator('#transaction-rows select[data-status]').nth(2).inputValue(),'pending');
 // Global product selection cannot overwrite cards explicitly linked by the user.
 await page.selectOption('#issuer-select','현대카드');
 assert.deepEqual(await page.locator('#transaction-rows select[data-card]').evaluateAll(ns=>ns.map(n=>n.value)),[a,b,'']);
 await page.locator('#transaction-rows').locator('..').screenshot({path:path.join(out,'wallet-matched-and-pending.png')});
 await page.fill('#purchase-merchant','커피매장');await page.fill('#purchase-month','2026-10');await page.fill('#purchase-amount','-1');await page.click('#purchase-form button[type=submit]');assert.equal(await page.locator('#purchase-results').isVisible(),false);assert.match(await page.textContent('#purchase-status'),/정확히/);
 await page.fill('#purchase-amount','10000');await page.click('#purchase-form button[type=submit]');assert.match(await page.textContent('#purchase-rows'),/산정 불가/);
 async function condition(id,rate,used,previousMonth='2026-09'){
   await page.selectOption('#benefit-card',id);
   for(const [field,value] of Object.entries({scope:'커피매장',rate,minimum:'300000',previousSpend:'400000',previousMonth,cap:'20000',used}))await page.fill('#benefit-'+field,value);
   await page.selectOption('#benefit-capMode','limited');await page.check('#benefit-confirmed');await page.check('#benefit-previousConfirmed');await page.click('#benefit-form button[type=submit]');
 }
 await condition(a,'10','19500');await condition(b,'3','0');await page.click('#purchase-form button[type=submit]');
 assert.match(await page.textContent('#purchase-title'),new RegExp(shinhan.name.replace(/[.*+?^$()|[\]\\]/g,'\\$&')));
 assert.match(await page.textContent('#purchase-rows'),/500원 예상/);assert.match(await page.textContent('#purchase-rows'),/300원 예상/);
 const warning='누락된 사용 내역이나 혜택 한도 정보가 있으면 실제 결과와 달라질 수 있습니다.';
 for(const id of ['#purchase-input-warning','#purchase-result-warning']){assert.equal(await page.locator(id).isVisible(),true);assert.equal(await page.locator(id+' strong').textContent(),warning);const style=await page.locator(id+' strong').evaluate(n=>{const s=getComputedStyle(n);return {size:parseFloat(s.fontSize),weight:Number(s.fontWeight),color:s.color}});assert.ok(style.size>=21);assert.ok(style.weight>=700);assert.equal(style.color,'rgb(161, 18, 18)');}
 await page.locator('.benefit-details summary').click();await page.locator('#purchase-comparison').screenshot({path:path.join(out,'purchase-recommendation-warning.png')});await page.locator('.benefit-details summary').click();
 await condition(b,'5','0');await page.click('#purchase-form button[type=submit]');assert.match(await page.textContent('#purchase-title'),/동률/);
 await condition(b,'5','0','2026-10');await page.click('#purchase-form button[type=submit]');assert.match(await page.textContent('#purchase-status'),/전체 보유 카드의 추천은 산정할 수 없습니다/);assert.match(await page.textContent('#purchase-rows'),/2026-09 확정 실적/);
 // A mapping edit invalidates existing bindings rather than reassigning historic transactions.
 await page.locator('#wallet-list button[data-wallet-action=edit]').first().click();const alternate=ps.find(p=>p.issuer===shinhan.issuer&&p.id!==shinhan.id);await page.selectOption('#wallet-product',alternate.id);await page.click('#wallet-save');
 assert.equal(await page.locator('#transaction-rows select[data-status]').first().inputValue(),'pending');assert.equal(await page.locator('#purchase-results').isVisible(),false);
 await page.reload();await page.selectOption('#purchase-mode','manual');assert.equal(await page.locator('#wallet-list li').count(),2);assert.equal(await page.locator('#results').isVisible(),false);
 await page.fill('#purchase-merchant','커피매장');await page.fill('#purchase-amount','10000');await page.fill('#purchase-month','2026-10');await page.click('#purchase-form button[type=submit]');assert.match(await page.textContent('#purchase-rows'),/산정 불가/);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('cardpilot.card-links.v1')));assert.deepEqual(Object.keys(saved.cards[0]).sort(),['id','issuer','last4','productId']);
 await page.setViewportSize({width:390,height:844});await page.locator('.benefit-details summary').click();await page.locator('#purchase-comparison').screenshot({path:path.join(out,'purchase-warning-mobile.png')});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
 await page.locator('#wallet-list button[data-wallet-action=remove]').first().click();assert.equal(await page.locator('#wallet-list li').count(),1);await page.reload();assert.equal(await page.locator('#wallet-list li').count(),1);
 await page.click('#wallet-clear');await page.reload();assert.equal(await page.locator('#wallet-list li').count(),0);assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'wallet-purchase-browser-result.json'),JSON.stringify({passed:['register and reload minimal mappings','duplicate rejected; shared suffix distinguished by issuer','unregistered and generic BC pending','manual explicit connection; old transactions never silently reassigned','global selected product preserves bound cards','edit and remove invalidate historic bindings','normal recommendation and cap','ties preserved','missing and wrong-month conditions uncalculated','bad amount rejected','large bold red exact warning at input and result','390px mobile no document overflow','release persisted across reload'],pageErrors:errors,browser:'Chromium headless '+browser.version()},null,2));
 console.log('Wallet + purchase UI checks passed.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
