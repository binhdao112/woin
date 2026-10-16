import * as T from './three.module.js';
import {AVATAR_OPTIONS,AVATAR_LABELS,createAvatarDraft,describeAvatar} from './avatar-profile.js';
import {createAvatar} from './avatar-rig.js';

const $=selector=>document.querySelector(selector);
const icons={hair:'◡',hairColor:'◒',outfit:'✧',color:'◕',skin:'☀',accessory:'✿'};

function choiceArt(field,option,avatar){
 const tint=key=>AVATAR_OPTIONS[key].find(item=>item.id===avatar[key]).color;
 const hair=tint('hairColor'),skin=tint('skin'),cloth=tint('color');let art='';
 if(field==='hair'){
  const style=option.id;
  art=(style==='bun'?`<circle cx="50" cy="15" r="13" fill="${hair}"/>`:'')+
   (style==='long'?`<rect x="21" y="21" width="58" height="66" rx="25" fill="${hair}"/>`:`<ellipse cx="50" cy="44" rx="30" ry="${style==='pixie'?25:33}" fill="${hair}"/>`)+
   `<ellipse cx="50" cy="49" rx="23" ry="25" fill="${skin}"/><path d="M27 37Q29 14 54 21Q72 18 75 39Q54 36 48 28Q40 39 27 37" fill="${hair}"/><g fill="#30303b"><circle cx="42" cy="49" r="2"/><circle cx="58" cy="49" r="2"/></g><path d="M45 61Q50 66 55 61" fill="none" stroke="#30303b" stroke-width="2" stroke-linecap="round"/>`;
 }else if(field==='outfit'){
  const paths={dress:'M39 16L31 26L35 41L22 77Q50 88 78 77L65 41L69 26L61 16Q50 25 39 16',tee:'M36 18L17 29L25 45L34 40L34 77L66 77L66 40L75 45L83 29L64 18Q50 29 36 18',hoodie:'M37 18Q50 5 63 18L79 30L84 69L69 73L64 43L66 79L34 79L36 43L31 73L16 69L21 30Z'};
  art=`<path d="${paths[option.id]}" fill="${cloth}" stroke="#52615e" stroke-width="2" stroke-linejoin="round"/>`+(option.id==='hoodie'?'<path d="M44 25V43M56 25V43M40 61H60V70H40Z" fill="none" stroke="#fff6e5" stroke-width="2"/>':'<circle cx="57" cy="37" r="3" fill="#fff6e5"/>');
 }else if(field==='accessory'){
  const artById={flower:'<g fill="#fff6e5" stroke="#c2a36b" stroke-width="1.5"><ellipse cx="50" cy="35" rx="11" ry="17"/><ellipse cx="35" cy="47" rx="17" ry="11"/><ellipse cx="65" cy="47" rx="17" ry="11"/><ellipse cx="41" cy="62" rx="10" ry="15"/><ellipse cx="59" cy="62" rx="10" ry="15"/></g><circle cx="50" cy="49" r="10" fill="#eac77b"/>',glasses:'<g fill="none" stroke="#967239" stroke-width="4"><circle cx="31" cy="47" r="16"/><circle cx="69" cy="47" r="16"/><path d="M47 45H53"/></g>',headphones:`<path d="M23 53V43A27 27 0 0154 16Q78 18 78 43V53" fill="none" stroke="${cloth}" stroke-width="8"/><g fill="${cloth}" stroke="#52615e" stroke-width="2"><rect x="17" y="43" width="15" height="29" rx="7"/><rect x="68" y="43" width="15" height="29" rx="7"/></g>`,hat:`<ellipse cx="50" cy="62" rx="38" ry="11" fill="#ead9b3" stroke="#967239" stroke-width="2"/><path d="M28 56L32 25Q50 16 68 25L72 56Z" fill="#fff6e5" stroke="#967239" stroke-width="2"/><path d="M29 48H71V57H29Z" fill="${cloth}"/>`,none:'<circle cx="50" cy="47" r="25" fill="none" stroke="#a8b8ad" stroke-width="2" stroke-dasharray="4 4"/><path d="M39 48L47 56L62 39" fill="none" stroke="#557761" stroke-width="3" stroke-linecap="round"/>'};
  art=artById[option.id];
 }
 return `<svg viewBox="0 0 100 92" aria-hidden="true" focusable="false">${art}</svg>`;
}

