import test from 'node:test';
import assert from 'node:assert/strict';
test('a skipped or foreign drink cannot become another participants souvenir',async()=>{
 const {reconcileDrinkGift}=await import('../dist/drink-journey.js');
 assert.equal(reconcileDrinkGift({result:'Không đăng ký · Một ly nước mát'},'member:NhanCk',null),null);
 assert.equal(reconcileDrinkGift({drinkProfileKey:'member:NhanCk',drinkSynced:true},'member:ThaoNTK',null),null);
 assert.equal(reconcileDrinkGift(null,'member:ThaoNTK',null),null);
});
test('only the owners confirmed choice restores a legacy drink; nickname edits keep an owned receipt',async()=>{
 const {reconcileDrinkGift}=await import('../dist/drink-journey.js');
 const old={title:'Ly',style:0,result:'Old'},order={itemName:'Hồng Trà',size:'Vừa',sugar:'50%',ice:'Ít đá',category:'tea'};
 const restored=reconcileDrinkGift(old,'member:NhanCk',order);assert.match(restored.result,/Hồng Trà/);assert.equal(restored.style,1);assert.equal(restored.drinkProfileKey,'member:NhanCk');assert.equal(restored.drinkSynced,true);
 assert.deepEqual(reconcileDrinkGift(restored,'member:NhanCk',null),restored);assert.equal(old.result,'Old');
});
