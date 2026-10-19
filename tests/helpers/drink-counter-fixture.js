import {readFile} from 'node:fs/promises';
import {createDrinkCounter} from '../../dist/drink-counter.js';

export async function drinkCounterFixture(t,{transport}={}){
 const menu=JSON.parse(await readFile(new URL('../../dist/assets/drinks/koi-menu.json',import.meta.url))),settings=JSON.parse(await readFile(new URL('../../dist/assets/drinks/order-config.json',import.meta.url)));
 const html=await readFile(new URL('../../dist/index.html',import.meta.url),'utf8'),elements=new Map(),values=new Map(),events=new Map();
 const doc={createElement(tag){return {tag,ownerDocument:doc,children:[],attrs:{},dataset:{},value:'',hidden:false,disabled:false,textContent:'',setAttribute(k,v){this.attrs[k]=String(v);},append(...items){for(const item of items){item.parentNode=this;this.children.push(item);}},add(item){this.append(item);},replaceChildren(...items){this.children=[];this.append(...items);},after(item){this.parentNode.append(item);},remove(){this.parentNode.children=this.parentNode.children.filter(x=>x!==this);},focus(){doc.activeElement=this;},showModal(){this.open=true;},close(){this.open=false;}};},querySelector:id=>elements.get(id),querySelectorAll:()=>elements.get('#drink-categories').children};
 const root=doc.createElement('div');for(const [,id] of html.matchAll(/id="(drink-[^"]+)"/g)){const el=doc.createElement('div');elements.set('#'+id,el);root.append(el);}
 const fields=doc.createElement('fieldset');elements.get('#drink-order-form').querySelector=()=>fields;
 const replacements={document:doc,innerWidth:1280,localStorage:{getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)},Option:class{constructor(text,value){this.textContent=text;this.value=value;}},fetch:async url=>({ok:true,json:async()=>String(url).includes('koi-menu')?menu:settings}),addEventListener:(type,fn)=>events.set(type,fn)};
 const previous=new Map(Object.keys(replacements).map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));Object.assign(globalThis,replacements);
 t.after(()=>{for(const [key,descriptor] of previous)if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];});
 const keeps=[],calls=[];const counter=createDrinkCounter({onKeep:(order,meta)=>keeps.push({order,meta}),transport:async args=>{calls.push(args.payload);return transport?transport(args):{status:'accepted',requestId:args.payload.requestId,sequence:args.payload.sequence};}});await counter.ready;
 return {counter,menu,keeps,calls,values,events,get:id=>elements.get('#'+id),choose(){elements.get('#drink-menu-list').children.find(el=>!el.hidden).onclick();},submit:()=>elements.get('#drink-order-form').onsubmit({preventDefault(){}})};
}
