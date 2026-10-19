import * as T from './three.module.js';
import {installPopupFit,mountPopupTabs,mountPopupPager} from './popup-layout.js?v=popup-fit-20261019-2';
import {wishes} from './wishes.js';
import {getJourneyProgress, canVisitStation, getPrimaryAction} from './journey.js';
import {createCardModel, cardFilename, renderWishCard, canvasToPng} from './wish-card.js';
import {renderSocialCard, socialCardFilename, getSocialCopy, loadCardArtwork, SOCIAL_TEMPLATES, getSocialTemplate} from './social-card.js';
import { CAMPUS_STOPS, createCampus } from './campus.js';
import {loadSharedAlbum,findMemoryPhoto} from './memory-album.js?v=team-album-20261016-1';
import {createDrinkCounter} from './drink-counter.js?v=popup-fit-20261019-2';
import {drinkLabel} from './drink-orders.js';
import {normaliseLuckySet,formatLuckySet} from './lucky-numbers.js';
import {normaliseAvatar} from './avatar-profile.js';
import {createAvatar} from './avatar-rig.js?v=campus-20261016-1';
import {createAvatarStudio} from './avatar-studio.js?v=name-picker-20261019-1';
import {createAvatarActionPlayer} from './avatar-actions.js?v=campus-20261016-1';
import {createAvatarActionEffects} from './avatar-action-effects.js?v=campus-20261016-1';
import {createAvatarControls} from './avatar-controls.js?v=campus-20261016-1';
import {createMovementInput,movementVector,stepMovement,createWalkableWorld,nearestStation} from './avatar-movement.js?v=campus-20261016-1';
import {canonicalCampusURL} from './campus-url.js';
import {createCheckinModel} from './checkin-card.js';
import {createCheckinStudio} from './checkin-studio.js?v=checkin-photo-20261019-1';
import './experience.js?v=lucky-ticket-20261019-2';
const $=s=>document.querySelector(s), modal=$('#final');
const campusURL=canonicalCampusURL(location.href);if(location.href!==campusURL)history.replaceState(history.state,'',campusURL);
document.body.dataset.world='campus';
const names=["Sảnh văn phòng", "Góc cà phê", "Vườn ý tưởng", "Cầu đồng đội", "Trạm nạp năng lượng", "Bưu điện lời cảm ơn", "Trạm kỷ niệm", "Sân thượng 20/10"];
const notes=[["Tấm bản đồ bí mật", "Hành trình nhỏ này dành cho các đồng nghiệp nữ nhân ngày 20/10. Mỗi điểm dừng là một lời cảm ơn cho những điều rất đời thường ở văn phòng.", "Hôm nay bạn muốn mang theo gì?", ["Một chiếc bụng vui vẻ", "Một tinh thần khám phá", "Một ngày ít cuộc họp"], "Đã chuẩn bị hành trang. Chúc bạn một chuyến đi vui!"], ["Menu của đồng đội", "Một ly nước không giải quyết hết công việc, nhưng một lời hỏi han có thể khiến ngày làm việc dễ chịu hơn.", "Chọn đồ uống cho giờ nghỉ:", ["Cà phê sữa đá", "Trà đào mát lạnh", "Nước lọc cũng được"], "Đơn đã nhận! Kèm một lời chúc: hôm nay làm việc thuận lợi, tan ca đúng giờ."], ["Chiếc bảng không có ý tưởng sai", "Góc này dành cho những người luôn tìm cách tốt hơn. Cảm ơn vì những câu hỏi giúp cả nhóm hiểu đúng vấn đề.", "Nếu có một “nút thần kỳ” ở văn phòng, bạn chọn:", ["Họp xong là có biên bản", "Task nào cũng đủ thông tin", "Ý tưởng đến đúng lúc"], "Ý tưởng đã được ghim lên bảng. Mọi góc nhìn đều xứng đáng được lắng nghe."], ["Một tin nhắn rất có ích", "Có những tin nhắn ngắn mà đọc xong thấy nhẹ cả người.", "Bạn muốn nhận tin nhắn nào hôm nay?", ["Phần này để mình hỗ trợ", "Mình đã kiểm tra, ổn rồi nhé", "Cứ hỏi nếu cần thêm thông tin"], "Đã nhận một chút năng lượng đồng đội. Cảm ơn vì đã cùng nhau làm tốt công việc."], ["Giấy phép nghỉ 30 giây", "Rời mắt khỏi màn hình một chút, thả lỏng vai, uống một ngụm nước. Không cần phải luôn bận rộn mới là một ngày có giá trị.", "Chọn một khoảng nghỉ cho mình:", ["Nghe một bài hát yêu thích", "Đi bộ một vòng", "Nhắn hẹn ăn trưa cùng nhóm"], "Khoảng nghỉ đã được duyệt bởi chính bạn. Chúc bạn khỏe mạnh và có nhịp làm việc dễ chịu."], ["Bưu thiếp gửi đồng nghiệp", "Những câu này là gợi ý để bạn nói trực tiếp với người đồng đội của mình. Không có tin nhắn nào được gửi tự động.", "Chọn một câu bạn muốn giữ lại:", ["Cảm ơn vì đã hỗ trợ mình", "Mình học được nhiều từ bạn", "Thật vui khi được cùng team"], "Đã lưu câu này trong sổ tay của chuyến đi. Một lời cảm ơn nói đúng lúc luôn có ý nghĩa."], ["Bàn tiệc cuối hành trình", "Một buổi gặp mặt nhỏ để chúc mừng các đồng nghiệp nữ — những người đem đến chuyên môn, sự bền bỉ và nhiều góc nhìn cho đội ngũ.", "Điều ước nào dành cho chặng tiếp theo?", ["Công việc suôn sẻ, nhiều cơ hội", "Khỏe mạnh, cân bằng, vui vẻ", "Nhiều trải nghiệm ngoài giờ làm"], "Chúc điều bạn chọn sẽ đi cùng bạn trong những ngày sắp tới. Happy 20/10!"]];
const stops=CAMPUS_STOPS.map(p=>new T.Vector3(...p));
let index=0,moving=false,arrival=false,party=0;
const chapters=[["01 · SẢNH VĂN PHÒNG", "8:30 sáng. Văn phòng hôm nay có gì đó khác: trên bàn là một tấm bản đồ cùng lời nhắn “Hôm nay, deadline duy nhất là vui vẻ.” Cùng đi một vòng để sưu tầm bảy kỷ vật từ những người đồng nghiệp tuyệt vời nhé.", "Ghé Góc cà phê →"], ["02 · GÓC CÀ PHÊ · MỘT KHỞI ĐẦU DỄ CHỊU", "Máy pha cà phê đã sẵn sàng. Có những buổi sáng, một câu “Uống gì không, mình lấy giúp?” khiến ngày mới dễ chịu hẳn. Dấu ấn đầu tiên: sự quan tâm từ những việc rất nhỏ.", "Đến Vườn ý tưởng →"], ["03 · VƯỜN Ý TƯỞNG · MỖI GÓC NHÌN ĐỀU CÓ GIÁ TRỊ", "Một cuộc họp đang hơi bí ý tưởng. Ai đó lên tiếng: “Hay mình thử cách khác?” Và cả nhóm tìm được hướng đi mới. Cảm ơn những người luôn dám đề xuất, đặt câu hỏi và biến điều chưa rõ thành điều có thể làm.", "Qua Cầu đồng đội →"], ["04 · CẦU ĐỒNG ĐỘI · CÙNG NHAU THÌ NHẸ HƠN", "Một đầu cầu là task còn dang dở, đầu kia là ngày bàn giao. Chiếc cầu được dựng bằng những câu “Để mình xem cùng”, “Mình hỗ trợ phần này nhé”. Làm đồng nghiệp không chỉ là ngồi gần, mà còn là sẵn sàng giúp nhau tiến lên.", "Ghé Trạm nạp năng lượng →"], ["05 · TRẠM NẠP NĂNG LƯỢNG · NGHỈ MỘT CHÚT NHÉ", "Bạn đã đi được một quãng dài. Ở đây không có thông báo họp: chỉ có cây xanh, ghế nghỉ và một lời nhắc uống nước. Chúc các bạn có thời gian cho bản thân, cho sở thích và cho những niềm vui ngoài công việc.", "Đến Bưu điện lời cảm ơn →"], ["06 · BƯU ĐIỆN LỜI CẢM ƠN · NHỮNG ĐIỀU ÍT KHI NÓI", "Trong chiếc hòm thư có những mẩu giấy: “Cảm ơn vì đã giải thích lại”, “Cảm ơn vì góp ý thẳng thắn”, “Cảm ơn vì luôn giữ lời”. Có những đóng góp âm thầm nhưng đội ngũ luôn cần và trân trọng.", "Lên Sân thượng 20/10 →"], ["07 · SÂN THƯỢNG 20/10 · HÔM NAY LÀ NGÀY CỦA CÁC BẠN", "Bạn đã gom đủ bảy kỷ vật. Trên sân thượng, một buổi gặp mặt nhỏ đang chờ: có bánh, hoa và những lời chúc từ đồng đội. Cảm ơn các bạn vì chuyên môn, sự tận tâm và cá tính riêng làm nên một đội ngũ nhiều màu sắc.", "Mở thiệp từ đồng đội ✦"]];
notes.splice(6,0,['Album của team','Những khoảnh khắc cùng làm, cùng vui và cùng trưởng thành.','Mở album 3D',[],'']);
chapters[5][2]='Đến Trạm kỷ niệm →';chapters.splice(6,0,['07 · TRẠM KỶ NIỆM · CHÚNG MÌNH ĐÃ CÙNG NHAU','Những khung hình do host chuẩn bị sẵn kể lại hành trình của cả team. Chọn một tấm bạn thích để mang theo; bạn cũng có thể thêm ảnh riêng từ máy.','Lên Sân thượng 20/10 →']);chapters[7][0]='08 · SÂN THƯỢNG 20/10 · HÔM NAY LÀ NGÀY CỦA CÁC BẠN';chapters[7][1]=chapters[7][1].replace('sáu','bảy');


 names[0]='Sảnh VNG Campus';names[3]='Bậc thềm đồng đội';names[7]='Vườn check-in 20/10';
 chapters[0][0]='01 · SẢNH VNG CAMPUS · CHÀO MỪNG VỀ NHÀ';
 chapters[0][1]='Một ngày 20/10 thật khác ở nơi mình đi làm mỗi ngày. Từ sảnh đón đến góc cà phê, qua những khoảng sân xanh, bảy món quà nhỏ đang chờ bạn trong phiên bản campus thu nhỏ này.';
 chapters[2][2]='Đến Bậc thềm đồng đội →';
 chapters[3][0]='04 · BẬC THỀM ĐỒNG ĐỘI · CÙNG NHAU THÌ NHẸ HƠN';
 chapters[3][1]='Ngồi lại trên bậc thềm xanh, trao nhau một ý tưởng hay một câu “Để mình hỗ trợ”. Những điều nho nhỏ ấy làm nên một nơi mình muốn quay về mỗi ngày.';
 chapters[6][2]='Đến Vườn check-in 20/10 →';
 chapters[7][0]='08 · VƯỜN CHECK-IN 20/10 · HÔM NAY BẠN TỎA SÁNG';
 chapters[7][1]='Bảy kỷ vật đã đủ, giờ đến lượt bạn tỏa sáng. Ở góc vườn quen thuộc của campus, chọn một mẫu thiệp, thêm bức ảnh mình thích và giữ lại khoảnh khắc 20/10 cùng đồng đội.';
 document.title='VNG Campus · Một vòng cùng team · 20/10';
 $('#world').setAttribute('aria-label','Campus 3D cách điệu, lấy cảm hứng từ VNG Campus');
 $('.side h1').innerHTML='Một vòng<br><em>campus mình.</em>';
 $('.side>p').textContent='Những góc quen, một ngày khác. Ghé 8 điểm dừng ở campus, gom 7 kỷ vật và mang về một tấm thiệp dành riêng cho bạn.';
 $('#welcome .eyebrow').textContent='CHÀO MỪNG VỀ NHÀ · VNG CAMPUS';
 $('#loading p').textContent='Đang mở cửa campus cho một ngày thật đặc biệt';
 $('#memory-keep').textContent='Giữ khung ảnh & đến vườn check-in →';
 $('#journey-album>p:last-of-type').textContent='Gom đủ 7 kỷ vật qua các điểm dừng để nhận thiệp cá nhân hóa tại Vườn check-in 20/10.';
 document.querySelectorAll('[data-stop]').forEach((button,i)=>button.lastChild.textContent=names[i]);
