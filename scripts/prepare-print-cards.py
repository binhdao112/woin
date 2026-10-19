#!/usr/bin/env python3
"""Build A6 postcard concepts, personalized from the website roster.

Requires reportlab, Pillow, pypdf and pdftoppm. Original team photograph is
clipped for layout only; no face retouching or synthesized people.
"""
import argparse
import json
import math
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageOps, ImageDraw, ImageFont
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF

ROOT=Path(__file__).resolve().parents[1]
MM=72/25.4
W,H=148*MM,105*MM
ROSTER=[s.rsplit(' - ',1) for s in re.findall(r"^ '([^']+)',",(ROOT/'dist/name-picker.js').read_text(),re.M)]
STYLES=[
 {'id':'vuon-hong','name':'Vườn hồng','tag':'Dịu dàng, thanh lịch','bg':'#FAF5EB','ink':'#493A3D','accent':'#A26173','soft':'#E9D8D7','green':'#697A62'},
 {'id':'dem-anh-kim','name':'Đêm ánh kim','tag':'Trang trọng, ấm áp','bg':'#172C2B','ink':'#FBF1DC','accent':'#D5B77E','soft':'#334945','green':'#D5B77E'},
 {'id':'nhat-ky','name':'Những ngày có nhau','tag':'Gần gũi, giàu kỷ niệm','bg':'#F0EBDF','ink':'#384F48','accent':'#B25D4F','soft':'#DADBC8','green':'#75836C'},
 {'id':'ruc-ro','name':'Rực rỡ theo cách riêng','tag':'Hiện đại, nổi bật','bg':'#F6E8DE','ink':'#552F52','accent':'#C55334','soft':'#E2C7D5','green':'#552F52'},
 {'id':'anh-hong-pastel','layout':'dem-anh-kim','name':'Ánh hồng pastel','tag':'Bố cục ánh kim, hồng phấn dịu dàng','bg':'#FBEAF0','ink':'#6F3D52','accent':'#A76A7C','soft':'#EBCAD5','green':'#A76A7C'},
 {'id':'no-hong-ballet','name':'Nơ hồng ballet','tag':'Hồng sữa, nơ lụa và một chút điệu đà','bg':'#FFF5F7','ink':'#773C53','accent':'#B76C89','soft':'#F3D1DE','green':'#B76C89'},
 {'id':'hong-tra-hoa','name':'Hồng trà hoa','tag':'Hồng trà ấm, hoa mềm và nét thanh lịch','bg':'#FFF4EE','ink':'#68424B','accent':'#A65F72','soft':'#EEC9CD','green':'#8A8B74'},
 {'id':'pink-muse','name':'Pink Muse','tag':'Bìa tạp chí, hồng rose và khí chất riêng','bg':'#F5C7D8','ink':'#702D4E','accent':'#A4446C','soft':'#FFE9F0','green':'#A4446C'},
]
URL='https://binhdao112.github.io/woin/'
REVISION='pink-collection-20261019-1'

def fonts():
 base=Path('/System/Library/Fonts/Supplemental')
 for name,file in [('Sans','Arial.ttf'),('SansBold','Arial Bold.ttf'),('Serif','Georgia.ttf'),('SerifItalic','Georgia Italic.ttf'),('SerifBold','Georgia Bold.ttf')]:
  path=base/file
  if not path.exists():
   raise SystemExit(f'Missing font {path}; set up licensed Vietnamese-capable fonts before rendering.')
  pdfmetrics.registerFont(TTFont(name,str(path)))

def fill(c,color):c.setFillColor(HexColor(color))
def stroke(c,color,width=.6):c.setStrokeColor(HexColor(color));c.setLineWidth(width)
def rect(c,x,y,w,h,color):fill(c,color);c.rect(x*MM,H-(y+h)*MM,w*MM,h*MM,fill=1,stroke=0)
def text(c,value,x,y,size=10,font='Sans',color='#493A3D',align='left',width=None):
 if width:
  while pdfmetrics.stringWidth(value,font,size)>width*MM and size>6:size-=.25
 fill(c,color);c.setFont(font,size)
 {'left':c.drawString,'center':c.drawCentredString,'right':c.drawRightString}[align](x*MM,H-y*MM,value)
