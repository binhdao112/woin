const titles = ['Vé khởi hành', 'Đồ uống đồng đội', 'Lá bài cảm hứng', 'Bùa số may mắn', 'Lọ niềm vui', 'Thư từ vũ trụ', 'Khung ảnh kỷ niệm'];
const drinks = ['Cà phê sữa đá', 'Trà đào', 'Nước mát'];
import {normaliseLuckySet,formatLuckySet} from './lucky-numbers.js';

export function createCardModel({ recipient = '', wish, gifts }) {
  const name = recipient.trim() || 'bạn';
  const luckySet = normaliseLuckySet(gifts.get(3)?.luckySet);
  const clean = text => {
    const value = String(text || '').replace(new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' ơi,\\s*'), '');
    return value.charAt(0).toLocaleUpperCase('vi') + value.slice(1);
  };
  const keepsakes = titles.flatMap((title, station) => {
    if (!gifts.has(station)) return [];
    const data = gifts.get(station);
    let detail = clean(data.result);
    if (station === 0) detail = 'Một chuyến đi dành riêng cho ' + name;
    if (station === 1) detail = drinks[data.style] || drinks[0];
    if (station === 2 || station === 5) detail = detail.split(' · ').slice(0, 2).join(' · ');
    if (station === 3) { detail = data.number ? 'Số ' + data.number : detail; if (luckySet) detail += ' · Bộ số vui 6/45: ' + formatLuckySet(luckySet); }
    if (station === 6) detail = data.photoName || 'Những khoảnh khắc cùng team';
    return [{ title, detail: detail || 'Một kỷ vật của chuyến đi' }];
  });
  return { recipient: name, message: wish.text, wishNumber: String(wish.id || 1).padStart(3, '0'), keepsakes, luckySet };
}

export function cardFilename(recipient) {
  const slug = recipient.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60).replace(/-$/, '');
  return 'thiep-20-10-' + (slug || 'dong-doi') + '.png';
}

export function wrapText(ctx, text, maxWidth) {
  const lines = [];
  for (const paragraph of String(text).split('\n')) {
    let line = '';
    for (const word of paragraph.trim().split(/\s+/).filter(Boolean)) {
      if (line && ctx.measureText(line + ' ' + word).width <= maxWidth) {
        line += ' ' + word;
        continue;
      }
      if (line) lines.push(line);
      line = '';
      for (const character of Array.from(word)) {
        if (line && ctx.measureText(line + character).width > maxWidth) {
          lines.push(line);
          line = '';
        }
        line += character;
      }
    }
    lines.push(line);
  }
  return lines;
}

function roundedBox(ctx, x, y, width, height, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

export function renderWishCard(canvas, model, photo) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Trình duyệt chưa hỗ trợ canvas để tạo thiệp.');
  canvas.width = 1200;
  const font = (size, weight = 400) => { ctx.font = `${weight} ${size}px "Be Vietnam Pro", system-ui, sans-serif`; };
  font(60, 700);
  const nameLines = wrapText(ctx, model.recipient + ' ơi,', 960);
  font(32);
  const messageLines = wrapText(ctx, model.message, 900);
  const messageTop = 272 + nameLines.length * 78;
  const collectionTop = messageTop + messageLines.length * 51 + 104;
  font(24);
  const items = model.keepsakes.map(item => ({ ...item, lines: wrapText(ctx, item.detail, 410) }));
  const rows = [];
  for (let i = 0; i < items.length; i += 2) rows.push(Math.max(...items.slice(i, i + 2).map(item => 82 + item.lines.length * 34)));
  const collectionBottom = collectionTop + 55 + rows.reduce((sum, height) => sum + height + 16, 0);
  canvas.height = Math.ceil(collectionBottom + (photo ? 370 : 0) + 180);

  const background = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  background.addColorStop(0, '#d8edf0');
  background.addColorStop(1, '#f4dcd8');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  roundedBox(ctx, 36, 36, 1128, canvas.height - 72, 40, '#fffaf1');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  font(22, 600);
  ctx.fillStyle = '#6b7f77';
  ctx.fillText('MỘT VÒNG CÙNG TEAM · 20 / 10', 600, 108);
  font(72, 700);
  ctx.fillStyle = '#9a6075';
  ctx.fillText('Một ngày dành cho bạn.', 600, 222);
  font(60, 700);
  nameLines.forEach((line, i) => ctx.fillText(line, 600, 304 + i * 78));
  ctx.fillStyle = '#365b5c';
  font(32);
  messageLines.forEach((line, i) => ctx.fillText(line, 600, messageTop + 34 + i * 51));
  font(21, 600);
  ctx.fillStyle = '#916746';
  ctx.fillText('NHỮNG ĐIỀU BẠN MANG THEO', 600, collectionTop);
  let rowTop = collectionTop + 32;
  rows.forEach((height, row) => {
    items.slice(row * 2, row * 2 + 2).forEach((item, column) => {
      const x = 92 + column * 520;
      roundedBox(ctx, x, rowTop, 496, height, 18, row % 2 ? '#edf1e6' : '#f6e9e2');
      ctx.textAlign = 'left';
      font(22, 600);
      ctx.fillStyle = '#8b5c70';
      ctx.fillText(item.title, x + 28, rowTop + 39);
      font(24);
      ctx.fillStyle = '#365b5c';
      item.lines.forEach((line, i) => ctx.fillText(line, x + 28, rowTop + 78 + i * 34));
    });
    rowTop += height + 16;
  });
  if (photo) {
    const y = collectionBottom + 12;
    roundedBox(ctx, 92, y, 1016, 330, 18, '#e8eee6');
    const scale = Math.min(960 / photo.width, 286 / photo.height);
    const width = photo.width * scale, height = photo.height * scale;
    ctx.drawImage(photo, 600 - width / 2, y + (330 - height) / 2, width, height);
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#6b7f77';
  font(23, 600);
  ctx.fillText('Từ những người đồng đội luôn trân trọng bạn.', 600, canvas.height - 106);
  font(19);
  ctx.fillText('VĂN PHÒNG TRÊN MÂY · THIỆP ' + model.wishNumber + ' / 200', 600, canvas.height - 69);
  return canvas;
}

export function canvasToPng(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Không tạo được ảnh PNG. Hãy thử lại.')), 'image/png');
  });
}
