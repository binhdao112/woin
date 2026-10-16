import {cardFilename, wrapText} from './wish-card.js';

const messages = [
  'Chúc bạn luôn được yêu thương,\nđược trân trọng và tự do tỏa sáng.',
  'Đẹp theo cách riêng.\nHạnh phúc theo nhịp của mình.',
  'Mong những điều dịu dàng nhất\nluôn tìm đến bạn.',
  'Chúc bạn một đời nhiều hoa,\nnhiều niềm vui và những người thương.',
];

export function getSocialCopy(model) {
  return {title:'Gửi một người\nrất đặc biệt.', message:messages[(Number(model.wishNumber)||0)%messages.length]};
}

export function socialCardFilename(recipient, format='post') {
  return cardFilename(recipient).replace('.png', format==='story'?'-story.png':'-bai-dang.png');
}

function box(ctx,x,y,width,height,radius,color) {
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x+radius,y);
  ctx.lineTo(x+width-radius,y);ctx.quadraticCurveTo(x+width,y,x+width,y+radius);
  ctx.lineTo(x+width,y+height-radius);ctx.quadraticCurveTo(x+width,y+height,x+width-radius,y+height);
  ctx.lineTo(x+radius,y+height);ctx.quadraticCurveTo(x,y+height,x,y+height-radius);
  ctx.lineTo(x,y+radius);ctx.quadraticCurveTo(x,y,x+radius,y);ctx.closePath();ctx.fill();
}

function cover(ctx,image,x,y,width,height) {
  const ratio=width/height,sourceRatio=image.width/image.height;
  const sw=sourceRatio>ratio?image.height*ratio:image.width;
  const sh=sourceRatio>ratio?image.height:image.width/ratio;
  ctx.drawImage(image,(image.width-sw)/2,(image.height-sh)/2,sw,sh,x,y,width,height);
}

function fallbackFlowers(ctx,height) {
  for(let flower=0;flower<7;flower++) {
    const x=flower*180-10,y=height-90-(flower%3)*52;
    ctx.save();ctx.translate(x,y);
    for(let petal=0;petal<7;petal++) {
      ctx.rotate(Math.PI*2/7);ctx.fillStyle=flower%2?'#d9a3b0':'#f0c4b5';
      ctx.beginPath();ctx.ellipse(0,-59,36,65,0,0,Math.PI*2);ctx.fill();
    }
    ctx.fillStyle='#b38950';ctx.beginPath();ctx.arc(0,0,20,0,Math.PI*2);ctx.fill();ctx.restore();
  }
}

export function renderSocialCard(canvas,model,{format='post',photo,artwork}={}) {
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('Trình duyệt chưa hỗ trợ canvas để tạo thiệp.');
  const story=format==='story',height=story?1920:1350;
  canvas.width=1080;canvas.height=height;
  const serif=(size,italic=false)=>{ctx.font=`${italic?'italic ':''}500 ${size}px Lora, Georgia, serif`;};
  const body=(size,weight=400)=>{ctx.font=`${weight} ${size}px "Be Vietnam Pro", sans-serif`;};
  const lines=(text,x,y,width,lineHeight)=>{const values=wrapText(ctx,text,width);values.forEach((value,i)=>ctx.fillText(value,x,y+i*lineHeight));return y+values.length*lineHeight;};
  const ink='#733e50',muted='#886c6b',gold='#ac8050',copy=getSocialCopy(model);
  const background=ctx.createLinearGradient(0,0,1080,height);background.addColorStop(0,'#fff7ed');background.addColorStop(1,'#f1d3d2');
  ctx.fillStyle=background;ctx.fillRect(0,0,1080,height);
  if(artwork)cover(ctx,artwork,0,0,1080,height);else fallbackFlowers(ctx,height);

  ctx.strokeStyle='#9d76574d';ctx.lineWidth=1.25;ctx.strokeRect(38,38,1004,height-76);
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  box(ctx,283,67,514,53,26,'#fff9efe8');
  body(18,500);ctx.fillStyle=ink;ctx.fillText('20 / 10  ·  MỘT NGÀY THẬT ĐẶC BIỆT',540,101);
  serif(story?66:57);ctx.fillText('Gửi một người',540,story?275:235);
  serif(story?96:88,true);ctx.fillText('rất đặc biệt.',540,story?378:336);

  let nameSize=story?94:86,nameLines;
  do{serif(nameSize,true);nameLines=wrapText(ctx,model.recipient,900);if(nameLines.length<=2)break;nameSize-=2;}while(nameSize>36);
  ctx.fillStyle='#a04f68';nameLines.forEach((line,i)=>ctx.fillText(line,540,(story?525:475)+i*(nameSize+14)));

  if(photo) {
    const x=story?160:105,y=story?680:610,width=story?760:400,frameHeight=story?812:490;
    ctx.save();ctx.translate(x+width/2,y+frameHeight/2);ctx.rotate(story?-.035:.055);
    ctx.shadowColor='#743b4b30';ctx.shadowBlur=32;ctx.shadowOffsetY=18;
    box(ctx,-width/2,-frameHeight/2,width,frameHeight,4,'#fffdf7');ctx.shadowColor='transparent';
    cover(ctx,photo,-width/2+19,-frameHeight/2+19,width-38,frameHeight-90);
    ctx.textAlign='center';serif(story?27:22,true);ctx.fillStyle=ink;
    ctx.fillText('a beautiful day, a beautiful you.',0,frameHeight/2-28);ctx.restore();
    if(story)box(ctx,80,1548,920,216,24,'#fff9eff0');
    ctx.textAlign='left';body(story?17:15,500);ctx.fillStyle=gold;
    ctx.fillText('MỘT CHÚT YÊU THƯƠNG',story?120:585,story?1590:659);
    serif(story?33:31);ctx.fillStyle=ink;
    lines(copy.message,story?120:585,story?1641:720,story?840:395,story?49:46);
    if(!story){body(19);ctx.fillStyle=muted;lines('Từ những người đồng đội\nluôn trân trọng bạn.',585,956,395,33);}
  } else {
    ctx.textAlign='center';
    serif(story?40:37);ctx.fillStyle=ink;
    lines(copy.message,story?540:630,story?1010:684,story?800:660,story?65:56);
    body(21);ctx.fillStyle=muted;lines('Từ những người đồng đội\nluôn trân trọng bạn.',story?540:650,story?1300:910,650,34);
  }

  const number=model.keepsakes.find(item=>item.title==='Bùa số may mắn')?.detail.match(/\d+/)?.[0];
  if(number) {
    const x=story?910:529,y=story?1460:1092;
    ctx.save();ctx.translate(x,y);ctx.rotate(-.13);ctx.fillStyle='#fbf0d7';ctx.strokeStyle=gold;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(0,0,59,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.textAlign='center';body(12,500);ctx.fillStyle=ink;ctx.fillText('LUCKY YOU',0,-25);serif(50);ctx.fillText(number,0,22);ctx.restore();
  }
  box(ctx,80,height-105,920,51,25,'#fffaf2e8');
  body(15,500);ctx.fillStyle=ink;ctx.textAlign='left';ctx.fillText('WITH LOVE, YOUR TEAM',104,height-72);
  ctx.textAlign='right';ctx.fillText('#Happy2010   #VanPhongTrenMay',976,height-72);
  return canvas;
}

let artworkPromise;
export function loadCardArtwork() {
  if(!artworkPromise)artworkPromise=new Promise(resolve=>{
    const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>resolve(null);
    image.src=new URL('./assets/social-bloom.png',import.meta.url).href;
  });
  return artworkPromise;
}
