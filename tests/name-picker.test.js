import test from 'node:test';
import assert from 'node:assert/strict';

const expected=[
 'Châu Kim Nhẩn - NhanCk',
 'Nguyễn Thị Kim Thảo - ThaoNTK',
 'Hoàng Khánh Ly - LyHK',
 'Nguyễn Trần Bảo Ngọc - NgocNTB12',
 'Nguyễn Hoàng Gia Hân - HanNHG2',
];

function field(id){return {id,value:'',hidden:false,disabled:false,children:[],validityMessage:'',focused:false,
 append(node){this.children.push(node);},replaceChildren(){this.children=[];},setCustomValidity(text){this.validityMessage=text;},
 reportValidity(){this.reported=true;},focus(){this.focused=true;},select(){this.selected=true;},
 ownerDocument:{createElement(){return field('');}}};}
async function fixture(){
 const {createNamePicker}=await import('../dist/name-picker.js');
 const select=field('welcome-participant'),input=field('welcome-name'),edit=field('welcome-name-edit'),label={},changes=[];
 const picker=createNamePicker({select,input,edit,label,onChange:name=>changes.push(name)});
 return {select,input,edit,label,changes,picker};
}

test('name list preserves all five supplied names and codes, without choosing somebody by default',async()=>{
 const {PARTICIPANT_NAMES}=await import('../dist/name-picker.js');assert.deepEqual(PARTICIPANT_NAMES,expected);
 const {select,input,label,picker}=await fixture();
 assert.deepEqual(select.children.slice(1).map(option=>option.textContent),expected);
 assert.equal(select.children[0].value,'');assert.equal(picker.read(),'');assert.equal(select.required,true);
 assert.equal(select.disabled,false);assert.equal(input.hidden,true);assert.equal(input.disabled,true);assert.equal(label.htmlFor,select.id);
});

test('every listed selection becomes the exact personalized name and updates the preview',async()=>{
 const {select,input,changes,picker}=await fixture();
 for(const name of expected){select.value=name;select.onchange();assert.equal(picker.read(),name);assert.equal(input.value,name);assert.equal(changes.at(-1),name);}
});

test('adjacent edit pre-fills the selected name and switches validation and keyboard focus to the input',async()=>{
 const {select,input,edit,label,picker}=await fixture();picker.restore(expected[3]);edit.onclick();
 assert.equal(input.value,expected[3]);assert.equal(input.hidden,false);assert.equal(input.disabled,false);assert.equal(input.required,true);
 assert.equal(select.hidden,true);assert.equal(select.disabled,true);assert.equal(label.htmlFor,input.id);assert.equal(input.focused,true);
 input.value='  Ngọc   mê check-in  ';input.oninput();assert.equal(picker.read(),'Ngọc mê check-in');assert.equal(picker.validate(),true);
});

test('returning to the list restores its selection and requires an explicit choice for a saved nickname',async()=>{
 const {select,input,edit,picker}=await fixture();picker.restore(expected[2]);edit.onclick();input.value='Ly cute';input.oninput();edit.onclick();
 assert.equal(picker.read(),expected[2]);assert.equal(input.hidden,true);assert.equal(select.disabled,false);assert.equal(select.focused,true);
 picker.restore('Mây');assert.equal(input.hidden,false);assert.equal(picker.read(),'Mây');edit.onclick();assert.equal(picker.read(),'');
});

test('reopening restores the saved profile, discarding uncommitted name edits and list changes',async()=>{
 const {select,input,edit,picker}=await fixture();picker.restore(expected[0]);edit.onclick();input.value='Chưa lưu';input.oninput();
 picker.restore(expected[0]);assert.equal(input.hidden,true);assert.equal(picker.read(),expected[0]);
 select.value=expected[4];select.onchange();picker.restore(expected[0]);assert.equal(picker.read(),expected[0]);
 picker.restore('Biệt danh cũ');assert.equal(input.hidden,false);assert.equal(picker.read(),'Biệt danh cũ');
 picker.restore('');assert.equal(select.hidden,false);assert.equal(picker.read(),'');
});

test('empty or whitespace names report errors only on the visible active field; changing clears the error',async()=>{
 const {select,input,edit,picker}=await fixture();assert.equal(picker.validate(),false);assert.equal(select.reported,true);assert.ok(select.validityMessage);
 select.value=expected[1];select.onchange();assert.equal(select.validityMessage,'');assert.equal(picker.validate(),true);
 edit.onclick();input.value='   ';input.oninput();assert.equal(picker.validate(),false);assert.equal(input.reported,true);assert.ok(input.validityMessage);
 input.value='Thảo';input.oninput();assert.equal(input.validityMessage,'');assert.equal(picker.validate(),true);
});

test('custom names retain the existing 40-character limit and normalize spaces',async()=>{
 const {input,edit,picker}=await fixture();edit.onclick();input.value='  '+ 'a'.repeat(45)+'   b  ';input.oninput();assert.equal(picker.read(),'a'.repeat(40));
 picker.restore(null);assert.equal(picker.read(),'');
});
