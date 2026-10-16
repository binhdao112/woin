import test from 'node:test';
import assert from 'node:assert/strict';
import {createSheetsFixture as backend} from './helpers/sheets-fixture.js';
import {readFile} from 'node:fs/promises';

test('Apps Script artifact stays synchronized with the exact menu and validation used by the website',async()=>{
 const {buildDrinkSheetsBundle}=await import('../scripts/prepare-drink-sheets.mjs');
 assert.equal(await readFile(new URL('../integrations/google-sheets/Code.gs',import.meta.url),'utf8'),await buildDrinkSheetsBundle());
});

test('Sheets backend accepts one row, overwrites edits and summarizes exact cup variants',async()=>{
 const b=await backend();assert.equal(b.post(b.payload).status,'accepted');assert.equal(b.sheets.get('Đăng ký').rows.length,2);
 assert.equal(b.post(b.payload).status,'accepted');assert.equal(b.sheets.get('Đăng ký').rows.length,2);
 const newer={...b.payload,sequence:2,requestId:'2029d92d-7934-4c2e-b0e4-d41c7e20a8f0',sugar:'0%',price:1};assert.equal(b.post(newer).status,'accepted');assert.equal(b.sheets.get('Đăng ký').rows.length,2);
 assert.equal(b.post(b.payload).code,'stale');assert.ok(b.sheets.get('Tổng hợp').rows.flat().includes('0%'));assert.ok(!b.sheets.get('Tổng hợp').rows.flat().includes('50%'));
});

test('Sheets backend refuses closed/foreign/invalid orders and does not expose registrations via JSONP',async()=>{
 const b=await backend();b.props.set('ORDERS_OPEN','false');assert.equal(b.post(b.payload).code,'closed');assert.equal(b.sheets.get('Đăng ký').rows.length,1);
 b.props.set('ORDERS_OPEN','true');assert.equal(b.post({...b.payload,eventId:'another-event'}).status,'rejected');assert.equal(b.post({...b.payload,variantId:'forged'}).status,'rejected');
 assert.equal(b.post({...b.payload,name:'=IMPORTXML("bad")'}).status,'accepted');assert.ok(b.sheets.get('Đăng ký').rows[1].some(cell=>String(cell).startsWith("'=")));
 const result=b.context.doGet({parameter:{action:'receipt',requestId:b.payload.requestId,callback:'__koiReceipt_test'}}).text;assert.match(result,/accepted/);assert.ok(!result.includes('IMPORTXML'));assert.ok(!result.includes('participantId'));
 assert.doesNotMatch(b.context.doGet({parameter:{action:'receipt',requestId:b.payload.requestId,callback:'alert(1)'}}).text,/alert\(1\)/);
 assert.ok(!b.context.doGet({parameter:{action:'list'}}).text.includes('IMPORTXML'));
});

test('an interrupted summary write stays unconfirmed and retry repairs it without another row',async()=>{
 const b=await backend(),summary=b.sheets.get('Tổng hợp'),getRange=summary.getRange.bind(summary);
 summary.getRange=()=>{throw Error('Sheets unavailable');};
 assert.equal(b.post(b.payload).status,'pending');assert.equal(b.sheets.get('Đăng ký').rows.length,2);
 summary.getRange=getRange;assert.equal(b.post(b.payload).status,'accepted');assert.equal(b.sheets.get('Đăng ký').rows.length,2);
 b.props.set('ORDERS_OPEN','false');assert.equal(b.post(b.payload).status,'accepted');
});

test('malformed payloads, stale menu, full events and lock contention never append orders',async()=>{
 const b=await backend();
 assert.equal(JSON.parse(b.context.doPost({postData:{contents:'not json'}}).text).status,'rejected');
 assert.equal(b.post({...b.payload,requestId:'bad'}).status,'rejected');
 assert.equal(b.post({...b.payload,menuVersion:'old'}).code,'menu');
 assert.equal(b.sheets.get('Đăng ký').rows.length,1);
 b.context.LockService.getScriptLock=()=>({tryLock:()=>false});assert.equal(b.post(b.payload).status,'pending');assert.equal(b.sheets.get('Đăng ký').rows.length,1);
 const full=await backend();full.sheets.get('Đăng ký').rows=Array.from({length:501},()=>[]);assert.equal(full.post(full.payload).code,'full');assert.equal(full.sheets.get('Đăng ký').rows.length,501);
});
