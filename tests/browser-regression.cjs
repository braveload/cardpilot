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
 await page.goto(`http://127.0.0.1:${server.address().port}/`);
 const issuer=await page.evaluate(()=>window.CARDPILOT_RULES.products.find(p=>p.id==='bc-kpass').issuer);
 await page.selectOption('#issuer-select',issuer);await page.selectOption('#product-select','bc-kpass');
 await page.selectOption('#wallet-issuer','BC 바로카드'); await page.selectOption('#wallet-product','bc-kpass'); await page.fill('#wallet-last4','1234'); await page.click('#wallet-save');
 await page.evaluate(()=>document.querySelector('#ocr-review').hidden=false);
 await page.fill('#ocr-text',fixture);await page.click('#extract-images');
 assert.equal(await page.textContent('#sum-count'),'3건');
 const amounts=await page.locator('#transaction-rows input[data-field="amount"]').evaluateAll(nodes=>nodes.map(n=>n.value));assert.deepEqual(amounts,['8500','120000','50000']);
 assert.equal(await page.textContent('#sum-included'),'₩8,500');
 await page.locator('#sum-count').locator('..').locator('..').screenshot({path:path.join(out,'ui-three-transactions.png')});
 page.once('dialog',dialog=>dialog.accept());await page.click('#extract-images');
 assert.equal(await page.textContent('#sum-count'),'3건');assert.match(await page.textContent('#file-status'),/중복 의심 3건 제외/);
 await page.click('#clear-analysis');await page.evaluate(()=>document.querySelector('#ocr-review').hidden=false);
 await page.fill('#ocr-text','[Web발신]\n신한카드 승인\n09/30 12:40\n승인금액 8,500원\n[Web발신]\n신한카드 승인\n10/01 13:00\n가맹점: 서점');await page.click('#extract-images');
 assert.equal(await page.textContent('#sum-count'),'2건');assert.equal(await page.textContent('#sum-included'),'₩0');
 assert.deepEqual(await page.locator('#transaction-rows select[data-status]').evaluateAll(nodes=>nodes.map(n=>n.value)),['pending','pending']);
 await page.locator('#results').screenshot({path:path.join(out,'ui-incomplete-transactions.png')});
 assert.deepEqual(errors,[]);
 // Make a clearly synthetic local image for a separate OCR run.
 await page.evaluate(text=>{const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=1800;const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,1400,1800);ctx.fillStyle='black';ctx.font='38px Arial';text.split('\n').forEach((line,i)=>ctx.fillText(line,50,65+i*62));window.syntheticPng=canvas.toDataURL('image/png').split(',')[1];},'[Web발신]\n신한카드 승인\n09/30 12:40\n승인금액 8,500원\n가맹점: 커피매장\n\n[Web발신]\n신한카드 승인\n10/01 13:20\n승인금액 120,000원\n가맹점: 아파트관리비\n\n[Web발신]\n신한카드 승인\n10/02 14:30\n승인금액 50,000원\n가맹점: 온라인상품권몰');
 fs.writeFileSync(path.join(out,'synthetic-three-sms.png'),Buffer.from(await page.evaluate(()=>window.syntheticPng),'base64'));
 fs.writeFileSync(path.join(out,'browser-result.json'),JSON.stringify({passed:['three SMS -> three rows with correct amounts','BC K-Pass eligible total 8500','repeat extraction excluded duplicates','two incomplete candidates pending; eligible total 0'],pageErrors:errors},null,2));
 console.log('Browser UI checks passed: three rows, amounts, duplicate exclusion, incomplete pending, no page errors.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