try{
const scene=new T.Scene();scene.background=new T.Color('#e3e9dc');scene.fog=new T.FogExp2('#e3e9dc',.003);
const camera=new T.PerspectiveCamera(42,innerWidth/innerHeight,.1,180),renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;$('#world').append(renderer.domElement);
scene.add(new T.HemisphereLight(0xffffff,0x9bb6a0,2.7));const sun=new T.DirectionalLight(0xffd5a4,4);sun.position.set(-8,18,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-22,right:22,top:20,bottom:-20});scene.add(sun);
const mats={grass:mat(0x9bcf9a),rock:mat(0x93b5b6),edge:mat(0x7ca1ad),wood:mat(0xa67a56),gold:mat(0xffcc78,.4),pink:mat(0xe7a6a0),green:mat(0x69ad83),cream:mat(0xf5e5bd),dark:mat(0x304c54)};
function mat(c,r=.85){return new T.MeshStandardMaterial({color:c,roughness:r});}
function mesh(g,m,p,parent=scene){const o=new T.Mesh(g,m);o.position.set(...p);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(x,y,z,m,p,parent){return mesh(new T.BoxGeometry(x,y,z),m,p,parent);}
function cylinder(r1,r2,h,m,p,parent,n=8){return mesh(new T.CylinderGeometry(r1,r2,h,n),m,p,parent);}
function sphere(r,m,p,parent){return mesh(new T.IcosahedronGeometry(r,1),m,p,parent);}
function textSprite(txt,size=1.5,color='#173f49'){const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font='600 80px sans-serif';ctx.textAlign='center';let fontSize=80;while(ctx.measureText(txt).width>970&&fontSize>20){fontSize-=2;ctx.font='600 '+fontSize+'px sans-serif';}ctx.fillText(txt,512,150);const s=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),depthTest:false,transparent:true}));s.scale.set(size*4,size,1);return s;}
const campus=createCampus({label:textSprite});
if(campus)scene.add(campus.group);
const clickables=[...campus.clickables],gifts=[];
// Collectible symbols hovering over the destinations.
for(let i=0;i<stops.length-1;i++){const g=new T.Group();g.position.copy(stops[i]).add(new T.Vector3(0,1.6,.5));scene.add(g);const core=i===1?mesh(new T.OctahedronGeometry(.27),mats.gold,[0,0,0],g):i===2?sphere(.25,mats.gold,[0,0,0],g):sphere(.27,mats.pink,[0,0,0],g);const ring=mesh(new T.TorusGeometry(.43,.015,6,40),mats.gold,[0,0,0],g);ring.rotation.x=Math.PI/2;gifts.push(g);}
// The body is a separate child: changing clothes preserves the player's route and souvenirs.
const player=new T.Group();scene.add(player);let appearance=normaliseAvatar(),playerAvatar=createAvatar(appearance),legs=playerAvatar.legs;player.add(playerAvatar.group);
let actionPlayer=null,actionUI=null;const movementInput=createMovementInput(),walkWorld=createWalkableWorld(stops.map(p=>p.toArray()));let wasWalking=false;
function applyAvatar(value){actionUI?.close();actionPlayer?.stop();appearance=normaliseAvatar(value);player.remove(playerAvatar.group);playerAvatar.dispose();playerAvatar=createAvatar(appearance);legs=playerAvatar.legs;player.add(playerAvatar.group);}
player.position.copy(stops[0]).add(new T.Vector3(0,0,.7));
// Warm drifting stars above the campus.
const particles=new T.BufferGeometry(),pos=new Float32Array(450);for(let i=0;i<450;i++)pos[i]=(Math.random()-.5)*45;particles.setAttribute('position',new T.BufferAttribute(pos,3));const stars=new T.Points(particles,new T.PointsMaterial({color:0xffd59e,size:.055,transparent:true,opacity:.8}));scene.add(stars);
let yaw=.38,pitch=.72,zoom=25,drag=false,lastX=0,lastY=0,dragged=0;const focus=new T.Vector3(0,0,1),targetFocus=new T.Vector3(0,0,1);const pointer=new T.Vector2(),ray=new T.Raycaster();
renderer.domElement.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;dragged=0;renderer.domElement.setPointerCapture(e.pointerId);});renderer.domElement.addEventListener('pointermove',e=>{if(drag){const dx=e.clientX-lastX,dy=e.clientY-lastY;yaw-=dx*.005;pitch=T.MathUtils.clamp(pitch+dy*.003,.35,1.1);dragged+=Math.abs(dx)+Math.abs(dy);lastX=e.clientX;lastY=e.clientY;}});renderer.domElement.addEventListener('pointerup',e=>{drag=false;if(dragged<8){if(keepsakeActive)return;pointer.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(clickables)[0];if(hit)go(hit.object.userData.stop);}});renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();zoom=T.MathUtils.clamp(zoom+e.deltaY*.015,5,160);},{passive:false});
function advanceJourney(){
 if(moving)return;
 if(player.position.distanceTo(stops[index].clone().add(new T.Vector3(0,0,.7)))>1.65){go(index);return;}
 arrival=true;
 const action=getPrimaryAction(index,keepsakeCollection);
 if(action.type==='collect'){if(action.station===6)openMemories();else openKeepsake(action.station);}
 else if(action.type==='move')go(action.station);
 else openFinalCheckin();
}
function updateUI(){
 const progress=getJourneyProgress(keepsakeCollection),hasGift=keepsakeCollection.has(index),c=chapters[index];
 $('#explore').disabled=moving;$('#drink-open').disabled=moving;
 $('#explore').textContent=index===6?'Mở album ảnh ▧':index===7?'Album hành trình ▤':'Xem kỷ vật ✿';
 $('#chapter').textContent=c[0];$('#narrative').textContent=personalMessage(c[1]);
 $('#next').textContent=index===7?'Check-in cùng nhân vật ✦':hasGift?c[2]:['Nhận vé khởi hành →','Chọn đồ uống →','Rút lá bài cảm hứng →','Nhận số may mắn →','Quay vòng niềm vui →','Bóc quẻ & nhận thư →','Giữ khung ảnh kỷ niệm →'][index];
 if(!moving&&player.position.distanceTo(stops[index].clone().add(new T.Vector3(0,0,.7)))>1.65)$('#next').textContent='Đi đến '+names[index]+' →';
 $('#next').disabled=moving;
 const label=progress.count+' / 7 kỷ vật';
 $('#count').textContent=label;$('#keepsake-count').textContent=label;$('#album-progress').textContent=label+' đã giữ lại';
 $('.progress').setAttribute('aria-valuenow',String(progress.count));
 document.querySelectorAll('.progress span').forEach((span,k)=>span.classList.toggle('done',progress.collected[k]));
 document.querySelectorAll('[data-stop]').forEach((button,k)=>{
  button.disabled=moving||!canVisitStation(k,keepsakeCollection);
  button.classList.toggle('active',k===index);button.classList.toggle('collected',progress.collected[k]===true);
  if(k===index){button.setAttribute('aria-current','step');if(innerWidth<700)button.scrollIntoView({block:'nearest',inline:'center'});}else button.removeAttribute('aria-current');
 });
 gifts.forEach((gift,k)=>gift.visible=!progress.collected[k]);
 if(campus)campus.updateProgress(keepsakeCollection,index);
}
let destination=player.position.clone(),waypoints=[];function go(i){
 if(moving||!canVisitStation(i,keepsakeCollection)||(i===index&&arrival&&player.position.distanceTo(stops[i].clone().add(new T.Vector3(0,0,.7)))<.2))return;
 actionUI?.close();actionPlayer?.stop();movementInput.clear();
 closeKeepsake();closeMemories();
 for(let n=animations.length-1;n>=0;n--)if(animations[n].g===player)animations.splice(n,1);
 const route=walkWorld.findPath(player.position,{x:stops[i].x,z:stops[i].z+.7});if(!route.length)return;
 waypoints=route.map(point=>new T.Vector3(point.x,0,point.z));
 $('#effect-toast').hidden=true;index=i;moving=true;arrival=true;
 destination=waypoints.shift();targetFocus.copy(stops[i]).multiplyScalar(.25);
 $('#chapter').textContent='ĐANG ĐẾN TRẠM TIẾP THEO';$('#narrative').textContent=personalMessage('Dạo một vòng qua những góc quen của campus. Một món quà nhỏ đang chờ bạn ở điểm dừng tiếp theo.');
 $('#next').textContent='Đang trên đường…';$('#next').disabled=true;$('#explore').disabled=true;
 document.querySelectorAll('[data-stop]').forEach(button=>button.disabled=true);
}
$('#next').onclick=()=>advanceJourney();document.querySelectorAll('[data-stop]').forEach(b=>b.onclick=()=>go(Number(b.dataset.stop)));$('.close').onclick=()=>modal.close();$('#celebrate').onclick=()=>{party=1;modal.close();applyChoice(7,1,'Khỏe mạnh, cân bằng, vui vẻ');};$('#replay').onclick=()=>{
 actionUI?.close();actionPlayer?.stop();movementInput.clear();modal.close();$('#wish-card').close();closeKeepsake();closeMemories();keepsakeCollection.clear();finalWish=null;currentWish=null;
 savedFrames.forEach(g=>{scene.remove(g);clearGroup(g);});savedFrames.clear();selected={};clearChoiceEffects();
 index=0;arrival=true;moving=false;waypoints=[];player.position.copy(stops[0]).add(new T.Vector3(0,0,.7));targetFocus.set(0,0,1);
 updateUI();saveJourney();
};$('#wish-replay').onclick=()=>$('#replay').onclick();

