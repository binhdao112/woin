import {UUID} from './drink-orders.js';

export function createDrinkRegistrationStore(storage, eventId, createId = () => crypto.randomUUID(), now = Date.now) {
  const key = 'team-drink-order-v1:' + eventId;
  function write(state) { storage.setItem(key,JSON.stringify(state)); return state; }
  function read() {
    const raw=storage.getItem(key);
    if(raw){
      try {
        const state=JSON.parse(raw);
        if(UUID.test(state.participantId) && Number.isSafeInteger(state.sequence) && state.sequence>=0 && (!state.pending || UUID.test(state.pending.requestId))) return state;
      } catch { /* A malformed draft is never interpreted as a sent order. */ }
    }
    return write({participantId:createId(),sequence:0,pending:null,confirmed:null});
  }
  read(); // Fail early if the browser cannot durably retain the registration ID.
  return {
    read,
    prepare(draft) {
      const state=read();if(state.pending)return state.pending;
      const sequence=Math.max(now(),state.sequence+1);
      const payload={...draft,eventId,participantId:state.participantId,requestId:createId(),sequence};
      write({...state,sequence,pending:payload});return payload;
    },
    confirm(receipt) {
      const state=read(),pending=state.pending;
      if(!pending || receipt.status!=='accepted' || receipt.requestId!==pending.requestId || receipt.sequence!==pending.sequence) throw Error('Lần gửi đã thay đổi. Hãy kiểm tra lại lựa chọn.');
      return write({...state,pending:null,confirmed:pending}).confirmed;
    },
    reject() { const state=read();write({...state,pending:null}); },
  };
}
