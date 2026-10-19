import test from 'node:test';
import assert from 'node:assert/strict';
const identity='e88eeec0-bbbd-49ad-a570-958d82fdc8fb',request='c6ba67ed-e609-494e-ae98-de202118d799';
const memory=()=>{const values=new Map();return {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};};
const people=[{profileKey:'member:NhanCk',name:'Châu Kim Nhẩn - NhanCk'},{profileKey:'member:ThaoNTK',name:'Nguyễn Thị Kim Thảo - ThaoNTK'}];
test('each selected participant starts without a drink and never inherits another person on the same browser',async()=>{
 const {createDrinkRegistrationStore}=await import('../dist/drink-registration.js'),storage=memory();
 const a=createDrinkRegistrationStore(storage,'team',undefined,()=>100,people[0]);
 const first=a.prepare({name:people[0].name,variantId:'milk'});a.confirm({status:'accepted',requestId:first.requestId,sequence:first.sequence});
 const b=createDrinkRegistrationStore(storage,'team',undefined,()=>200,people[1]);
 assert.equal(b.read().confirmed,null);assert.equal(b.read().pending,null);assert.notEqual(b.read().participantId,a.read().participantId);assert.notEqual(a.key,b.key);
 assert.equal(createDrinkRegistrationStore(storage,'team',undefined,()=>300,people[0]).read().confirmed.variantId,'milk');
});
test('legacy order migrates only to its owner, preserving the original ID and pending retry',async()=>{
 const {createDrinkRegistrationStore}=await import('../dist/drink-registration.js'),storage=memory();
 const old=createDrinkRegistrationStore(storage,'team',()=>identity,()=>100),pending=old.prepare({name:people[0].name,variantId:'milk'});
 const b=createDrinkRegistrationStore(storage,'team',undefined,()=>200,people[1]);assert.equal(b.read().pending,null);assert.notEqual(b.read().participantId,identity);
 const a=createDrinkRegistrationStore(storage,'team',undefined,()=>300,people[0]);assert.equal(a.read().participantId,identity);assert.deepEqual(a.read().pending,pending);
 assert.deepEqual(a.prepare({name:people[0].name,variantId:'other'}),pending);
 assert.equal(old.read().pending.requestId,pending.requestId);
});
test('one legacy identity cannot be claimed by two profiles with the same display name',async()=>{
 const {createDrinkRegistrationStore}=await import('../dist/drink-registration.js'),storage=memory();
 const old=createDrinkRegistrationStore(storage,'team',()=>identity,()=>100),pending=old.prepare({name:people[0].name,variantId:'milk'});old.confirm({status:'accepted',requestId:pending.requestId,sequence:100});
 const a=createDrinkRegistrationStore(storage,'team',undefined,()=>200,people[0]);
 const guest=createDrinkRegistrationStore(storage,'team',undefined,()=>300,{profileKey:'guest:'+request,name:people[0].name});
 assert.equal(a.read().participantId,identity);assert.equal(guest.read().confirmed,null);assert.notEqual(guest.read().participantId,identity);
});
test('pending drink survives reload and retry reuses the identical request instead of an extra cup',async()=>{
 const {createDrinkRegistrationStore}=await import('../dist/drink-registration.js'),storage=memory();let ids=0;
 const createId=()=>ids++?request:identity;
 const store=createDrinkRegistrationStore(storage,'team',createId,()=>100),first=store.prepare({name:'An',variantId:'small'});
 const restored=createDrinkRegistrationStore(storage,'team',createId,()=>200);
 assert.deepEqual(restored.prepare({name:'An',variantId:'changed'}),first);
 assert.throws(()=>restored.confirm({status:'accepted',requestId:'wrong',sequence:100}));
 restored.confirm({status:'accepted',requestId:request,sequence:100});
 assert.equal(store.read().pending,null);assert.equal(store.read().confirmed.variantId,'small');
 const updated=store.prepare({name:'An',variantId:'changed'});assert.equal(updated.participantId,identity);assert.ok(updated.sequence>first.sequence);
});
test('registration state is isolated by event and never pretends persistence succeeded',async()=>{
 const {createDrinkRegistrationStore}=await import('../dist/drink-registration.js');let n=0;
 const ids=()=>[identity,request][n++%2],storage=memory();
 const a=createDrinkRegistrationStore(storage,'event-a',ids,()=>100),b=createDrinkRegistrationStore(storage,'event-b',ids,()=>100);
 a.prepare({name:'An'});assert.equal(b.read().pending,null);
 a.reject();assert.equal(a.read().pending,null);
 assert.throws(()=>createDrinkRegistrationStore({getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}},'event',ids));
});
