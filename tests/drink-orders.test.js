import test from 'node:test';
import assert from 'node:assert/strict';

const menu={version:'2026-10-16',items:[{id:'milk',name:'Hồng Trà Sữa',category:'milk-tea',variants:[{id:'milk-small',label:'Nhỏ',temperature:'cold',price:57000},{id:'milk-medium',label:'Vừa',temperature:'cold',price:76000}]},{id:'hot',name:'Trà Sữa Ngũ Cốc Rang',category:'new',variants:[{id:'hot-cup',label:'Nóng',temperature:'hot',price:83000}]}]};
const id='e88eeec0-bbbd-49ad-a570-958d82fdc8fb';
const base={eventId:'team-2010',menuVersion:menu.version,participantId:id,requestId:'c6ba67ed-e609-494e-ae98-de202118d799',sequence:1,name:' Minh Anh ',variantId:'milk-small',sugar:'50%',ice:'Ít đá',note:' Ít ngọt nhé '};

test('drink registration uses catalog prices and exact variant, ignoring submitted price/name',async()=>{
 const {validateDrinkOrder}=await import('../dist/drink-orders.js');
 const order=validateDrinkOrder(menu,{...base,price:1,itemName:'Món giả'});
 assert.equal(order.price,57000);assert.equal(order.itemName,'Hồng Trà Sữa');assert.equal(order.size,'Nhỏ');assert.equal(order.name,'Minh Anh');assert.equal(order.quantity,1);
});

test('drink registration rejects missing name, forged options, identifiers and stale menus',async()=>{
 const {validateDrinkOrder}=await import('../dist/drink-orders.js');
 for(const patch of [{name:''},{name:'A'.repeat(41)},{variantId:'missing'},{sugar:'500%'},{ice:'Tùy ý'},{participantId:'person'},{requestId:'bad'},{sequence:0},{sequence:1.2},{note:'x'.repeat(161)},{menuVersion:'old'}])assert.throws(()=>validateDrinkOrder(menu,{...base,...patch}));
 const hot=validateDrinkOrder(menu,{...base,variantId:'hot-cup'});assert.equal(hot.ice,'Không áp dụng');
});

test('order summary updates the same participant once and keeps equal names as separate people',async()=>{
 const {validateDrinkOrder,aggregateDrinkOrders}=await import('../dist/drink-orders.js');
 const first=validateDrinkOrder(menu,base),changed=validateDrinkOrder(menu,{...base,sequence:2,variantId:'milk-medium'});
 const second=validateDrinkOrder(menu,{...base,participantId:'cc8b5040-aefd-4620-8033-d2b74314b2f8',sequence:3});
 const result=aggregateDrinkOrders([changed,first,second]);
 assert.equal(result.totalCups,2);assert.equal(result.totalPrice,133000);assert.equal(result.groups.length,2);
 assert.equal(aggregateDrinkOrders([first,{...first,participantId:second.participantId}]).groups[0].quantity,2);
});

test('summary separates sugar, ice and special requests instead of grouping unlike cups',async()=>{
 const {validateDrinkOrder,aggregateDrinkOrders}=await import('../dist/drink-orders.js');
 const first=validateDrinkOrder(menu,base);
 const orders=[first,{...first,participantId:'two',sugar:'0%'},{...first,participantId:'three',ice:'Không đá'},{...first,participantId:'four',note:'Thêm topping nếu có'}];
 assert.equal(aggregateDrinkOrders(orders).groups.length,4);
});

test('menu search matches Vietnamese without accents and sheet cells neutralize formulas',async()=>{
 const {searchDrinks,sheetText,drinkLabel}=await import('../dist/drink-orders.js');
 assert.equal(searchDrinks(menu,'hong tra','all').length,1);assert.equal(searchDrinks(menu,'','new').length,1);assert.equal(searchDrinks(menu,'not here','all').length,0);
 assert.equal(sheetText('=IMPORTXML("https://example.com")').startsWith("'="),true);assert.equal(sheetText('+123'),"'+123");assert.equal(sheetText('Minh Anh'),'Minh Anh');
 assert.match(drinkLabel((await import('../dist/drink-orders.js')).validateDrinkOrder(menu,base)),/Hồng Trà Sữa.*Nhỏ.*50%.*Ít đá/);
});

test('sending waits for a matching server receipt and retries ambiguous network failures',async()=>{
 const {sendDrinkOrder}=await import('../dist/drink-order-client.js');let posts=0,reads=0;
 const result=await sendDrinkOrder({endpoint:'https://script.google.com/macros/s/test/exec',payload:base,fetchImpl:async()=>{posts++;throw Error('network');},readReceipt:async()=>{reads++;return reads===1?{status:'pending'}:{status:'accepted',requestId:base.requestId,sequence:base.sequence};},pause:async()=>{}});
 assert.equal(result.status,'accepted');assert.equal(posts,2);assert.equal(reads,2);
});

test('client never reports opaque POST success as a registered drink',async()=>{
 const {sendDrinkOrder}=await import('../dist/drink-order-client.js');
 const call=readReceipt=>sendDrinkOrder({endpoint:'https://script.google.com/macros/s/test/exec',payload:base,fetchImpl:async()=>({type:'opaque'}),readReceipt,pause:async()=>{},attempts:2});
 await assert.rejects(call(async()=>({status:'pending'})),/chưa xác nhận/i);
 await assert.rejects(call(async()=>({status:'accepted',requestId:'someone-else',sequence:1})),/chưa xác nhận/i);
 await assert.rejects(call(async()=>({status:'rejected',requestId:base.requestId,code:'closed'})),/đóng/i);
 await assert.rejects(sendDrinkOrder({endpoint:'https://example.com/steal',payload:base}),/Google Apps Script/i);
});
