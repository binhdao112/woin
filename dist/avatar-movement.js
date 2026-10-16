const codes=new Map([['KeyW',[0,1]],['ArrowUp',[0,1]],['KeyS',[0,-1]],['ArrowDown',[0,-1]],['KeyA',[-1,0]],['ArrowLeft',[-1,0]],['KeyD',[1,0]],['ArrowRight',[1,0]]]);
export function createMovementInput(){const keys=new Set();return {keys,down(code){if(!codes.has(code))return false;keys.add(code);return true;},up:code=>keys.delete(code),clear:()=>keys.clear()};}
export function movementVector(keys,yaw){let x=0,f=0;for(const code of keys){const v=codes.get(code);if(v){x+=v[0];f+=v[1];}}const length=Math.hypot(x,f);if(!length)return {x:0,z:0};x/=length;f/=length;return {x:Math.cos(yaw)*x-Math.sin(yaw)*f,z:-Math.sin(yaw)*x-Math.cos(yaw)*f};}
export function stepMovement(position,direction,dt,canStand,speed=3.6){
 const p={x:position.x,z:position.z},length=Math.hypot(direction.x,direction.z);if(!Number.isFinite(dt)||dt<=0||!Number.isFinite(length)||!length)return p;
 const distance=Math.min(dt,1)*speed,steps=Math.ceil(distance/.06),dx=direction.x/length*distance/steps,dz=direction.z/length*distance/steps;
 for(let i=0;i<steps;i++){if(canStand({x:p.x+dx,z:p.z+dz})){p.x+=dx;p.z+=dz;}else{if(canStand({x:p.x+dx,z:p.z}))p.x+=dx;if(canStand({x:p.x,z:p.z+dz}))p.z+=dz;}}return p;
}
const campusRects=[[-13.7,-6.3,-10,2],[-5.8,10.8,-11.5,-5.7],[1.6,10,-5.56,-2.04],[-5.95,-3.05,-.2,.8],[10.5,13.5,-.25,2.25],[5.57,6.43,6.62,7.18],[-2.05,2.05,10.1,10.3],[-3,-1,3.75,4.25],[3,5,3.75,4.25],[7,9,.75,1.25],[-2.75,-1.25,4.52,5.08],[3.25,4.75,4.52,5.08],[7.25,8.75,1.52,2.08]];
const campusCircles=[[-.1,-4.5,1.1],[-1.3,-4.5,.25],[1.1,-4.5,.25],[-2.5,-3.3,.3],[1.3,-1,.3],[-1.7,-.6,.25],[13.2,3.6,.35],[9.4,5.7,.3],[12.2,6,.8],[-13.3,3.9,.09],[-6.7,3.9,.09],[-6.3,9.6,.09],[-3.7,9.6,.09]];
function segmentDistance(p,a,b){const dx=b.x-a.x,dz=b.z-a.z,q=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(p.x-a.x-q*dx,p.z-a.z-q*dz);}
export function createWalkableWorld(kind,stops){
 const radius=.22,points=stops.map(([x,,z])=>({x,z}));
 function canStand(p){if(!Number.isFinite(p?.x)||!Number.isFinite(p?.z))return false;
  if(kind==='cloud')return points.some(a=>Math.hypot(p.x-a.x,p.z-a.z)<=2.35)||points.some((a,i)=>i>0&&segmentDistance(p,points[i-1],a)<=.25);
  if(p.x< -16.45||p.x>16.45||p.z< -13.3||p.z>11.45)return false;
  if(campusRects.some(([l,r,b,f])=>p.x>l-radius&&p.x<r+radius&&p.z>b-radius&&p.z<f+radius))return false;
  return !campusCircles.some(([x,z,r])=>Math.hypot(p.x-x,p.z-z)<r+radius);
 }
 function clearLine(a,b){const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.06));for(let i=0;i<=n;i++)if(!canStand({x:a.x+(b.x-a.x)*i/n,z:a.z+(b.z-a.z)*i/n}))return false;return true;}
 function findPath(from,to){
  if(!canStand(from)||!canStand(to))return [];if(clearLine(from,to))return [{x:to.x,z:to.z}];
  const cell=.3,key=(x,z)=>x+','+z,point=(x,z)=>({x:x*cell,z:z*cell});
  function snap(p){const x=Math.round(p.x/cell),z=Math.round(p.z/cell);for(let r=0;r<=3;r++)for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++){const candidate=point(x+a,z+b);if(clearLine(p,candidate))return {x:x+a,z:z+b};}return null;}
  const start=snap(from),end=snap(to);if(!start||!end)return [];
  const target=key(end.x,end.z),open=[{...start,cost:0,score:0}],scores=new Map([[key(start.x,start.z),0]]),parents=new Map(),closed=new Set();
  let found=null;
  while(open.length){let best=0;for(let i=1;i<open.length;i++)if(open[i].score<open[best].score)best=i;const node=open.splice(best,1)[0],id=key(node.x,node.z);if(closed.has(id))continue;if(id===target){found=id;break;}closed.add(id);
   for(const [dx,dz] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]){const x=node.x+dx,z=node.z+dz,next=key(x,z),cost=node.cost+Math.hypot(dx,dz);if(closed.has(next)||cost>=(scores.get(next)??Infinity)||!clearLine(point(node.x,node.z),point(x,z)))continue;scores.set(next,cost);parents.set(next,id);open.push({x,z,cost,score:cost+Math.hypot(x-end.x,z-end.z)});}
  }
  if(!found)return [];const path=[{x:to.x,z:to.z}];while(found){const [x,z]=found.split(',').map(Number);path.push(point(x,z));found=parents.get(found);}path.reverse();
  const smooth=[];let previous=from;for(let i=0;i<path.length;){let next=path.length-1;while(next>i&&!clearLine(previous,path[next]))next--;smooth.push(path[next]);previous=path[next];i=next+1;}return smooth;
 }
 return {canStand,findPath};
}
export function nearestStation(position,stops,canVisit,radius=1.65){let found=-1,distance=radius;stops.forEach(([x,,z],i)=>{const d=Math.hypot(position.x-x,position.z-z-.7);if(d<=distance&&canVisit(i)){found=i;distance=d;}});return found;}
