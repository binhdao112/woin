import {wrapText} from './wish-card.js';

export const SOCIAL_TEMPLATES=Object.freeze([
  {id:'bloom',name:'Mây hoa',description:'Dịu dàng, lãng mạn',title:'Gửi một người\nrất đặc biệt.'},
  {id:'editorial',name:'Bìa tạp chí',description:'Nổi bật, thời thượng',title:'The HER edition',message:'Tự tin là phiên bản của mình.\nHôm nay, mọi ánh nhìn dành cho bạn.'},
  {id:'scrapbook',name:'Sổ tay vui',description:'Đáng yêu, nhiều năng lượng',title:'Một ngày\nsiêu đáng yêu!',message:'Chúc bạn một ngày đầy tiếng cười,\nmột chiếc bụng vui và một trái tim ấm.'},
  {id:'midnight',name:'Đêm sao',description:'Lấp lánh, sang trọng',title:'Bạn là\nmột vì sao.',message:'Cứ tỏa sáng theo cách của bạn.\nNhững điều đẹp đẽ đang chờ phía trước.'},
]);

export const getSocialTemplate=id=>SOCIAL_TEMPLATES.find(item=>item.id===id)||SOCIAL_TEMPLATES[0];

function rounded(ctx,x,y,w,h,r,color){
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();ctx.fill();
}

function photoCover(ctx,image,x,y,w,h){
  const ratio=w/h,wide=image.width/image.height>ratio,sw=wide?image.height*ratio:image.width,sh=wide?image.height:image.width/ratio;
  ctx.drawImage(image,(image.width-sw)/2,(image.height-sh)/2,sw,sh,x,y,w,h);
}

function font(ctx,size,{serif=false,italic=false,bold=false}={}){
  ctx.font=`${italic?'italic ':''}${bold?800:500} ${size}px ${serif?'Lora, Georgia, serif':'"Be Vietnam Pro", sans-serif'}`;
}

function paragraph(ctx,text,x,y,width,lineHeight){
  const lines=wrapText(ctx,text,width);lines.forEach((line,i)=>ctx.fillText(line,x,y+i*lineHeight));return lines.length;
}

function name(ctx,text,x,y,width,maxSize,{serif=true,italic=false,maxLines=2}={}){
  let size=maxSize,lines;
  do{font(ctx,size,{serif,italic,bold:!serif});lines=wrapText(ctx,text,width);if(lines.length<=maxLines)break;size-=2;}while(size>32);
  lines.forEach((line,i)=>ctx.fillText(line,x,y+i*(size+12)));
}

function sparkle(ctx,x,y,size,color){
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,y-size);ctx.quadraticCurveTo(x+size*.18,y-size*.18,x+size,y);ctx.quadraticCurveTo(x+size*.18,y+size*.18,x,y+size);ctx.quadraticCurveTo(x-size*.18,y+size*.18,x-size,y);ctx.quadraticCurveTo(x-size*.18,y-size*.18,x,y-size);ctx.fill();
}

function heart(ctx,x,y,size,color){
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,y+size*.65);ctx.bezierCurveTo(x-size*1.5,y-size*.2,x-size*.7,y-size*1.35,x,y-size*.55);ctx.bezierCurveTo(x+size*.7,y-size*1.35,x+size*1.5,y-size*.2,x,y+size*.65);ctx.fill();
}

