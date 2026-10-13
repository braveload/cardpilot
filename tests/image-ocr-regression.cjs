const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const root=path.resolve(__dirname,'..');
const out=process.env.CARDPILOT_TEST_OUTPUT || path.join(require('node:os').tmpdir(),'cardpilot-browser-check'); fs.mkdirSync(out,{recursive:true});
const fixture=[0,1,2].map(i=>`[Web발신]\n신한카드(1234) 승인\n홍*동님 123\n09/30 12:4${i}\n승인금액 ${[8500,120000,50000][i].toLocaleString('en-US')}원\n가맹점: ${['커피매장','아파트관리비','온라인상품권몰'][i]}\n승인번호 456\n할부 3\n누계 999,999원`).join('\n');
(async()=>{
 const server=http.createServer((req,res)=>{const name=req.url.split('?')[0]==='/'?'index.html':req.url.split('?')[0].slice(1);if(!['index.html','cardpilot.js','card-tools.js','bc-benefits.js','card-rules.js','download-guide.html'].includes(name)){res.writeHead(404).end();return;}res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8');res.end(fs.readFileSync(path.join(root,name)));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.CARDPILOT_CHROMIUM_PATH,headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1100}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{

 const requests=[];page.on('request',r=>requests.push(r.url()));
 await page.route('**/*',route=>{const u=route.request().url();if(u.startsWith('http://127.0.0.1:')||u.startsWith('blob:')||/^https:\/\/(cdn.jsdelivr.net|unpkg.com|tessdata.projectnaptha.com)\//.test(u))route.continue();else route.abort();});
 await page.goto('http://127.0.0.1:'+server.address().port+'/');
 await page.setInputFiles('#statement-images',path.join(out,'synthetic-three-sms.png'));
 await page.click('#read-images');
 await page.waitForFunction(()=>!document.querySelector('#read-images').disabled,{},{timeout:180000});
 const status=await page.textContent('#image-status');
 const text=await page.inputValue('#ocr-text');
 fs.writeFileSync(path.join(out,'synthetic-ocr-text.txt'),text);
 if(!text)throw new Error('OCR did not return text: '+status);
 console.log('OCR returned '+text.length+' characters.');
 await page.click('#extract-images');
 const count=await page.textContent('#sum-count');
 const amounts=await page.locator('#transaction-rows input[data-field="amount"]').evaluateAll(nodes=>nodes.map(n=>n.value));
 await page.locator('#sum-count').locator('..').locator('..').screenshot({path:path.join(out,'ui-synthetic-ocr.png')});
 await page.locator('#transaction-rows').locator('..').screenshot({path:path.join(out,'ui-synthetic-ocr-table.png')});
 fs.writeFileSync(path.join(out,'ocr-result.json'),JSON.stringify({status,text,count,amounts,pageErrors:errors,requests},null,2));
 assert.equal(count,'3건');assert.deepEqual(amounts,['8500','120000','50000']);assert.deepEqual(errors,[]);
 console.log('Synthetic image -> real Tesseract -> UI: 3 rows, correct amounts.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
