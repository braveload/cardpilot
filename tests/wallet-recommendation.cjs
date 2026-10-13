const {test}=require('node:test');const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const stored=new Map();const storage={getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)};
const c=vm.createContext({window:{localStorage:storage},document:{querySelector:()=>null},Intl});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../card-rules.js'),'utf8'),c);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../card-tools.js'),'utf8'),c);
const api=c.window.CARDPILOT_TOOLS,products=c.window.CARDPILOT_RULES.products;
const product=issuer=>products.find(p=>api.family(p.issuer)===issuer).id;
const cardA={id:'a',issuer:'신한카드',last4:'1234',productId:product('신한카드')};
const cardB={id:'b',issuer:'삼성카드',last4:'1234',productId:product('삼성카드')};
const purchase={merchant:'커피매장',amount:'10000',month:'2026-10'};
const profile={scope:'커피매장',rate:'10',minimum:'300000',previousSpend:'400000',previousMonth:'2026-09',capMode:'limited',cap:'20000',used:'19500',confirmed:true,previousConfirmed:true};
test('minimal card mapping persistence, reload and no financial/raw fields saved',()=>{
  const saved=api.saveMappings([{...cardA,amount:10000,raw:'private',fullNumber:'do-not-persist'}],storage);
  assert.deepEqual(Object.keys(saved[0]).sort(),['id','issuer','last4','productId']);
  assert.equal(api.loadMappings(storage)[0].last4,'1234');
  assert.ok(![...stored.values()].join('').includes('private'));
  api.saveMappings([],storage);assert.equal(api.loadMappings(storage).length,0);
});
test('mapping rejects full card numbers, issuer/product mismatch and duplicate endings',()=>{
  for(const card of [{...cardA,last4:'1234567890123456'},{...cardA,last4:'12x4'},{...cardA,productId:cardB.productId}])assert.throws(()=>api.saveMappings([card],storage));
  assert.throws(()=>api.saveMappings([cardA,{...cardA,id:'other'}],storage),/이미/);
  assert.equal(api.saveMappings([cardA,cardB],storage).length,2);
});
test('known issuer+ending resolves; absent, ambiguous and generic BC never guesses a product',()=>{
  const identity=api.detectCardIdentity('[Web발신]\n신한카드(1234) 승인\n09/30 12:40\n승인금액 8,500원');
  assert.equal(api.resolveIdentity(identity,[cardA,cardB]).card.id,'a');
  for(const text of ['BC카드(1234) 승인','신한 삼성카드(1234) 승인','신한카드 승인','카드(1234) 승인','신한카드 1234567890123456 승인'])assert.equal(api.resolveIdentity(api.detectCardIdentity(text),[cardA,cardB]).card,null);
  assert.equal(api.resolveIdentity(identity,[cardA,{...cardA,id:'other'}]).card,null);
  assert.equal(api.resolveIdentity(identity,[]).card,null);
});
test('storage corruption or denial returns no automatic mappings',()=>{
  assert.equal(api.loadMappings({getItem:()=>'{broken'}).length,0);
  assert.equal(api.loadMappings({getItem:()=>{throw Error('denied')}}).length,0);
  assert.throws(()=>api.saveMappings([cardA],{setItem:()=>{throw Error('denied')}}),/저장하지/);
});
test('percentage comparison uses remaining cap and lists selection reason',()=>{
  const r=api.comparePurchase(purchase,[cardA,cardB],{a:profile,b:{...profile,rate:'3',used:'0'}});
  assert.equal(r.rows[0].benefit,500);assert.equal(r.rows[1].benefit,300);assert.deepEqual(Array.from(r.winners),['a']);assert.match(r.rows[0].reason,/남은 혜택 한도 500/);
});
test('ties are retained, no arbitrary best card',()=>{
  const r=api.comparePurchase(purchase,[cardA,cardB],{a:profile,b:profile});assert.deepEqual(Array.from(r.winners),['a','b']);
});
test('missing conditions stay uncalculated rather than inventing rates or caps',()=>{
  const r=api.comparePurchase(purchase,[cardA,cardB],{a:profile});assert.equal(r.rows[1].benefit,null);assert.equal(r.incomplete,true);
  for(const missing of [{rate:''},{capMode:''},{cap:''},{used:''},{confirmed:false},{previousConfirmed:false},{previousSpend:''}])assert.equal(api.comparePurchase(purchase,[cardA],{a:{...profile,...missing}}).rows[0].benefit,null);
});
test('previous month confirmed spend is mandatory, current spend cannot substitute',()=>{
  assert.equal(api.comparePurchase(purchase,[cardA],{a:{...profile,previousMonth:'2026-10',currentSpend:'900000'}}).rows[0].benefit,null);
  assert.equal(api.comparePurchase(purchase,[cardA],{a:{...profile,previousSpend:'100000',currentSpend:'900000'}}).rows[0].benefit,0);
  assert.equal(api.previousMonth('2026-01'),'2025-12');assert.equal(api.previousMonth('2026-13'),'');
});
test('bad amounts, negative or excessive rates/caps and cap-used inconsistency do not recommend',()=>{
  for(const amount of ['', '-1','1.5','1e3','1000000001'])assert.ok(api.comparePurchase({...purchase,amount},[cardA],{a:profile}).error);
  for(const bad of [{rate:'-1'},{rate:'101'},{used:'20001'},{cap:'0'},{previousSpend:'-1'},{minimum:'x'}])assert.equal(api.comparePurchase(purchase,[cardA],{a:{...profile,...bad}}).rows[0].benefit,null);
});
test('explicit no cap, unmatched merchant and exhausted cap are represented honestly',()=>{
  assert.equal(api.comparePurchase(purchase,[cardA],{a:{...profile,capMode:'none',cap:'',used:''}}).rows[0].benefit,1000);
  assert.equal(api.comparePurchase({...purchase,merchant:'마트'},[cardA],{a:profile}).rows[0].benefit,0);
  const exhausted=api.comparePurchase(purchase,[cardA],{a:{...profile,used:'20000'}});assert.equal(exhausted.rows[0].benefit,0);assert.equal(exhausted.winners.length,0);
});
