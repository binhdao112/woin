import {AVATAR_ACTIONS} from './avatar-actions.js';
export function createAvatarControls({input,isBlocked,onManualStart,onInteract,onStage,onAction,onStop}){
 const trigger=document.createElement('button');trigger.id='avatar-actions-open';trigger.textContent='♡ Biểu cảm';trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls','avatar-actions');document.querySelector('.tools').insertBefore(trigger,document.querySelector('#profile-edit')?.nextSibling||null);
 const panel=document.createElement('section');panel.id='avatar-actions';panel.hidden=true;panel.setAttribute('aria-label','Biểu cảm của nhân vật');panel.innerHTML='<div class="gesture-heading"><div><small>MỘT CHÚT CUTE CỦA BẠN</small><h2>Hôm nay, mood gì nè?</h2></div><button id="gesture-close" aria-label="Đóng biểu cảm">×</button></div><div class="gesture-buttons" role="group" aria-label="Chọn động tác"></div><div class="gesture-footer"><p id="gesture-status" role="status">Chọn một động tác để thử nhé.</p><button id="gesture-stop">Đứng yên</button></div>';
 document.body.append(panel);const status=panel.querySelector('#gesture-status');
 for(const action of AVATAR_ACTIONS){const button=document.createElement('button');button.dataset.gesture=action.id;button.setAttribute('aria-pressed','false');const icon=document.createElement('span');icon.textContent=action.icon;icon.setAttribute('aria-hidden','true');button.append(icon,document.createTextNode(action.label));button.onclick=()=>onAction(action.id);panel.querySelector('.gesture-buttons').append(button);}
 const pad=document.createElement('section');pad.id='walk-controls';pad.setAttribute('aria-label','Điều khiển di chuyển');pad.innerHTML='<div class="walk-keys"><button data-walk="KeyW" aria-label="Đi tới">↑</button><button data-walk="KeyA" aria-label="Đi sang trái">←</button><button data-walk="KeyS" aria-label="Đi lùi">↓</button><button data-walk="KeyD" aria-label="Đi sang phải">→</button></div><div class="walk-help"><strong>WASD / ↑ ↓ ← →</strong><span>Giữ để đi · Kéo để xoay</span><button id="walk-interact">E · Tương tác</button><p id="walk-status" role="status">Dạo một vòng cùng nhân vật của bạn.</p></div>';document.body.append(pad);
 let open=false,nearby=-2;const pressed=new Map();
 function release(){pressed.clear();input.clear();pad.querySelectorAll('[data-walk]').forEach(b=>b.classList.remove('pressed'));}
 function close({focus=false}={}){if(!open)return;open=false;onStop();onStage(false);panel.hidden=true;document.body.classList.remove('gesture-stage');trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus();}
 trigger.onclick=()=>{if(open){close({focus:true});return;}if(isBlocked())return;release();onManualStart({forAction:true});open=true;panel.hidden=false;document.body.classList.add('gesture-stage');trigger.setAttribute('aria-expanded','true');onStage(true);panel.querySelector('[data-gesture]').focus();};
 panel.querySelector('#gesture-close').onclick=()=>close({focus:true});panel.querySelector('#gesture-stop').onclick=onStop;
 panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close({focus:true});}});
 document.addEventListener('pointerdown',event=>{if(open&&!panel.contains(event.target)&&!trigger.contains(event.target))close();},true);
 const editable=target=>target instanceof Element&&!!target.closest('input,textarea,select,[contenteditable="true"]');
 window.addEventListener('keydown',event=>{
  if(open){if(event.key==='Escape'){event.preventDefault();close({focus:true});return;}if(['KeyW','KeyA','KeyS','KeyD'].includes(event.code)){close();}else return;}
  if(isBlocked()||editable(event.target)||event.altKey||event.ctrlKey||event.metaKey)return;
  if(event.code==='KeyE'&&!event.repeat){event.preventDefault();release();onInteract();return;}
  if(input.down(event.code)){event.preventDefault();if(!event.repeat)onManualStart();}
 });
 window.addEventListener('keyup',event=>{if(input.up(event.code))event.preventDefault();});window.addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
 for(const button of pad.querySelectorAll('[data-walk]')){
  button.addEventListener('pointerdown',event=>{if(isBlocked()||open)return;event.preventDefault();button.setPointerCapture(event.pointerId);pressed.set(event.pointerId,button.dataset.walk);input.down(button.dataset.walk);button.classList.add('pressed');onManualStart();});
  const up=event=>{const code=pressed.get(event.pointerId);if(!code)return;pressed.delete(event.pointerId);if(![...pressed.values()].includes(code))input.up(code);button.classList.remove('pressed');};for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,up);
  button.addEventListener('keydown',event=>{if(event.code==='Space'||event.code==='Enter'){event.preventDefault();if(!isBlocked()){input.down(button.dataset.walk);onManualStart();}}});button.addEventListener('keyup',event=>{if(event.code==='Space'||event.code==='Enter'){input.up(button.dataset.walk);event.preventDefault();}});button.addEventListener('blur',()=>input.up(button.dataset.walk));
 }
 const interact=pad.querySelector('#walk-interact');interact.onclick=onInteract;
 return {close,release,isOpen:()=>open,setAction(state){panel.querySelectorAll('[data-gesture]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.gesture===state?.id)));status.textContent=state?'Đang '+AVATAR_ACTIONS.find(a=>a.id===state.id).label.toLocaleLowerCase('vi')+'…':'Chọn một động tác để thử nhé.';},setNearby(index,name){if(index===nearby)return;nearby=index;interact.disabled=index<0;pad.querySelector('#walk-status').textContent=index<0?'Đi gần trạm đã mở để tương tác.':name;}};
}
