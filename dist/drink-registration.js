import {UUID} from './drink-orders.js';

const sameName=(a,b)=>String(a??'').normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('vi')===String(b??'').normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('vi');
const valid=state=>state&&UUID.test(state.participantId)&&Number.isSafeInteger(state.sequence)&&state.sequence>=0&&(!state.pending||UUID.test(state.pending.requestId));

export function createDrinkRegistrationStore(storage,eventId,createId=()=>crypto.randomUUID(),now=Date.now,profile){
 const legacyKey='team-drink-order-v1:'+eventId;
 const key=profile?.profileKey?legacyKey+':profile:'+encodeURIComponent(profile.profileKey):legacyKey;
 function write(state){storage.setItem(key,JSON.stringify(state));return state;}
 function parse(raw){try{const state=JSON.parse(raw);return valid(state)?state:null;}catch{return null;}}
 function migrate(){
  if(key===legacyKey||!profile.name)return null;
  const legacy=parse(storage.getItem(legacyKey)),owner=legacy?.pending||legacy?.confirmed;
  if(!owner||!sameName(owner.name,profile.name))return null;
  const claimKey=legacyKey+':legacy-owner',claim=storage.getItem(claimKey);
  if(claim&&claim!==profile.profileKey)return null;
  // Keep retries and their original participant ID intact, but never copy a different person's cup.
  storage.setItem(claimKey,profile.profileKey);
  return {...legacy,pending:legacy.pending&&sameName(legacy.pending.name,profile.name)?legacy.pending:null,confirmed:legacy.confirmed&&sameName(legacy.confirmed.name,profile.name)?legacy.confirmed:null};
 }
 function read(){
  const saved=parse(storage.getItem(key));if(saved)return saved;
  return write(migrate()||{participantId:createId(),sequence:0,pending:null,confirmed:null});
 }
 read();
 return {key,read,
  prepare(draft){const state=read();if(state.pending)return state.pending;const sequence=Math.max(now(),state.sequence+1);const payload={...draft,eventId,participantId:state.participantId,requestId:createId(),sequence};write({...state,sequence,pending:payload});return payload;},
  confirm(receipt){const state=read(),pending=state.pending;if(!pending||receipt.status!=='accepted'||receipt.requestId!==pending.requestId||receipt.sequence!==pending.sequence)throw Error('Lần gửi đã thay đổi. Hãy kiểm tra lại lựa chọn.');return write({...state,pending:null,confirmed:pending}).confirmed;},
  reject(){const state=read();write({...state,pending:null});},
 };
}
