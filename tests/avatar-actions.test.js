import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/three.module.js';
import {createAvatar} from '../dist/avatar-rig.js';

test('avatar exposes two articulated arms and a head without moving the world anchor',()=>{
 const rig=createAvatar(),anchor=new T.Group();anchor.position.set(5,0,-8);anchor.add(rig.group);
 assert.equal(rig.arms?.length,2);assert.ok(rig.head?.isGroup);
 for(const arm of rig.arms){assert.equal(arm.elbow.parent,arm.shoulder);assert.equal(arm.wrist.parent,arm.elbow);}
 assert.deepEqual(anchor.position.toArray(),[5,0,-8]);rig.dispose();
});

test('six distinct actions have finite poses and return exactly to neutral at their boundaries',async()=>{
 const {AVATAR_ACTIONS,sampleAvatarAction,neutralAvatarPose}=await import('../dist/avatar-actions.js');
 assert.equal(AVATAR_ACTIONS.length,6);assert.equal(new Set(AVATAR_ACTIONS.map(a=>a.id)).size,6);
 const poses=[];
 for(const action of AVATAR_ACTIONS){
  assert.deepEqual(sampleAvatarAction(action.id,0),neutralAvatarPose());assert.deepEqual(sampleAvatarAction(action.id,1),neutralAvatarPose());
  for(const p of [-5,NaN,Infinity,.1,.3,.5,.8,5]){
   const pose=sampleAvatarAction(action.id,p),numbers=JSON.stringify(pose);assert.equal(/null/.test(numbers),false);assert.ok(numbers.length>0);
  }
  poses.push(JSON.stringify(sampleAvatarAction(action.id,.35)));
 }
 assert.equal(new Set(poses).size,6);assert.equal(sampleAvatarAction('bad',.5),null);
});

test('67 alternates forearms and turns both palms upward instead of merely showing a label',async()=>{
 const {sampleAvatarAction}=await import('../dist/avatar-actions.js');
 const a=sampleAvatarAction('sixseven',1/12),b=sampleAvatarAction('sixseven',1/4),middle=sampleAvatarAction('sixseven',.5);
 assert.ok((a.elbows[0][0]-a.elbows[1][0])*(b.elbows[0][0]-b.elbows[1][0])<0);
 for(let side=0;side<2;side++)assert.ok(Math.abs(middle.shoulders[side][0]+middle.elbows[side][0]+middle.wrists[side][0]+Math.PI/2)<1e-8);
});

test('reduced-motion actions hold a still pose without bouncing or spinning',async()=>{
 const {AVATAR_ACTIONS,sampleAvatarAction}=await import('../dist/avatar-actions.js');
 for(const action of AVATAR_ACTIONS){
  const a=sampleAvatarAction(action.id,.1,{reducedMotion:true}),b=sampleAvatarAction(action.id,.8,{reducedMotion:true});
  assert.deepEqual(a,b);assert.equal(a.lift,0);assert.equal(a.turn,0);assert.equal(a.tilt,0);
 }
});

test('switch, stop and completion reset pose and replace effects without queued timers',async()=>{
 const {createAvatarActionPlayer,AVATAR_ACTIONS,neutralAvatarPose,readAvatarPose}=await import('../dist/avatar-actions.js');
 const rig=createAvatar();let starts=0,clears=0,updates=0;const changes=[];
 const player=createAvatarActionPlayer({getRig:()=>rig,effects:{start(){starts++;},update(){updates++;},clear(){clears++;}},onChange:state=>changes.push(state?.id||null)});
 assert.equal(player.play('heart'),true);player.tick(.4);assert.notDeepEqual(readAvatarPose(rig),neutralAvatarPose());
 player.play('sixseven');assert.equal(starts,2);assert.equal(clears,1);player.tick(.5);assert.equal(player.current().id,'sixseven');
 player.stop();assert.equal(player.current(),null);assert.deepEqual(readAvatarPose(rig),neutralAvatarPose());assert.equal(clears,2);player.stop();assert.equal(clears,2);
 player.play('wave');player.tick(100);assert.equal(player.current(),null);assert.deepEqual(readAvatarPose(rig),neutralAvatarPose());assert.ok(updates>0);assert.ok(changes.includes('heart'));assert.ok(AVATAR_ACTIONS.find(a=>a.id==='wave').duration>0);rig.dispose();
});

test('movement, modal blocking and replacing the rig cancel safely; invalid actions and time do nothing',async()=>{
 const {createAvatarActionPlayer,neutralAvatarPose,readAvatarPose}=await import('../dist/avatar-actions.js');
 let rig=createAvatar(),blocked=true;const first=rig;let starts=0;
 const player=createAvatarActionPlayer({getRig:()=>rig,isBlocked:()=>blocked,effects:{start(){starts++;},update(){},clear(){}}});
 assert.equal(player.play('heart'),false);blocked=false;assert.equal(player.play('unknown'),false);assert.equal(starts,0);
 player.play('dance');player.tick(-1);player.tick(NaN);assert.equal(player.current().progress,0);player.tick(.3);blocked=true;player.tick(.1);assert.equal(player.current(),null);assert.deepEqual(readAvatarPose(rig),neutralAvatarPose());
 blocked=false;player.play('pose');player.tick(.4);rig=createAvatar();player.tick(.1);assert.equal(player.current(),null);assert.deepEqual(readAvatarPose(first),neutralAvatarPose());assert.deepEqual(readAvatarPose(rig),neutralAvatarPose());first.dispose();rig.dispose();
});

test('repeated actions never change the parent route position or leave residue on the body',async()=>{
 const {createAvatarActionPlayer,AVATAR_ACTIONS,neutralAvatarPose,readAvatarPose}=await import('../dist/avatar-actions.js');
 const rig=createAvatar(),anchor=new T.Group();anchor.position.set(-4,.05,7);anchor.rotation.y=.8;anchor.add(rig.group);
 const player=createAvatarActionPlayer({getRig:()=>rig,reducedMotion:true});
 for(let n=0;n<30;n++){player.play(AVATAR_ACTIONS[n%6].id);player.tick(.1);player.stop();assert.deepEqual(anchor.position.toArray(),[-4,.05,7]);assert.equal(anchor.rotation.y,.8);assert.deepEqual(readAvatarPose(rig),neutralAvatarPose());}
 player.tick(1);rig.dispose();
});

test('action visuals stay bounded and dispose geometry, materials and label textures when replaced',async()=>{
 const {createAvatarActionEffects}=await import('../dist/avatar-action-effects.js');
 const scene=new T.Scene(),anchor=new T.Group(),camera=new T.PerspectiveCamera();let disposed=0,total=0;
 const effects=createAvatarActionEffects({scene,anchor,camera,createLabel:()=>new T.Sprite(new T.SpriteMaterial({map:new T.DataTexture(new Uint8Array([255,255,255,255]),1,1)}))});
 for(const id of ['heart','wave','dance','hug','pose','sixseven']){
  effects.start({id,reducedMotion:false});const resources=new Set();let count=0;scene.traverse(node=>{if(node.isMesh||node.isSprite){count++;if(node.geometry)resources.add(node.geometry);resources.add(node.material);if(node.material.map)resources.add(node.material.map);}});
  assert.ok(count>0&&count<=12);for(const value of resources){total++;value.addEventListener('dispose',()=>disposed++);}
  effects.update({progress:.4,reducedMotion:false});effects.update({progress:.7,reducedMotion:true});effects.clear();effects.clear();assert.equal(scene.children.length,0);
 }
 assert.equal(disposed,total);effects.start({id:'bad'});assert.equal(scene.children.length,0);
});
