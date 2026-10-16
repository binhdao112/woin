import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {formatLuckySet,normaliseLuckySet} from '../dist/lucky-numbers.js';

test('one station action saves both draws once while copy stays enabled and never rerolls',async()=>{
 const source=await readFile(new URL('../dist/experience.js',import.meta.url),'utf8'),buttons=[],saved=[],copied=[];let draws=0;
 const node=tag=>({tag,children:[],textContent:'',style:{setProperty(){}},classList:{add(){},remove(){}},setAttribute(){},append(...children){this.children.push(...children);},querySelectorAll(selector){return this.children.flatMap(child=>[...(child.tag===selector?[child]:[]),...child.querySelectorAll(selector)]);}});
 const context={document:{createElement:node},intro(){},result:()=>node('div'),button:(text,onclick)=>{const button=node('button');Object.assign(button,{textContent:text,onclick});buttons.push(button);return button;},navigator:{clipboard:{writeText:async text=>copied.push(text)}},drawLuckyBundle:()=>{draws++;return {number:'07',luckySet:[1,9,18,24,37,45]};},formatLuckySet,personal:text=>text,meanings:Array(9).fill('Một lời nhắc vui'),stationContext:{station:3},stationReady:(result,number,luckySet)=>{saved.push({result,number,luckySet});buttons.forEach(button=>button.disabled=true);},celebrate(){}};
 const start=source.indexOf('function renderNumber('),end=source.indexOf('\nconst wheelItems=',start);vm.runInNewContext(source.slice(start,end),context);
 const area=node('div');context.renderNumber(area);const draw=buttons.find(button=>button.textContent.startsWith('Nhận số')),copy=buttons.find(button=>button.textContent==='Chép bộ số');
 assert.equal(copy.disabled,true);draw.onclick();assert.equal(saved.length,1);assert.equal(saved[0].number,'07');assert.deepEqual(saved[0].luckySet,[1,9,18,24,37,45]);assert.equal(copy.disabled,false);
 await copy.onclick();assert.match(copied[0],/01 · 09 · 18 · 24 · 37 · 45/);assert.equal(draws,1);draw.onclick();assert.equal(draws,1);
});

test('collection receives a validated structured set and ignores duplicate station results',async()=>{
 const source=await readFile(new URL('../dist/app.js',import.meta.url),'utf8'),start=source.indexOf("window.addEventListener('station-result'"),end=source.indexOf('\n',start);
 let handler,saved;const gifts=new Map(),context={window:{addEventListener:(type,callback)=>handler=callback},index:3,keepsakeCollection:gifts,normaliseLuckySet,collectGift:(station,data)=>{saved=data;gifts.set(station,data);}};
 vm.runInNewContext(source.slice(start,end),context);handler({detail:{station:3,number:'07',result:'Bốc vui',luckySet:[45,37,24,18,9,1]}});
 assert.deepEqual(saved.luckySet,[1,9,18,24,37,45]);handler({detail:{station:3,number:'99',luckySet:[1,2,3,4,5,6]}});assert.equal(saved.number,'07');
});
