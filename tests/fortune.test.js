import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile(new URL('../dist/experience.js',import.meta.url),'utf8');
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}

test('fortune results are withheld until the shake finishes',()=>{
  const nodes=[];let saved=0,complete;
  const element=()=>({className:'',classList:{add(){},remove(){}},setAttribute(){},removeAttribute(){},style:{},append(){},replaceChildren(){},animate(){return {finished:Promise.resolve(),cancel(){}};}});
  const area=element();area.append=(...items)=>nodes.push(...items);
  const context={document:{createElement:element},intro(){},result:element,button:(text,fn)=>({textContent:text,onclick:fn}),pick:a=>a[0],fortunes:[['Cát','Thông điệp']],personal:x=>x,stationReady:()=>saved++,celebrate(){},stationContext:{station:5},currentTab:'fortune',hub:{open:true},matchMedia:()=>({matches:false}),activeFortuneCancel:null,playFortuneDraw:(node,options)=>{complete=options.onReveal;return {cancel(){},finished:Promise.resolve()};}};
  const start=source.indexOf('function renderFortune('),end=source.indexOf('\nfunction renderNumber(',start);
  vm.runInNewContext(source.slice(start,end),context);
  context.renderFortune(area);nodes.at(-1).onclick();
  assert.equal(saved,0,'do not save or resize the result while the tube starts shaking');
  complete();assert.equal(saved,1);
});

test('animation completion reveals once; cancelling suppresses late results',async()=>{
  const {playFortuneDraw}=await import('../dist/fortune-animation.js');
  const motion=deferred();let reveals=0,cancels=0;
  const run=playFortuneDraw({animate:()=>({finished:motion.promise,cancel(){cancels++;}})},{onReveal:()=>reveals++});
  assert.equal(reveals,0);motion.resolve();assert.equal(await run.finished,true);assert.equal(reveals,1);
  const second=deferred();const cancelled=playFortuneDraw({animate:()=>({finished:second.promise,cancel(){cancels++;}})},{onReveal:()=>reveals++});
  cancelled.cancel();second.resolve();assert.equal(await cancelled.finished,false);assert.equal(reveals,1);assert.ok(cancels>=1);
});

test('reduced motion and browsers without animate still produce a result',async()=>{
  const {playFortuneDraw}=await import('../dist/fortune-animation.js');
  let revealed=0;
  const run=playFortuneDraw({animate(){throw Error('motion must be skipped');}},{reducedMotion:true,onReveal:()=>revealed++});
  await run.finished;await playFortuneDraw({}, {onReveal:()=>revealed++}).finished;assert.equal(revealed,2);
  const rejected=playFortuneDraw({animate:()=>({finished:Promise.reject(Error('cancelled')),cancel(){}})},{onReveal:()=>revealed++});
  assert.equal(await rejected.finished,false);assert.equal(revealed,2);
});
