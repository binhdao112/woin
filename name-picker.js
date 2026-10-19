export const PARTICIPANT_NAMES=Object.freeze([
 'Châu Kim Nhẩn - NhanCk',
 'Nguyễn Thị Kim Thảo - ThaoNTK',
 'Hoàng Khánh Ly - LyHK',
 'Nguyễn Trần Bảo Ngọc - NgocNTB12',
 'Nguyễn Hoàng Gia Hân - HanNHG2',
]);

const normalize=value=>String(value??'').trim().replace(/\s+/g,' ').slice(0,40);

// This editor owns a draft only. The avatar form decides when to save it.
export function createNamePicker({select,input,edit,label,onChange}){
 let custom=false;
 select.replaceChildren();
 for(const name of ['',...PARTICIPANT_NAMES]){
  const option=select.ownerDocument.createElement('option');option.value=name;option.textContent=name||'Chọn tên của bạn';select.append(option);
 }
 select.required=true;input.required=true;
 const read=()=>normalize(custom?input.value:select.value);
 function changed(){select.setCustomValidity('');input.setCustomValidity('');onChange(read());}
 function mode(editing,focus=false){
  custom=editing;select.hidden=custom;select.disabled=custom;input.hidden=!custom;input.disabled=!custom;
  label.htmlFor=custom?input.id:select.id;edit.textContent=custom?'↶ Danh sách':'✎ Sửa tên';
  if(focus){const active=custom?input:select;active.focus();if(custom)input.select();}
  changed();
 }
 select.onchange=()=>{input.value=select.value;changed();};
 input.oninput=changed;
 edit.onclick=()=>{
  if(custom){if(PARTICIPANT_NAMES.includes(read()))select.value=read();input.value=select.value;mode(false,true);}
  else{input.value=read();mode(true,true);}
 };
 function restore(value){const name=normalize(value);select.value=PARTICIPANT_NAMES.includes(name)?name:'';input.value=name;mode(Boolean(name&&!select.value));}
 restore('');
 return {read,restore,validate(){const name=read(),active=custom?input:select;active.setCustomValidity(name?'':'Chọn tên hoặc bấm Sửa tên để nhập biệt danh nhé.');if(!name)active.reportValidity();return Boolean(name);}};
}
