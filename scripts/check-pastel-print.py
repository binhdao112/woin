"""Verify the pastel print artifact matches the existing night layout."""
import json
import re
import sys
from pathlib import Path
from pypdf import PdfReader
from pypdf.generic import ContentStream

ROOT=Path(__file__).resolve().parents[1]
MM=72/25.4
folder=Path(sys.argv[1])
file=folder/'05-anh-hong-pastel-A6-5-ten.pdf'
assert file.is_file(), 'Missing pastel print PDF'
reader=PdfReader(file)
original=PdfReader(ROOT/'dist/print-cards/assets/02-dem-anh-kim-A6-5-ten.pdf')
people=[name.rsplit(' - ',1) for name in re.findall(r"^ '([^']+)',",(ROOT/'dist/name-picker.js').read_text(),re.M)]
assert len(reader.pages)==len(people)*2==10
assert reader.metadata['/QRTarget']=='https://binhdao112.github.io/woin/'

def positions(page):
 result=[]
 def visit(text,cm,tm,font,size):
  text=' '.join(text.split())
  if text:result.append((text,round(float(tm[4]),2),round(float(tm[5]),2),round(float(size),2)))
 page.extract_text(visitor_text=visit)
 return result

for i,(name,code) in enumerate(people):
 for offset,side in enumerate(('front','back')):
  page=reader.pages[i*2+offset]
  assert name in page.extract_text() and code in page.extract_text()
  assert abs(float(page.trimbox.width)/MM-148)<.01 and abs(float(page.trimbox.height)/MM-105)<.01
  assert abs(float(page.bleedbox.width)/MM-154)<.01 and abs(float(page.bleedbox.height)/MM-111)<.01
  assert positions(page)==positions(original.pages[i*2+offset]), 'Changed layout or typography'
  assert (folder/f'05-anh-hong-pastel-{code}-{side}.jpg').is_file()
  colors=[list(map(float,args)) for args,op in ContentStream(page.get_contents(),reader).operations if op==b'rg']
  assert any(max(abs(a-b) for a,b in zip(color,[251/255,234/255,240/255]))<.001 for color in colors),'Missing pastel background'
  if offset:
   links=[obj.get_object().get('/A',{}).get('/URI') for obj in page.get('/Annots',[])]
   assert links==['https://binhdao112.github.io/woin/']
print(json.dumps({'pages':10,'recipients':5,'sameLayoutAsNight':True,'sizeMm':[148,105],'bleedMm':3,'qrUrl':'https://binhdao112.github.io/woin/'},ensure_ascii=False))
