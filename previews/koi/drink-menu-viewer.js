// The reference photo is independent of the order form and never submits a drink.
export function createDrinkMenuViewer({dialog,opener,close,viewport,stage,image,zoomIn,zoomOut,reset,label,loading,error}){
 let zoom=1,pan=null;
 const dimensions=()=>({width:image.naturalWidth||2480,height:image.naturalHeight||1754});
 const fit=()=>{const size=dimensions();return Math.min(Math.max(1,viewport.clientWidth)/size.width,Math.max(1,viewport.clientHeight)/size.height);};
 function render(){
  const size=dimensions(),scale=fit()*zoom,width=Math.max(1,Math.round(size.width*scale)),height=Math.max(1,Math.round(size.height*scale));
  image.style.width=width+'px';image.style.height=height+'px';stage.style.width=Math.max(viewport.clientWidth,width)+'px';stage.style.height=Math.max(viewport.clientHeight,height)+'px';
  label.textContent=zoom===1?'Toàn ảnh':Math.round(zoom*100)+'%';zoomOut.disabled=zoom<=1;zoomIn.disabled=zoom>=8;viewport.style.cursor=zoom>1?'grab':'auto';
 }
 function change(next){
  const x=(viewport.scrollLeft+viewport.clientWidth/2)/Math.max(viewport.clientWidth,parseFloat(image.style.width)||1),y=(viewport.scrollTop+viewport.clientHeight/2)/Math.max(viewport.clientHeight,parseFloat(image.style.height)||1);
  zoom=Math.min(8,Math.max(1,next));render();
  viewport.scrollLeft=zoom===1?0:Math.max(0,x*Math.max(viewport.clientWidth,parseFloat(image.style.width))-viewport.clientWidth/2);
  viewport.scrollTop=zoom===1?0:Math.max(0,y*Math.max(viewport.clientHeight,parseFloat(image.style.height))-viewport.clientHeight/2);
 }
 opener.onclick=()=>{if(dialog.open)return;zoom=1;dialog.showModal();render();viewport.scrollLeft=0;viewport.scrollTop=0;close.focus();};
 close.onclick=()=>dialog.close();dialog.onclose=()=>{pan=null;opener.focus();};
 zoomIn.onclick=()=>change(zoom===1?Math.max(2,1/fit()):zoom*1.5);zoomOut.onclick=()=>change(zoom/1.5);reset.onclick=()=>change(1);
 image.onload=()=>{loading.hidden=true;error.hidden=true;if(dialog.open)render();};image.onerror=()=>{loading.hidden=true;error.hidden=false;};
 loading.hidden=Boolean(image.complete&&image.naturalWidth);error.hidden=true;
 // Touch uses native scrolling/pinch zoom; mouse users can drag the enlarged image.
 viewport.onpointerdown=e=>{if(e.pointerType!=='mouse'||e.button!==0||zoom<=1)return;pan={id:e.pointerId,x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.setPointerCapture?.(e.pointerId);viewport.style.cursor='grabbing';viewport.focus();e.preventDefault();};
 viewport.onpointermove=e=>{if(!pan||e.pointerId!==pan.id)return;viewport.scrollLeft=pan.left+pan.x-e.clientX;viewport.scrollTop=pan.top+pan.y-e.clientY;};
 function endPan(){pan=null;viewport.style.cursor=zoom>1?'grab':'auto';}
 viewport.onpointerup=endPan;viewport.onpointercancel=endPan;viewport.onlostpointercapture=endPan;
 addEventListener('resize',()=>{if(dialog.open)render();});
 if(typeof ResizeObserver==='function')new ResizeObserver(()=>{if(dialog.open)render();}).observe(viewport);
}
