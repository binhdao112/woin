import {getJourneyProgress} from './journey.js';
import {normaliseAvatar} from './avatar-profile.js';
import {normaliseLuckySet} from './lucky-numbers.js';
import {wrapText} from './wish-card.js';
const stamps=[['🎟','Khởi hành'],['☕','Đồng đội'],['✧','Cảm hứng'],['◇','May mắn'],['✿','Niềm vui'],['✉','Lời thương'],['▧','Kỷ niệm']];
const clean=(value,max)=>String(value??'').replace(/\s+/g,' ').trim().slice(0,max);
export function createCheckinModel({gifts=new Map(),recipient='',avatar,message='',wishNumber='001'}={}){
 if(!getJourneyProgress(gifts).complete)return null;
 const lucky=gifts.get(3),number=Number(lucky?.number);
 return {recipient:clean(recipient,40)||'Bạn',avatar:normaliseAvatar(avatar),message:clean(message,160)||'Mong những điều dịu dàng nhất luôn tìm đến bạn.',wishNumber:clean(wishNumber,3),number:Number.isInteger(number)&&number>0&&number<100?String(number).padStart(2,'0'):null,luckySet:normaliseLuckySet(lucky?.luckySet)??null,photoId:gifts.get(6)?.photoId,keepsakes:stamps.map(([icon,label],station)=>({station,icon,label,detail:clean(gifts.get(station)?.result,120)}))};
}
export function getCheckinSize(format){return {width:1080,height:format==='post'?1350:1920};}
export function checkinFilename(name,format='story',extension='png'){
 const slug=String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50).replace(/-$/,'')||'ban';
 return 'check-in-20-10-'+slug+'-'+(format==='post'?'post':'story')+'.'+(['png','mp4','webm'].includes(extension)?extension:'png');
}
function rounded(ctx,x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.fill();}
function flower(ctx,x,y,size,color){ctx.save();ctx.translate(x,y);for(let i=0;i<7;i++){ctx.rotate(Math.PI*2/7);ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(0,-size*.55,size*.29,size*.53,0,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#d3aa64';ctx.beginPath();ctx.arc(0,0,size*.2,0,Math.PI*2);ctx.fill();ctx.restore();}
function cover(ctx,image,x,y,w,h){const ratio=Math.max(w/image.width,h/image.height),sw=w/ratio,sh=h/ratio;ctx.drawImage(image,(image.width-sw)/2,(image.height-sh)/2,sw,sh,x,y,w,h);}
export function renderCheckinCard(canvas,model,{format='story',theme='blush',avatar,photo,time=0,reducedMotion=false}={}){
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Không thể tạo canvas check-in.');
 const {width,height}=getCheckinSize(format);if(canvas.width!==width)canvas.width=width;if(canvas.height!==height)canvas.height=height;
 const post=format==='post',dark=theme==='night',ink=dark?'#fff1dc':'#623e4c',accent=dark?'#e5c484':'#a35472',soft=dark?'#4a3c59':'#efd4d5',paper=dark?'#342c47':'#fffaf1',muted=dark?'#cdbbc9':'#8a6b70';
 const t=reducedMotion||!Number.isFinite(time)?0:time,gradient=ctx.createLinearGradient(0,0,width,height);gradient.addColorStop(0,dark?'#1e2039':'#fff6e9');gradient.addColorStop(1,dark?'#453052':'#efcbd1');ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);
 ctx.save();ctx.strokeStyle=dark?'#c5aa7450':'#fffaf3';ctx.lineWidth=2;ctx.strokeRect(35,35,width-70,height-70);ctx.restore();
 const text=(value,x,y,size=28,color=ink,weight=500,family='"Be Vietnam Pro", sans-serif')=>{ctx.font=`${weight} ${size}px ${family}`;ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(value,x,y);};
 const brandY=post?90:132;text('VNG CAMPUS',232,brandY,25,ink,700);text('20 / 10',890,brandY,31,accent,600,'Lora, serif');
 text('MỘT VÒNG CÙNG TEAM',540,post?157:225,20,muted,500);
 const nameY=post?259:353;let size=post?84:100;ctx.font=`800 ${size}px Nunito, sans-serif`;while(ctx.measureText(model.recipient).width>870&&size>52){size-=2;ctx.font=`800 ${size}px Nunito, sans-serif`;}
 const nameLines=wrapText(ctx,model.recipient,875).slice(0,2);nameLines.forEach((line,i)=>text(line,540,nameY+(i-(nameLines.length-1)/2)*(size+8),size,ink,800,'Nunito, sans-serif'));
 text('hôm nay, mình tỏa sáng.',540,post?330:459,post?36:43,accent,500,'Lora, serif');
 const heroY=post?365:510,heroH=post?505:790,heroX=photo?85:210,heroW=photo?610:660;
 ctx.save();ctx.globalAlpha=dark?.24:.55;ctx.fillStyle=soft;ctx.beginPath();ctx.ellipse(535,heroY+heroH*.52,420,heroH*.53,0,0,Math.PI*2);ctx.fill();ctx.restore();
 ctx.save();ctx.strokeStyle=dark?'#d9b87d65':'#c58f9d65';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(530,heroY+heroH*.52,450,heroH*.56,-.15,0,Math.PI*2);ctx.stroke();ctx.restore();
 for(let i=0;i<10;i++){const x=110+(i*157)%880,y=heroY+35+(i*93)%heroH+Math.sin(t*.8+i)*12;ctx.save();ctx.translate(x,y);ctx.rotate(i*.7+t*.08);ctx.globalAlpha=.5;text('✦',0,14,i%3?25:38,accent,500);ctx.restore();}
 ctx.save();ctx.fillStyle=dark?'#0f102530':'#a4758720';ctx.beginPath();ctx.ellipse(heroX+heroW*.5,heroY+heroH*.96,heroW*.35,35,0,0,Math.PI*2);ctx.fill();ctx.restore();
 if(avatar)ctx.drawImage(avatar,heroX,heroY,heroW,heroH);
 if(photo){ctx.save();ctx.translate(825,heroY+heroH*.5);ctx.rotate(.10+Math.sin(t*.5)*.018);rounded(ctx,-155,-205,310,410,8,'#fffaf2');cover(ctx,photo,-135,-185,270,310);text('cùng team, cùng vui.',0,167,19,'#826365',500,'Lora, serif');ctx.restore();}
 const stampY=post?915:1385;text('7 / 7 KỶ VẬT · MỘT CHUYẾN ĐI ĐÁNG NHỚ',540,stampY,post?20:23,muted,600);
 for(const [i,item] of model.keepsakes.entries()){const x=142+i*133;rounded(ctx,x-48,stampY+27,96,102,28,paper);text(item.icon,x,stampY+81,40,accent,500);text(item.label,x,stampY+108,16,muted,500);}
 const luckyY=post?1105:1590;
 if(model.luckySet){text(model.number?'SỐ MAY MẮN '+model.number+' · BỘ SỐ VUI 6/45':'BỘ SỐ VUI 6/45',540,luckyY-20,18,accent,600);model.luckySet.forEach((n,i)=>{const x=340+i*80;ctx.fillStyle=paper;ctx.beginPath();ctx.arc(x,luckyY+25,30,0,Math.PI*2);ctx.fill();text(String(n).padStart(2,'0'),x,luckyY+34,25,ink,700);});}
 else if(model.number)text('MỘT CHÚT MAY MẮN · '+model.number,540,luckyY+15,25,accent,600);
 const quoteY=post?1230:1743;ctx.font='500 29px Lora, serif';const lines=wrapText(ctx,model.message,830).slice(0,2);lines.forEach((line,i)=>text(line,540,quoteY+i*40,post?25:29,ink,500,'Lora, serif'));
 flower(ctx,30,height-30,post?94:145,dark?'#74617c':'#d6a8b6');flower(ctx,width-15,height-15,post?90:135,dark?'#907482':'#c4c99e');
 text('HAPPY VIETNAMESE WOMEN’S DAY · #VNGCampus',540,height-47,15,muted,500);return canvas;
}
