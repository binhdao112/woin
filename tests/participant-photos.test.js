import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const api=()=>import('../dist/participant-photos.js');
const bindings={defaultPhotoId:'group',participants:{'member:LyHK':'ly','member:ThaoNTK':'thao'}},photos=[{id:'thao',canvas:'Thảo'},{id:'group',canvas:'Tập thể'},{id:'ly',canvas:'Ly'}];

test('card composition uses the selected participant instead of another person kept at station seven',async()=>{
 const source=await readFile(new URL('../dist/app.js',import.meta.url),'utf8'),fn=source.slice(source.indexOf('async function composeWishCanvas('),source.indexOf('\nasync function refreshTemplatePreviews'));
 const context={profileKey:'member:LyHK',cardTemplate:'editorial',participantPhotoBindings:bindings,sharedPhotos:photos,photoPreferences:{read:()=>({photo:null,enabled:true})},getParticipantTeamPhoto:owner=>photos.find(p=>p.id===bindings.participants[owner])?.canvas,cardPhotoEnabled:true,checkinPhoto:null,allMemoryPhotos:()=>photos,keepsakeCollection:new Map([[6,{photoId:'thao'}]]),findMemoryPhoto:()=>photos[0],document:{fonts:{ready:Promise.resolve(),load:()=>Promise.resolve()},createElement:()=>({})},photosReady:Promise.resolve(),renderSocialCard:(canvas,model,options)=>options,renderWishCard:(canvas,model,photo)=>({photo}),loadCardArtwork:()=>null};
 vm.createContext(context);vm.runInContext(fn+';this.compose=composeWishCanvas;',context);
 assert.equal((await context.compose({recipient:'Ly'},'post')).photo,'Ly');
 assert.equal((await context.compose({recipient:'Ly'},'full')).photo,'Ly');
});

test('photo lookup honors explicit participant IDs and only uses the configured group fallback',async()=>{
 const {findParticipantPhoto}=await api();
 assert.equal(findParticipantPhoto(photos,bindings,'member:LyHK'),photos[2]);assert.equal(findParticipantPhoto(photos,bindings,'member:ThaoNTK'),photos[0]);
 assert.equal(findParticipantPhoto(photos,bindings,'guest:unknown'),photos[1]);assert.equal(findParticipantPhoto(photos.filter(p=>p.id!=='ly'),bindings,'member:LyHK'),photos[1]);assert.equal(findParticipantPhoto([photos[0]],bindings,'member:LyHK'),null);
});

test('custom photos, hidden state and late decoding stay with their original participant',async()=>{
 const {createParticipantPhotoStore}=await api(),store=createParticipantPhotoStore();
 store.setPhoto('member:LyHK','Selfie Ly');store.setPhoto('member:ThaoNTK','Selfie Thảo');store.setEnabled('member:LyHK',false);
 assert.deepEqual(store.read('member:LyHK'),{photo:'Selfie Ly',enabled:false});assert.deepEqual(store.read('member:ThaoNTK'),{photo:'Selfie Thảo',enabled:true});assert.deepEqual(store.read('member:NhanCk'),{photo:null,enabled:true});
 const stale=store.beginSelection('member:LyHK'),latest=store.beginSelection('member:LyHK');assert.equal(store.commitSelection(stale,'Old Ly'),false);assert.equal(store.commitSelection(latest,'New Ly'),true);assert.equal(store.read('member:ThaoNTK').photo,'Selfie Thảo');
 const reset=store.beginSelection('member:LyHK');store.resetPhoto('member:LyHK');assert.equal(store.commitSelection(reset,'Late Ly'),false);assert.equal(store.read('member:LyHK').photo,null);
 const copy=store.read('member:ThaoNTK');copy.photo='Changed';assert.equal(store.read('member:ThaoNTK').photo,'Selfie Thảo');
});

test('bindings reject unknown roster keys or image URLs and missing config never invents a portrait',async()=>{
 const {normaliseParticipantPhotoBindings,loadParticipantPhotoBindings}=await api();
 assert.deepEqual(normaliseParticipantPhotoBindings({defaultPhotoId:'group',participants:{'member:LyHK':'ly','member:Nobody':'other','member:ThaoNTK':'https://example.com/p.jpg'}}),{defaultPhotoId:'group',participants:{'member:LyHK':'ly'}});
 assert.deepEqual(await loadParticipantPhotoBindings({fetchImpl:async()=>{throw Error('offline');}}),{defaultPhotoId:null,participants:{}});
 assert.deepEqual(await loadParticipantPhotoBindings({fetchImpl:async()=>({ok:true,json:async()=>bindings})}),bindings);
});
