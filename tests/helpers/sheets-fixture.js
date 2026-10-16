import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

class Sheet {
 constructor(){this.rows=[];}
 getLastRow(){return this.rows.length;}
 getDataRange(){return this.getRange(1,1,Math.max(1,this.rows.length),16);}
 getRange(row,column,count=1,width=1){return {getValues:()=>Array.from({length:count},(_,r)=>Array.from({length:width},(_,c)=>this.rows[row+r-1]?.[column+c-1]??'')),setValues:values=>{for(let r=0;r<values.length;r++){this.rows[row+r-1]??=[];for(let c=0;c<values[r].length;c++)this.rows[row+r-1][column+c-1]=values[r][c];}return this;},clearContent:()=>{for(let r=0;r<count;r++)for(let c=0;c<width;c++)if(this.rows[row+r-1])this.rows[row+r-1][column+c-1]='';}};}
 setFrozenRows(){} autoResizeColumns(){} hideColumns(){}
}
export async function createSheetsFixture(){
 const source=await readFile(new URL('../../integrations/google-sheets/Code.gs',import.meta.url),'utf8'),sheets=new Map(),props=new Map(),cache=new Map();let locked=false;
 const book={getId:()=> 'sheet-id',getUrl:()=> 'https://docs.google.com/spreadsheets/d/sheet-id',getSheetByName:name=>sheets.get(name),insertSheet:name=>{const sheet=new Sheet();sheets.set(name,sheet);return sheet;}};
 const context={console:{log(){}},Date,JSON,Map,Set,Math,Number,String,Error,RegExp,PropertiesService:{getScriptProperties:()=>({getProperty:key=>props.get(key)||null,setProperty:(key,val)=>props.set(key,String(val))})},CacheService:{getScriptCache:()=>({get:key=>cache.get(key)||null,put:(key,val)=>cache.set(key,val)})},LockService:{getScriptLock:()=>({tryLock:()=>{if(locked)return false;locked=true;return true;},releaseLock:()=>{locked=false;}})},SpreadsheetApp:{getActiveSpreadsheet:()=>book,openById:()=>book},ContentService:{MimeType:{JSON:'json',JAVASCRIPT:'js'},createTextOutput:text=>({text,setMimeType(){return this;}})}};
 vm.createContext(context);vm.runInContext(source,context);context.setupKoiOrders();
 const menu=JSON.parse(await readFile(new URL('../../dist/assets/drinks/koi-menu.json',import.meta.url),'utf8'));
 const payload={eventId:'team-2010-2026',menuVersion:menu.version,participantId:'e88eeec0-bbbd-49ad-a570-958d82fdc8fb',requestId:'c6ba67ed-e609-494e-ae98-de202118d799',sequence:1,name:'Minh Anh',variantId:menu.items[0].variants[0].id,sugar:'50%',ice:'Ít đá',note:''};
 return {context,sheets,props,cache,payload,post:input=>JSON.parse(context.doPost({postData:{contents:JSON.stringify(input)}}).text)};
}