def line(c,x1,y1,x2,y2,color,width=.5):stroke(c,color,width);c.line(x1*MM,H-y1*MM,x2*MM,H-y2*MM)
def circle(c,x,y,r,color):fill(c,color);c.circle(x*MM,H-y*MM,r*MM,stroke=0,fill=1)
def flower(c,x,y,r,color,center):
 c.saveState();c.translate(x*MM,H-y*MM);fill(c,color)
 for n in range(7):
  c.saveState();c.rotate(n*360/7);c.ellipse(-r*.32*MM,0,r*.32*MM,r*MM,fill=1,stroke=0);c.restoreState()
 fill(c,center);c.circle(0,0,r*.24*MM,fill=1,stroke=0);c.restoreState()
def sprig(c,x,y,scale,color):
 c.saveState();c.translate(x*MM,H-y*MM);c.scale(scale,scale);stroke(c,color,.55)
 p=c.beginPath();p.moveTo(0,0);p.curveTo(10*MM,8*MM,7*MM,20*MM,19*MM,28*MM);c.drawPath(p)
 for px,py,angle in [(4,7,20),(7,12,160),(10,18,30),(13,22,155)]:
  c.saveState();c.translate(px*MM,py*MM);c.rotate(angle);p=c.beginPath();p.moveTo(0,0);p.curveTo(2*MM,4*MM,6*MM,5*MM,8*MM,1*MM);p.curveTo(5*MM,-2*MM,2*MM,-2*MM,0,0);c.drawPath(p,fill=0,stroke=1);c.restoreState()
 c.restoreState()

def bow(c,x,y,size,color,soft):
 c.saveState();c.translate(x*MM,H-y*MM);c.scale(size*MM,size*MM)
 # Two broad silk loops and separate flowing tails, drawn as vector curves.
 fill(c,soft);stroke(c,color,.025)
 for direction in (-1,1):
  c.saveState();c.scale(direction,1)
  p=c.beginPath();p.moveTo(0,0);p.curveTo(.5,.3,1.25,.9,1.35,.3);p.curveTo(1.55,-.35,.5,-.35,0,0);c.drawPath(p,fill=1,stroke=1)
  p=c.beginPath();p.moveTo(.05,-.08);p.curveTo(.35,-.55,.38,-.95,.82,-1.25);p.lineTo(.52,-1.12);p.lineTo(.35,-1.4);p.curveTo(.08,-.8,.05,-.5,-.08,-.1);p.close();c.drawPath(p,fill=1,stroke=1)
  c.restoreState()
 fill(c,color);c.ellipse(-.15,-.18,.15,.18,fill=1,stroke=0);c.restoreState()

def rose(c,x,y,r,color,soft):
 circle(c,x,y,r,soft)
 c.saveState();c.translate(x*MM,H-y*MM);stroke(c,color,.55)
 p=c.beginPath()
 for i in range(101):
  angle=i*.17;radius=r*.82*(1-i/125)
  px=math.cos(angle)*radius*MM;py=math.sin(angle)*radius*MM
  p.moveTo(px,py) if i==0 else p.lineTo(px,py)
 c.drawPath(p);c.restoreState()

def photo(c,image,x,y,w,h,border=None):
 if border:rect(c,x-1.2,y-1.2,w+2.4,h+2.4,border)
 # Bias crop upward to retain the heads of the back row in this specific photo.
 iw,ih=image.getSize();scale=max(w*MM/iw,h*MM/ih);dw,dh=iw*scale,ih*scale
 px=x*MM-(dw-w*MM)/2;py=H-(y+h)*MM-(dh-h*MM)*.72
 c.saveState();p=c.beginPath();p.rect(x*MM,H-(y+h)*MM,w*MM,h*MM);c.clipPath(p,stroke=0,fill=0)
 c.drawImage(image,px,py,dw,dh,mask='auto');c.restoreState()

