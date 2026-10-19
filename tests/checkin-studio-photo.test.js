import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
async function harness(options={}){
 const source=await readFile(new URL('../dist/checkin-studio.js',import.meta.url),'utf8');
 const method=source.match(/setTeamPhoto\(([^)]*)\)\{(.*?)\},open\(/s);assert.ok(method);
 const model={recipient:'Mây'},context={model,photo:null,teamPhoto:null,customPhoto:false,photoEnabled:false,dialog:{open:true},photoPicker:{busy:()=>false},sync(){},...options};vm.createContext(context);
 context.apply=vm.runInContext(`(function(${method[1]}){${method[2]}})`,context);return context;
}
test('late team-photo loading respects an intentionally hidden image',async()=>{
 const ctx=await harness();ctx.apply('team',ctx.model,false);assert.equal(ctx.teamPhoto,'team');assert.equal(ctx.photoEnabled,false);
 const visible=await harness();visible.apply('team',visible.model,true);assert.equal(visible.photo,'team');assert.equal(visible.photoEnabled,true);
});
test('late album loading cannot replace a chosen or decoding private photo or reopen a closed studio',async()=>{
 for(const options of [{customPhoto:true,photo:'selfie'},{photo:'previous',photoPicker:{busy:()=>true}}]){
  const ctx=await harness(options);ctx.apply('team',ctx.model);assert.equal(ctx.photo,options.photo);assert.equal(ctx.teamPhoto,'team');
 }
 const closed=await harness({dialog:{open:false}});closed.apply('team',closed.model);assert.equal(closed.teamPhoto,null);
 const stale=await harness();stale.apply('team',{});assert.equal(stale.teamPhoto,null);
});
