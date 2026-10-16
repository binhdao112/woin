import test from 'node:test';
import assert from 'node:assert/strict';

import * as card from '../dist/wish-card.js';
const gifts = new Map([
  [0, {}], [1, { style: 1 }],
  [2, { result: 'Minh Anh ơi, The Sun · Mặt trời · Một lời nhắc.' }],
  [3, { number: '07' }], [4, { result: 'Minh Anh ơi, Nghe bài hát yêu thích' }],
  [5, { result: 'Minh Anh ơi, Đại cát · Tan ca nhẹ lòng · Hôm nay vui nhé.' }],
  [6, { photoName: 'Chuyến đi của team' }],
]);

test('the card includes the recipient, fixed wish and the seven actual choices', () => {
  assert.equal(typeof card.createCardModel, 'function', 'personalized PNG data must be implemented');
  const model = card.createCardModel({ recipient: ' Minh Anh ', wish: { id: 42, text: 'Chúc bạn vui vẻ!' }, gifts });
  assert.equal(model.recipient, 'Minh Anh');
  assert.equal(model.message, 'Chúc bạn vui vẻ!');
  assert.equal(model.wishNumber, '042');
  assert.equal(model.keepsakes.length, 7);
  assert.equal(model.keepsakes[1].detail, 'Trà đào');
  assert.equal(model.keepsakes[2].detail, 'The Sun · Mặt trời');
  assert.equal(model.keepsakes[3].detail, 'Số 07');
  assert.equal(model.keepsakes[4].detail, 'Nghe bài hát yêu thích');
  assert.equal(model.keepsakes[6].detail, 'Chuyến đi của team');
});

test('Vietnamese names produce portable filenames and text wraps even for a long unbroken name', () => {
  assert.equal(typeof card.cardFilename, 'function');
  assert.equal(card.cardFilename('Đặng Mỹ Linh'), 'thiep-20-10-dang-my-linh.png');
  assert.equal(card.cardFilename('🌷'), 'thiep-20-10-dong-doi.png');
  const ctx = { measureText: text => ({ width: Array.from(text).length * 10 }) };
  const text = 'Một lời chúc\n' + 'A'.repeat(40);
  const lines = card.wrapText(ctx, text, 100);
  assert.ok(lines.every(line => ctx.measureText(line).width <= 100));
  assert.ok(lines.includes('chúc'));
  assert.equal(lines.join('').replaceAll(' ', ''), text.replaceAll(/\s/g, ''));
});

test('PNG encoding handles success, empty output and browser exceptions', async () => {
  assert.equal(typeof card.canvasToPng, 'function');
  const blob = new Blob(['png'], { type: 'image/png' });
  assert.equal(await card.canvasToPng({ toBlob: callback => callback(blob) }), blob);
  await assert.rejects(card.canvasToPng({ toBlob: callback => callback(null) }), /PNG/);
  await assert.rejects(card.canvasToPng({ toBlob() { throw new Error('Blocked canvas'); } }), /Blocked canvas/);
});

test('the renderer expands for long content and draws the selected photo when present', () => {
  assert.equal(typeof card.renderWishCard, 'function');
  const texts = [], images = [];
  const ctx = new Proxy({
    measureText: text => ({ width: Array.from(text).length * 17 }),
    fillText: (text, x, y) => texts.push({ text, x, y }),
    drawImage: (...args) => images.push(args),
    createLinearGradient: () => ({ addColorStop() {} }),
  }, { get: (target, key) => key in target ? target[key] : () => {} });
  const canvas = { getContext: () => ctx };
  const model = card.createCardModel({ recipient: 'Tên'.repeat(13), wish: { id: 42, text: 'Một lời chúc thật dài. '.repeat(20) }, gifts });
  const photo = { width: 1200, height: 900 };
  assert.equal(card.renderWishCard(canvas, model, photo), canvas);
  assert.equal(canvas.width, 1200);
  assert.ok(canvas.height > 1200);
  assert.equal(images.length, 1);
  assert.ok(texts.every(item => item.y >= 0 && item.y < canvas.height - 20));
  texts.length = 0;
  images.length = 0;
  card.renderWishCard(canvas, card.createCardModel({ recipient: '', wish: { text: 'Chúc vui!' }, gifts: new Map() }));
  assert.equal(images.length, 0);
  assert.ok(texts.some(item => item.text.includes('bạn')));
  assert.throws(() => card.renderWishCard({ getContext: () => null }, model), /canvas/i);
});
