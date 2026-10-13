const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const files=['index.html','cardpilot.js','card-tools.js','bc-benefits.js','card-rules.js','download-guide.html'];
const port=Number(process.env.CARDPILOT_PORT || 8080);
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('CARDPILOT_PORT must be an integer from 1024 to 65535');
const server=http.createServer((req,res)=>{const name=req.url.split('?')[0]==='/'?'index.html':req.url.split('?')[0].slice(1);if(!['GET','HEAD'].includes(req.method)||!files.includes(name)){res.writeHead(404).end();return;}res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(req.method==='HEAD'?'':fs.readFileSync(path.join(root,name)));});
server.on('error',e=>{console.error(e.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log('CardPilot local preview: http://127.0.0.1:'+port+' (Ctrl+C to stop)'));
