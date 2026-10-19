import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';

test('single number and six-number set can be drawn independently for the two-tap flow',async()=>{
 const {drawLuckyNumber,drawLuckySet}=await import('../dist/lucky-numbers.js');
 let calls=0;assert.equal(drawLuckyNumber(()=>{calls++;return 0;}),'01');assert.equal(calls,1);
 assert.equal(drawLuckyNumber(max=>max-1),'99');assert.deepEqual(drawLuckySet(()=>0),[1,2,3,4,5,6]);assert.deepEqual(drawLuckySet(max=>max-1),[40,41,42,43,44,45]);
});

test('a lucky bundle keeps the 01–99 number and draws six unique sorted values from 01–45',async()=>{
 const {drawLuckyBundle,randomBelow}=await import('../dist/lucky-numbers.js');
 assert.deepEqual(drawLuckyBundle(()=>0),{number:'01',luckySet:[1,2,3,4,5,6]});
 assert.deepEqual(drawLuckyBundle(max=>max-1),{number:'99',luckySet:[40,41,42,43,44,45]});
 for(let run=0;run<300;run++){
  const result=drawLuckyBundle(max=>randomBelow(max,webcrypto));
  assert.match(result.number,/^(?:0[1-9]|[1-9][0-9])$/);
  assert.equal(result.luckySet.length,6);assert.equal(new Set(result.luckySet).size,6);
  assert.ok(result.luckySet.every((value,index,array)=>Number.isInteger(value)&&value>=1&&value<=45&&(index===0||value>array[index-1])));
 }
});

test('random integers reject biased high values before mapping to a range',async()=>{
 const {randomBelow}=await import('../dist/lucky-numbers.js');let calls=0;
 const crypto={getRandomValues(array){array[0]=calls++===0?0xffffffff:44;return array;}};
 assert.equal(randomBelow(45,crypto),44);assert.equal(calls,2);
 for(const max of [0,-1,2.5,0x100000001])assert.throws(()=>randomBelow(max,crypto),RangeError);
 assert.equal(randomBelow(1,crypto),0);
 const hadCrypto=Boolean(globalThis.crypto);if(!hadCrypto)globalThis.crypto=webcrypto;
 try { assert.equal((await import('../dist/lucky-numbers.js')).drawLuckyBundle().luckySet.length,6); } finally {if(!hadCrypto)delete globalThis.crypto;}
});

test('stored sets normalize without mutation and reject corrupt or old unsupported data',async()=>{
 const {normaliseLuckySet,formatLuckySet}=await import('../dist/lucky-numbers.js');
 const input=[45,1,22,9,30,16];assert.deepEqual(normaliseLuckySet(input),[1,9,16,22,30,45]);assert.equal(input[0],45);
 assert.equal(formatLuckySet(input),'01 · 09 · 16 · 22 · 30 · 45');
 for(const value of [undefined,null,'01 02 03 04 05 06',[],[1,2,3,4,5,5],[0,2,3,4,5,6],[1,2,3,4,5,46],[1,2,3,4,5,'6'],[1,2,3,4,5,6,7]]){
  assert.equal(normaliseLuckySet(value),undefined);assert.equal(formatLuckySet(value),'');
 }
});
