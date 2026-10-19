import test from 'node:test';
import assert from 'node:assert/strict';
const api=()=>import('../dist/participant-photo-gallery.js');
function host(){const doc={createElement(tag){return {tag,ownerDocument:doc,children:[],attrs:{},dataset:{},hidden:false,disabled:false,setAttribute(key,value){this.attrs[key]=String(value);},append(...nodes){this.children.push(...nodes);},replaceChildren(...nodes){this.children=[...nodes];}};}};return doc.createElement('div');}
const photos=Array.from({length:8},(_,i)=>({id:'ly'+i,name:'Ly '+i,url:'https://example.test/'+i+'.jpg',canvas:{index:i}}));

test('thumbnail pages select the actual photo and keep its selection without submitting anything',async()=>{
 const {createParticipantPhotoGallery}=await api(),root=host(),selected=[],gallery=createParticipantPhotoGallery(root,{onSelect:p=>selected.push(p),pageSize:()=>4});
 gallery.setPhotos(photos);const [grid,pager,empty]=root.children,[previous,label,next]=pager.children;
 assert.equal(grid.children.length,4);assert.equal(empty.hidden,true);assert.equal(previous.disabled,true);assert.equal(label.textContent,'1–4 / 8');next.onclick();assert.equal(label.textContent,'5–8 / 8');assert.equal(next.disabled,true);
 const last=grid.children[3];last.onclick();assert.equal(selected[0],photos[7]);assert.equal(last.attrs['aria-pressed'],'true');assert.equal(last.attrs['aria-label'],'Chọn ảnh 8 trong 8');assert.equal(selected.length,1);
 gallery.setDisabled(true);last.onclick();assert.equal(selected.length,1);assert.equal(previous.disabled,true);gallery.setDisabled(false);assert.equal(previous.disabled,false);
 gallery.setSelected(photos[4].canvas);assert.equal(grid.children[0].attrs['aria-pressed'],'true');assert.equal(last.attrs['aria-pressed'],'false');
});

test('responsive paging retains a selected photo and switching participants removes the old gallery',async()=>{
 const {createParticipantPhotoGallery}=await api(),root=host();let size=4;const gallery=createParticipantPhotoGallery(root,{onSelect(){},pageSize:()=>size});gallery.setPhotos(photos,photos[7].canvas);
 const [grid,pager]=root.children;assert.equal(grid.children[3].attrs['aria-pressed'],'true');size=2;gallery.refresh();assert.equal(grid.children.length,2);assert.equal(pager.children[1].textContent,'7–8 / 8');assert.equal(grid.children[1].attrs['aria-pressed'],'true');
 gallery.setPhotos(photos.slice(0,1));assert.equal(grid.children.length,1);assert.equal(pager.hidden,true);assert.equal(grid.children[0].attrs['aria-pressed'],'false');gallery.setPhotos([]);assert.equal(grid.children.length,0);assert.equal(root.children[2].hidden,false);assert.equal(pager.hidden,true);
});
