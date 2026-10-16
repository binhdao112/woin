import test from 'node:test';
import assert from 'node:assert/strict';
const base=new URL('https://example.test/woin/previews/campus/assets/memories/album.json');
const data={title:'Team mình',photos:[{id:'team-1',src:'./photos/one.png',name:'Gala'},{id:'team-2',src:'./photos/two.jpg',name:'Gala'}]};

test('shared album paths resolve relative to the manifest at any deploy subpath',async()=>{
 const {normaliseSharedAlbum}=await import('../dist/memory-album.js');
 const album=normaliseSharedAlbum(data,base);
 assert.equal(album.title,'Team mình');assert.equal(album.photos.length,2);
 assert.equal(album.photos[0].url,'https://example.test/woin/previews/campus/assets/memories/photos/one.png');
 assert.equal(album.photos[1].id,'team-2');
});

test('manifest rejects external URLs, traversal, unsupported files and duplicate IDs',async()=>{
 const {normaliseSharedAlbum}=await import('../dist/memory-album.js');
 const invalid=['https://tracker.test/p.png','/other.png','../outside.png','%2e%2e/outside.png','./script.svg','data:image/png;base64,abc'];
 const result=normaliseSharedAlbum({photos:[...invalid.map(src=>({src})),data.photos[0],data.photos[0]]},base);
 assert.equal(result.photos.length,1);assert.equal(result.issues.length,7);
 assert.throws(()=>normaliseSharedAlbum({photos:'wrong'},base),/album/i);
});

test('host images load without IndexedDB and one broken image does not hide the rest',async()=>{
 const {loadSharedAlbum}=await import('../dist/memory-album.js');
 const fetchImpl=async url=>String(url).endsWith('album.json')?{ok:true,json:async()=>data}:{ok:!String(url).includes('two.jpg'),blob:async()=>new Blob(['png'],{type:'image/png'})};
 const result=await loadSharedAlbum({manifestURL:base,fetchImpl,decode:async blob=>({width:1200,height:900,blob})});
 assert.equal(result.photos.length,1);assert.equal(result.photos[0].source,'shared');assert.equal(result.photos[0].name,'Gala');assert.ok(result.issues.length>0);
 for(const fail of [async()=>({ok:false}),async()=>{throw Error('offline');},async()=>({ok:true,json:async()=>{throw Error('JSON');}})]){
  const fallback=await loadSharedAlbum({manifestURL:base,fetchImpl:fail,decode:async()=>null});assert.equal(fallback.photos.length,0);
 }
});

test('saved frames select by photo ID even when host captions repeat',async()=>{
 const {findMemoryPhoto}=await import('../dist/memory-album.js');
 const photos=[{id:'team-1',name:'Gala'},{id:'team-2',name:'Gala'}];
 assert.equal(findMemoryPhoto(photos,{photoId:'team-2',photoName:'Gala'}),photos[1]);
 assert.equal(findMemoryPhoto(photos,{photoName:'Gala'}),photos[0]);
 assert.equal(findMemoryPhoto(photos,{photoId:'removed',photoName:'Gala'}),undefined);
});

test('shared album limits work and falls back safely for wrong image types or decoder errors',async()=>{
 const {normaliseSharedAlbum,loadSharedAlbum,findMemoryPhoto}=await import('../dist/memory-album.js');
 const photos=Array.from({length:14},(_,i)=>({src:'./photo-'+i+'.png'}));
 assert.equal(normaliseSharedAlbum({photos},base).photos.length,12);
 assert.ok(normaliseSharedAlbum({photos},base).issues.length>0);
 for(const image of [new Blob(['bad'],{type:'text/html'}),new Blob([],{type:'image/png'})]){
  const fetchImpl=async url=>String(url).endsWith('album.json')?{ok:true,json:async()=>({photos:[{src:'./one.png'}]})}:{ok:true,blob:async()=>image};
  assert.equal((await loadSharedAlbum({manifestURL:base,fetchImpl,decode:async()=>null})).photos.length,0);
 }
 const fetchImpl=async url=>String(url).endsWith('album.json')?{ok:true,json:async()=>({photos:[{src:'./one.png'}]})}:{ok:true,blob:async()=>new Blob(['png'],{type:'image/png'})};
 assert.equal((await loadSharedAlbum({manifestURL:base,fetchImpl,decode:async()=>{throw Error('decode');}})).photos.length,0);
 const first={id:'one'};assert.equal(findMemoryPhoto([first],{},0),first);
});

test('shared photo requests time out without blocking the rest of the journey',async()=>{
 const {loadSharedAlbum}=await import('../dist/memory-album.js');
 const fetchImpl=(url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('aborted'))));
 const result=await loadSharedAlbum({manifestURL:base,fetchImpl,decode:async()=>null,timeoutMs:5});
 assert.equal(result.photos.length,0);assert.ok(result.issues.length>0);
});