def front(c,style,person,image):
 name,code=person;ink,bg,accent,soft=style['ink'],style['bg'],style['accent'],style['soft']
 rect(c,-3,-3,154,111,bg)
 if style['id']=='vuon-hong':
  rect(c,0,0,3,105,accent)
  text(c,'GỬI MỘT NGƯỜI ĐỒNG ĐỘI TUYỆT VỜI',10,10,6.4,'SansBold',accent)
  text(c,'Hôm nay, mình tỏa sáng.',10,24,22,'SerifItalic',ink,width=116)
  circle(c,136,16,8,soft);text(c,'20',136,15.3,12,'SerifBold',accent,'center');text(c,'THÁNG 10',136,20.2,4.5,'SansBold',accent,'center')
  photo(c,image,10,31,128,55)
  rect(c,10,82,35,4,'#FAF5EB');text(c,'CÙNG TEAM, THẬT VUI.',11,85,4.7,'SansBold',accent)
  text(c,name,10,95,14,'SerifBold',ink,width=113);text(c,code,10,100,6,'Sans',accent)
  flower(c,137,97,6.7,soft,accent);sprig(c,123,103,.35,style['green'])
 elif style.get('layout',style['id'])=='dem-anh-kim':
  stroke(c,accent,.65);c.rect(5*MM,5*MM,(148-10)*MM,(105-10)*MM,stroke=1,fill=0)
  text(c,'20.10',10,22,29,'Serif',accent)
  text(c,'DÀNH CHO BẠN,',138,13,6.5,'SansBold',accent,'right');text(c,'những điều đẹp nhất.',138,23,17,'SerifItalic',ink,'right')
  photo(c,image,10,30,128,54,accent)
  text(c,name,74,94,14.8,'SerifBold',ink,'center',width=124);text(c,code+'  /  MỘT NGƯỜI ĐỒNG ĐỘI ĐẶC BIỆT',74,99.4,5.3,'Sans',accent,'center')
 elif style['id']=='no-hong-ballet':
  stroke(c,soft,.8);c.roundRect(5*MM,5*MM,138*MM,95*MM,3*MM,stroke=1,fill=0)
  text(c,'20 / 10',10,15,7,'SansBold',accent)
  text(c,'GỬI BẠN MỘT CHÚT YÊU THƯƠNG',138,15,5.2,'SansBold',accent,'right')
  bow(c,74,11,6.5,accent,soft)
  text(c,'một ngày thật xinh.',74,29,20,'SerifItalic',ink,'center')
  rect(c,9,34,130,53,'#FFFFFF');photo(c,image,10.5,35.5,127,50)
  text(c,name,74,94,14.6,'SerifBold',ink,'center',width=125)
  text(c,code+'  /  LUÔN ĐƯỢC YÊU THƯƠNG',74,99,5.3,'Sans',accent,'center')
 elif style['id']=='hong-tra-hoa':
  stroke(c,soft,.7);c.rect(5*MM,5*MM,138*MM,95*MM,stroke=1,fill=0)
  text(c,'20.10  /  GỬI NHỮNG NGƯỜI THƯƠNG QUÝ',10,13,5.8,'SansBold',accent)
  text(c,'Nở hoa theo cách riêng.',10,26,20,'SerifItalic',ink,width=113)
  sprig(c,128,30,.5,style['green']);rose(c,137,14,4.4,accent,soft);rose(c,128,18,3.1,accent,'#F6DFD8')
  rect(c,9,33.5,130,53,'#FFFFFF');photo(c,image,10.5,35,127,50)
  text(c,name,74,94,14.6,'SerifBold',ink,'center',width=117)
  text(c,code+'  /  THẬT VUI VÌ CÓ BẠN Ở ĐÂY',74,99,5.2,'Sans',accent,'center')
  rose(c,9,94,3.3,accent,soft);rose(c,139,94,3.3,accent,soft)
 elif style['id']=='pink-muse':
  text(c,'muse.',9,28,44,'SerifItalic',ink)
  text(c,'20',138,19,24,'Serif',ink,'right');text(c,'THÁNG MƯỜI',138,26,5.8,'SansBold',accent,'right')
  rect(c,8.5,32.5,131,55,'#FFF9F7');photo(c,image,10,34,128,52)
  text(c,name,74,95,15,'SerifBold',ink,'center',width=126)
  text(c,code+'  /  THE MAIN CHARACTER, ALWAYS.',74,101,5.3,'SansBold',accent,'center')
 elif style['id']=='nhat-ky':
  for y in range(6,105,5):line(c,0,y,148,y,'#E5DFCF',.25)
  text(c,'NHỮNG NGÀY CÓ NHAU.',9,13,18,'SerifBold',ink,width=113)
  text(c,'Một chút kỷ niệm. Một lời cảm ơn thật nhiều.',9,20,7.1,'Sans',accent)
  circle(c,136,12,7.5,accent);text(c,'20/10',136,13.7,8,'SansBold','#FFF9EB','center')
  c.saveState();c.translate(74*MM,H-58*MM);c.rotate(-1.7);c.translate(-74*MM,-(H-58*MM))
  rect(c,8,25.2,132,64.7,'#FFFFFF');photo(c,image,10.5,27.5,127,54)
  text(c,'cùng nhau, những ngày rất đáng nhớ.',74,87,7.6,'SerifItalic',ink,'center');c.restoreState()
  rect(c,19,24,19,5,'#D5D4B4');rect(c,111,23,19,5,'#E3C9AE')
  text(c,name,10,97,13.6,'SerifBold',ink,width=113);text(c,code,138,101,5.8,'SansBold',accent,'right');flower(c,136,94,5.3,'#DCC9AE',accent)
 else:
  rect(c,0,0,48,105,ink);rect(c,48,0,100,9,accent)
  text(c,'20',7,25,46,'SansBold','#F8ECDC');text(c,'/10',8,39,24,'SerifItalic','#F0B8AE')
  text(c,'RỰC RỠ',7,53,13.5,'SansBold','#F8ECDC');text(c,'theo cách',7,61,12,'SerifItalic','#F0B8AE');text(c,'riêng.',7,70,23,'SerifItalic','#F8ECDC')
  photo(c,image,52,15,89,66.75)
  text(c,'HÔM NAY LÀ NGÀY CỦA BẠN.',52,90,6.8,'SansBold',accent)
  text(c,name,52,98,12.2,'SerifBold',ink,width=89);text(c,code,52,102,5.8,'Sans',accent)
  flower(c,22,92,8,'#93687D','#E9A381')