export function createAvatarStudio({name='',avatar}={}){
 const dialog=$('#welcome'),draft=createAvatarDraft(avatar),container=$('#avatar-preview');
 let savedName=name,field='hair',angle=0,renderer,scene,camera,rig;

 function drawPreview(){
  if(!renderer||!dialog.open)return;
  const {width,height}=container.getBoundingClientRect(),aspect=Math.max(width,1)/Math.max(height,1);
  camera.left=-1.02*aspect;camera.right=1.02*aspect;camera.updateProjectionMatrix();renderer.setSize(Math.max(1,width),Math.max(1,height),false);
  rig.group.rotation.y=angle;renderer.render(scene,camera);
 }
 function makePreview(){
  if(!renderer){
   try{
    renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
    renderer.domElement.setAttribute('aria-hidden','true');container.replaceChildren(renderer.domElement);
    scene=new T.Scene();camera=new T.OrthographicCamera(-1,1,1.02,-1.02,.1,20);camera.position.set(1.9,1.55,4.8);camera.lookAt(0,.76,0);
    scene.add(new T.HemisphereLight(0xffffff,0xa4b79b,2.7));const light=new T.DirectionalLight(0xffe7c8,3.5);light.position.set(-3,5,4);scene.add(light);
    const pedestal=new T.Mesh(new T.CylinderGeometry(.53,.58,.12,48),new T.MeshStandardMaterial({color:'#d8e0c8',roughness:.9}));pedestal.position.y=-.085;scene.add(pedestal);
   }catch{renderer?.dispose();renderer=null;container.textContent='Bạn vẫn có thể chọn diện mạo. Xem nhân vật khi bắt đầu hành trình.';return;}
  }
  if(rig){scene.remove(rig.group);rig.dispose();}rig=createAvatar(draft.read());scene.add(rig.group);drawPreview();
 }
 function updateSelection(){
  const avatar=draft.read();
  $('#avatar-description').textContent=describeAvatar(avatar);container.setAttribute('aria-label','Nhân vật 3D: '+describeAvatar(avatar));
  document.querySelectorAll('[data-avatar-field]').forEach(button=>{const key=button.dataset.avatarField;button.setAttribute('aria-pressed',String(key===field));button.querySelector('small').textContent=AVATAR_OPTIONS[key].find(choice=>choice.id===avatar[key]).label;});
  makePreview();
 }
 function showChoices(){
  const area=$('#avatar-choices');area.replaceChildren();const legend=document.createElement('legend');legend.textContent=AVATAR_LABELS[field];const back=document.createElement('button');back.type='button';back.className='avatar-back';back.textContent='Đổi mục ↑';back.onclick=()=>{$('.avatar-controls').scrollTop=0;document.querySelector('[data-avatar-field="'+field+'"]').focus();};legend.append(back);area.append(legend);area.dataset.field=field;
  const avatar=draft.read();
  for(const option of AVATAR_OPTIONS[field]){
   const label=document.createElement('label');label.className='avatar-option';const input=document.createElement('input');input.type='radio';input.name='avatar-'+field;input.value=option.id;input.checked=avatar[field]===option.id;input.setAttribute('aria-label',option.label);
   const art=document.createElement('span');art.className='avatar-choice-art';art.setAttribute('aria-hidden','true');
   if(option.color){art.classList.add('avatar-swatch');art.style.setProperty('--avatar-swatch',option.color);}else art.innerHTML=choiceArt(field,option,avatar);
   const text=document.createElement('span');text.textContent=option.label;label.append(input,art,text);area.append(label);
   input.onchange=()=>{draft.select(field,option.id);updateSelection();};
  }
 }
 for(const key of Object.keys(AVATAR_OPTIONS)){
  const button=document.createElement('button');button.type='button';button.dataset.avatarField=key;
  const icon=document.createElement('span');icon.textContent=icons[key];icon.setAttribute('aria-hidden','true');
  const text=document.createElement('span'),label=document.createElement('strong'),selected=document.createElement('small');label.textContent=AVATAR_LABELS[key];text.append(label,selected);button.append(icon,text);
  button.onclick=()=>{field=key;showChoices();document.querySelectorAll('[data-avatar-field]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));if(innerWidth<=700){const pane=$('.avatar-controls');pane.scrollTop+=$('#avatar-choices').getBoundingClientRect().top-pane.getBoundingClientRect().top-3;}};$('#avatar-categories').append(button);
 }
 function open(){
  draft.cancel();field='hair';angle=0;$('#welcome-name').value=savedName;$('#welcome-name').setCustomValidity('');$('#avatar-cancel').hidden=!savedName;$('#welcome-submit').textContent=savedName?'Lưu nhân vật & tiếp tục →':'Cùng nhân vật của mình đi chơi →';
  $('#welcome-music').checked=$('#music-toggle').getAttribute('aria-pressed')==='true';$('#avatar-name').textContent=savedName||'Sắp là bạn rồi ✦';
  dialog.showModal();dialog.scrollTop=0;$('#welcome .avatar-layout').scrollTop=0;$('.avatar-controls').scrollTop=0;showChoices();updateSelection();
 }
 $('#profile-edit').onclick=open;
 $('#avatar-cancel').onclick=()=>{draft.cancel();dialog.close();};
 dialog.addEventListener('cancel',event=>{if(!savedName)event.preventDefault();else draft.cancel();});
 $('#avatar-random').onclick=()=>{draft.randomize();showChoices();updateSelection();};
 $('#avatar-turn-left').onclick=()=>{angle-=Math.PI/4;drawPreview();};$('#avatar-turn-right').onclick=()=>{angle+=Math.PI/4;drawPreview();};
 $('#welcome-name').oninput=()=>{$('#welcome-name').setCustomValidity('');$('#avatar-name').textContent=$('#welcome-name').value.trim()||'Sắp là bạn rồi ✦';};
 $('#welcome-form').onsubmit=event=>{
  event.preventDefault();const name=$('#welcome-name').value.trim().replace(/\s+/g,' ').slice(0,40);
  if(!name){$('#welcome-name').setCustomValidity('Cho mình biết tên bạn nhé.');$('#welcome-name').reportValidity();return;}
  $('#welcome-name').setCustomValidity('');const avatar=draft.commit();savedName=name;
  window.dispatchEvent(new CustomEvent('welcome-profile',{detail:{name,avatar}}));dialog.close();
  window.dispatchEvent(new CustomEvent('profile-music',{detail:{enabled:$('#welcome-music').checked}}));
 };
 window.addEventListener('journey-profile',event=>{savedName=event.detail.name;draft.restore(event.detail.avatar);});
 const observer=new ResizeObserver(drawPreview);observer.observe(container);
 window.addEventListener('pagehide',event=>{if(event.persisted)return;observer.disconnect();if(rig){scene.remove(rig.group);rig.dispose();}if(scene)scene.traverse(node=>{if(node.isMesh){node.geometry.dispose();node.material.dispose();}});renderer?.dispose();},{once:true});
 return {open};
}
