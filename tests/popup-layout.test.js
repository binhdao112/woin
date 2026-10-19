import test from 'node:test';
import assert from 'node:assert/strict';

function dom(){
 const doc={createElement(tag){return {tag,ownerDocument:doc,children:[],attrs:{},style:{values:{},setProperty(k,v){this.values[k]=v;}},classList:{add(){}},hidden:false,setAttribute(k,v){this.attrs[k]=String(v);},append(...items){for(const x of items){x.parentNode=this;this.children.push(x);}},insertBefore(x,before){x.parentNode=this;if(before)this.children.splice(this.children.indexOf(before),0,x);else this.children.push(x);},after(x){this.parentNode.insertBefore(x,this.parentNode.children[this.parentNode.children.indexOf(this)+1]);},remove(){this.parentNode.children=this.parentNode.children.filter(x=>x!==this);},focus(){doc.activeElement=this;}};}};
 const root=doc.createElement('div');return {doc,root,el:tag=>doc.createElement(tag)};
}

test('popup fitting keeps every edge in the viewport, never enlarges, and safely ignores zero sizes',async()=>{
 const {fitPopupScale}=await import('../dist/popup-layout.js');
 assert.equal(fitPopupScale(560,800,1280,720),.87);
 assert.equal(fitPopupScale(366,698,390,844),1);
 assert.equal(fitPopupScale(600,400,390,844),.61);
 assert.equal(fitPopupScale(0,0,0,0),1);
 assert.ok(fitPopupScale(700,1200,375,667)*1200<=643);
});

test('page ranges clamp after filtering, include every item once, and support empty lists',async()=>{
 const {popupPage}=await import('../dist/popup-layout.js');
 assert.deepEqual(popupPage(19,4,99),{page:4,pages:5,start:16,end:19});
 assert.deepEqual(popupPage(0,4,2),{page:0,pages:1,start:0,end:0});
 assert.equal(popupPage(3,4,-2).page,0);assert.equal(popupPage(7,0,1).end,2);
 const seen=[];for(let page=0;page<5;page++){const {start,end}=popupPage(19,4,page);for(let n=start;n<end;n++)seen.push(n);}assert.deepEqual(seen,Array.from({length:19},(_,i)=>i));
});

test('tabs reveal one complete settings group without replacing inputs, and support keyboard selection',async()=>{
 const {mountPopupTabs}=await import('../dist/popup-layout.js');const {root,el,doc}=dom();const panels=[el('section'),el('section'),el('section')];panels[1].value='saved choice';root.append(...panels);
 const tabs=mountPopupTabs(root,panels,['Khung','Tạo dáng','Lưu']);
 assert.deepEqual(panels.map(p=>p.hidden),[false,true,true]);tabs.select(1);assert.equal(panels[1].value,'saved choice');assert.deepEqual(panels.map(p=>p.hidden),[true,false,true]);
 assert.equal(tabs.select(8),false);const buttons=root.children[0].children;let prevented=0;buttons[1].onkeydown({key:'ArrowRight',preventDefault(){prevented++;}});assert.equal(prevented,1);assert.equal(doc.activeElement,buttons[2]);assert.equal(buttons[2].attrs['aria-pressed'],'true');
 buttons[0].onclick();assert.equal(tabs.active(),0);buttons[0].onkeydown({key:'Tab',preventDefault(){throw Error('do not consume Tab');}});
});

test('list paging hides only off-page choices, keeps values, and refreshes for a smaller viewport',async()=>{
 const {mountPopupPager}=await import('../dist/popup-layout.js');const {root,el}=dom(),list=el('div');root.append(list);const items=Array.from({length:7},()=>el('article'));list.append(...items);items[6].value='unchanged';let size=4;
 const pager=mountPopupPager(list,{pageSize:()=>size});assert.deepEqual(items.map(i=>i.hidden),[false,false,false,false,true,true,true]);
 pager.next();assert.equal(items[6].hidden,false);assert.equal(items[6].value,'unchanged');pager.next();assert.equal(pager.page(),1);size=2;pager.refresh();assert.equal(items.filter(i=>!i.hidden).length,2);pager.previous();assert.equal(pager.page(),0);pager.previous();assert.equal(pager.page(),0);
 const nav=root.children[1];nav.children[2].onclick();assert.equal(pager.page(),1);nav.children[0].onclick();assert.equal(pager.page(),0);pager.dispose();assert.equal(root.children.length,1);
});

test('fitter observes popup content and resize, skips clean check-in mode, and cleans up listeners',async()=>{
 const {installPopupFit}=await import('../dist/popup-layout.js');const {doc,el}=dom();let disconnected=0,removed=0;
 const d=el('dialog');Object.assign(d,{id:'cosmic-hub',open:true,offsetWidth:560,offsetHeight:800});const checkin=el('dialog');Object.assign(checkin,{id:'checkin-final',open:true});doc.body=el('body');doc.querySelectorAll=()=>[d,checkin];
 const win={innerWidth:1280,innerHeight:720,addEventListener(){},removeEventListener(){removed++;},requestAnimationFrame:()=>1,cancelAnimationFrame(){},MutationObserver:class{observe(){}disconnect(){disconnected++;}},ResizeObserver:class{observe(){}disconnect(){disconnected++;}}};
 const fitter=installPopupFit({doc,win});fitter.refresh();assert.equal(d.style.values['--popup-scale'],'0.87');assert.equal(checkin.style.values['--popup-scale'],undefined);d.open=false;fitter.refresh();fitter.dispose();assert.equal(disconnected,2);assert.equal(removed,1);
});
