import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

async function gallery({complete=true,format='full'}={}){
 const source=await readFile(new URL('../dist/app.js',import.meta.url),'utf8');
 const functionSource=source.slice(source.indexOf('function openWish('),source.indexOf('\nfunction closeKeepsake'));
 const preview={textContent:'Hiện tùy chỉnh',setAttribute(key,value){this[key]=value;}},body={previewOnly:true,classList:{remove(){body.previewOnly=false;}}};
 const dialog={open:false,showModal(){this.open=true;}},elements={'#wish-card':dialog,'.wish-studio-body':body,'#wish-see-preview':preview};
 const context={index:7,cardFormat:format,keepsakeCollection:new Map(),player:{position:{}},wishTabs:{select(index){context.selectedTab=index;}},selectedTab:2,getJourneyProgress:()=>({complete}),openJourneyAlbum(){context.albumOpened=true;},drawWish(){},updateWishPreview(){context.previewUpdated=true;},celebrateAt(){},$:selector=>elements[selector]};
 vm.createContext(context);vm.runInContext(functionSource+';this.open=openWish;',context);
 return {context,dialog,body,preview};
}

test('changing templates from final check-in always opens the four choices, including after full keepsake or enlarged preview',async()=>{
 const {context,dialog,body,preview}=await gallery();context.open({templates:true});
 assert.equal(dialog.open,true);assert.equal(context.cardFormat,'post');assert.equal(context.selectedTab,0);assert.equal(body.previewOnly,false);assert.equal(preview.textContent,'Phóng to thiệp');assert.equal(preview['aria-pressed'],'false');assert.equal(context.previewUpdated,true);
});

test('template shortcut preserves an existing social format and cannot bypass unfinished keepsakes',async()=>{
 const {context}=await gallery({format:'story'});context.open({templates:true});assert.equal(context.cardFormat,'story');
 const unfinished=await gallery({complete:false});unfinished.context.open({templates:true});assert.equal(unfinished.dialog.open,false);assert.equal(unfinished.context.albumOpened,true);
 const normal=await gallery();normal.context.open();assert.equal(normal.context.cardFormat,'full');assert.equal(normal.context.selectedTab,2);
});
