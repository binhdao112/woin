export function fitPopupScale(width,height,viewportWidth,viewportHeight){
 if(![width,height,viewportWidth,viewportHeight].every(n=>Number.isFinite(n)&&n>0))return 1;
 return Math.max(.01,Math.floor(Math.min(1,(viewportWidth-24)/width,(viewportHeight-24)/height)*1000)/1000);
}
export function popupPage(total,size,page){
 total=Math.max(0,Math.trunc(total)||0);size=Math.max(1,Math.trunc(size)||1);
 const pages=Math.max(1,Math.ceil(total/size));page=Math.max(0,Math.min(pages-1,Math.trunc(page)||0));
 return {page,pages,start:page*size,end:Math.min(total,(page+1)*size)};
}
function control(doc,text,label){const b=doc.createElement('button');b.type='button';b.textContent=text;b.setAttribute('aria-label',label||text);return b;}
export function mountPopupTabs(host,panels,labels){
 const doc=host.ownerDocument,nav=doc.createElement('nav');nav.className='popup-tabs';nav.setAttribute('aria-label','Các mục tùy chỉnh');
 let current=0;const buttons=labels.map((label,index)=>{
  const b=control(doc,label);b.onclick=()=>select(index);b.onkeydown=e=>{const delta={ArrowLeft:-1,ArrowRight:1}[e.key];if(!delta)return;e.preventDefault();select((index+delta+panels.length)%panels.length);buttons[current].focus();};nav.append(b);return b;
 });
 function select(index){if(!Number.isInteger(index)||index<0||index>=panels.length)return false;current=index;panels.forEach((p,i)=>p.hidden=i!==index);buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));return true;}
 host.insertBefore(nav,panels[0]);select(0);return {select,active:()=>current};
}
export function mountPopupPager(container,{pageSize=4,initialPage=0}={}){
 const items=Array.from(container.children),doc=container.ownerDocument,nav=doc.createElement('nav');nav.className='popup-pager';nav.setAttribute('aria-label','Chuyển trang');
 let current=initialPage;
 const before=control(doc,'← Trước','Trang trước'),label=doc.createElement('span'),after=control(doc,'Sau →','Trang sau');label.setAttribute('aria-live','polite');nav.append(before,label,after);container.after(nav);
 function refresh(){const p=popupPage(items.length,typeof pageSize==='function'?pageSize():pageSize,current);current=p.page;items.forEach((item,i)=>item.hidden=i<p.start||i>=p.end);before.disabled=current===0;after.disabled=current===p.pages-1;label.textContent=(current+1)+' / '+p.pages;nav.hidden=p.pages===1;}
 function next(){current++;refresh();}function previous(){current--;refresh();}
 before.onclick=previous;after.onclick=next;refresh();
 return {next,previous,refresh,page:()=>current,dispose(){items.forEach(item=>item.hidden=false);nav.remove();}};
}
export function installPopupFit({doc=document,win=window}={}){
 let frame=0;
 function refresh(){frame=0;for(const dialog of doc.querySelectorAll('dialog,#keepsake-panel')){
  if((dialog.id==='keepsake-panel'?dialog.hidden:!dialog.open)||dialog.id==='checkin-final')continue;
  dialog.classList.add('popup-fit');
  const scale=fitPopupScale(dialog.offsetWidth,dialog.offsetHeight,win.innerWidth,win.innerHeight);
  dialog.style.setProperty('--popup-scale',String(scale));
 }}
 function queue(){if(!frame)frame=win.requestAnimationFrame(refresh);}
 const mutations=new win.MutationObserver(queue);mutations.observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['open','hidden','class']});
 const sizes=new win.ResizeObserver(queue);doc.querySelectorAll('dialog,#keepsake-panel').forEach(d=>sizes.observe(d));
 win.addEventListener('resize',queue);doc.fonts?.ready.then(queue);queue();
 return {refresh,dispose(){mutations.disconnect();sizes.disconnect();win.removeEventListener('resize',queue);win.cancelAnimationFrame(frame);}};
}