function editorial(ctx,model,{story,photo,copy,height}){
  const ink='#252522',red='#a34139';ctx.fillStyle='#f3eee5';ctx.fillRect(0,0,1080,height);
  ctx.strokeStyle=ink;ctx.lineWidth=1;ctx.strokeRect(42,42,996,height-84);
  ctx.textAlign='left';ctx.fillStyle=ink;font(ctx,16,{bold:true});ctx.fillText('VNG CAMPUS',76,96);
  ctx.textAlign='right';ctx.fillText('20 / 10  ·  SPECIAL ISSUE',1004,96);
  ctx.textAlign='center';font(ctx,story?330:278,{serif:true});ctx.fillText('HER',540,story?405:370);
  font(ctx,18);ctx.fillText('THE MAIN CHARACTER EDITION',540,story?468:425);
  ctx.strokeStyle=ink;ctx.beginPath();ctx.moveTo(76,story?505:457);ctx.lineTo(1004,story?505:457);ctx.stroke();
  if(photo){
    const x=story?150:190,y=story?560:500,w=story?780:700,h=story?990:615;
    photoCover(ctx,photo,x,y,w,h);
    rounded(ctx,x+24,y+h-147,w-48,123,0,'#f8f3e9ed');
    ctx.fillStyle=ink;font(ctx,story?29:26,{serif:true,italic:true});paragraph(ctx,copy.message,540,y+h-102,w-84,42);
    ctx.fillStyle=red;name(ctx,model.recipient,540,story?1660:1200,920,story?86:72,{maxLines:story?2:1});
  }else{
    ctx.strokeStyle='#a3413933';ctx.lineWidth=40;ctx.beginPath();ctx.arc(540,story?875:685,story?338:250,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle=red;name(ctx,model.recipient,540,story?835:665,900,story?130:108);
    font(ctx,19);ctx.fillStyle=ink;ctx.fillText('KHÍ CHẤT RIÊNG. CÂU CHUYỆN RIÊNG.',540,story?1120:865);
    font(ctx,story?41:34,{serif:true,italic:true});paragraph(ctx,copy.message,540,story?1270:970,850,story?65:53);
    ctx.fillStyle='#a34139';font(ctx,story?235:130,{serif:true});ctx.fillText('20.10',540,story?1665:1190);
  }
  ctx.strokeStyle=ink;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(76,height-109);ctx.lineTo(1004,height-109);ctx.stroke();
  ctx.fillStyle=ink;font(ctx,15);ctx.textAlign='left';ctx.fillText('YOUR DAY. YOUR RULES.',76,height-73);
  ctx.textAlign='right';ctx.fillText('#Happy2010   #TheHerEdition',1004,height-73);
}

function tapedPaper(ctx,x,y,w,h,angle,draw){
  ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate(angle);ctx.shadowColor='#62446820';ctx.shadowBlur=15;ctx.shadowOffsetY=10;
  rounded(ctx,-w/2,-h/2,w,h,5,'#fffdf2');ctx.shadowColor='transparent';
  rounded(ctx,-w/2+30,-h/2-15,110,38,1,'#eac86caa');rounded(ctx,w/2-140,-h/2-15,110,38,1,'#e8aab5aa');
  draw(-w/2,-h/2);ctx.restore();
}

function scrapbook(ctx,model,{story,photo,copy,height}){
  const ink='#66416c';ctx.fillStyle='#f6edda';ctx.fillRect(0,0,1080,height);ctx.strokeStyle='#c1b59e40';ctx.lineWidth=1;
  for(let x=0;x<1080;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}
  for(let y=0;y<height;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1080,y);ctx.stroke();}
  ctx.textAlign='center';ctx.fillStyle=ink;font(ctx,18,{bold:true});ctx.fillText('A LITTLE HAPPINESS CLUB  ·  20/10',540,86);
  font(ctx,story?85:73,{bold:true});ctx.fillText('Một ngày',540,story?217:190);
  rounded(ctx,135,story?255:225,810,story?105:92,20,'#efd78b');
  ctx.fillStyle=ink;font(ctx,story?92:85,{bold:true});ctx.fillText('siêu đáng yêu!',540,story?338:299);
  tapedPaper(ctx,story?120:140,story?438:375,story?840:800,story?178:150,-.028,()=>{
    ctx.textAlign='center';ctx.fillStyle='#bd5c78';name(ctx,model.recipient,0,story?-18:-14,story?750:710,story?80:68,{serif:false});
  });
  heart(ctx,story?950:942,story?680:592,43,'#d97b91');sparkle(ctx,100,story?820:682,44,'#8fa88b');sparkle(ctx,story?939:925,story?1435:935,44,'#ac92bc');
  if(photo){
    const x=story?170:235,y=story?704:590,w=story?740:610,h=story?817:510;
    tapedPaper(ctx,x,y,w,h,story?.035:-.045,(left,top)=>{
      photoCover(ctx,photo,left+18,top+18,w-36,h-84);ctx.textAlign='center';ctx.fillStyle=ink;font(ctx,story?27:23,{serif:true,italic:true});ctx.fillText('little moments, lovely memories.',0,h/2-25);
    });
  }else{
    const cy=story?1030:795,r=story?168:126;ctx.save();ctx.translate(540,cy);
    for(let i=0;i<9;i++){ctx.save();ctx.rotate(i*Math.PI*2/9);ctx.fillStyle=i%2?'#d8bddb':'#c9a9ce';ctx.beginPath();ctx.ellipse(0,-r,r*.55,r*.76,0,0,Math.PI*2);ctx.fill();ctx.restore();}
    ctx.fillStyle='#efd78b';ctx.beginPath();ctx.arc(0,0,r*.65,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=ink;for(const x of [-r*.2,r*.2]){ctx.beginPath();ctx.ellipse(x,-r*.05,7,13,0,0,Math.PI*2);ctx.fill();}
    ctx.strokeStyle=ink;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,r*.02,r*.26,.15,Math.PI-.15);ctx.stroke();ctx.restore();
  }
  const quoteY=story?(photo?1610:1470):(photo?1144:1060),quoteHeight=story?215:160;
  tapedPaper(ctx,100,quoteY,880,quoteHeight,.018,()=>{
    ctx.textAlign='center';ctx.fillStyle=ink;font(ctx,story?37:30,{serif:false});paragraph(ctx,copy.message,0,story?-30:-22,780,story?52:44);
  });
  ctx.textAlign='left';ctx.fillStyle='#7d6c79';font(ctx,15,{bold:true});ctx.fillText('KEEP THE LITTLE JOYS.',74,height-39);
  ctx.textAlign='right';ctx.fillText('#Happy2010   #LovelyLittleThings',1006,height-39);
}

