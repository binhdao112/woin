export function isAppsScriptEndpoint(value) {
  try { const url = new URL(value); return url.origin === 'https://script.google.com' && /^\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(url.pathname) && !url.search && !url.hash; }
  catch { return false; }
}

// Only an unguessable request ID and a status are returned by this read-only
// endpoint. Names, notes and the team's registration list never enter JSONP.
export function readDrinkReceipt(endpoint, requestId, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const callback = '__koiReceipt_' + crypto.randomUUID().replaceAll('-', '');
    const script = document.createElement('script'), url = new URL(endpoint);
    let timer;
    const clean = () => { clearTimeout(timer); script.remove(); delete window[callback]; };
    window[callback] = receipt => { clean(); resolve(receipt); };
    script.onerror = () => { clean(); reject(Error('Không đọc được xác nhận.')); };
    timer = setTimeout(() => { clean(); reject(Error('Chưa đọc được xác nhận.')); }, timeoutMs);
    url.searchParams.set('action', 'receipt'); url.searchParams.set('requestId', requestId);
    url.searchParams.set('callback', callback); url.searchParams.set('_', String(Date.now()));
    script.src = url.href; script.referrerPolicy = 'no-referrer'; document.head.append(script);
  });
}

export async function sendDrinkOrder({ endpoint, payload, fetchImpl = fetch, readReceipt = readDrinkReceipt, pause = ms => new Promise(resolve => setTimeout(resolve, ms)), attempts = 3, timeoutMs = 15000 }) {
  if (!isAppsScriptEndpoint(endpoint)) throw Error('Host chưa kết nối Google Apps Script cho quầy nước.');
  for (let attempt = 0; attempt < attempts; attempt++) {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      // Apps Script redirects ContentService responses; no-cors POST alone
      // cannot prove persistence. Always require the matching receipt below.
      await fetchImpl(endpoint, { method: 'POST', mode: 'no-cors', credentials: 'omit', signal: controller.signal, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(payload) });
    } catch { /* The write may already have reached Google. Reuse its ID. */ }
    finally { clearTimeout(timer); }
    let receipt;
    try { receipt = await readReceipt(endpoint, payload.requestId); } catch { /* Retry the same idempotent write. */ }
    if (receipt?.requestId === payload.requestId) {
      if (receipt.status === 'accepted' && receipt.sequence === payload.sequence) return receipt;
      if (receipt.status === 'rejected') {
        const error = Error(({ closed: 'Host đã đóng đăng ký nước.', stale: 'Có lựa chọn mới hơn trên trình duyệt này. Hãy tải lại trang.', menu: 'Menu đã thay đổi. Hãy tải lại trang.', invalid: 'Lựa chọn chưa hợp lệ. Hãy kiểm tra lại.', full: 'Đợt đăng ký đã đạt giới hạn. Hãy liên hệ host.' })[receipt.code] || 'Host chưa nhận được lựa chọn. Hãy kiểm tra cấu hình.');
        error.definitive = true; throw error;
      }
    }
    if (attempt + 1 < attempts) await pause(600 * (attempt + 1));
  }
  throw Error('Google Sheets chưa xác nhận. Lựa chọn có thể đã đến nơi; bấm thử lại để kiểm tra, không tạo thêm ly.');
}
