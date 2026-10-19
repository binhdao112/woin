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
 f.get('drink-close').onclick();await f.counter.open(b,'member:ThaoNTK');assert.equal(f.get('drink-submit').disabled,true);assert.equal(f.get('drink-loading').hidden,true);
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

test('loading remains visible until the receipt arrives and repeated taps never create an extra send',async t=>{
 let accept;const f=await drinkCounterFixture(t,{transport:()=>new Promise(resolve=>{accept=resolve;})});
 await f.counter.open(a,'member:NhanCk');f.choose();assert.equal(f.get('drink-loading')?.hidden,true);
 const sending=f.submit(),payload=f.calls[0];assert.equal(f.get('drink-loading').hidden,false);assert.equal(f.get('drink-order-form').attrs['aria-busy'],'true');assert.equal(f.get('drink-submit').disabled,true);assert.equal(f.get('drink-continue').hidden,true);
 await f.submit();assert.equal(f.calls.length,1);assert.equal(f.keeps.length,0);
 accept({status:'accepted',requestId:payload.requestId,sequence:payload.sequence});await sending;
 assert.equal(f.get('drink-loading').hidden,true);assert.equal(f.get('drink-order-form').attrs['aria-busy'],'false');assert.equal(f.get('drink-continue').hidden,false);assert.match(f.get('drink-order-status').textContent,/Đã ghi nhận/);
});

test('loading stops on an uncertain error and starts again for the same pending request on retry',async t=>{
 let rejectSend,accept;let failing=true;const f=await drinkCounterFixture(t,{transport:()=>new Promise((resolve,reject)=>{if(failing)rejectSend=reject;else accept=resolve;})});
 await f.counter.open(a,'member:NhanCk');f.choose();const first=f.submit();assert.equal(f.get('drink-loading')?.hidden,false);
 rejectSend(Error('Chưa xác nhận được kết nối'));await first;
 assert.equal(f.get('drink-loading').hidden,true);assert.equal(f.get('drink-continue').hidden,true);assert.equal(f.get('drink-submit').disabled,false);assert.match(f.get('drink-order-status').textContent,/Chưa xác nhận/);
 failing=false;const retry=f.submit();assert.equal(f.get('drink-loading').hidden,false);assert.deepEqual(f.calls[1],f.calls[0]);
 accept({status:'accepted',requestId:f.calls[1].requestId,sequence:f.calls[1].sequence});await retry;assert.equal(f.get('drink-loading').hidden,true);
});

test('full image menu opens over the counter, allows reading and returns without changing or submitting the selected drink',async t=>{
 const f=await drinkCounterFixture(t);await f.counter.open(a,'member:NhanCk');f.choose();f.get('drink-note').value='Ít ngọt nhé';
 const before=f.get('drink-footer-choice').textContent,open=f.get('drink-menu-full-open');assert.equal(typeof open?.onclick,'function');
 Object.assign(f.get('drink-menu-full-viewport'),{clientWidth:320,clientHeight:400,scrollLeft:0,scrollTop:0});
 open.onclick();assert.equal(f.get('drink-menu-full').open,true);assert.equal(f.get('drink-counter').open,true);assert.equal(f.calls.length,0);
 assert.equal(f.get('drink-menu-full-zoom-out').disabled,true);f.get('drink-menu-full-zoom-in').onclick();assert.ok(parseFloat(f.get('drink-menu-full-image').style.width)>320);
 f.get('drink-menu-full-close').onclick();assert.equal(f.get('drink-menu-full').open,false);assert.equal(f.get('drink-counter').open,true);assert.equal(f.get('drink-footer-choice').textContent,before);assert.equal(f.get('drink-note').value,'Ít ngọt nhé');assert.equal(f.calls.length,0);
 open.onclick();assert.equal(f.get('drink-menu-full-zoom-out').disabled,true);assert.equal(f.get('drink-menu-full-viewport').scrollLeft,0);
});

test('menu image zoom is bounded, native close restores focus, and an image failure can recover',async t=>{
 const f=await drinkCounterFixture(t);await f.counter.open(a,'member:NhanCk');const open=f.get('drink-menu-full-open');assert.equal(typeof open?.onclick,'function');
 const viewport=f.get('drink-menu-full-viewport'),image=f.get('drink-menu-full-image');Object.assign(viewport,{clientWidth:320,clientHeight:400,scrollLeft:0,scrollTop:0});open.onclick();
 for(let i=0;i<10;i++)f.get('drink-menu-full-zoom-in').onclick();assert.equal(f.get('drink-menu-full-zoom-in').disabled,true);assert.ok(parseFloat(image.style.width)<=320*8);
 f.get('drink-menu-full-reset').onclick();assert.equal(parseFloat(image.style.width),320);assert.equal(f.get('drink-menu-full-zoom-out').disabled,true);
 image.onerror();assert.equal(f.get('drink-menu-full-error').hidden,false);image.onload();assert.equal(f.get('drink-menu-full-error').hidden,true);
 // Closing with Escape is a native dialog close event, rather than the explicit close button.
 f.get('drink-menu-full').close();assert.equal(open.ownerDocument.activeElement,open);assert.equal(f.calls.length,0);assert.equal(f.keeps.length,0);
});

test('enlarged menu supports mouse panning, leaves touch to native scrolling, and fits again on resize',async t=>{
 const f=await drinkCounterFixture(t);await f.counter.open(a,'member:NhanCk');const viewport=f.get('drink-menu-full-viewport');Object.assign(viewport,{clientWidth:320,clientHeight:400,scrollLeft:0,scrollTop:0});f.get('drink-menu-full-open').onclick();
 const event={pointerType:'mouse',button:0,pointerId:7,clientX:80,clientY:100,preventDefault(){}};
 viewport.onpointerdown(event);viewport.onpointermove({...event,clientX:30,clientY:50});assert.equal(viewport.scrollLeft,0);
 f.get('drink-menu-full-zoom-in').onclick();viewport.scrollLeft=100;viewport.scrollTop=200;
 viewport.onpointerdown({...event,pointerType:'touch',preventDefault(){throw Error('touch must use native scrolling');}});viewport.onpointermove({...event,clientX:30});assert.equal(viewport.scrollLeft,100);
 viewport.onpointerdown(event);viewport.onpointermove({...event,pointerId:8,clientX:30});assert.equal(viewport.scrollLeft,100);
 viewport.onpointermove({...event,clientX:30,clientY:50});assert.equal(viewport.scrollLeft,150);assert.equal(viewport.scrollTop,250);assert.equal(viewport.ownerDocument.activeElement,viewport);
 viewport.onpointerup();viewport.onpointermove({...event,clientX:0});assert.equal(viewport.scrollLeft,150);viewport.onpointercancel();viewport.onlostpointercapture();
 f.get('drink-menu-full-reset').onclick();viewport.clientWidth=280;f.events.get('image-resize')();assert.equal(parseFloat(f.get('drink-menu-full-image').style.width),280);
 f.get('drink-menu-full-close').onclick();f.events.get('image-resize')();assert.equal(f.calls.length,0);
});
