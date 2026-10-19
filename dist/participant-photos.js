import {PARTICIPANT_NAMES} from './name-picker.js';

export const PARTICIPANT_PHOTOS_URL=new URL('./assets/memories/portraits.json',import.meta.url);
const members=new Set(PARTICIPANT_NAMES.map(name=>'member:'+name.split(' - ').at(-1)));
const photoId=value=>typeof value==='string'&&/^[\w-]{1,160}$/.test(value)?value:null;

export function normaliseParticipantPhotoBindings(data){
 const participants={},albums={};
 for(const [key,value] of Object.entries(data?.participants||{}))if(members.has(key)&&photoId(value))participants[key]=value;
 for(const key of members){const values=Array.isArray(data?.albums?.[key])?data.albums[key]:[],ids=[participants[key],...values].filter(photoId);if(ids.length)albums[key]=[...new Set(ids)].slice(0,48);}
 return {defaultPhotoId:photoId(data?.defaultPhotoId),participants,albums};
}
export async function loadParticipantPhotoBindings({fetchImpl=fetch}={}){
 try{const response=await fetchImpl(PARTICIPANT_PHOTOS_URL,{cache:'no-cache'});if(!response.ok)throw Error();return normaliseParticipantPhotoBindings(await response.json());}
 catch{return {defaultPhotoId:null,participants:{},albums:{}};}
}
export function getParticipantPhotos(photos,bindings,profileKey){
 const ids=bindings?.albums?.[profileKey]||[bindings?.participants?.[profileKey]];
 return [...new Set(ids)].map(id=>photos.find(photo=>photo.id===id)).filter(Boolean);
}
export function findParticipantPhoto(photos,bindings,profileKey){
 const assigned=bindings?.participants?.[profileKey];
 return (assigned&&photos.find(photo=>photo.id===assigned))||photos.find(photo=>photo.id===bindings?.defaultPhotoId)||null;
}

// Photo choices belong to the stable participant key, including after a nickname edit.
export function createParticipantPhotoStore(){
 const choices=new Map(),versions=new Map();
 const advance=key=>{const version=(versions.get(key)||0)+1;versions.set(key,version);return version;};
 const read=key=>({...choices.get(key)||{photo:null,enabled:true}});
 return {read,
  setPhoto(key,photo){if(!key)return;advance(key);choices.set(key,{photo,enabled:true});},
  setEnabled(key,enabled){if(!key)return;advance(key);choices.set(key,{...read(key),enabled:!!enabled});},
  resetPhoto(key){if(!key)return;advance(key);choices.delete(key);},
  beginSelection(profileKey){return {profileKey,version:advance(profileKey)};},
  commitSelection(ticket,photo){if(!ticket?.profileKey||versions.get(ticket.profileKey)!==ticket.version)return false;choices.set(ticket.profileKey,{photo,enabled:true});return true;},
 };
}