const journal=$('#journal'); let selected={};
function showNote(){if(moving)return;if(index===6){openMemories();return;}const n=notes[index];$('#note-title').textContent=n[0];$('#note-body').textContent=personalMessage(n[1]);$('#note-question').textContent=n[2];$('#choices').replaceChildren();$('#note-result').textContent=selected[index] ? '✓ '+selected[index]+' — '+n[4] : '';$('#note-continue').hidden=!selected[index];n[3].forEach((v,i)=>{const b=document.createElement('button');b.textContent=v;b.className='choice';b.classList.toggle('selected',selected[index]===v);b.onclick=()=>{selected[index]=v;$('#note-result').textContent='✓ '+v+' — '+n[4];$('#note-continue').hidden=false;party=.6;document.querySelectorAll('.choice').forEach(x=>x.classList.toggle('selected',x===b));journal.close();applyChoice(index,i,v);};$('#choices').append(b);});journal.showModal();}
$('#note-continue').onclick=()=>{journal.close();advanceJourney();};$('#effect-next').onclick=()=>{$('#effect-toast').hidden=true;advanceJourney();};$('#effect-again').onclick=()=>{const value=selected[index];if(value)applyChoice(index,notes[index][3].indexOf(value),value);};$('#explore').onclick=()=>index===6?openMemories():index===7?openJourneyAlbum():openKeepsake(index);$('#journal-close').onclick=()=>journal.close();$('#journal-open').onclick=showNote;function worldZoom(){return Math.max(43,52*innerHeight/innerWidth);}
$('#map-reset').onclick=()=>{yaw=.38;pitch=.72;zoom=worldZoom();targetFocus.set(0,0,1);};
addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;if(keepsakeActive){if(e.key==='Escape')closeKeepsake();return;}if(memoryOpen){if(e.key==='ArrowLeft'){e.preventDefault();moveMemory(-1);}if(e.key==='ArrowRight'){e.preventDefault();moveMemory(1);}if(e.key==='Escape')closeMemories();}});

// Each choice creates a visible scene event, with persistent souvenirs and timed animation.
const souvenirs=new T.Group();player.add(souvenirs);
const stationEffects=new Map(), animations=[], confetti=[];
let effectTime=0, closeupUntil=0, savedZoom=34;
const effectColors=[0xffbb55,0xf58ead,0x70c9c2,0xb39ee8,0xffe58a];
function clearGroup(g){while(g.children.length){const child=g.children[0];g.remove(child);child.traverse(o=>{if(o.geometry)o.geometry.dispose();});}}
function clearChoiceEffects(){clearGroup(souvenirs);stationEffects.forEach(g=>{scene.remove(g);clearGroup(g);});stationEffects.clear();animations.length=0;confetti.forEach(p=>scene.remove(p.mesh));confetti.length=0;$('#effect-toast').hidden=true;closeupUntil=0;}
function stationGroup(k){const old=stationEffects.get(k);if(old){for(let i=animations.length-1;i>=0;i--){let node=animations[i].g;while(node&&node!==old)node=node.parent;if(node===old)animations.splice(i,1);}scene.remove(old);clearGroup(old);}const g=new T.Group();g.position.copy(stops[k]);scene.add(g);stationEffects.set(k,g);return g;}
function celebrateAt(p,count=70){if(document.querySelector('dialog[open]'))return;if(reduced)count=20;for(let i=0;i<count;i++){const o=mesh(new T.PlaneGeometry(.10,.18),new T.MeshBasicMaterial({color:effectColors[i%5],side:T.DoubleSide}),[p.x+(Math.random()-.5)*2,p.y+2+Math.random()*2,p.z+(Math.random()-.5)*2]);confetti.push({mesh:o,v:new T.Vector3((Math.random()-.5)*2,1+Math.random()*2,(Math.random()-.5)*2),life:3+Math.random()*2});}while(confetti.length>200){const old=confetti.shift();scene.remove(old.mesh);old.mesh.geometry.dispose();old.mesh.material.dispose();}}
function animate(g,seconds,fn){animations.push({g,start:effectTime,seconds,fn});}
function badge(g,txt,y=2.9){const spr=textSprite(txt,.36);spr.position.set(0,y,0);g.add(spr);animate(spr,2,u=>{spr.position.y=y+Math.sin(u*Math.PI)*.5;});}
function cup(parent,kind,p){const g=new T.Group();parent.add(g);g.position.set(...p);const material=[mats.cream,mats.pink,mat(0x9fdbe7)][kind];cylinder(.15,.11,.35,material,[0,0,0],g,20);cylinder(.13,.13,.012,mat([0x694730,0xe5a04c,0xb7e3ee][kind]),[0,.18,0],g,20);if(kind===0){const handle=mesh(new T.TorusGeometry(.095,.025,6,18),material,[.17,.02,0],g);handle.rotation.y=Math.PI/2;for(let n=0;n<3;n++)box(.065,.045,.065,mats.cream,[(n-1)*.06,.2,(n%2)*.04],g);}else{cylinder(.012,.012,.35,mats.cream,[.055,.28,0],g,6);if(kind===1)sphere(.07,mats.gold,[.1,.11,.02],g);}return g;}
function letter(g,p){const env=box(.42,.28,.045,mats.cream,p,g);const flap=mesh(new T.ConeGeometry(.19,.17,3),mats.pink,[p[0],p[1]+.03,p[2]+.03],g);flap.rotation.z=Math.PI;return env;}
function applyChoice(k,choice,value){if(moving)return;const g=stationGroup(k);const effectKey=k===7?6:k;const labels=[['Bụng vui, chuyến đi vui!','Sẵn sàng khám phá!','Hôm nay họp ít, vui nhiều!'],['Cà phê sữa đá của bạn đây!','Một ly trà đào mát lạnh!','Nạp nước, nạp năng lượng!'],['Biên bản đã sẵn sàng!','Task đã đủ thông tin!','Ý tưởng mới vừa nảy ra!'],['Có đồng đội hỗ trợ rồi!','Đã kiểm tra: mọi thứ ổn!','Đồng đội luôn sẵn sàng!'],['Một bản nhạc cho giờ nghỉ!','Đi dạo một vòng nào!','Bữa trưa đã có đồng đội!'],['Cảm ơn vì đã hỗ trợ mình','Mình học được nhiều từ bạn','Thật vui khi được cùng team'],['Chúc bạn nhiều cơ hội!','Khỏe mạnh và luôn vui vẻ!','Nhiều chuyến đi đáng nhớ!']];
 player.rotation.y=yaw;targetFocus.copy(stops[k]).add(new T.Vector3(0,.5,0));if(effectTime>closeupUntil)savedZoom=zoom;zoom=innerWidth<700?19:14;closeupUntil=effectTime+6;
 $('#effect-title').textContent=labels[effectKey][choice];$('#effect-detail').textContent=value+' · '+(k===1?'Nhân vật đã nhận đồ uống.':'Một dấu ấn mới vừa xuất hiện trên đảo.');$('#effect-toast').hidden=false;$('#effect-next').textContent=k===7?'Mở lời chúc 20/10 ✦':'Đến trạm tiếp theo →';
 if(k===0){if(choice===0){const snack=new T.Group();souvenirs.add(snack);snack.position.set(-.36,.7,0);const donut=mesh(new T.TorusGeometry(.16,.08,8,24),mats.gold,[0,0,0],snack);donut.rotation.x=.6;for(let i=0;i<6;i++)sphere(.025,mats.pink,[Math.cos(i)*.16,Math.sin(i)*.16,.08],snack);}else if(choice===1){const flag=new T.Group();souvenirs.add(flag);flag.position.set(-.33,.6,0);cylinder(.015,.015,.85,mats.wood,[0,.3,0],flag);box(.32,.22,.025,mats.pink,[.16,.6,0],flag);}else{const calendar=box(.8,1,.12,mats.cream,[0,1.7,-.4],g);const check=textSprite('✓ HỌP ÍT THÔI',.25);check.position.set(0,1.8,-.3);g.add(check);animate(calendar,2,u=>calendar.rotation.y=Math.sin(u*6)*.1);}}
 if(k===1){const old=souvenirs.getObjectByName('drink');if(old){souvenirs.remove(old);clearGroup(old);}const drink=cup(souvenirs,choice,[.38,.78,.16]);drink.name='drink';drink.scale.setScalar(1.15);animate(drink,1,u=>{drink.position.y=.78+Math.sin(u*Math.PI)*.3;drink.rotation.z=-Math.sin(u*Math.PI)*.35;});const tray=cylinder(.6,.6,.06,mats.cream,[0,1.06,.5],g,24);for(let i=0;i<3;i++)cup(g,choice,[-.35+i*.35,1.28,.5]);}
 if(k===2){box(1.6,1.1,.09,mats.cream,[0,1.6,-.6],g);if(choice===0){for(let i=0;i<4;i++)box(.85-i*.1,.035,.03,mats.green,[-.1,1.85-i*.17,-.53],g);badge(g,'✓ BIÊN BẢN HOÀN TẤT',2.6);}else if(choice===1){for(let i=0;i<4;i++){box(.3,.3,.03,[mats.gold,mats.pink,mats.grass,mats.cream][i],[-.55+i*.36,1.65,-.52],g);}badge(g,'✓ ĐỦ THÔNG TIN',2.6);}else{const bulb=sphere(.35,mats.gold,[0,2.4,-.4],g);cylinder(.15,.15,.2,mats.dark,[0,2.08,-.4],g);const glow=new T.PointLight(0xffd36e,4,5);glow.position.copy(bulb.position);g.add(glow);for(let j=0;j<8;j++){const a=j/8*6.28;box(.06,.22,.04,mats.gold,[Math.cos(a)*.6,2.4+Math.sin(a)*.6,-.4],g);}}}
 if(k===3){const helper=new T.Group();g.add(helper);helper.position.set(1,.05,.8);cylinder(.18,.22,.5,mats.green,[0,.45,0],helper);sphere(.2,mats.cream,[0,.9,0],helper);const arm=box(.12,.4,.12,mats.gold,[-.27,.6,0],helper);animate(arm,4,u=>arm.rotation.z=Math.sin(u*24)*.6);if(choice===0){const parcel=box(.4,.35,.3,mats.gold,[1,.8,.8],g);animate(parcel,2,u=>{parcel.position.x=1-u;parcel.position.y=.8+Math.sin(u*Math.PI)*.6;});}else if(choice===1){badge(g,'✓ ĐÃ KIỂM TRA',2.6);const ring=mesh(new T.TorusGeometry(.5,.05,8,32),mats.grass,[0,1.7,.7],g);animate(ring,2,u=>ring.rotation.y=u*6.28);}else{const bubble=textSprite('CỨ HỎI NHÉ! ☺',.3);bubble.position.set(1,1.7,.8);g.add(bubble);}}
 if(k===4){if(choice===0){for(let j=0;j<5;j++){const note=textSprite(j%2?'♫':'♪',.25);note.position.set((j-2)*.3,1+j*.15,.7);g.add(note);animate(note,5,u=>{note.position.y=1+j*.15+u*1.5;note.position.x=(j-2)*.3+Math.sin(u*6+j)*.3;});}}else if(choice===1){const start=player.position.clone();animate(player,4,u=>{player.position.set(start.x+Math.sin(u*6.28)*.8,start.y,start.z+(1-Math.cos(u*6.28))*.4);player.rotation.y=-u*6.28;});}else{box(1.4,.08,.8,mats.wood,[0,.65,.5],g);for(let j=0;j<3;j++){cylinder(.18,.18,.03,mats.cream,[-.45+j*.45,.72,.5],g,16);sphere(.11,[mats.gold,mats.pink,mats.grass][j],[-.45+j*.45,.8,.5],g);}}}
 if(k===5){for(let j=0;j<3;j++){const flying=new T.Group();g.add(flying);letter(flying,[0,0,0]);animate(flying,3,u=>{const q=Math.max(0,Math.min(1,u*1.4-j*.2));flying.position.set(-1.5+q*2.75,.9+Math.sin(q*Math.PI)*2,.8-q*.2);flying.rotation.z=Math.sin(q*6)*.3;});}const message=textSprite(['CẢM ƠN BẠN!','CÙNG NHAU HỌC HỎI','TEAM MÌNH TUYỆT!'][choice],.38);message.position.set(0,2.6,0);g.add(message);}
 if(k===7){for(let j=0;j<6;j++){const balloon=sphere(.3,[mats.pink,mats.gold,mats.grass][(j+choice)%3],[Math.cos(j)*1.4,1.7+(j%2)*.3,Math.sin(j)*1.4],g);animate(balloon,6,u=>{balloon.position.y=1.7+(j%2)*.3+u*3;});}badge(g,['CƠ HỘI MỚI ĐANG ĐẾN','LUÔN KHỎE, LUÔN VUI','THÊM NHIỀU CHUYẾN ĐI'][choice],3);}
 celebrateAt(player.position,k===7?120:50);party=.8;
}
function tickEffects(dt){effectTime+=dt;for(let i=animations.length-1;i>=0;i--){const a=animations[i],u=Math.min(1,(effectTime-a.start)/a.seconds);a.fn(reduced?1:u);if(u>=1||reduced)animations.splice(i,1);}for(let i=confetti.length-1;i>=0;i--){const p=confetti[i];p.life-=dt;p.v.y-=dt*1.7;p.mesh.position.addScaledVector(p.v,dt);p.mesh.rotation.x+=dt*2;p.mesh.rotation.z+=dt*3;if(p.life<=0){scene.remove(p.mesh);p.mesh.geometry.dispose();p.mesh.material.dispose();confetti.splice(i,1);}}if(closeupUntil&&effectTime>closeupUntil){zoom=savedZoom;closeupUntil=0;}}


