import test from 'node:test';
import assert from 'node:assert/strict';
const api=()=>import('../dist/checkin-photo.js');
const file=(type='image/jpeg',size=1024)=>({type,size});

test('photo decoder rejects unsupported, empty and oversized files before decoding',async()=>{
 const {decodeCheckinPhoto}=await api();let called=0;
 for(const f of [file('image/gif'),file('image/jpeg',0),file('image/png',20*1024*1024+1)])await assert.rejects(decodeCheckinPhoto(f,{bitmap:()=>{called++;}}),/JPG|20 MB/);
 assert.equal(called,0);
});
test('photo decoder honors EXIF orientation, keeps aspect ratio and limits the longest edge to1600',async()=>{
 const {decodeCheckinPhoto}=await api();
 for(const [w,h] of [[4000,3000],[1200,2400],[400,600]]){
  let closed=0,options,draw;const image={width:w,height:h,close(){closed++;}},canvas={getContext:()=>({drawImage(...args){draw=args;}})};
  const result=await decodeCheckinPhoto(file(),{bitmap:async(f,o)=>{options=o;return image;},canvas:()=>canvas});
  assert.equal(result,canvas);assert.deepEqual(options,{imageOrientation:'from-image'});assert.equal(closed,1);
  assert.ok(canvas.width<=1600&&canvas.height<=1600);assert.ok(Math.abs(canvas.width/canvas.height-w/h)<.002);assert.equal(draw[0],image);
 }
});
test('decoder failures release the bitmap',async()=>{
 const {decodeCheckinPhoto}=await api();let closed=0;
 await assert.rejects(decodeCheckinPhoto(file(),{bitmap:async()=>({width:100,height:100,close(){closed++;}}),canvas:()=>({getContext:()=>null})}));assert.equal(closed,1);
});
test('canceling a chooser keeps the previous picture, and a valid selection reports completion',async()=>{
 const {createCheckinPhotoPicker}=await api();const photos=[],states=[];
 const picker=createCheckinPhotoPicker({decode:async()=>({id:'selfie'}),onPhoto:p=>photos.push(p),onState:s=>states.push(s)});picker.open();
 assert.equal(await picker.select(undefined),false);assert.equal(photos.length,0);
 assert.equal(await picker.select(file()),true);assert.equal(photos[0].id,'selfie');assert.equal(picker.busy(),false);assert.match(states.at(-1).message,/Ảnh riêng/);
});
test('only the latest selection can replace the picture, closing or resetting cancels pending decode',async()=>{
 const {createCheckinPhotoPicker}=await api();const pending=[],photos=[];
 const picker=createCheckinPhotoPicker({decode:()=>new Promise(resolve=>pending.push(resolve)),onPhoto:p=>photos.push(p),onState:()=>{}});picker.open();
 const first=picker.select(file()),second=picker.select(file());pending[1]('second');await second;pending[0]('first');await first;assert.deepEqual(photos,['second']);
 const third=picker.select(file());picker.close();pending[2]('closed');await third;assert.deepEqual(photos,['second']);assert.equal(await picker.select(file()),false);
 picker.open();const fourth=picker.select(file());picker.reset();pending[3]('reset');await fourth;assert.deepEqual(photos,['second']);
});
test('a decode error preserves the picture and clears busy so the next upload succeeds',async()=>{
 const {createCheckinPhotoPicker}=await api();const states=[],photos=[];let fail=true;
 const picker=createCheckinPhotoPicker({decode:async()=>{if(fail)throw Error('Không đọc được ảnh');return 'ok';},onPhoto:p=>photos.push(p),onState:s=>states.push(s)});picker.open();
 assert.equal(await picker.select(file()),false);assert.equal(picker.busy(),false);assert.equal(photos.length,0);assert.match(states.at(-1).message,/Không đọc/);
 fail=false;assert.equal(await picker.select(file()),true);assert.deepEqual(photos,['ok']);
});
