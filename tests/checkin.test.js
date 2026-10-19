import test from 'node:test';
import assert from 'node:assert/strict';
const api=()=>import('../dist/checkin-card.js');
const gifts=()=>new Map(Array.from({length:7},(_,i)=>[i,{result:'Kỷ vật '+i,number:i===3?'07':undefined,luckySet:i===3?[1,8,15,22,30,45]:undefined,photoId:i===6?'team-photo':undefined}]));
test('check-in opens only after seven real keepsakes and never mutates the journey',async()=>{
 const {createCheckinModel}=await api();const collection=gifts(),before=JSON.stringify([...collection]);
 assert.equal(createCheckinModel({gifts:new Map(),recipient:'Mây'}),null);
 collection.delete(2);assert.equal(createCheckinModel({gifts:collection}),null);collection.set(2,{result:'Kỷ vật 2'});
 const model=createCheckinModel({gifts:collection,recipient:'  Mây  ',avatar:{hair:'bun'},message:'Một ngày rực rỡ',wishNumber:'123'});
 assert.equal(model.recipient,'Mây');assert.equal(model.keepsakes.length,7);assert.deepEqual(model.keepsakes.map(k=>k.station),[0,1,2,3,4,5,6]);assert.equal(model.avatar.hair,'bun');assert.equal(model.number,'07');assert.deepEqual(model.luckySet,[1,8,15,22,30,45]);assert.equal(model.photoId,'team-photo');assert.equal(collection.size,7);assert.equal(JSON.stringify([...gifts()]),before);
});
test('check-in normalizes names, old lucky data and safe deterministic download names',async()=>{
 const {createCheckinModel,checkinFilename,getCheckinSize}=await api();const collection=gifts();collection.set(3,{number:'999',luckySet:[1,1,2,3,4,5]});
 const model=createCheckinModel({gifts:collection,recipient:'\n '+ 'Nguyễn '.repeat(20),avatar:{hair:'bad'}});
 assert.ok(model.recipient.length<=40);assert.equal(model.number,null);assert.equal(model.luckySet,null);assert.ok(model.avatar.hair);assert.equal(createCheckinModel({gifts:gifts()}).recipient,'Bạn');
 assert.equal(checkinFilename('Đặng Minh Anh','story','png'),'check-in-20-10-dang-minh-anh-story.png');assert.match(checkinFilename('../../','post','webm'),/^check-in-20-10-ban-post\.webm$/);
 assert.deepEqual(getCheckinSize('story'),{width:1080,height:1920});assert.deepEqual(getCheckinSize('post'),{width:1080,height:1350});assert.deepEqual(getCheckinSize('bad'),getCheckinSize('story'));
});
function canvas(){const texts=[],images=[],ctx=new Proxy({measureText(text){return {width:String(text).length*32};},fillText(text,x,y){texts.push({text,x,y});},drawImage(...args){images.push(args);},createLinearGradient(){return {addColorStop(){}};},createRadialGradient(){return {addColorStop(){}};}},{get:(o,k)=>k in o?o[k]:()=>{}});return {canvas:{getContext:()=>ctx},texts,images};}
test('both check-in formats contain the chosen avatar/photo, name, seven stamps and saved lucky values',async()=>{
 const {createCheckinModel,renderCheckinCard}=await api();const model=createCheckinModel({gifts:gifts(),recipient:'Nguyễn Minh Anh',message:'Chúc bạn tự do tỏa sáng.'});
 for(const format of ['story','post'])for(const theme of ['blush','night']){
  const {canvas:c,texts,images}=canvas(),avatar={width:600,height:760},photo={width:1200,height:900};renderCheckinCard(c,model,{format,theme,avatar,photo,time:1});
  assert.equal(c.width,1080);assert.equal(c.height,format==='story'?1920:1350);assert.ok(images.some(a=>a[0]===avatar));assert.ok(images.some(a=>a[0]===photo));
  const content=texts.map(t=>t.text).join(' ');assert.match(content,/Nguyễn Minh Anh/);assert.match(content,/VNG CAMPUS/);assert.match(content,/7 \/ 7/);assert.match(content,/07/);assert.match(content,/45/);assert.ok(texts.every(t=>t.y>0&&t.y<c.height));
 }
});
test('photo-free and old journeys export without inventing a new lucky set; long names stay inside the canvas',async()=>{
 const {createCheckinModel,renderCheckinCard}=await api(),collection=gifts();collection.set(3,{});
 const model=createCheckinModel({gifts:collection,recipient:'Nguyễn '.repeat(6),message:'Lời chúc '.repeat(60)}),{canvas:c,texts,images}=canvas();renderCheckinCard(c,model,{format:'post',theme:'unknown'});
 assert.equal(images.length,0);assert.ok(texts.some(t=>t.text.includes('Nguyễn')));assert.ok(texts.every(t=>Number.isFinite(t.x)&&Number.isFinite(t.y)&&t.y>0&&t.y<c.height));assert.ok(!texts.some(t=>t.text==='6/45'));
 assert.throws(()=>renderCheckinCard({getContext:()=>null},model),/canvas/i);
});
