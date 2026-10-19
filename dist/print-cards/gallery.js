import {PARTICIPANT_NAMES} from '../name-picker.js';
const $=s=>document.querySelector(s),select=$('#print-person'),gallery=$('#print-gallery');
for(const name of PARTICIPANT_NAMES){const option=document.createElement('option');option.value=name.split(' - ').at(-1);option.textContent=name;select.append(option);}
let side='front',catalog=null;
function sync(){
 if(!catalog)return;
 const person=catalog.people.find(p=>p.code===select.value);
 for(const [index,article] of Array.from(gallery.children).entries()){
  const design=catalog.styles[index],preview=design.previews.find(p=>p.code===person.code),image=article.querySelector('img'),link=article.querySelector('.concept-image');
  image.src='./assets/'+preview[side]+'?v='+encodeURIComponent(catalog.revision);image.alt=design.name+' · '+person.name+' · '+(side==='front'?'mặt trước':'lời chúc mặt sau');link.href=image.src;article.querySelector('.concept-person').textContent=person.name+' · '+person.code;
 }
 document.querySelectorAll('[data-side]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.side===side)));
}
select.onchange=sync;document.querySelectorAll('[data-side]').forEach(b=>b.onclick=()=>{side=b.dataset.side;sync();});
try{
 const response=await fetch('./assets/manifest.json?v=main-qr-20261019-1');if(!response.ok)throw Error();catalog=await response.json();
 for(const design of catalog.styles){
  const article=document.createElement('article');article.className='print-concept';
  article.innerHTML='<div class="concept-heading"><div><h2 class="concept-title"><small></small><span></span></h2><p class="concept-tag"></p></div></div><a class="concept-image" target="_blank" rel="noopener"><img width="1600" height="1136" loading="lazy"></a><div class="concept-footer"><p><span class="concept-person"></span><br>5 thiệp · hai mặt · 10 trang PDF</p><a class="pdf-link" download>PDF đủ 5 tên ↓</a></div>';
  article.querySelector('.concept-title small').textContent='MẪU '+String(design.number).padStart(2,'0');article.querySelector('.concept-title span').textContent=design.name;article.querySelector('.concept-tag').textContent=design.tag;
  article.querySelector('.pdf-link').href='./assets/'+design.pdf+'?v='+encodeURIComponent(catalog.revision);article.querySelector('.pdf-link').download=design.pdf.replace('.pdf','-QR-chinh.pdf');
  if(design.number===2){const badge=document.createElement('span');badge.className='recommended';badge.textContent='Mình đề xuất';article.querySelector('.concept-heading').append(badge);}
  gallery.append(article);
 }
 sync();$('#gallery-status').textContent='';
}catch{$('#gallery-status').textContent='Chưa mở được bộ thiệp. Tải lại trang giúp mình nhé.';}
