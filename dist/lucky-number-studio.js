import {drawLuckyNumber,drawLuckySet,formatLuckySet} from './lucky-numbers.js?v=lucky-ticket-20261019-1';

export const LUCKY_TICKET_QUOTE='Muốn trúng số, việc đầu tiên là phải mua vé số. Thế thôi! Chúc chị em may mắn 8386';

// Each tap owns one random draw. Completion happens only after the ticket opens.
export function mountLuckyNumber(area,{
 drawNumber=drawLuckyNumber,drawSet=drawLuckySet,onComplete=()=>{},celebrate=()=>{},
 clipboard=globalThis.navigator?.clipboard
}={}){
 const doc=area.ownerDocument;
 const node=(tag,cls,text)=>{const el=doc.createElement(tag);el.className=cls;if(text!==undefined)el.textContent=text;return el;};
 const button=(cls,label)=>{const el=node('button',cls);el.type='button';el.setAttribute('aria-label',label);return el;};
 const shell=node('div','lucky-flow');
 const step=node('p','lucky-step','01 / 02 · SỐ MAY MẮN');
 const title=node('h3','lucky-title','Một con số dành riêng cho bạn.');
 const intro=node('p','cosmic-intro','Chạm vào quả cầu để nhận số may mắn của mình nhé.');
 const orb=button('lucky-orb','Lấy số may mắn');
 orb.append(node('span','lucky-orb-value','?'),node('small','lucky-orb-hint','CHẠM ĐỂ NHẬN SỐ'));
 const single=node('p','lucky-single');single.hidden=true;
 const ticket=button('lucky-ticket-open','Mở vé Vietlott để nhận 6 số ngẫu nhiên');ticket.hidden=true;
 ticket.append(node('small','lucky-ticket-eyebrow','MỘT CHÚT MAY MẮN NỮA, DÀNH CHO BẠN'),node('strong','lucky-ticket-brand','VIETLOTT'),node('span','lucky-ticket-mega','MEGA 6/45'),node('span','lucky-ticket-seal','✦'),node('span','lucky-ticket-tap','Chạm để mở 6 số của bạn →'),node('small','lucky-ticket-footnote','VÉ VUI · 20 / 10'));
 const result=node('section','lucky-ticket-result');result.hidden=true;result.setAttribute('aria-label','Vé số vui của bạn');
 const ticketHead=node('div','lucky-ticket-head');ticketHead.append(node('strong','lucky-ticket-brand','VIETLOTT'),node('span','lucky-ticket-mega','MEGA 6/45'));
 const list=node('div','lucky-set-balls');list.setAttribute('role','list');list.setAttribute('aria-label','Bộ số vui 6/45');
 for(let i=0;i<6;i++){const value=node('span','lucky-ticket-number');value.setAttribute('role','listitem');value.style.setProperty('--ball-index',String(i));list.append(value);}
 result.append(ticketHead,node('p','lucky-ticket-caption','SÁU CON SỐ NGẪU NHIÊN CỦA BẠN'),list,node('small','lucky-ticket-footnote','BỐC VUI CÙNG TEAM · 20 / 10'));
 const quote=node('p','lucky-ticket-quote',LUCKY_TICKET_QUOTE);quote.hidden=true;
 const copy=button('lucky-set-copy','Chép bộ số');copy.textContent='Chép bộ số';copy.hidden=true;copy.disabled=true;
 const status=node('p','lucky-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 shell.append(step,title,intro,orb,single,ticket,result,quote,copy,status);area.append(shell);
 let number=null,luckySet=null;
 orb.onclick=()=>{
  if(number!==null)return;
  number=drawNumber();orb.hidden=true;orb.disabled=true;
  single.textContent='Số may mắn của bạn · '+number;single.hidden=false;
  step.textContent='02 / 02 · MỞ VÉ MAY MẮN';title.textContent='Có một tấm vé gửi bạn.';
  intro.textContent='Chạm vào tấm vé để mở thêm 6 số ngẫu nhiên nhé.';
  ticket.hidden=false;status.textContent='Bạn nhận được số '+number+'. Tấm vé của bạn đã sẵn sàng.';
  ticket.focus();celebrate();
 };
 ticket.onclick=()=>{
  if(number===null||luckySet!==null)return;
  luckySet=drawSet();ticket.hidden=true;ticket.disabled=true;
  Array.from(list.children).forEach((el,i)=>el.textContent=String(luckySet[i]).padStart(2,'0'));
  list.className='lucky-set-balls is-revealed';list.setAttribute('aria-label','Bộ số vui 6/45: '+formatLuckySet(luckySet));
  result.hidden=false;quote.hidden=false;copy.hidden=false;
  step.textContent='02 / 02 · VÉ CỦA BẠN';title.textContent='May mắn gọi tên bạn!';intro.hidden=true;
  onComplete({number,luckySet:[...luckySet],result:'Số '+number+' · Bộ số vui 6/45: '+formatLuckySet(luckySet)+' · '+LUCKY_TICKET_QUOTE});
  // stationReady locks all game buttons; copying the completed ticket stays usable.
  copy.disabled=false;status.textContent='Đã mở đủ 6 số: '+formatLuckySet(luckySet)+'.';copy.focus();celebrate();
 };
 copy.onclick=async()=>{
  if(luckySet===null)return;
  copy.disabled=true;
  try{await clipboard.writeText('Số may mắn: '+number+'\nBộ số vui 6/45: '+formatLuckySet(luckySet)+'\n'+LUCKY_TICKET_QUOTE);status.textContent='Đã chép bộ số và lời chúc ✦';}
  catch{status.textContent='Chưa chép được. Bạn thử lại hoặc chụp tấm vé nhé.';}
  finally{copy.disabled=false;}
 };
}