function portraitArch(ctx,x,y,w,h){
  ctx.beginPath();ctx.moveTo(x,y+w/2);ctx.arc(x+w/2,y+w/2,w/2,Math.PI,0);ctx.lineTo(x+w,y+h);ctx.lineTo(x,y+h);ctx.closePath();
}

function midnight(ctx,model,{story,photo,copy,height}){
  const gold='#ebd09d';const gradient=ctx.createLinearGradient(0,0,1080,height);gradient.addColorStop(0,'#10172c');gradient.addColorStop(1,'#3b2546');ctx.fillStyle=gradient;ctx.fillRect(0,0,1080,height);
  for(let i=0;i<95;i++){
    const x=50+(i*137.508)%980,y=45+(i*i*47+113)%(height-90);sparkle(ctx,x,y,i%6===0?7:2.2,i%6===0?'#e8ce9c99':'#e8ce9c44');
  }
  ctx.strokeStyle='#d7b67588';ctx.lineWidth=1;ctx.strokeRect(42,42,996,height-84);ctx.strokeRect(54,54,972,height-108);
  ctx.textAlign='center';ctx.fillStyle=gold;font(ctx,17);ctx.fillText('20 / 10  ·  A NIGHT TO SHINE',540,112);
  font(ctx,story?80:68,{serif:true,italic:true});ctx.fillText('Bạn là',540,story?270:230);
  font(ctx,story?110:94,{serif:true,italic:true});ctx.fillText('một vì sao.',540,story?390:342);
  ctx.fillStyle='#fff0d6';name(ctx,model.recipient,540,story?553:490,900,story?94:82,{italic:true});
  if(photo){
    const x=story?170:280,y=story?710:633,w=story?740:520,h=story?805:478;
    ctx.save();portraitArch(ctx,x,y,w,h);ctx.clip();photoCover(ctx,photo,x,y,w,h);ctx.restore();
    ctx.strokeStyle=gold;ctx.lineWidth=3;portraitArch(ctx,x-10,y-10,w+20,h+20);ctx.stroke();
    sparkle(ctx,x+w,y+w/2,36,gold);
  }else{
    const cy=story?1080:830,r=story?195:132;ctx.strokeStyle='#d7b67566';ctx.lineWidth=1.2;
    for(const offset of [43,72]){ctx.beginPath();ctx.ellipse(540,cy,r+offset,r*.66+offset,-.4,0,Math.PI*2);ctx.stroke();}
    ctx.fillStyle=gold;ctx.shadowColor='#f9dfab66';ctx.shadowBlur=45;ctx.beginPath();ctx.arc(540,cy,r,0,Math.PI*2);ctx.fill();ctx.shadowColor='transparent';
    ctx.fillStyle=story?'#27213b':'#272039';ctx.beginPath();ctx.arc(540+r*.4,cy-r*.2,r*.88,0,Math.PI*2);ctx.fill();sparkle(ctx,540-r-34,cy+42,25,gold);
  }
  ctx.textAlign='center';ctx.fillStyle=gold;font(ctx,story?38:28,{serif:true});paragraph(ctx,copy.message,540,story?(photo?1630:1510):1191,850,story?59:44);
  const number=model.keepsakes.find(item=>item.title==='Bùa số may mắn')?.detail.match(/\d+/)?.[0];
  if(number){font(ctx,16);ctx.fillText('YOUR LUCKY STAR  ·  '+number,540,story?1790:1290);}
  ctx.strokeStyle='#d7b67555';ctx.beginPath();ctx.moveTo(85,height-99);ctx.lineTo(995,height-99);ctx.stroke();
  ctx.fillStyle=gold;font(ctx,14);ctx.textAlign='left';ctx.fillText('YOU DESERVE THE STARS.',85,height-68);ctx.textAlign='right';ctx.fillText('#Happy2010   #ShineYourWay',995,height-68);
}

export function drawCardTemplate(ctx,model,options){
  ctx.textBaseline='alphabetic';
  const renderer={editorial,scrapbook,midnight}[options.template];
  renderer(ctx,model,{...options,story:options.format==='story'});
}
