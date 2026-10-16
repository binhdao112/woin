// Run setupKoiOrders once in a script bound to the host's private spreadsheet.
// Public web requests can register a cup or read a receipt, never list orders.
var KOI_HEADERS = ['Sự kiện','Mã trình duyệt','Phiên gửi','Mã xác nhận','Tên nhận nước','Mã món','Món','Cỡ ly / nhiệt','Đường','Đá','Ghi chú','Giá tham khảo','Số ly','Cập nhật','Menu','Nhóm món'];

function setupKoiOrders() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book) throw Error('Mở Apps Script từ Extensions / Tiện ích mở rộng trong bảng Google Sheets của bạn.');
  var props = PropertiesService.getScriptProperties();
  props.setProperty('SPREADSHEET_ID', book.getId());
  if (!props.getProperty('EVENT_ID')) props.setProperty('EVENT_ID', 'team-2010-2026');
  if (!props.getProperty('ORDERS_OPEN')) props.setProperty('ORDERS_OPEN', 'true');
  var details = book.getSheetByName('Đăng ký') || book.insertSheet('Đăng ký');
  if (!details.getLastRow()) details.getRange(1, 1, 1, KOI_HEADERS.length).setValues([KOI_HEADERS]);
  details.setFrozenRows(1); details.hideColumns(1, 4);
  refreshKoiSummary_(book, details);
  console.log('Bảng đặt nước: ' + book.getUrl());
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Quầy KOI').addItem('Mở đăng ký', 'openKoiOrders').addItem('Chốt / đóng đăng ký', 'closeKoiOrders').addItem('Cập nhật tổng hợp', 'rebuildKoiSummary').addToUi();
}
function openKoiOrders() { PropertiesService.getScriptProperties().setProperty('ORDERS_OPEN', 'true'); }
function closeKoiOrders() { PropertiesService.getScriptProperties().setProperty('ORDERS_OPEN', 'false'); }
function rebuildKoiSummary() {
  var props = PropertiesService.getScriptProperties(), book = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID'));
  refreshKoiSummary_(book, book.getSheetByName('Đăng ký'));
}
function koiOutput_(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
function koiReceipt_(data) {
  CacheService.getScriptCache().put('receipt:' + data.requestId, JSON.stringify(data), 21600);
  return koiOutput_(data);
}

function doPost(event) {
  var input;
  try {
    if (!event.postData || event.postData.contents.length > 4096) throw Error();
    input = JSON.parse(event.postData.contents);
    if (!UUID.test(input.requestId || '')) throw Error();
  } catch (error) { return koiOutput_({ status: 'rejected', code: 'invalid' }); }
  var receipt = { requestId: input.requestId, sequence: input.sequence, status: 'rejected', code: 'invalid' };
  var props = PropertiesService.getScriptProperties(), order;
  if (input.eventId !== props.getProperty('EVENT_ID')) return koiReceipt_(receipt);
  if (input.menuVersion !== KOI_MENU.version) { receipt.code = 'menu'; return koiReceipt_(receipt); }
  try { order = validateDrinkOrder(KOI_MENU, input); } catch (error) { return koiReceipt_(receipt); }
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return koiOutput_({ requestId: input.requestId, status: 'pending' });
  try {
    var book = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID')), details = book.getSheetByName('Đăng ký');
    if (!details) throw Error('Run setup first.');
    var values = details.getDataRange().getValues(), row = values.findIndex(function (entry, index) { return index > 0 && entry[0] === order.eventId && entry[1] === order.participantId; });
    // Replaying an acknowledged request remains safe even after registration closes.
    if (row > 0 && values[row][3] === order.requestId) {
      refreshKoiSummary_(book, details);
      receipt.status = 'accepted'; delete receipt.code; return koiReceipt_(receipt);
    }
    if (row > 0 && Number(values[row][2]) >= order.sequence) { receipt.code = 'stale'; return koiReceipt_(receipt); }
    if (props.getProperty('ORDERS_OPEN') !== 'true') { receipt.code = 'closed'; return koiReceipt_(receipt); }
    if (row < 0 && details.getLastRow() > 500) { receipt.code = 'full'; return koiReceipt_(receipt); }
    var cells = [order.eventId,order.participantId,order.sequence,order.requestId,sheetText(order.name),order.variantId,order.itemName,order.size,order.sugar,order.ice,sheetText(order.note),order.price,1,new Date().toISOString(),KOI_MENU.version,order.category];
    details.getRange(row > 0 ? row + 1 : details.getLastRow() + 1, 1, 1, cells.length).setValues([cells]);
    refreshKoiSummary_(book, details);
    receipt.status = 'accepted'; delete receipt.code; return koiReceipt_(receipt);
  } catch (error) {
    // A partial Sheets write may exist. Leave the result ambiguous so the client
    // retries this same request ID instead of creating another registration.
    return koiOutput_({ requestId: input.requestId, status: 'pending' });
  } finally { lock.releaseLock(); }
}

function doGet(event) {
  var p = event.parameter || {}, receipt = { status: 'pending', requestId: p.requestId };
  if (p.action !== 'receipt' || !UUID.test(p.requestId || '') || !/^__koiReceipt_[a-zA-Z0-9_]{1,80}$/.test(p.callback || '')) return koiOutput_({ status: 'unavailable' });
  var saved = CacheService.getScriptCache().get('receipt:' + p.requestId);
  if (saved) receipt = JSON.parse(saved);
  // This endpoint exposes only an unguessable request's acceptance, no PII.
  return ContentService.createTextOutput(p.callback + '(' + JSON.stringify(receipt) + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function refreshKoiSummary_(book, details) {
  var rows = details.getDataRange().getValues().slice(1).filter(function (row) { return row[0] === PropertiesService.getScriptProperties().getProperty('EVENT_ID'); });
  var orders = rows.map(function (r) { return { eventId:r[0],participantId:r[1],sequence:Number(r[2]),name:r[4],variantId:r[5],itemName:r[6],size:r[7],sugar:r[8],ice:r[9],note:r[10],price:Number(r[11]) }; });
  var summary = aggregateDrinkOrders(orders), sheet = book.getSheetByName('Tổng hợp') || book.insertSheet('Tổng hợp');
  var values = [['Món','Cỡ ly / nhiệt','Đường','Đá','Ghi chú','Số ly','Đơn giá tham khảo','Thành tiền tham khảo','Tên nhận nước']];
  summary.groups.forEach(function (g) { values.push([g.itemName,g.size,g.sugar,g.ice,sheetText(g.note),g.quantity,g.price,g.price*g.quantity,sheetText(g.names.join(', '))]); });
  values.push(['TỔNG','','','','',summary.totalCups,'',summary.totalPrice,'']);
  values.push(['Giá tham khảo; chưa gồm phí giao hàng, ưu đãi và topping thêm.','','','','','','','','']);
  if (sheet.getLastRow()) sheet.getRange(1,1,sheet.getLastRow(),9).clearContent();
  sheet.getRange(1,1,values.length,9).setValues(values); sheet.setFrozenRows(1); sheet.autoResizeColumns(1,9);
}