def wrapped(c,value,x,y,maxwidth,size,font,color,leading):
 words=value.split();lines=[];row=''
 for word in words:
  if row and pdfmetrics.stringWidth(row+' '+word,font,size)>maxwidth*MM:lines.append(row);row=word
  else:row=(row+' '+word).strip()
 if row:lines.append(row)
 for i,row in enumerate(lines):text(c,row,x,y+i*leading,size,font,color)
 return y+len(lines)*leading

def qr(c,x,y,size,ink,bg):
 widget=QrCodeWidget(URL,barFillColor=HexColor(ink),barStrokeColor=HexColor(ink))
 bounds=widget.getBounds();w,h=bounds[2]-bounds[0],bounds[3]-bounds[1]
 rect(c,x-1.5,y-1.5,size+3,size+3,bg)
 drawing=Drawing(size*MM,size*MM,transform=[size*MM/w,0,0,size*MM/h,0,0]);drawing.add(widget)
 renderPDF.draw(drawing,c,x*MM,H-(y+size)*MM)
 c.linkURL(URL,(x*MM,H-(y+size)*MM,(x+size)*MM,H-y*MM),relative=1,thickness=0)

def back(c,style,person):
 name,code=person;ink,bg,accent=style['ink'],style['bg'],style['accent']
 rect(c,-3,-3,154,111,bg);line(c,10,10,138,10,accent,.5)
 text(c,'20 / 10  ·  MỘT LỜI NHẮN TỪ TEAM',10,18,6.1,'SansBold',accent)
 text(c,'Gửi '+name+',',10,31,16,'SerifItalic',ink,width=126)
 body='Cảm ơn bạn vì những ý tưởng, sự tận tâm và cả những niềm vui rất riêng đã mang đến cho team. Những ngày đi làm dễ thương hơn vì có bạn ở đây.'
 y=wrapped(c,body,10,43,100,9.2,'Sans',ink,5)
 y=wrapped(c,'Chúc bạn luôn được yêu thương, tự tin theo đuổi điều mình thích và rực rỡ theo cách của riêng mình.',10,y+4,100,9.2,'Sans',ink,5)
 text(c,'Chúc mừng ngày Phụ nữ Việt Nam!',10,84,11.8,'SerifItalic',accent,width=98)
 text(c,'Từ những người đồng đội luôn quý mến bạn.',10,92,7,'Sans',ink)
 text(c,code,10,99,5.6,'SansBold',accent)
 qr(c,118,71,20,'#304C42','#FFFFFF');text(c,'Mở chuyến đi 20/10',128,96,5.5,'Sans',ink,'center')
 text(c,URL.removeprefix('https://'),128,100.2,4.5,'Sans',ink,'center',width=29)
 if style['id']=='no-hong-ballet':bow(c,128,45,9,accent,style['soft'])
 elif style['id']=='pink-muse':
  circle(c,128,45,10,style['soft']);text(c,'20',128,46,19,'SerifItalic',ink,'center');text(c,'THÁNG 10',128,51,4.6,'SansBold',accent,'center')
 else:
  sprig(c,128,57,.73,accent)
  if style['id']=='hong-tra-hoa':rose(c,132,42,5,accent,style['soft'])

