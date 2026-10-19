# Số may mắn → mở vé 6/45 · 19/10/2026

Yêu cầu trực tiếp của host: giao diện ban đầu chỉ có một số để bấm nhận; sau đó xuất hiện vé Vietlott, bấm vé mới hiện sáu số. Hiện nguyên câu “Muốn trúng số, việc đầu tiên là phải mua vé số. Thế thôi! Chúc chị em may mắn 8386”. Journeys và ca kiểm thử được rút từ yêu cầu này.

## RED → GREEN

- `b7c1bac`: 9 ca kiểm thử liên quan đã chạy, 4 pass / 5 fail đúng do thiếu helper bốc riêng, module giao diện hai lượt và kết nối completion mới.
- `95cf6d3`: cùng 9 ca pass. Helper một số và bộ sáu số tách riêng; `mountLuckyNumber` chỉ gọi completion khi mở vé.
- Phần tích hợp thay CSS, tên truy cập của dialog và phiên bản URL chống cache cũ. Fortune test đổi điểm kết thúc đoạn mã VM vì danh sách meanings cũ đã được gỡ, vẫn kiểm tra cùng hành vi chờ animation quẻ hoàn tất.

## Bảo đảm

| Hành vi | Kiểm chứng |
| --- | --- |
| Ban đầu chỉ có quả cầu; không hiện vé, bộ số hay nút chép | `tests/lucky-number-flow.test.js` |
| Lượt một chỉ sinh một số, giữ tiến độ 3/7; lượt hai mới sinh sáu số và lưu một lần | Unit + browser fixture local |
| Bấm lặp hoặc sao chép không sinh lại kết quả; `stationReady` khóa nút chơi nhưng không khóa nút chép | Unit integration mô phỏng đúng thứ tự callback |
| Clipboard lỗi cho thử lại; bộ sáu số và câu chúc được chép nguyên văn | Unit success/error paths; browser báo đã chép |
| Cả sáu số khác nhau, trong 01–45; số đầu trong 01–99 | Helper boundary + 300 random bundles trong kiểm thử hiện có |
| Reload giữ bộ số đã lưu, không tăng thêm kỷ vật | Browser album hành trình |

## Kết quả thực chạy

- `npm test`: 93/93 pass.
- `node --experimental-test-coverage --test tests/lucky-number-flow.test.js tests/lucky-numbers.test.js`: studio 100% lines/functions, 95.65% branches; helper 92.86% lines, 80% branches, 91.67% functions. Phần không đo là một số lượt gọi wrapper cũ qua URL module khác.
- `npm run check:pages`: 59 tài nguyên dưới `/woin/`; `npm run check:drinks`: bundle khớp menu.
- Browser desktop 1280×720 và mobile 390×844: bước đầu chỉ một quả cầu; mở số **68** hiện vé đóng; mở vé mới hiện **11 · 13 · 17 · 20 · 29 · 41**, lời chúc, nút chép và đi tiếp. Không có lỗi/warning console.
- Reload và mở album hành trình xác nhận đúng số 68, sáu số trên và nguyên câu chúc; tiến độ 4/7. Không gửi đơn nước.
- Ảnh kiểm chứng local: `output/lucky-step1-desktop.png`, `output/lucky-step2-closed-mobile.png`, `output/lucky-ticket-open-mobile.png`.

## Kiểm tra thứ tự cập nhật trạng thái

1. Bấm quả cầu: tạo `number` một lần → ẩn quả cầu → hiện chip số và vé đóng → focus vé; chưa gọi `stationReady`.
2. Bấm vé: tạo `luckySet` một lần → hiện kết quả + câu chúc → `stationReady` lưu và khóa các nút chơi → bật lại nút chép, focus nút chép.
3. Chép: chỉ đọc kết quả đang giữ → ghi clipboard → hiển thị trạng thái; không dispatch collection hoặc bốc thêm số.
4. Đi tiếp: dùng pendingResult của trạm đang mở → đóng modal → dispatch station-continue; không xóa kỷ vật đã lưu.

Kết quả chỉ được lưu sau bước mở vé. Nếu đóng/tải lại trước bước đó thì chưa có kỷ vật và có thể thử lại số đầu. Các hành trình cũ có kết quả vẫn giữ nguyên dữ liệu. Animation CSS tắt khi prefers-reduced-motion; không thêm ảnh/logo tải ngoài hoặc phụ thuộc mới.
