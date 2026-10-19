import {drinkLabel} from './drink-orders.js';

export function reconcileDrinkGift(existing,profileKey,confirmedOrder){
 if(!existing)return null;
 if(confirmedOrder&&profileKey)return {...existing,style:confirmedOrder.category==='tea'?1:0,result:'KOI · '+drinkLabel(confirmedOrder),drinkProfileKey:profileKey,drinkSynced:true};
 return profileKey&&existing.drinkProfileKey===profileKey&&existing.drinkSynced===true?existing:null;
}
