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
 assert.equal(await page.inputValue('#purchase-mode'),'official');assert.equal(await page.locator('.benefit-details').isVisible(),false);
 const catalog=await page.evaluate(()=>window.CARDPILOT_BC.catalog.map(m=>({id:m.id,name:m.name,unit:m.unit,version:m.version})));assert.equal(catalog.length,12);
 for(let i=0;i<catalog.length;i++){await page.selectOption('#wallet-issuer','BC 바로카드');await page.selectOption('#wallet-product',catalog[i].id);await page.fill('#wallet-last4',String(1000+i));await page.click('#wallet-save');}
 const cards=await page.evaluate(()=>window.CARDPILOT_TOOLS.getMappings());assert.equal(cards.length,12);
 async function personal(card){
  await page.selectOption('#official-card',card.id);assert.match(await page.textContent('#official-detail'),new RegExp('확인 2026-10-13'));assert.ok((await page.textContent('#official-detail')).includes(catalog.find(m=>m.id===card.productId).version));
  await page.fill('#official-previousMonth','2026-09');await page.fill('#official-previousSpend','1500000');await page.selectOption('#official-memberStatus','standard');await page.check('#official-previousConfirmed');await page.check('#official-versionConfirmed');await page.check('#official-exclusionsConfirmed');
  const counters=await page.locator('#official-used input').count();for(let i=0;i<counters;i++)await page.locator('#official-used input').nth(i).fill('0');
  if(await page.locator('#official-mobileCount').count())await page.fill('#official-mobileCount','0');
  if(card.productId==='bc-air-plus'){await page.fill('#official-billingMonth','2026-10');await page.fill('#official-billingBase','0');await page.fill('#official-billingBonus','0');await page.check('#official-billingConfirmed');}
  await page.click('#official-form button[type=submit]');
 }
 for(let i=0;i<cards.length;i++){await personal(cards[i]);if((i+1)%4===0)console.log('Official UI profiles checked: '+(i+1)+'/12');}
 await page.fill('#purchase-merchant','스타벅스');await page.fill('#purchase-amount','10000');await page.fill('#purchase-month','2026-10');await page.selectOption('#purchase-category','cafe');await page.selectOption('#purchase-channel','onsite');await page.check('#purchase-category-confirmed');await page.click('#purchase-form button[type=submit]');
 assert.equal(await page.locator('#purchase-rows tr').count(),12);
 const rows=await page.locator('#purchase-rows tr').allTextContents();const rowFor=id=>rows.find(t=>t.includes(catalog.find(m=>m.id===id).name));
 assert.match(rowFor('bc-kpass'),/500원 예상/);assert.match(rowFor('bc-on-off'),/1,000원 예상/);assert.match(rowFor('bc-anywhere-green-v3'),/1,000에코머니 포인트 예상/);assert.match(rowFor('bc-air-plus'),/10스카이패스 마일 예상/);
 assert.match(await page.textContent('#purchase-title'),/단위별/);assert.match(await page.textContent('#purchase-status'),/포인트·마일·원화 간 순위는 매기지/);
 assert.equal(await page.locator('#purchase-input-warning').isVisible(),true);assert.equal(await page.locator('#purchase-result-warning').isVisible(),true);
 // Manual rates are ignored in official mode.
 await page.evaluate(()=>document.querySelector('#benefit-rate').value='99');await page.click('#purchase-form button[type=submit]');assert.match((await page.locator('#purchase-rows tr').allTextContents()).find(t=>t.includes('BC 바로 K-패스 카드')),/500원 예상/);
 await page.locator('#official-benefits summary').click();await page.locator('#purchase-results').screenshot({path:path.join(out,'bc-official-pc-results.png')});
 await page.locator('#official-benefits summary').click();const onoff=cards.find(c=>c.productId==='bc-on-off');await page.selectOption('#official-card',onoff.id);await page.fill('#official-used-food','14500');await page.fill('#official-used-total','14500');await page.click('#official-form button[type=submit]');await page.click('#purchase-form button[type=submit]');assert.match(await page.textContent('#purchase-title'),/동률/);
 const kpass=cards.find(c=>c.productId==='bc-kpass');await page.selectOption('#official-card',kpass.id);await page.uncheck('#official-versionConfirmed');await page.click('#official-form button[type=submit]');await page.click('#purchase-form button[type=submit]');assert.match((await page.locator('#purchase-rows tr').allTextContents()).find(t=>t.includes('BC 바로 K-패스 카드')),/산정 불가/);
 // Native monthly telecom discount and frequency limit.
 await page.fill('#purchase-merchant','KT');await page.selectOption('#purchase-category','mobile');await page.selectOption('#purchase-channel','autopay');const flex=cards.find(c=>c.productId==='bc-shinsegae-seven-flex');await page.selectOption('#official-card',flex.id);await page.fill('#official-mobileCount','1');await page.click('#official-form button[type=submit]');await page.click('#purchase-form button[type=submit]');assert.match((await page.locator('#purchase-rows tr').allTextContents()).find(t=>t.includes('신세계 BC 바로 SEVEN FLEX')),/월 할인 횟수 소진/);
 await page.setViewportSize({width:390,height:844});await page.locator('#official-benefits summary').click();await page.locator('#purchase-comparison').screenshot({path:path.join(out,'bc-official-mobile-warning.png')});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const style=await page.locator('#purchase-result-warning strong').evaluate(n=>({size:parseFloat(getComputedStyle(n).fontSize),weight:Number(getComputedStyle(n).fontWeight),color:getComputedStyle(n).color}));assert.ok(style.size>=21&&style.weight>=700);assert.equal(style.color,'rgb(161, 18, 18)');
 await page.selectOption('#purchase-mode','manual');assert.equal(await page.locator('.benefit-details').isVisible(),true);assert.equal(await page.locator('#official-benefits').isVisible(),false);
 await page.reload();assert.equal(await page.locator('#wallet-list li').count(),12);assert.equal(await page.inputValue('#purchase-mode'),'official');await page.selectOption('#official-card',kpass.id);assert.equal(await page.inputValue('#official-previousSpend'),'');
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'bc-browser-result.json'),JSON.stringify({passed:['12 official card choices, sources and personal forms','automatic currency rates and caps','native point and mile units separated','manual values cannot override official rules','same-unit tie','version missing held pending','monthly frequency exhausted','PC and 390px mobile warning','manual mode explicitly separated','personal financial data clears on reload; mapping preserved'],browser:'Chromium '+browser.version(),pageErrors:errors},null,2));console.log('BC official UI checks passed.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
