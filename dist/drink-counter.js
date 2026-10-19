import {mountPopupPager} from './popup-layout.js?v=popup-fit-20261019-1';
import {findDrink,searchDrinks,validateDrinkOrder,drinkLabel,SUGAR_OPTIONS,ICE_OPTIONS} from './drink-orders.js';
import {sendDrinkOrder,isAppsScriptEndpoint} from './drink-order-client.js';
import {createDrinkRegistrationStore} from './drink-registration.js';

const MENU_URL=new URL('./assets/drinks/koi-menu.json',import.meta.url);
const CONFIG_URL=new URL('./assets/drinks/order-config.json',import.meta.url);
const $=selector=>document.querySelector(selector);
const money=value=>new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(value);
const sameChoice=(a,b)=>a&&b&&['menuVersion','name','variantId','sugar','ice','note'].every(key=>String(a[key]||'').trim()===String(b[key]||'').trim());

export function createDrinkCounter({onKeep,transport=sendDrinkOrder}={}) {
  const dialog=$('#drink-counter'),form=$('#drink-order-form');
  let menuPager=null;
  let menu,config={eventId:'team-2010-2026',enabled:false,endpoint:''},store,selected=null,category='best',busy=false,storageError=false,localDraft=null;
  const ready=Promise.all([
    fetch(MENU_URL).then(response=>{if(!response.ok)throw Error();return response.json();}),
    fetch(CONFIG_URL,{cache:'no-cache'}).then(response=>{if(!response.ok)throw Error();return response.json();}).catch(()=>config),
  ]).then(([catalog,settings])=>{
    if(!Array.isArray(catalog.items)||!catalog.items.length)throw Error();
    menu=catalog;config=settings;config.enabled=config.enabled===true&&isAppsScriptEndpoint(config.endpoint);
    try {store=createDrinkRegistrationStore(localStorage,config.eventId);}catch {storageError=true;}
    $('#drink-menu-source').href=menu.sourceUrl;$('#drink-menu-date').textContent='Menu Grab · cập nhật '+menu.checkedAt.split('-').reverse().join('/');
    for(const value of SUGAR_OPTIONS)$('#drink-sugar').add(new Option(value,value));
    for(const value of ICE_OPTIONS)$('#drink-ice').add(new Option(value,value));
    const categories=[{id:'all',name:'Tất cả'},...menu.categories];
    for(const item of categories){const button=document.createElement('button');button.type='button';button.textContent=item.name;button.dataset.drinkCategory=item.id;button.onclick=()=>{category=item.id;renderMenu();};$('#drink-categories').append(button);}
    renderMenu();renderSelection();
  }).catch(()=>{status('Chưa tải được menu. Bạn có thể đóng rồi mở lại sau, hoặc tiếp tục hành trình.');$('#drink-menu-status').textContent='Menu chưa tải được. Hãy tải lại trang để thử lại.';});

  function state(){return store?.read()||{pending:null,confirmed:null};}
  function status(text){$('#drink-order-status').textContent=text;}
  function draft(){return {menuVersion:menu.version,name:$('#drink-name').value.trim(),variantId:selected,sugar:$('#drink-sugar').value,ice:$('#drink-ice').value,note:$('#drink-note').value.trim()};}
  function normalized(){return validateDrinkOrder(menu,{...draft(),eventId:config.eventId,participantId:state().participantId||'00000000-0000-4000-8000-000000000000',requestId:'00000000-0000-4000-8000-000000000000',sequence:1});}
  function apply(order){
    if(!order)return;selected=order.variantId;$('#drink-name').value=order.name||'';$('#drink-sugar').value=SUGAR_OPTIONS.includes(order.sugar)?order.sugar:'Mặc định';$('#drink-ice').value=ICE_OPTIONS.includes(order.ice)?order.ice:'Mặc định';$('#drink-note').value=order.note||'';
  }
  function renderMenu(){
    if(!menu)return;
    const found=selected?findDrink(menu,selected):null,items=searchDrinks(menu,$('#drink-search').value,category),pending=Boolean(state().pending);
    document.querySelectorAll('[data-drink-category]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.drinkCategory===category));});
    menuPager?.dispose();$('#drink-menu-list').replaceChildren();$('#drink-menu-status').textContent=items.length?items.length+' món · chọn món để xem cỡ ly':'Chưa có món khớp. Thử tên khác hoặc chọn Tất cả.';
    for(const item of items){
      const button=document.createElement('button');button.type='button';button.className='drink-menu-item';button.setAttribute('aria-pressed',String(found?.item.id===item.id));button.disabled=busy||pending;
      const cup=document.createElement('span');cup.className='drink-cup drink-cup-'+item.category;cup.setAttribute('aria-hidden','true');cup.textContent='✦';
      const info=document.createElement('span'),title=document.createElement('strong'),price=document.createElement('small');title.textContent=item.name;
      price.textContent='Từ '+money(Math.min(...item.variants.map(variant=>variant.price)));info.append(title,price);
      const marker=document.createElement('span');marker.className='drink-marker';marker.textContent=found?.item.id===item.id?'✓':'＋';marker.setAttribute('aria-hidden','true');button.append(cup,info,marker);
      button.onclick=()=>{selected=item.variants[0].id;status('');renderMenu();renderSelection();dialog.dataset.drinkStep='options';$('#drink-change').focus();};
      $('#drink-menu-list').append(button);
    }
    menuPager=mountPopupPager($('#drink-menu-list'),{pageSize:()=>innerWidth<760?2:4});
  }
  function renderSelection(){
    if(!menu)return;
    const found=selected?findDrink(menu,selected):null,saved=state(),pending=Boolean(saved.pending),confirmed=sameChoice(draft(),saved.confirmed);
    $('#drink-picked-name').textContent=found?found.item.name:'Chọn một ly thật hợp gu';$('#drink-picked-price').textContent=found?money(found.variant.price):'Một chút ngọt ngào cho giờ nghỉ';
    $('#drink-footer-choice').textContent=found?found.item.name+' · '+found.variant.label+' · '+money(found.variant.price):'';
    $('#drink-variants').replaceChildren();
    if(found)for(const variant of found.item.variants){const button=document.createElement('button');button.type='button';button.textContent=variant.label+' · '+money(variant.price);button.setAttribute('aria-pressed',String(variant.id===selected));button.disabled=busy||pending;button.onclick=()=>{selected=variant.id;status('');renderSelection();};$('#drink-variants').append(button);}
    form.querySelector('fieldset').disabled=busy||pending;
    $('#drink-ice').disabled=busy||pending||found?.variant.temperature==='hot';$('#drink-ice-note').hidden=found?.variant.temperature!=='hot';
    $('#drink-submit').hidden=!config.enabled||confirmed;$('#drink-submit').disabled=busy||!selected||storageError;
    $('#drink-submit').textContent=busy?'Đang gửi và chờ xác nhận…':pending?'Kiểm tra lại lần gửi':saved.confirmed?'Cập nhật lựa chọn':'Gửi lựa chọn cho host';
    $('#drink-continue').hidden=!confirmed;$('#drink-continue').disabled=busy;
    $('#drink-local').hidden=config.enabled;$('#drink-local').disabled=busy||!selected;
    $('#drink-skip').disabled=busy;$('#drink-skip').textContent=pending?'Tiếp tục hành trình, giữ lần gửi đang chờ':saved.confirmed?'Tiếp tục với ly đã đăng ký':'Mình không đăng ký nước · Đi tiếp';
    $('#drink-setup-notice').hidden=config.enabled;$('#drink-storage-notice').hidden=!storageError;
  }
  async function submit(event){
    event.preventDefault();if(busy||!menu||!config.enabled||!store)return;
    let payload;
    try {const pending=state().pending;if(!pending)normalized();payload=store.prepare(draft());}
    catch(error){status(error.message);return;}
    busy=true;status('Đang gửi lựa chọn. Chỉ hiện đã nhận khi Google Sheets xác nhận.');renderMenu();renderSelection();
    try {
      const receipt=await transport({endpoint:config.endpoint,payload});store.confirm(receipt);
      status('Đã ghi nhận 1 ly cho '+payload.name+'. Bạn có thể đổi món và cập nhật trên trình duyệt này.');
    }catch(error){if(error.definitive)store.reject();status(error.message||'Chưa xác nhận được. Bấm thử lại để kiểm tra.');}
    finally{busy=false;renderMenu();renderSelection();}
  }
  function finish(order,synced){dialog.close();onKeep?.(order,{synced});}
  form.onsubmit=submit;
  $('#drink-close').onclick=()=>dialog.close();$('#drink-search').oninput=()=>{if($('#drink-search').value.trim())category='all';renderMenu();};
  form.oninput=()=>{if(!busy){status('');renderSelection();}};
  $('#drink-local').onclick=()=>{try{const order=normalized();localDraft=draft();finish(order,false);}catch(error){status(error.message);}};
  $('#drink-continue').onclick=()=>{try{if(sameChoice(draft(),state().confirmed))finish(normalized(),true);}catch(error){status(error.message);}};
  $('#drink-skip').onclick=()=>{const saved=state();if(saved.confirmed&&!saved.pending){try{finish(validateDrinkOrder(menu,saved.confirmed),true);}catch(error){status(error.message);}return;}let order=null;if(saved.pending)try{order=normalized();}catch{}finish(order,false);};
  $('#drink-change').textContent='← Đổi món';$('#drink-change').onclick=()=>{dialog.dataset.drinkStep='menu';$('#drink-search').focus();};
  addEventListener('resize',()=>menuPager?.refresh());
  addEventListener('storage',event=>{if(event.key==='team-drink-order-v1:'+config.eventId&&dialog.open&&!busy){apply(state().pending||state().confirmed);renderMenu();renderSelection();}});
  return {
    ready,
    async open(name){
      dialog.dataset.drinkStep='menu';if(!dialog.open)dialog.showModal();dialog.scrollTop=0;status('Đang mở quầy KOI…');await ready;
      if(!menu)return;selected=null;$('#drink-name').value=name||'';$('#drink-sugar').value='Mặc định';$('#drink-ice').value='Mặc định';$('#drink-note').value='';
      const saved=state();apply(saved.pending||saved.confirmed||localDraft);dialog.dataset.drinkStep=selected?'options':'menu';if(!saved.pending&&name)$('#drink-name').value=name;
      status(saved.pending?'Lần gửi trước chưa được xác nhận. Bấm kiểm tra lại; lựa chọn cũ được giữ để tránh gửi trùng.':saved.confirmed?'Bạn đã đăng ký 1 ly. Đổi lựa chọn rồi bấm cập nhật nếu muốn.':'');
      renderMenu();renderSelection();
    },
  };
}
