import test from 'node:test';
import assert from 'node:assert/strict';
import {drinkCounterFixture} from './helpers/drink-counter-fixture.js';
import {createSheetsFixture} from './helpers/sheets-fixture.js';
const a='Châu Kim Nhẩn - NhanCk',b='Nguyễn Thị Kim Thảo - ThaoNTK';

test('no default cup: explicit choices for two people create separate Sheets rows, and an edit updates only its owner',async t=>{
 const backend=await createSheetsFixture(),f=await drinkCounterFixture(t,{transport:({payload})=>backend.post(payload)});
 assert.equal(backend.sheets.get('Đăng ký').rows.length,1);
 await f.counter.open(a,'member:NhanCk');assert.equal(f.get('drink-counter').dataset.drinkStep,'menu');assert.equal(f.get('drink-submit').disabled,true);assert.equal(f.get('drink-continue').hidden,true);assert.equal(f.calls.length,0);
 await f.submit();assert.equal(f.calls.length,0);assert.equal(f.keeps.length,0);
 f.choose();assert.equal(f.get('drink-counter').dataset.drinkStep,'options');await f.submit();assert.equal(f.get('drink-continue').hidden,false);assert.equal(f.keeps.length,0);
 f.get('drink-continue').onclick();assert.equal(f.keeps[0].meta.profileKey,'member:NhanCk');assert.equal(f.keeps[0].meta.synced,true);
 await f.counter.open(b,'member:ThaoNTK');assert.equal(f.get('drink-counter').dataset.drinkStep,'menu');assert.equal(f.get('drink-submit').disabled,true);assert.equal(f.calls.length,1);assert.equal(backend.sheets.get('Đăng ký').rows.length,2);
 f.choose();await f.submit();assert.equal(backend.sheets.get('Đăng ký').rows.length,3);assert.notEqual(f.calls[0].participantId,f.calls[1].participantId);
 await f.counter.open('Nhân cute','member:NhanCk');assert.equal(f.get('drink-name').value,a);assert.equal(f.get('drink-name').readOnly,true);assert.equal(f.get('drink-counter').dataset.drinkStep,'options');assert.equal(f.get('drink-continue').hidden,false);
 f.get('drink-sugar').value='0%';f.get('drink-order-form').oninput();assert.equal(f.get('drink-continue').hidden,true);await f.submit();assert.equal(f.calls[2].participantId,f.calls[0].participantId);assert.equal(f.calls[2].name,a);assert.equal(backend.sheets.get('Đăng ký').rows.length,3);
 await f.counter.open(b,'member:ThaoNTK');assert.equal(f.get('drink-sugar').value,'Mặc định');assert.equal(f.counter.getSavedConfirmed(b,'member:ThaoNTK').sugar,'Mặc định');
});

test('a late receipt after switching people confirms its own store without assigning a cup or success to the new person',async t=>{
 let accept;const f=await drinkCounterFixture(t,{transport:()=>new Promise(resolve=>{accept=resolve;})});
 await f.counter.open(a,'member:NhanCk');f.choose();const sending=f.submit(),payload=f.calls[0];
 f.get('drink-close').onclick();await f.counter.open(b,'member:ThaoNTK');assert.equal(f.get('drink-submit').disabled,true);
 accept({status:'accepted',requestId:payload.requestId,sequence:payload.sequence});await sending;
 assert.equal(f.get('drink-continue').hidden,true);assert.equal(f.get('drink-submit').disabled,true);assert.match(f.get('drink-order-status').textContent,/Chưa chọn nước/);assert.equal(f.counter.getSavedConfirmed(b,'member:ThaoNTK'),null);
 await f.counter.open(a,'member:NhanCk');assert.equal(f.get('drink-continue').hidden,false);assert.match(f.get('drink-footer-choice').textContent,/.+/);assert.equal(f.keeps.length,0);
});

test('uncertain sends stay pending across reopening, block continuation, and retry the exact request',async t=>{
 let failed=true;const f=await drinkCounterFixture(t,{transport:({payload})=>{if(failed)throw Error('Chưa xác nhận');return {status:'accepted',requestId:payload.requestId,sequence:payload.sequence};}});
 await f.counter.open(a,'member:NhanCk');f.choose();await f.submit();assert.equal(f.get('drink-continue').hidden,true);f.get('drink-continue').onclick();assert.equal(f.keeps.length,0);
 f.get('drink-close').onclick();await f.counter.open(a,'member:NhanCk');assert.equal(f.get('drink-counter').dataset.drinkStep,'options');assert.match(f.get('drink-order-status').textContent,/chưa được xác nhận/);
 failed=false;await f.submit();assert.deepEqual(f.calls[1],f.calls[0]);assert.equal(f.get('drink-continue').hidden,false);
});
