import test from 'node:test';
import assert from 'node:assert/strict';

import * as social from '../dist/social-card.js';
const model = {
  recipient: 'Đặng Mỹ Linh', wishNumber: '042', message: 'Một lời chúc dài của hành trình.',
  keepsakes: [{title:'Lá bài cảm hứng',detail:'The Sun · Mặt trời'},{title:'Bùa số may mắn',detail:'Số 07'}],
};

function canvasFixture() {
  const texts = [], images = [];
  let offsetX=0,offsetY=0;const stack=[];
  const ctx = new Proxy({
    font: '20px sans-serif',
    measureText(text) { return { width: Array.from(text).length * (parseFloat(this.font.match(/\d+(?:\.\d+)?px/)?.[0]) || 20) * .52 }; },
    save(){stack.push([offsetX,offsetY]);},
    restore(){[offsetX,offsetY]=stack.pop();},
    translate(x,y){offsetX+=x;offsetY+=y;},
    fillText(text,x,y) { texts.push({text,x:x+offsetX,y:y+offsetY,font:this.font}); },
    drawImage(...args) { images.push(args); },
    createLinearGradient: () => ({addColorStop(){}}),
  }, {get:(target,key)=>key in target?target[key]:()=>{}});
  return {canvas:{getContext:()=>ctx},texts,images};
}

test('four distinct templates render personalized post and story cards with or without photos', () => {
  assert.equal(social.SOCIAL_TEMPLATES?.length,4,'four selectable styles are required');
  assert.deepEqual(social.SOCIAL_TEMPLATES.map(item=>item.id),['bloom','editorial','scrapbook','midnight']);
  const signatures=[];
  for(const template of social.SOCIAL_TEMPLATES) {
    for(const format of ['post','story']) for(const photo of [undefined,{width:1200,height:800}]) {
      const {canvas,texts,images}=canvasFixture();
      social.renderSocialCard(canvas,model,{format,photo,template:template.id});
      assert.equal(canvas.width,1080);assert.equal(canvas.height,format==='post'?1350:1920);
      assert.ok(texts.some(item=>item.text.includes(model.recipient)),template.id+' includes the recipient');
      assert.ok(texts.every(item=>item.y>0&&item.y<canvas.height),template.id+' keeps text inside the card');
      if(photo) assert.ok(images.some(args=>args[0]===photo),template.id+' includes the selected photo');
      if(format==='post'&&!photo)signatures.push(texts.map(item=>item.text).join('|'));
    }
  }
  assert.equal(new Set(signatures).size,4,'templates have distinct content and layouts');
});

test('unknown styles fall back safely, and filenames and captions identify the selected template', () => {
  assert.equal(typeof social.getSocialTemplate,'function');
  assert.equal(social.getSocialTemplate('not-a-style').id,'bloom');
  const files=social.SOCIAL_TEMPLATES.map(item=>social.socialCardFilename(model.recipient,'post',item.id));
  assert.equal(new Set(files).size,4);
  assert.ok(files.every(file=>/^[a-z0-9-]+\.png$/.test(file)));
  assert.equal(social.getSocialCopy(model,'midnight').title,'Bạn là\nmột vì sao.');
});

test('all styles adapt a long Vietnamese name in both formats', () => {
  assert.equal(social.SOCIAL_TEMPLATES?.length,4);
  for(const template of social.SOCIAL_TEMPLATES) for(const format of ['post','story']) {
    const {canvas,texts}=canvasFixture();
    social.renderSocialCard(canvas,{...model,recipient:'Nguyễn '.repeat(5)+'Linh'},{format,template:template.id});
    const names=texts.filter(item=>item.text.includes('Nguyễn'));
    assert.ok(names.length>0,template.id);
    assert.ok(names.every(item=>parseFloat(item.font.match(/\d+(?:\.\d+)?px/)[0])>=30),template.id);
    assert.ok(texts.every(item=>item.y>0&&item.y<canvas.height),template.id);
  }
});

test('the social card exports a fixed 4:5 post and 9:16 story instead of an expanding report', () => {
  assert.equal(typeof social.renderSocialCard,'function','a designed social card renderer is required');
  for (const [format,height] of [['post',1350],['story',1920]]) {
    const {canvas,texts}=canvasFixture();
    social.renderSocialCard(canvas,model,{format});
    assert.equal(canvas.width,1080);assert.equal(canvas.height,height);
    assert.ok(texts.some(item=>item.text.includes('Đặng Mỹ Linh')));
    assert.ok(!texts.some(item=>item.text==='Vé khởi hành'));
    assert.ok(texts.every(item=>item.y>0&&item.y<height));
  }
});

test('long Vietnamese names stay inside the typography area in both formats', () => {
  assert.equal(typeof social.renderSocialCard,'function');
  for (const format of ['post','story']) {
    const {canvas,texts}=canvasFixture();
    social.renderSocialCard(canvas,{...model,recipient:'Nguyễn '.repeat(5)+'Linh'},{format});
    const nameText=texts.filter(item=>item.font.includes('Lora')&&item.text.includes('Nguyễn'));
    assert.ok(nameText.length>0);
    assert.ok(nameText.every(item=>parseFloat(item.font.match(/\d+(?:\.\d+)?px/)[0])>=30));
    assert.ok(texts.every(item=>item.y<canvas.height));
  }
});

test('the selected photo and illustrated background are composed into the same exported canvas', () => {
  assert.equal(typeof social.renderSocialCard,'function');
  for(const format of ['post','story']) {
    const {canvas,images}=canvasFixture(),photo={width:800,height:1200},artwork={width:1080,height:1350};
    social.renderSocialCard(canvas,model,{format,photo,artwork});
    assert.equal(images.length,2);
    assert.equal(images[0][0],artwork);assert.equal(images[1][0],photo);
    assert.equal(images[1].length,9,'photo must use an explicit cover crop');
  }
  assert.throws(()=>social.renderSocialCard({getContext:()=>null},model),/canvas/i);
});

test('social downloads have distinct Vietnamese-safe filenames and stable celebratory copy', () => {
  assert.equal(typeof social.socialCardFilename,'function');
  assert.equal(social.socialCardFilename('Đặng Mỹ Linh','post'),'thiep-20-10-dang-my-linh-bai-dang.png');
  assert.equal(social.socialCardFilename('Đặng Mỹ Linh','story'),'thiep-20-10-dang-my-linh-story.png');
  assert.deepEqual(social.getSocialCopy(model),social.getSocialCopy(model));
  assert.ok(social.getSocialCopy(model).message.length<150);
});
