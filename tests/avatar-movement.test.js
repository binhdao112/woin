import test from 'node:test';
import assert from 'node:assert/strict';
import {CAMPUS_STOPS} from '../dist/campus.js';
const api=()=>import('../dist/avatar-movement.js');
const cloud=[[-10,0,4],[-6,0,-2],[0,0,-5],[6,0,-2],[10,0,4],[4,0,8],[-2,0,11],[-9,0,10]];
test('camera relative walking has equal diagonal speed and is stable across frame rates',async()=>{
 const {movementVector,stepMovement}=await api();
 assert.deepEqual(movementVector(new Set(['KeyW']),0),{x:0,z:-1});
 assert.ok(Math.abs(movementVector(new Set(['ArrowUp']),Math.PI/2).x+1)<1e-8);
 const diagonal=movementVector(new Set(['KeyW','KeyD']),0);assert.ok(Math.abs(Math.hypot(diagonal.x,diagonal.z)-1)<1e-8);
 assert.deepEqual(movementVector(new Set(['KeyW','KeyS']),0),{x:0,z:0});
 const run=fps=>{let p={x:0,z:0};for(let i=0;i<fps;i++)p=stepMovement(p,diagonal,1/fps,()=>true);return p;};
 const a=run(20),b=run(60);assert.ok(Math.hypot(a.x-b.x,a.z-b.z)<1e-8);assert.ok(Math.abs(Math.hypot(a.x,a.z)-3.6)<1e-8);
 assert.deepEqual(stepMovement(a,diagonal,NaN,()=>true),a);assert.deepEqual(stepMovement(a,diagonal,-1,()=>true),a);
});
test('walls stop fast movement, allow sliding and all campus stop anchors are on walkable land',async()=>{
 const {stepMovement,createWalkableWorld}=await api(),world=createWalkableWorld('campus',CAMPUS_STOPS);
 assert.equal(world.canStand({x:-10,z:-4}),false);assert.equal(world.canStand({x:0,z:-9}),false);assert.equal(world.canStand({x:5,z:-4}),false);
 assert.equal(world.canStand({x:0,z:13}),false);assert.equal(world.canStand({x:30,z:0}),false);
 for(const [x,,z] of CAMPUS_STOPS)assert.ok(world.canStand({x,z:z+.7}));
 const wall=p=>p.x<1;const p=stepMovement({x:0,z:0},{x:1,z:1},1,wall);assert.ok(p.x<1);assert.ok(p.z>1);
});
test('automatic walking finds safe routes from arbitrary positions instead of crossing buildings',async()=>{
 const {createWalkableWorld}=await api(),world=createWalkableWorld('campus',CAMPUS_STOPS);
 for(const from of [{x:-15,z:4},{x:14,z:-4},{x:-10,z:6.7}])for(const [x,,z]of CAMPUS_STOPS){
  let previous=from;const path=world.findPath(from,{x,z:z+.7});assert.ok(path.length>0);
  for(const next of path){for(let i=0;i<=20;i++)assert.ok(world.canStand({x:previous.x+(next.x-previous.x)*i/20,z:previous.z+(next.z-previous.z)*i/20}));previous=next;}
  assert.deepEqual(path.at(-1),{x,z:z+.7});
 }
 assert.deepEqual(world.findPath({x:0,z:0},{x:0,z:-9}),[]);
});
test('cloud walking remains on islands and narrow bridges, and every stop stays reachable',async()=>{
 const {createWalkableWorld}=await api(),world=createWalkableWorld('cloud',cloud);
 assert.equal(world.canStand({x:0,z:20}),false);assert.equal(world.canStand({x:-8,z:1}),true);
 for(let i=0;i<cloud.length-1;i++){
  const from={x:cloud[i][0],z:cloud[i][2]+.7},to={x:cloud[i+1][0],z:cloud[i+1][2]+.7};const path=world.findPath(from,to);assert.ok(path.length>0,`${i} connects to ${i+1}`);
  let previous=from;for(const next of path){for(let j=0;j<=20;j++)assert.ok(world.canStand({x:previous.x+(next.x-previous.x)*j/20,z:previous.z+(next.z-previous.z)*j/20}));previous=next;}
 }
});
test('nearby station selection respects collection gates and movement keys release cleanly',async()=>{
 const {nearestStation,createMovementInput}=await api();
 assert.equal(nearestStation({x:-5,z:2.7},CAMPUS_STOPS,()=>false),-1);
 assert.equal(nearestStation({x:-5,z:2.7},CAMPUS_STOPS,()=>true),1);
 assert.equal(nearestStation({x:100,z:100},CAMPUS_STOPS,()=>true),-1);
 const input=createMovementInput();assert.equal(input.down('KeyW'),true);input.down('KeyW');input.down('ArrowLeft');assert.equal(input.keys.size,2);input.up('KeyW');assert.equal(input.keys.size,1);input.clear();assert.equal(input.keys.size,0);assert.equal(input.down('KeyE'),false);
});
