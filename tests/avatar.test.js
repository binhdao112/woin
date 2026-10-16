import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/three.module.js';

test('avatar accepts only catalog choices and upgrades old or corrupt journeys to safe defaults',async()=>{
 const {normaliseAvatar,DEFAULT_AVATAR,AVATAR_OPTIONS}=await import('../dist/avatar-profile.js');
 for(const value of [undefined,null,7,'bad',[],{skin:'url(evil)',hair:'<script>',outfit:'unknown',accessory:42}])assert.deepEqual(normaliseAvatar(value),DEFAULT_AVATAR);
 for(const [key,choices] of Object.entries(AVATAR_OPTIONS))for(const choice of choices){
  const value={...DEFAULT_AVATAR,[key]:choice.id};assert.deepEqual(normaliseAvatar(JSON.parse(JSON.stringify(value))),value);
 }
 const input={...DEFAULT_AVATAR,extra:'ignored'};const normalized=normaliseAvatar(input);normalized.hair='changed';assert.equal(input.hair,DEFAULT_AVATAR.hair);assert.equal('extra' in normaliseAvatar(input),false);
});

test('random styling can reach all boundaries and always returns a complete allowed appearance',async()=>{
 const {randomAvatar,AVATAR_OPTIONS,normaliseAvatar}=await import('../dist/avatar-profile.js');
 for(const pick of [()=>0,n=>n-1]){
  const appearance=randomAvatar(pick);
  for(const [key,choices] of Object.entries(AVATAR_OPTIONS))assert.equal(appearance[key],choices[pick(choices.length)].id);
 }
 for(let i=0;i<80;i++){const appearance=randomAvatar(n=>Math.floor(Math.random()*n));assert.deepEqual(normaliseAvatar(appearance),appearance);}
});

test('editing and randomizing stay in a draft until saved; cancel restores the committed character',async()=>{
 const {createAvatarDraft,DEFAULT_AVATAR,AVATAR_OPTIONS}=await import('../dist/avatar-profile.js');
 const draft=createAvatarDraft();const key='hair',choice=AVATAR_OPTIONS[key].at(-1).id;
 draft.select(key,choice);assert.equal(draft.read()[key],choice);assert.deepEqual(draft.cancel(),DEFAULT_AVATAR);
 draft.select(key,choice);const committed=draft.commit();draft.randomize(n=>n-1);assert.deepEqual(draft.cancel(),committed);
 draft.select('skin','bad');draft.select('injected','bad');assert.deepEqual(draft.read(),committed);
 const copy=draft.read();copy.hair='bad';assert.deepEqual(draft.read(),committed);
 draft.restore({hair:choice});assert.equal(draft.read().hair,choice);assert.deepEqual(draft.cancel(),draft.read());
});

test('avatar description names selected choices for the preview alternative text',async()=>{
 const {describeAvatar,AVATAR_OPTIONS,DEFAULT_AVATAR}=await import('../dist/avatar-profile.js');
 const text=describeAvatar(DEFAULT_AVATAR);
 for(const [key,choices] of Object.entries(AVATAR_OPTIONS))assert.ok(text.includes(choices.find(c=>c.id===DEFAULT_AVATAR[key]).label));
 assert.equal(describeAvatar(null),text);
});

test('3D character uses the selected colors with two independent walking legs and finite bounds',async()=>{
 const {createAvatar}=await import('../dist/avatar-rig.js');
 const {AVATAR_OPTIONS}=await import('../dist/avatar-profile.js');
 const appearance={skin:AVATAR_OPTIONS.skin.at(-1).id,hairColor:AVATAR_OPTIONS.hairColor.at(-1).id,color:AVATAR_OPTIONS.color.at(-1).id};
 const rig=createAvatar(appearance);assert.equal(rig.legs.length,2);assert.notEqual(rig.legs[0],rig.legs[1]);
 const colors=new Set();rig.group.traverse(node=>{if(node.isMesh)colors.add(node.material.color.getHexString());});
 for(const key of ['skin','hairColor','color'])assert.ok(colors.has(new T.Color(AVATAR_OPTIONS[key].at(-1).color).getHexString()));
 rig.legs[0].rotation.x=.5;rig.group.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(rig.group),size=bounds.getSize(new T.Vector3());
 assert.ok(size.y>1.3&&size.y<1.9);assert.ok(size.x>.4&&size.x<1.5);assert.ok(Number.isFinite(size.z));rig.dispose();
});

test('every hairstyle, outfit and accessory combination produces a visible complete character',async()=>{
 const {createAvatar}=await import('../dist/avatar-rig.js');const {AVATAR_OPTIONS}=await import('../dist/avatar-profile.js');
 for(const hair of AVATAR_OPTIONS.hair)for(const outfit of AVATAR_OPTIONS.outfit)for(const accessory of AVATAR_OPTIONS.accessory){
  const rig=createAvatar({hair:hair.id,outfit:outfit.id,accessory:accessory.id});
  const size=new T.Box3().setFromObject(rig.group).getSize(new T.Vector3());assert.ok(size.y>1.3&&size.y<1.9,`${hair.id}/${outfit.id}/${accessory.id}`);assert.ok(size.x<1.5);rig.dispose();
 }
});

test('replacing a character disposes its GPU resources once without sharing them with another character',async()=>{
 const {createAvatar}=await import('../dist/avatar-rig.js');const first=createAvatar(),second=createAvatar();
 const resources=new Set(),other=new Set();first.group.traverse(n=>{if(n.isMesh){resources.add(n.geometry);resources.add(n.material);}});second.group.traverse(n=>{if(n.isMesh){other.add(n.geometry);other.add(n.material);}});
 let disposed=0;for(const resource of resources){assert.equal(other.has(resource),false);resource.addEventListener('dispose',()=>disposed++);}
 first.dispose();assert.equal(disposed,resources.size);first.dispose();assert.equal(disposed,resources.size);second.dispose();
});
