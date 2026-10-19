import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {formatLuckySet,normaliseLuckySet} from '../dist/lucky-numbers.js';

const quote='Muốn trúng số, việc đầu tiên là phải mua vé số. Thế thôi! Chúc chị em may mắn 8386';
function fixture(){
 const document={createElement(tag){return {tag,children:[],attrs:{},hidden:false,disabled:false,textContent:'',className:'',style:{setProperty(){}},classList:{add(){},remove(){}},setAttribute(k,v){this.attrs[k]=String(v);},append(...children){for(const c of children){c.parent=this;this.children.push(c);}},focus(){document.activeElement=this;}};}};
 const area=document.createElement('section');area.ownerDocument=document;
 const walk=node=>[node,...node.children.flatMap(walk)];
 const find=cls=>walk(area).find(n=>n.className.split(' ').includes(cls));
 const visible=node=>!!node&&!node.hidden&&(!node.parent||visible(node.parent));
 const saved=[],copied=[];let singles=0,sets=0,sparkles=0;
 const options={drawNumber:()=>{singles++;return '07';},drawSet:()=>{sets++;return [1,9,18,24,37,45];},clipboard:{writeText:async text=>copied.push(text)},celebrate:()=>sparkles++,onComplete:data=>{saved.push(data);walk(area).filter(n=>n.tag==='button').forEach(b=>b.disabled=true);}};
 return {area,document,find,visible,saved,copied,options,counts:()=>({singles,sets,sparkles})};
}

test('first tap draws only the single number and exposes a closed ticket; second tap saves both once',async()=>{
 const {mountLuckyNumber}=await import('../dist/lucky-number-studio.js');const f=fixture();mountLuckyNumber(f.area,f.options);
 const orb=f.find('lucky-orb'),ticket=f.find('lucky-ticket-open'),numbers=f.find('lucky-set-balls'),copy=f.find('lucky-set-copy');
 assert.equal(f.visible(orb),true);assert.equal(f.visible(ticket),false);assert.equal(f.visible(numbers),false);assert.equal(f.visible(copy),false);
 ticket.onclick();assert.deepEqual(f.counts(),{singles:0,sets:0,sparkles:0});
 orb.onclick();assert.deepEqual(f.counts(),{singles:1,sets:0,sparkles:1});assert.equal(f.saved.length,0);
 assert.equal(f.visible(orb),false);assert.equal(f.visible(ticket),true);assert.equal(f.visible(numbers),false);assert.match(f.find('lucky-single').textContent,/07/);assert.equal(f.document.activeElement,ticket);
 orb.onclick();assert.equal(f.counts().singles,1);
 ticket.onclick();assert.equal(f.saved.length,1);assert.equal(f.saved[0].number,'07');assert.deepEqual(f.saved[0].luckySet,[1,9,18,24,37,45]);assert.match(f.saved[0].result,/Số 07/);
 assert.equal(f.visible(ticket),false);assert.equal(f.visible(numbers),true);assert.equal(f.visible(copy),true);assert.equal(copy.disabled,false);assert.equal(f.find('lucky-ticket-quote').textContent,quote);assert.equal(f.document.activeElement,copy);
 assert.deepEqual(numbers.children.map(n=>n.textContent),['01','09','18','24','37','45']);
 ticket.onclick();orb.onclick();assert.equal(f.saved.length,1);assert.deepEqual(f.counts(),{singles:1,sets:1,sparkles:2});
 await copy.onclick();assert.match(f.copied[0],/01 · 09 · 18 · 24 · 37 · 45/);assert.ok(f.copied[0].includes(quote));assert.equal(f.counts().sets,1);
});

test('copy is unavailable before the ticket opens and clipboard failure allows retry without another draw',async()=>{
 const {mountLuckyNumber}=await import('../dist/lucky-number-studio.js');const f=fixture();mountLuckyNumber(f.area,f.options);
 const copy=f.find('lucky-set-copy');await copy.onclick();assert.equal(f.copied.length,0);
 f.find('lucky-orb').onclick();f.find('lucky-ticket-open').onclick();
 f.options.clipboard.writeText=async()=>{throw Error('clipboard denied');};await copy.onclick();assert.equal(copy.disabled,false);assert.match(f.find('lucky-status').textContent,/Chưa chép được/);
 f.options.clipboard.writeText=async text=>f.copied.push(text);await copy.onclick();assert.equal(f.copied.length,1);assert.equal(f.saved.length,1);assert.equal(f.counts().sets,1);
});

test('the standalone number experience uses the real random helpers and completes without a station callback',async()=>{
 const {mountLuckyNumber}=await import('../dist/lucky-number-studio.js');const f=fixture();mountLuckyNumber(f.area,{clipboard:f.options.clipboard});
 f.find('lucky-orb').onclick();f.find('lucky-ticket-open').onclick();const values=f.find('lucky-set-balls').children.map(n=>Number(n.textContent));
 assert.equal(new Set(values).size,6);assert.ok(values.every(n=>n>=1&&n<=45));assert.match(f.find('lucky-single').textContent,/\b(?:0[1-9]|[1-9][0-9])\b/);
});

test('experience wires completion after opening the ticket even though stationReady locks all game buttons',async()=>{
 const source=await readFile(new URL('../dist/experience.js',import.meta.url),'utf8');let complete;const saved=[];
 const f=fixture(),context={document:f.document,intro(){},result:()=>f.document.createElement('div'),button:(text,onclick)=>Object.assign(f.document.createElement('button'),{textContent:text,onclick}),mountLuckyNumber:(area,options)=>complete=options.onComplete,stationReady:(...data)=>saved.push(data),celebrate(){}};
 const start=source.indexOf('function renderNumber('),end=source.indexOf('\nconst wheelItems=',start);vm.runInNewContext(source.slice(start,end),context);context.renderNumber(f.area);assert.equal(typeof complete,'function','number UI must wire the new two-step completion');
 complete({number:'07',luckySet:[1,9,18,24,37,45],result:'Hai lượt bấm'});assert.deepEqual(saved[0],['Hai lượt bấm','07',[1,9,18,24,37,45]]);
});

test('collection receives a validated structured set and ignores duplicate station results',async()=>{
 const source=await readFile(new URL('../dist/app.js',import.meta.url),'utf8'),start=source.indexOf("window.addEventListener('station-result'"),end=source.indexOf('\n',start);
 let handler,saved;const gifts=new Map(),context={window:{addEventListener:(type,callback)=>handler=callback},index:3,keepsakeCollection:gifts,normaliseLuckySet,collectGift:(station,data)=>{saved=data;gifts.set(station,data);}};
 vm.runInNewContext(source.slice(start,end),context);handler({detail:{station:3,number:'07',result:'Bốc vui',luckySet:[45,37,24,18,9,1]}});
 assert.deepEqual(saved.luckySet,[1,9,18,24,37,45]);handler({detail:{station:3,number:'99',luckySet:[1,2,3,4,5,6]}});assert.equal(saved.number,'07');
});