let memoryOpen=false, memoryIndex=0, memoryAuto=true, memoryLast=0, memoryPhotos=[], memoryFrames=[], gallerySavedZoom=34;
let sharedPhotos=[],personalPhotos=[],memorySource='shared',memoryAlbumTitle='Album của team',albumIssues=[],photosLoading=true,photoSelectionVersion=0;
function allMemoryPhotos(){return [...sharedPhotos,...personalPhotos];}
const gallery=new T.Group();scene.add(gallery);gallery.visible=false;
function placeholder(i){const c=document.createElement('canvas');c.width=1000;c.height=750;const x=c.getContext('2d');x.fillStyle=['#f5d6ca','#d8e8ce','#d2e5ef'][i%3];x.fillRect(0,0,1000,750);x.fillStyle='#fff8eb';x.fillRect(110,90,780,470);x.fillStyle='#789d98';x.font='100px sans-serif';x.textAlign='center';x.fillText('＋',500,300);x.font='38px sans-serif';x.fillText('Ảnh kỷ niệm của team',500,400);x.font='28px sans-serif';x.fillStyle='#967966';x.fillText(['Một chuyến đi cùng nhau','Một ngày vui ở văn phòng','Một dấu mốc đáng nhớ'][i%3],500,650);return new T.CanvasTexture(c);}
function buildGallery(){memoryFrames.forEach(f=>{gallery.remove(f);f.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose();}});});memoryFrames=[];const photos=memoryPhotos.length?memoryPhotos:[null,null,null];photos.forEach((photo,i)=>{const card=new T.Group();gallery.add(card);const back=box(3.35,2.75,.08,mat(0xfffbf2),[0,0,0],card);let tex;if(photo){tex=new T.CanvasTexture(photo.canvas);}else tex=placeholder(i);tex.colorSpace=T.SRGBColorSpace;mesh(new T.PlaneGeometry(3.05,2.29),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}),[0,.10,.055],card);const title=textSprite(photo?photo.name:'CHỌN ẢNH ĐỂ BẮT ĐẦU',.22);title.position.set(0,-1.1,.07);card.add(title);card.scale.setScalar(.01);memoryFrames.push(card);});memoryIndex=Math.min(memoryIndex,memoryFrames.length-1);updateMemoryCaption();}
function updateMemoryCaption(){$('#memory-caption').textContent=memoryPhotos.length?memoryPhotos[memoryIndex].name:'Chưa có ảnh của team · Hãy chọn ảnh từ máy';$('#memory-position').textContent=(memoryIndex+1)+' / '+memoryFrames.length;$('#memory-play').textContent=memoryAuto?'Ⅱ Tạm dừng':'▶ Tự chạy';}
function openMemories(){if(moving)return;if(player.position.distanceTo(stops[6].clone().add(new T.Vector3(0,0,.7)))>1.65){go(6);return;}closeKeepsake();if(!memoryOpen)gallerySavedZoom=zoom;memoryOpen=true;selected[6]='Album 3D';gallery.visible=true;$('#memory-controls').hidden=false;$('#effect-toast').hidden=true;updateMemorySourceUI();$('#memory-keep').textContent=keepsakeCollection.has(6)?'Đến Vườn check-in 20/10 →':'Giữ khung ảnh & đến vườn check-in →';closeupUntil=0;zoom=innerWidth<700?19:14;targetFocus.copy(stops[6]).add(new T.Vector3(0,1.8,0));memoryLast=effectTime;if(!memoryFrames.length)buildGallery();}
function closeMemories(){if(!memoryOpen)return;memoryOpen=false;gallery.visible=false;$('#memory-controls').hidden=true;zoom=gallerySavedZoom;}
function moveMemory(d){memoryIndex=(memoryIndex+d+memoryFrames.length)%memoryFrames.length;memoryLast=effectTime;updateMemoryCaption();}
$('#memory-prev').onclick=()=>moveMemory(-1);$('#memory-next').onclick=()=>moveMemory(1);$('#memory-play').onclick=()=>{memoryAuto=!memoryAuto;memoryLast=effectTime;updateMemoryCaption();};$('#memory-close').onclick=closeMemories;$('#memory-open').onclick=()=>{if(index===6)openMemories();else if(canVisitStation(6,keepsakeCollection)&&!moving)go(6);else{$('#memory-status-global').textContent=(sharedPhotos.length?'Host đã chuẩn bị '+sharedPhotos.length+' ảnh của team. ':'')+'Trạm kỷ niệm nằm sau Bưu điện lời cảm ơn. Bạn cũng có thể chuẩn bị ảnh riêng trước.';$('#memory-prepare').showModal();}};$('#prepare-close').onclick=()=>$('#memory-prepare').close();
async function imageCanvas(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Chỉ hỗ trợ JPG, PNG và WebP.');if(file.size>20*1024*1024)throw Error('Mỗi ảnh cần nhỏ hơn 20 MB.');const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});const c=document.createElement('canvas');c.width=1200;c.height=900;const x=c.getContext('2d');x.fillStyle='#fff8ee';x.fillRect(0,0,1200,900);const scale=Math.min(1200/bitmap.width,900/bitmap.height);x.drawImage(bitmap,(1200-bitmap.width*scale)/2,(900-bitmap.height*scale)/2,bitmap.width*scale,bitmap.height*scale);bitmap.close();return c;}
function memoryDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open('team-memory-photos',1);r.onupgradeneeded=()=>r.result.createObjectStore('album');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function updateMemorySourceUI(){
 $('#memory-shared').disabled=!sharedPhotos.length;$('#memory-personal').disabled=!personalPhotos.length;
 $('#memory-shared').setAttribute('aria-pressed',String(memorySource==='shared'));$('#memory-personal').setAttribute('aria-pressed',String(memorySource==='personal'));
 $('#memory-clear').hidden=memorySource!=='personal'||!personalPhotos.length;
 $('#memory-album-title').textContent=memorySource==='shared'?memoryAlbumTitle:'Ảnh riêng của bạn';
 $('#memory-status').textContent=photosLoading?'Đang tải album của team…':memorySource==='shared'&&sharedPhotos.length?'Ảnh được host chuẩn bị sẵn cho mọi người. Chọn một khung hình để mang theo.'+(albumIssues.length?' Có ảnh chưa tải được; các ảnh còn lại vẫn xem được.':''):personalPhotos.length?'Ảnh riêng chỉ lưu trong trình duyệt này; album của team vẫn được giữ nguyên.':'Host chưa thêm ảnh vào album. Bạn có thể giữ khung minh họa hoặc chọn ảnh riêng.';
}
function setMemorySource(source){
 memorySource=source;memoryPhotos=source==='shared'?sharedPhotos:personalPhotos;memoryIndex=0;memoryLast=effectTime;
 buildGallery();refreshMemoryGift();updateMemorySourceUI();
}
async function savePhotos(){
 const data=await Promise.all(personalPhotos.map(async p=>({id:p.id,name:p.name,blob:await new Promise(resolve=>p.canvas.toBlob(resolve,'image/jpeg',.85))})));
 const db=await memoryDB();await new Promise((resolve,reject)=>{const tx=db.transaction('album','readwrite');tx.objectStore('album').put(data,'photos');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();
}
async function loadPersonalPhotos(){
 try{
  const db=await memoryDB();const data=await new Promise((resolve,reject)=>{const r=db.transaction('album').objectStore('album').get('photos');r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);});db.close();
  return await Promise.all(data.slice(0,12).map(async(p,i)=>({id:p.id||'personal-'+i+'-'+p.name,name:p.name,canvas:await imageCanvas(p.blob),source:'personal'})));
 }catch{return [];}
}
async function loadPhotos(){
 const version=photoSelectionVersion;
 const [shared,local]=await Promise.all([loadSharedAlbum({decode:imageCanvas}),loadPersonalPhotos()]);
 sharedPhotos=shared.photos;memoryAlbumTitle=shared.title;albumIssues=shared.issues;photosLoading=false;
 if(version===photoSelectionVersion){personalPhotos=local;memorySource=sharedPhotos.length?'shared':personalPhotos.length?'personal':'shared';}
 setMemorySource(memorySource);
}
async function selectPhotos(e){
 const files=Array.from(e.target.files||[]);if(!files.length)return;
 const version=++photoSelectionVersion,status=memoryOpen?$('#memory-status'):$('#memory-status-global');status.textContent='Đang chuẩn bị khung ảnh…';
 try{
  const result=await Promise.all(files.slice(0,12).map(async f=>({id:'personal-'+crypto.randomUUID(),name:f.name.replace(/\.[^.]+$/,''),canvas:await imageCanvas(f),source:'personal'})));
  if(version!==photoSelectionVersion)return;personalPhotos=result;setMemorySource('personal');
  try{await savePhotos();status.textContent='Đã lưu '+result.length+' ảnh riêng trên trình duyệt này. Album của team vẫn giữ nguyên.';}catch{status.textContent='Đã mở ảnh riêng; trình duyệt chưa cho lưu lâu dài.';}
 }catch(err){status.textContent=err.message||'Không đọc được ảnh. Hãy thử ảnh JPG hoặc PNG.';}finally{e.target.value='';}
}
$('#memory-files').onchange=selectPhotos;$('#prepare-files').onchange=selectPhotos;
$('#memory-shared').onclick=()=>setMemorySource('shared');$('#memory-personal').onclick=()=>setMemorySource('personal');
$('#memory-clear').onclick=async()=>{photoSelectionVersion++;personalPhotos=[];setMemorySource('shared');try{await savePhotos();}catch{}$('#memory-status').textContent=sharedPhotos.length?'Đã gỡ ảnh riêng. Album của team vẫn ở đây.':'Đã gỡ ảnh riêng khỏi trình duyệt này.';};
const photosReady=loadPhotos();

function tickMemories(dt){if(!memoryOpen)return;if(memoryAuto&&effectTime-memoryLast>4.5)moveMemory(1);gallery.position.copy(stops[6]).add(new T.Vector3(0,2.1,0));gallery.rotation.y=yaw;const n=memoryFrames.length;memoryFrames.forEach((f,i)=>{let d=(i-memoryIndex+n)%n;if(d>n/2)d-=n;const x=d*2.8,z=-Math.abs(d)*1.6;f.position.lerp(new T.Vector3(x,Math.sin(effectTime*.7+i)*.08,z),reduced?1:Math.min(1,dt*6));const size=d===0?1:.72;f.scale.lerp(new T.Vector3(size,size,size),reduced?1:Math.min(1,dt*6));f.rotation.y=T.MathUtils.lerp(f.rotation.y,-Math.sign(d)*.36,Math.min(1,dt*6));f.visible=Math.abs(d)<=2;});}



// Gentle souvenirs and an urn of 200 colleague wishes, drawn without replacement.

const keepsakeCollection=new Map(),savedFrames=new Map();let keepsakeActive=false,keepsakeRoot=null,keepsakeZoom=34,keepsakeStyle=0,wishBag=[],currentWish=null,finalWish=null,recipient='';
const stationGifts=[['Vé khởi hành','Tên bạn đã ở trên vé. Nhận chiếc vé dành riêng cho mình để bắt đầu chuyến đi nhé.','🎟'],['Ly cà phê đồng đội','Chọn đồ uống cho chuyến đi. Nhân vật sẽ mang theo món bạn chọn.','☕'],['Lá bài cảm hứng','Rút một lá tarot và giữ lại lời nhắc tích cực cho mình.','✧'],['Bùa số may mắn','Chọn một con số vui, đúc thành chiếc bùa nhỏ của chuyến đi.','◇'],['Lọ niềm vui','Quay một điều dễ thương rồi cất nó vào lọ để dành.','✿'],['Thư từ vũ trụ','Bóc một quẻ vui và giữ thông điệp trong phong thư của team.','✉'],['Khung ảnh kỷ niệm','Giữ lại một khung hình từ album của team.','▧']];
const activities={2:'tarot',3:'number',4:'wheel',5:'fortune'};
let cardFormat='post',checkinPhoto=null,cardPhotoEnabled=true,previewRequest=0;
let cardTemplate='bloom',templatePreviewKey='',cardPhotoVersion=0;
try{cardTemplate=getSocialTemplate(sessionStorage.getItem('team-card-template')).id;}catch{}
SOCIAL_TEMPLATES.forEach(style=>{
 const button=document.createElement('button'),preview=document.createElement('canvas'),label=document.createElement('strong'),description=document.createElement('small');
 button.className='wish-template';button.dataset.cardTemplate=style.id;button.setAttribute('aria-label',style.name+' · '+style.description);button.setAttribute('aria-pressed',String(style.id===cardTemplate));
 preview.width=288;preview.height=360;preview.setAttribute('aria-hidden','true');label.textContent=style.name;description.textContent=style.description;button.append(preview,label,description);
 button.onclick=()=>{cardTemplate=style.id;try{sessionStorage.setItem('team-card-template',cardTemplate);}catch{}updateWishPreview();};
 button.onkeydown=event=>{const step={ArrowRight:1,ArrowLeft:-1,ArrowDown:2,ArrowUp:-2}[event.key];if(!step)return;event.preventDefault();const choices=Array.from($('#wish-templates').children),next=choices[(choices.indexOf(button)+step+choices.length)%choices.length];next.focus();next.click();};
 $('#wish-templates').append(button);
});
const wishPanels=[$('#wish-template-picker'),$('.wish-size-picker'),$('#wish-photo-tools')].map(section=>{const panel=document.createElement('div');panel.className='popup-tab-panel';section.before(panel);panel.append(section);return panel;});
mountPopupTabs($('.wish-studio-options'),wishPanels,['Mẫu thiệp','Khổ ảnh','Ảnh của bạn']);
for(const panel of [wishPanels[0],wishPanels[2]]){const note=document.createElement('p');note.className='wish-full-note';note.textContent='Bản kỷ niệm dùng bố cục đầy đủ. Chọn Bài đăng hoặc Story ở mục Khổ ảnh để tùy chỉnh mẫu và ảnh nhé.';panel.append(note);}
$('#wish-see-preview').textContent='Phóng to thiệp';$('#wish-see-preview').onclick=()=>{const only=$('.wish-studio-body').classList.toggle('preview-only');$('#wish-see-preview').textContent=only?'Hiện tùy chỉnh':'Phóng to thiệp';$('#wish-see-preview').setAttribute('aria-pressed',String(only));};

function saveJourney(){try{sessionStorage.setItem('team-journey-v2',JSON.stringify({recipient,avatar:appearance,gifts:Array.from(keepsakeCollection.entries()),finalId:finalWish?.id,index,arrival}));}catch{}}
function updateKeepsakeCount(){updateUI();saveJourney();}
function shuffledWishes(){const bag=Array.from({length:wishes.length},(_,i)=>i);for(let i=bag.length-1;i>0;i--){const r=new Uint32Array(1);crypto.getRandomValues(r);const j=r[0]%(i+1);[bag[i],bag[j]]=[bag[j],bag[i]];}return bag;}
function drawWish(){
 if(!finalWish){if(!wishBag.length)wishBag=shuffledWishes();finalWish=wishes[wishBag.pop()];}
 currentWish=finalWish;saveJourney();
 const model=createCardModel({recipient,wish:finalWish,gifts:keepsakeCollection});
 $('#wish-message').textContent=model.message;$('#wish-number').textContent='THIỆP '+model.wishNumber+' / 200';
 $('#wish-recipient').textContent='Gửi '+model.recipient;
 $('#wish-keepsakes').replaceChildren();
 model.keepsakes.forEach(item=>{const entry=document.createElement('div'),title=document.createElement('strong'),detail=document.createElement('span');entry.className='wish-souvenir';title.textContent=item.title;detail.textContent=item.detail;entry.append(title,detail);$('#wish-keepsakes').append(entry);});
 $('#wish-download-status').textContent='';templatePreviewKey='';$('#wish-card').scrollTop=0;if($('#wish-card').open)updateWishPreview();
 $('#wish-face').classList.remove('reveal');void $('#wish-face').offsetWidth;$('#wish-face').classList.add('reveal');
}
function wishDownloadLabel(){return cardFormat==='full'?'Tải bản kỷ niệm đầy đủ ↓':cardFormat==='story'?'Tải story 9:16 ↓':'Tải bài đăng 4:5 ↓';}
async function composeWishCanvas(model,format,template=cardTemplate){
 const [,,artwork]=await Promise.all([document.fonts.ready,photosReady,format!=='full'&&template==='bloom'?loadCardArtwork():null,document.fonts.load('500 88px Lora'),document.fonts.load('italic 500 86px Lora'),document.fonts.load('800 85px "Be Vietnam Pro"')]);
 const original=findMemoryPhoto(allMemoryPhotos(),keepsakeCollection.get(6))?.canvas;
 const photo=format==='full'?original:cardPhotoEnabled?(checkinPhoto||original):null,canvas=document.createElement('canvas');
 return format==='full'?renderWishCard(canvas,model,photo):renderSocialCard(canvas,model,{format,photo,artwork,template});
}
async function refreshTemplatePreviews(model){
 const key=JSON.stringify([model.recipient,model.wishNumber,cardPhotoVersion]);if(templatePreviewKey===key)return;templatePreviewKey=key;
 await Promise.all(SOCIAL_TEMPLATES.map(async style=>{
  try{
   const canvas=await composeWishCanvas(model,'post',style.id);if(templatePreviewKey!==key)return;
   const preview=document.querySelector('[data-card-template="'+style.id+'"] canvas');preview.getContext('2d').clearRect(0,0,preview.width,preview.height);preview.getContext('2d').drawImage(canvas,0,0,preview.width,preview.height);
  }catch{}
 }));
}
async function updateWishPreview(){
 if(!currentWish)return;
 const request=++previewRequest,model=createCardModel({recipient,wish:currentWish,gifts:keepsakeCollection}),format=cardFormat,template=cardTemplate;
 $('#wish-preview-status').textContent='Đang chuẩn bị thiệp…';
 document.querySelectorAll('[data-card-format]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.cardFormat===format)));
 document.querySelectorAll('[data-card-template]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.cardTemplate===template)));
 $('#wish-template-picker').hidden=format==='full';$('#wish-template-description').textContent='Đang chọn: '+getSocialTemplate(template).name;$('#wish-selected-label').textContent=format==='full'?'Bản kỷ niệm đầy đủ':getSocialTemplate(template).name+' · '+(format==='story'?'Story 9:16':'Bài đăng 4:5');
 $('#wish-photo-tools').hidden=format==='full';$('#wish-download').textContent=wishDownloadLabel();$('#wish-copy').textContent=format==='full'?'Sao chép lời chúc':'Chép caption';
 try{
  const canvas=await composeWishCanvas(model,format,template);if(request!==previewRequest)return;
  const preview=$('#wish-preview');preview.width=canvas.width;preview.height=canvas.height;preview.getContext('2d').drawImage(canvas,0,0);
  $('#wish-remaining').textContent=format==='full'?'Bản lưu đầy đủ lời chúc và 7 kỷ vật.':canvas.width+' × '+canvas.height+' px · '+(format==='story'?'Sẵn sàng đăng story.':'Sẵn sàng cho bài đăng của bạn.');
  const original=Boolean(findMemoryPhoto(allMemoryPhotos(),keepsakeCollection.get(6)));
  $('#wish-remove-photo').hidden=!cardPhotoEnabled||!(checkinPhoto||original);$('#wish-preview-status').textContent='';
  if(format!=='full')refreshTemplatePreviews(model);
 }catch(error){if(request===previewRequest)$('#wish-preview-status').textContent='Chưa tạo được bản xem trước. '+error.message;}
}
async function downloadWish(){
 const button=$('#wish-download');if(button.disabled||!currentWish)return;
 button.disabled=true;button.textContent='Đang tạo thiệp…';$('#wish-download-status').textContent='';
 const model=createCardModel({recipient,wish:currentWish,gifts:keepsakeCollection}),format=cardFormat,template=cardTemplate;
 try{
  const canvas=await composeWishCanvas(model,format,template),blob=await canvasToPng(canvas);
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=format==='full'?cardFilename(model.recipient):socialCardFilename(model.recipient,format,template);document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  $('#wish-download-status').textContent='Đã tạo ảnh PNG. Hẹn gặp bạn trên bảng tin thật rực rỡ nhé!';
 }catch(error){$('#wish-download-status').textContent='Chưa tải được thiệp. '+(error.message||'Hãy thử lại.');}
 finally{button.disabled=false;button.textContent=wishDownloadLabel();}
}
async function chooseCheckinPhoto(event){
 const file=event.target.files?.[0];if(!file)return;
 $('#wish-download-status').textContent='Đang chuẩn bị ảnh check-in…';
 try{
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024)throw Error('Chọn ảnh JPG, PNG hoặc WebP nhỏ hơn 20 MB nhé.');
  const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'}),scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  checkinPhoto=canvas;cardPhotoEnabled=true;cardPhotoVersion++;await updateWishPreview();$('#wish-download-status').textContent='Ảnh đã sẵn sàng. Chọn khổ thiệp rồi tải về nhé.';
 }catch(error){$('#wish-download-status').textContent=error.message;}
 finally{event.target.value='';}
}
let checkinStudio=null;
function openFinalCheckin(){
 if(index!==7||!getJourneyProgress(keepsakeCollection).complete){openJourneyAlbum();return;}
 actionUI?.close();actionPlayer?.stop();movementInput.clear();closeKeepsake();closeMemories();$('#wish-card').close();drawWish();
 const card=createCardModel({recipient,wish:finalWish,gifts:keepsakeCollection});
 const model=createCheckinModel({gifts:keepsakeCollection,recipient,avatar:appearance,message:getSocialCopy(card).message,wishNumber:card.wishNumber});
 const getTeamPhoto=()=>findMemoryPhoto(allMemoryPhotos(),keepsakeCollection.get(6))?.canvas||null;
 const getPhoto=()=>cardPhotoEnabled?(checkinPhoto||getTeamPhoto()):null;
 checkinStudio.open({model,photo:getPhoto(),teamPhoto:getTeamPhoto(),customPhoto:!!checkinPhoto});photosReady.then(()=>checkinStudio.setTeamPhoto(getTeamPhoto(),model,cardPhotoEnabled));
}
function openWish(){if(index!==7||!getJourneyProgress(keepsakeCollection).complete){openJourneyAlbum();return;}drawWish();$('#wish-card').showModal();updateWishPreview();celebrateAt(player.position,90);}
function closeKeepsake(){if(!keepsakeActive)return;keepsakeActive=false;$('#keepsake-panel').hidden=true;if(keepsakeRoot){scene.remove(keepsakeRoot);clearGroup(keepsakeRoot);keepsakeRoot=null;}zoom=keepsakeZoom;}
function makeGift(k,data,parent){const g=new T.Group();parent.add(g);const blush=mat(0xe6b1be),cream=mat(0xffefd1),green=mat(0x9bc8b6);if(k===0){box(2.5,1.2,.1,cream,[0,0,0],g);box(.12,1.2,.13,blush,[.7,0,0],g);const label=textSprite(recipient||'VÉ ĐỒNG ĐỘI',.35);label.position.set(-.2,0,.1);g.add(label);}if(k===1){const drink=cup(g,data.style||0,[0,0,0]);drink.scale.setScalar(3);const tag=textSprite(recipient||'CÙNG TEAM',.25);tag.position.set(0,-.7,.2);g.add(tag);}if(k===2){box(1.45,2.1,.12,mat(0x92749e),[0,0,0],g);const star=textSprite('✧',.8);star.position.set(0,.3,.1);g.add(star);const label=textSprite('CẢM HỨNG',.25);label.position.set(0,-.55,.1);g.add(label);}if(k===3){const ring=mesh(new T.TorusGeometry(.6,.08,10,40),mats.gold,[0,0,0],g);const num=textSprite(data.number||'✦',.7);num.position.set(0,0,.15);g.add(num);cylinder(.025,.025,.5,mats.wood,[0,.9,0],g);}if(k===4){cylinder(.5,.5,1.15,mat(0xc3dfdc),[0,0,0],g,24);cylinder(.54,.54,.16,mats.gold,[0,.65,0],g,24);for(let n=0;n<5;n++)sphere(.14,n%2?blush:mats.gold,[Math.cos(n)*.25,-.3+n*.13,Math.sin(n)*.25],g);}if(k===5){box(1.7,1.15,.12,cream,[0,0,0],g);const flap=mesh(new T.ConeGeometry(.83,.7,3),blush,[0,.12,.1],g);flap.rotation.z=Math.PI;const seal=sphere(.14,mats.gold,[0,-.12,.2],g);}if(k===6){box(1.9,2.15,.15,blush,[0,0,0],g);const photo=data.photoId||data.photoName?findMemoryPhoto(allMemoryPhotos(),data):memoryPhotos[memoryIndex];const texture=photo?new T.CanvasTexture(photo.canvas):placeholder(0);texture.colorSpace=T.SRGBColorSpace;mesh(new T.PlaneGeometry(1.65,1.4),new T.MeshBasicMaterial({map:texture}),[0,.15,.1],g);const stamp=textSprite('TEAM · 20/10',.2);stamp.position.set(0,-.8,.15);g.add(stamp);}return g;}
function showGift(k,data={}){if(keepsakeRoot){scene.remove(keepsakeRoot);clearGroup(keepsakeRoot);}keepsakeRoot=new T.Group();scene.add(keepsakeRoot);keepsakeRoot.position.copy(stops[k]).add(new T.Vector3(0,1.8,.5));keepsakeRoot.rotation.y=yaw;makeGift(k,data,keepsakeRoot);}
function collectGift(k,data){if(moving||k!==index||k<0||k>6||keepsakeCollection.has(k))return;keepsakeCollection.set(k,{...data,title:stationGifts[k][0]});const g=new T.Group();scene.add(g);g.position.copy(stops[k]).add(new T.Vector3(-1.2,.8,.2));g.rotation.y=yaw;g.scale.setScalar(.4);makeGift(k,data,g);savedFrames.set(k,g);updateKeepsakeCount();celebrateAt(stops[k],60);if(k===1){const old=souvenirs.getObjectByName('drink');if(old){souvenirs.remove(old);clearGroup(old);}const d=cup(souvenirs,data.style||0,[.38,.78,.16]);d.name='drink';}if(keepsakeActive){showGift(k,data);$('#keepsake-result').textContent='Đã cất vào album hành trình. Mỗi trạm chỉ nhận một kỷ vật.';$('#keepsake-save').disabled=true;$('#station-activity').hidden=true;$('#keepsake-next').disabled=false;$('#keepsake-next').textContent='Trạm tiếp theo →';}}
function openKeepsake(k){if(!canVisitStation(k,keepsakeCollection))return;if(!moving&&player.position.distanceTo(stops[k].clone().add(new T.Vector3(0,0,.7)))>1.65){go(k);return;}if(k===1&&!moving){closeMemories();closeKeepsake();drinkCounter.open(recipient);return;}if(k===7){openFinalCheckin();return;}if(moving)return;closeMemories();closeKeepsake();keepsakeZoom=zoom;keepsakeActive=true;$('#effect-toast').hidden=true;closeupUntil=0;zoom=innerWidth<700?16:11;targetFocus.copy(stops[k]).add(new T.Vector3(0,1.3,0));focus.copy(targetFocus);const stored=keepsakeCollection.get(k);keepsakeStyle=stored?.style||0;$('#keepsake-title').textContent=stationGifts[k][0];$('#keepsake-description').textContent=personalMessage(stationGifts[k][1]);$('#keepsake-panel').hidden=false;$('#keepsake-next').disabled=!stored;$('#keepsake-next').textContent=stored?'Trạm tiếp theo →':'Nhận kỷ vật để mở trạm tiếp theo';$('#keepsake-save').textContent=k===0?'Nhận vé & đi tiếp →':k===1?'Giữ đồ uống & đi tiếp →':'Giữ kỷ vật & đi tiếp →';$('#recipient-wrap').hidden=true;$('#recipient-name').value=recipient;$('#keepsake-save').hidden=Boolean(activities[k]);$('#keepsake-save').disabled=Boolean(stored);$('#station-activity').hidden=!activities[k]||Boolean(stored);$('#station-activity').textContent={2:'Rút lá bài cảm hứng ✧',3:'Nhận con số may mắn ◇',4:'Quay vòng niềm vui ✿',5:'Bóc quẻ & nhận thư ✉'}[k]||'';$('#keepsake-result').textContent=stored?(stored.result||'Kỷ vật này đã ở trong album của bạn.'):'Trải nghiệm tại trạm để nhận kỷ vật, rồi tiếp tục chuyến đi. Gom đủ 7 món để mở thiệp cá nhân hóa.';renderStyles();showGift(k,stored||{});}
function renderStyles(){$('#keepsake-styles').replaceChildren();if(index!==1)return;['Cà phê sữa đá','Trà đào','Nước mát'].forEach((name,i)=>{const b=document.createElement('button');b.textContent=name;b.classList.toggle('selected',i===keepsakeStyle);b.disabled=keepsakeCollection.has(index);b.onclick=()=>{keepsakeStyle=i;showGift(index,{style:i});renderStyles();};$('#keepsake-styles').append(b);});}
function tickKeepsake(dt){if(keepsakeActive&&keepsakeRoot){keepsakeRoot.rotation.y=yaw+(reduced?0:Math.sin(effectTime*.7)*.07);keepsakeRoot.rotation.z=reduced?0:Math.sin(effectTime*.9)*.025;}}
let journeyPager=null;
function openJourneyAlbum(){journeyPager?.dispose();const list=$('#journey-items');list.replaceChildren();stationGifts.forEach((gift,k)=>{const entry=keepsakeCollection.get(k),card=document.createElement('article');card.className='album-item'+(entry?' collected':'');const icon=document.createElement('span');icon.textContent=entry?gift[2]:'○';const title=document.createElement('strong');title.textContent=gift[0];const text=document.createElement('p');text.textContent=entry?(entry.result||'Đã nhận tại '+names[k]):'Chưa nhận kỷ vật';const b=document.createElement('button');b.textContent=entry?'Ghé xem lại':canVisitStation(k,keepsakeCollection)?'Đến nhận kỷ vật':'Nhận quà ở trạm trước để mở';b.disabled=moving||!canVisitStation(k,keepsakeCollection);b.onclick=()=>{$('#journey-album').close();if(index===k){k===6?openMemories():openKeepsake(k);}else go(k);};card.append(icon,title,text,b);list.append(card);});journeyPager=mountPopupPager(list,{pageSize:1});$('#album-name').textContent=recipient?'Album của '+recipient:'Album hành trình của bạn';$('#album-final').disabled=!(index===7&&getJourneyProgress(keepsakeCollection).complete);$('#album-final').textContent='Check-in cuối hành trình ✦';$('#journey-album').showModal();updateKeepsakeCount();}
$('#journey-open').onclick=openJourneyAlbum;$('#journey-close').onclick=()=>$('#journey-album').close();$('#album-final').onclick=()=>{$('#journey-album').close();openFinalCheckin();};$('#keepsake-close').onclick=closeKeepsake;
const drinkCounter=createDrinkCounter({onKeep(order,{synced}){
 const style=order?.category==='tea'?1:0,result=order?(synced?'KOI · ':'Ly trong hành trình · Chưa xác nhận đặt nước · ')+drinkLabel(order):'Không đăng ký đặt nước · Một ly nước mát cho hành trình.';
 if(!keepsakeCollection.has(1)&&index===1&&!moving)collectGift(1,{style,result});
 else if(keepsakeCollection.has(1)){
  const data={...keepsakeCollection.get(1),style,result};keepsakeCollection.set(1,data);
  const frame=savedFrames.get(1);if(frame){clearGroup(frame);makeGift(1,data,frame);}updateKeepsakeCount();
 }
 if(index===1&&!moving)advanceJourney();
}});
$('#drink-open').onclick=()=>{if(moving)return;closeMemories();closeKeepsake();drinkCounter.open(recipient);};
$('#keepsake-save').onclick=()=>{recipient=$('#recipient-name').value.trim().slice(0,40)||recipient;collectGift(index,{style:keepsakeStyle,result:index===0?(recipient?'Vé dành cho '+recipient:'Chiếc vé khởi đầu một chuyến đi vui'):personalMessage(['Một ly cà phê sữa đá cùng team','Một ly trà đào cho giờ nghỉ','Một ly nước mát, thêm năng lượng'][keepsakeStyle])});renderStyles();advanceJourney();};
$('#station-activity').onclick=()=>window.dispatchEvent(new CustomEvent('station-divination',{detail:{station:index,tab:activities[index],name:recipient}}));
window.addEventListener('station-result',e=>{const {station,result,number,luckySet}=e.detail;if(station!==index||keepsakeCollection.has(station))return;collectGift(station,{result,number,luckySet:station===3?normaliseLuckySet(luckySet):undefined});});
window.addEventListener('station-continue',e=>{if(e.detail.station===index)advanceJourney();});
$('#memory-keep').onclick=()=>{const photo=memoryPhotos[memoryIndex];collectGift(6,{photoId:photo?.id,photoName:photo?.name,result:photo?'Khung ảnh từ '+photo.name:'Khung ảnh đang chờ những khoảnh khắc cùng team.'});closeMemories();advanceJourney();};
$('#wish-close').onclick=()=>$('#wish-card').close();$('#wish-download').onclick=downloadWish;
$('#wish-copy').onclick=async()=>{
 try{
  const model=createCardModel({recipient,wish:currentWish,gifts:keepsakeCollection});
  const message=cardFormat==='full'?currentWish.text:getSocialCopy(model,cardTemplate).message;
  const playful=model.luckySet?'\n\nBộ số vui 6/45: '+formatLuckySet(model.luckySet)+' · Bốc vui cùng team ✦':'';
  await navigator.clipboard.writeText((recipient?'Gửi '+recipient+' 💌\n\n':'')+message+playful+'\n\nMột ngày rực rỡ cùng team. 💐\n#Happy2010 '+'#VNGCampus');$('#wish-copy').textContent='Đã sao chép ✓';
 }catch{$('#wish-download-status').textContent='Chưa sao chép được. Bạn vẫn có thể tải ảnh thiệp nhé.';}
};
document.querySelectorAll('[data-card-format]').forEach(button=>button.onclick=()=>{cardFormat=button.dataset.cardFormat;updateWishPreview();});
$('#wish-checkin-photo').onchange=chooseCheckinPhoto;$('#wish-remove-photo').onclick=()=>{cardPhotoEnabled=false;cardPhotoVersion++;updateWishPreview();};
$('#keepsake-next').onclick=()=>{if(!keepsakeCollection.has(index))return;closeKeepsake();advanceJourney();};
function refreshMemoryGift(){const data=keepsakeCollection.get(6),frame=savedFrames.get(6);if(data&&frame){clearGroup(frame);makeGift(6,data,frame);}}
try{
 const raw=sessionStorage.getItem('team-journey-v2');
 if(raw){const saved=JSON.parse(raw);if(Array.isArray(saved.gifts)&&Number.isInteger(saved.index)&&saved.index>=0&&saved.index<=7){
  recipient=typeof saved.recipient==='string'?saved.recipient.slice(0,40):'';applyAvatar(saved.avatar);
  for(const item of saved.gifts){if(!Array.isArray(item)||item.length!==2)continue;const [k,data]=item;
   if(!Number.isInteger(k)||k<0||k>6||!data||typeof data!=='object')continue;
   const gift={title:stationGifts[k][0],style:[0,1,2].includes(data.style)?data.style:0,result:typeof data.result==='string'?data.result.slice(0,600):'',number:typeof data.number==='string'?data.number.slice(0,2):undefined,luckySet:k===3?normaliseLuckySet(data.luckySet):undefined,photoName:typeof data.photoName==='string'?data.photoName.slice(0,255):undefined,photoId:typeof data.photoId==='string'?data.photoId.slice(0,160):undefined};
   keepsakeCollection.set(k,gift);const frame=new T.Group();scene.add(frame);frame.position.copy(stops[k]).add(new T.Vector3(-1.2,.8,.2));frame.scale.setScalar(.4);frame.rotation.y=yaw;makeGift(k,gift,frame);savedFrames.set(k,frame);
  }
  const progress=getJourneyProgress(keepsakeCollection);finalWish=progress.complete?wishes.find(w=>w.id===saved.finalId)||null:null;
  index=Math.min(saved.index,progress.firstMissing);arrival=true;
  player.position.copy(stops[index]).add(new T.Vector3(0,0,.7));targetFocus.copy(stops[index]).multiplyScalar(.25);updateKeepsakeCount();
 }}
}catch{}

function personalMessage(text){return recipient?recipient+' ơi, '+text.charAt(0).toLocaleLowerCase('vi')+text.slice(1):text;}
window.addEventListener('welcome-profile',e=>{const old=recipient;recipient=e.detail.name;applyAvatar(e.detail.avatar);arrival=true;$('#recipient-name').value=recipient;$('.side .tag').textContent='20/10 · Hành trình của '+recipient;for(const [k,data] of keepsakeCollection){if(typeof data.result==='string'&&old)data.result=data.result.split(old).join(recipient);if(k===0)data.result='Vé dành cho '+recipient;const g=savedFrames.get(k);if(g){clearGroup(g);makeGift(k,data,g);}}window.dispatchEvent(new CustomEvent('journey-profile',{detail:{name:recipient,avatar:appearance}}));updateUI();saveJourney();$('#welcome-submit').textContent='Bắt đầu hành trình →';if(keepsakeActive)openKeepsake(index);});
checkinStudio=createCheckinStudio({onCards:openWish,onPhotoChange:photo=>{checkinPhoto=photo;cardPhotoEnabled=true;cardPhotoVersion++;}});
$('#wish-checkin-open').onclick=openFinalCheckin;
const avatarStudio=createAvatarStudio({name:recipient,avatar:appearance});
window.dispatchEvent(new CustomEvent('journey-profile',{detail:{name:recipient,avatar:appearance}}));avatarStudio.open();updateUI();


function controlsBlocked(){return document.hidden||!!document.querySelector('dialog[open]')||keepsakeActive||memoryOpen;}
function startManual({forAction=false}={}){
 actionPlayer?.stop();for(let n=animations.length-1;n>=0;n--)if(animations[n].g===player)animations.splice(n,1);
 closeupUntil=0;$('#effect-toast').hidden=true;moving=false;waypoints=[];player.position.y=0;
 if(!forAction){zoom=innerWidth<700?15:12;pitch=.55;targetFocus.copy(player.position).add(new T.Vector3(0,innerWidth<700?-.6:.6,0));}updateUI();
}
let stageCamera=null,stageLabels=[],lastNear=-2,lastInRange=true;
function setStage(open){
 if(open){gifts.forEach(gift=>gift.visible=false);campus.group.traverse(node=>{if(node.isSprite){stageLabels.push([node,node.visible]);node.visible=false;}});stageCamera={yaw,pitch,zoom,focus:focus.clone(),target:targetFocus.clone(),rotation:player.rotation.y};player.rotation.y=yaw;pitch=.26;zoom=innerWidth<700?5.7:4.8;targetFocus.copy(player.position).add(new T.Vector3(0,.35,0));focus.copy(targetFocus);}
 else if(stageCamera){({yaw,pitch,zoom}=stageCamera);focus.copy(stageCamera.focus);targetFocus.copy(stageCamera.target);player.rotation.y=stageCamera.rotation;stageCamera=null;stageLabels.forEach(([node,visible])=>node.visible=visible);stageLabels=[];updateUI();}
}
function actionLabel(text){const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#914c78';ctx.strokeStyle='#fffaf3';ctx.lineWidth=12;ctx.font='800 150px Nunito, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.strokeText(text,128,135);ctx.fillText(text,128,135);const sprite=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(canvas),depthTest:false,transparent:true}));sprite.scale.setScalar(.5);return sprite;}
actionPlayer=createAvatarActionPlayer({getRig:()=>playerAvatar,isBlocked:controlsBlocked,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,effects:createAvatarActionEffects({scene,anchor:player,camera,createLabel:actionLabel}),onChange:state=>actionUI?.setAction(state)});
actionUI=createAvatarControls({input:movementInput,isBlocked:controlsBlocked,onManualStart:startManual,onInteract(){if(controlsBlocked())return;const near=nearestStation(player.position,stops.map(p=>p.toArray()),i=>canVisitStation(i,keepsakeCollection));if(near<0)return;index=near;updateUI();if(near===6)openMemories();else openKeepsake(near);},onStage:setStage,onAction:id=>actionPlayer.play(id),onStop:()=>actionPlayer.stop()});
function tickWalking(dt,t){
 if(controlsBlocked()){actionUI.release();actionPlayer.stop();return false;}
 const direction=movementVector(movementInput.keys,yaw),walking=!!(direction.x||direction.z);
 if(walking){const next=stepMovement(player.position,direction,dt,walkWorld.canStand);player.position.set(next.x,0,next.z);player.rotation.y=Math.atan2(direction.x,direction.z);targetFocus.copy(player.position).add(new T.Vector3(0,innerWidth<700?-.6:.6,0));legs.forEach((leg,i)=>leg.rotation.x=reduced?0:Math.sin(t*12+i*Math.PI)*.5);}
 const near=nearestStation(player.position,stops.map(p=>p.toArray()),i=>canVisitStation(i,keepsakeCollection));actionUI.setNearby(near,names[near]);
 const inRange=player.position.distanceTo(stops[index].clone().add(new T.Vector3(0,0,.7)))<=1.65;
 if((walking||wasWalking)&&!moving){if(near>=0)index=near;if(walking!==wasWalking||near!==lastNear||inRange!==lastInRange)updateUI();if(!walking){player.position.y=0;saveJourney();}}
 lastNear=near;lastInRange=inRange;
 wasWalking=walking;return walking;
}

window.addEventListener('festival-sparkle',()=>celebrateAt(player.position,65));
function resize(){actionUI?.close();actionUI?.release();camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);zoom=worldZoom();}addEventListener('resize',resize);resize();$('#loading').remove();let prev=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,overlays=Array.from(document.querySelectorAll('dialog'));let renderedWorld=false;
renderer.setAnimationLoop(ms=>{const t=ms*.001,dt=Math.min((ms-prev)/1000,.05);prev=ms;if(renderedWorld&&(document.hidden||overlays.some(dialog=>dialog.open))){actionUI.release();actionPlayer.stop();return;}const walking=tickWalking(dt,t);tickEffects(dt);tickMemories(dt);tickKeepsake(dt);if(moving){const diff=destination.clone().sub(player.position);if(diff.length()<.09){player.position.copy(destination);if(waypoints.length){destination=waypoints.shift();}else{moving=false;if(index>0)party=.4;updateUI();saveJourney();if(index===6)openMemories();}}else{player.position.addScaledVector(diff.normalize(),Math.min(dt*5,diff.length()));player.rotation.y=Math.atan2(diff.x,diff.z);legs.forEach((l,i)=>l.rotation.x=Math.sin(t*12+i*Math.PI)*.5);player.position.y=Math.abs(Math.sin(t*10))*.07;}}else if(!walking&&!actionPlayer.current())legs.forEach(l=>l.rotation.x=0);actionPlayer.tick(dt);focus.lerp(targetFocus,.025);const horizontal=zoom*Math.cos(pitch);camera.position.set(focus.x+Math.sin(yaw)*horizontal,focus.y+zoom*Math.sin(pitch),focus.z+Math.cos(yaw)*horizontal);camera.lookAt(focus.x,focus.y,focus.z);gifts.forEach((g,i)=>{if(!reduced){g.rotation.y=t*.7;g.position.y=1.6+Math.sin(t*2+i)*.12;}});if(!reduced){stars.rotation.y=t*.015;if(party>0){stars.rotation.z+=dt*party;party=Math.max(0,party-dt*.12);}}renderer.render(scene,camera);renderedWorld=true;});
installPopupFit();
}catch(e){$('#loading').innerHTML='<div class="error">Trình duyệt chưa hỗ trợ WebGL.<br>Hãy thử Chrome hoặc Safari mới để khám phá thế giới 3D.<br><br>Chúc các đồng nghiệp nữ một ngày 20/10 thật vui, luôn hạnh phúc và được trân trọng!</div>';console.error(e);}