def boxes(path,trim=True):
 reader=PdfReader(path);writer=PdfWriter()
 for p in reader.pages:
  from pypdf.generic import RectangleObject
  p.trimbox=RectangleObject([7*MM,7*MM,155*MM,112*MM]);p.bleedbox=RectangleObject([4*MM,4*MM,158*MM,115*MM]);writer.add_page(p)
 writer.add_metadata({'/Title':'Thiệp 20/10 - A6 ngang - 5 tên - QR link chính','/Author':'Một vòng cùng team','/Subject':'148x105 mm; bleed3mm; front/back pairs; fonts embedded','/QRTarget':URL})
 with path.open('wb') as f:writer.write(f)

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=ROOT/'output/pdf/print-cards');parser.add_argument('--style',choices=[style['id'] for style in STYLES]);args=parser.parse_args();out=args.output;out.mkdir(parents=True,exist_ok=True);fonts()
 image=ImageReader(str(ROOT/'dist/assets/memories/photos/photo-2b7c4913979c371d.jpg'))
 manifest={'size':'A6 ngang · 148 × 105 mm','bleedMm':3,'photo':'Khoảnh khắc 19','qrUrl':URL,'revision':REVISION,'people':[{'name':n,'code':c} for n,c in ROSTER],'styles':[]}
 for index,style in enumerate(STYLES,1):
  if args.style and style['id']!=args.style:continue
  slug=f'{index:02}-{style["id"]}';pdf=out/f'{slug}-A6-5-ten.pdf';c=canvas.Canvas(str(pdf),pagesize=(162*MM,119*MM),pageCompression=1,invariant=1)
  for person in ROSTER:
   for side in (front,back):
    c.saveState();c.translate(7*MM,7*MM);side(c,style,person,image) if side==front else side(c,style,person);c.restoreState()
    stroke(c,'#666666',.25)
    for x in (7,155):
     for a,b in ((0,3),(116,119)):c.line(x*MM,a*MM,x*MM,b*MM)
    for y in (7,112):
     for a,b in ((0,3),(159,162)):c.line(a*MM,y*MM,b*MM,y*MM)
    c.showPage()
  c.save();boxes(pdf)
  # Render each trim-size personalized preview directly from a trim-size PDF.
  proof=out/f'{slug}-preview.pdf';c=canvas.Canvas(str(proof),pagesize=(W,H),pageCompression=1,invariant=1)
  for person in ROSTER:
   # Match print-page state isolation so QR rendering stays correct on later pages.
   c.saveState();front(c,style,person,image);c.restoreState();c.showPage()
   c.saveState();back(c,style,person);c.restoreState();c.showPage()
  c.save()
  subprocess.run(['pdftoppm','-scale-to','1600','-jpeg','-jpegopt','quality=90','-r','150',str(proof),str(out/slug)],check=True,capture_output=True)
  previews=[]
  for i,person in enumerate(ROSTER):
   frontname=f'{slug}-{person[1]}-front.jpg';backname=f'{slug}-{person[1]}-back.jpg'
   (out/f'{slug}-{i*2+1:02}.jpg').rename(out/frontname);(out/f'{slug}-{i*2+2:02}.jpg').rename(out/backname)
   previews.append({'code':person[1],'front':frontname,'back':backname})
  proof.unlink();manifest['styles'].append({**style,'number':index,'pdf':pdf.name,'previews':previews})
  print(slug,'10 pages',pdf.stat().st_size)
 (out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 # The comparison board grows with the selected designs.
 board=Image.new('RGB',(1800,220+math.ceil(len(manifest['styles'])/2)*740),'#e9e2d8');d=ImageDraw.Draw(board)
 title=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf',34);small=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',23)
 d.text((50,30),'MỘT TẤM THIỆP, NHIỀU CÁCH GỬI THƯƠNG.',font=title,fill='#493b3f')
 d.text((50,85),'A6 ngang · 148 × 105 mm · Ảnh team + tên riêng · Mỗi mẫu có 5 tên',font=small,fill='#716167')
 for i,style in enumerate(manifest['styles']):
  x=50+(i%2)*880;y=165+(i//2)*740
  d.text((x,y),f'{style["number"]:02} / {style["name"]}',font=title,fill='#493b3f')
  d.text((x,y+45),style['tag'],font=small,fill='#716167')
  card=Image.open(out/style['previews'][0]['front']);card=ImageOps.contain(card,(820,582));board.paste(card,(x,y+90))
 board.save(out/f'{len(manifest["styles"])}-mau-thiep-A6.jpg',quality=95)
 print('Output:',out)

if __name__=='__main__':main()
