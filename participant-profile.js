import {PARTICIPANT_NAMES} from './name-picker.js';
import {UUID} from './drink-orders.js';

const clean=value=>String(value??'').normalize('NFC').trim().replace(/\s+/g,' ').slice(0,40);
const comparable=value=>clean(value).toLocaleLowerCase('vi');
const members=new Map(PARTICIPANT_NAMES.map(name=>['member:'+name.split(' - ').at(-1),name]));
const validKey=key=>members.has(key)||(typeof key==='string'&&key.startsWith('guest:')&&UUID.test(key.slice(6)));

// A check-in nickname may change; the selected colleague's pickup identity does not.
export function resolveParticipantKey(name,previousKey,createId=()=>crypto.randomUUID()){
 const value=clean(name);if(!value)return '';
 for(const [key,canonical] of members)if(comparable(value)===comparable(canonical))return key;
 return validKey(previousKey)?previousKey:'guest:'+createId();
}
export function participantOrderName(key,displayName){return members.get(key)||clean(displayName);}
