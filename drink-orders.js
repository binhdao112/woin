export const SUGAR_OPTIONS = ['Mặc định', '0%', '25%', '50%', '70%', '100%'];
export const ICE_OPTIONS = ['Mặc định', 'Ít đá', 'Không đá'];
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function findDrink(menu, variantId) {
  for (const item of menu.items) {
    const variant = item.variants.find(candidate => candidate.id === variantId);
    if (variant) return { item, variant };
  }
  return null;
}

export function validateDrinkOrder(menu, input) {
  if (!input || input.menuVersion !== menu.version) throw Error('Menu đã thay đổi. Hãy tải lại trang.');
  if (!/^[a-z0-9-]{1,64}$/i.test(input.eventId || '')) throw Error('Sự kiện không hợp lệ.');
  if (!UUID.test(input.participantId || '') || !UUID.test(input.requestId || '')) throw Error('Mã đăng ký không hợp lệ.');
  if (!Number.isSafeInteger(input.sequence) || input.sequence < 1) throw Error('Phiên gửi không hợp lệ.');
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const note = typeof input.note === 'string' ? input.note.trim() : '';
  if (!name || name.length > 40 || /[\x00-\x1f\x7f]/.test(name)) throw Error('Nhập tên nhận nước, tối đa 40 ký tự.');
  if (note.length > 160 || /[\x00-\x1f\x7f]/.test(note)) throw Error('Ghi chú tối đa 160 ký tự, trên một dòng.');
  const found = findDrink(menu, input.variantId);
  if (!found || found.variant.available === false) throw Error('Chọn món và cỡ ly còn trên menu nhé.');
  if (!SUGAR_OPTIONS.includes(input.sugar) || !ICE_OPTIONS.includes(input.ice)) throw Error('Chọn mức đường và đá trong danh sách.');
  const { item, variant } = found;
  return {
    eventId: input.eventId, menuVersion: menu.version, participantId: input.participantId,
    requestId: input.requestId, sequence: input.sequence, name,
    variantId: variant.id, itemName: item.name, category: item.category, size: variant.label,
    sugar: input.sugar, ice: variant.temperature === 'hot' ? 'Không áp dụng' : input.ice,
    note, price: variant.price, quantity: 1,
  };
}

export function drinkLabel(order) {
  return order.itemName + ' · ' + order.size + ' · Đường ' + order.sugar + ' · ' + order.ice + (order.note ? ' · ' + order.note : '');
}

export function aggregateDrinkOrders(orders) {
  const latest = new Map(), groups = new Map();
  for (const order of orders) {
    const key = order.eventId + ':' + order.participantId;
    if (!latest.has(key) || latest.get(key).sequence < order.sequence) latest.set(key, order);
  }
  for (const order of latest.values()) {
    const key = JSON.stringify([order.variantId, order.sugar, order.ice, order.note]);
    const group = groups.get(key) || { itemName: order.itemName, size: order.size, sugar: order.sugar, ice: order.ice, note: order.note, price: order.price, quantity: 0, names: [] };
    group.quantity++; group.names.push(order.name); groups.set(key, group);
  }
  const list = [...groups.values()].sort((a, b) => a.itemName.localeCompare(b.itemName, 'vi') || a.size.localeCompare(b.size, 'vi'));
  return { groups: list, totalCups: latest.size, totalPrice: list.reduce((sum, group) => sum + group.price * group.quantity, 0) };
}

export function searchDrinks(menu, query, category = 'all') {
  const fold = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const term = fold(query).trim();
  return menu.items.filter(item => (category === 'all' || (category === 'best' ? item.bestSeller : item.category === category)) && fold(item.name).includes(term));
}

export function sheetText(value) {
  const text = String(value || '');
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}
