# Popup vừa khung, không cần cuộn · 19/10/2026

Yêu cầu trực tiếp: hiển thị trọn popup để chụp/quay check-in. Journeys: xem toàn bộ kết quả trong khung; chọn đầy đủ tùy chỉnh bằng mục/trang; không mất dữ liệu khi chuyển mục, tải ảnh hoặc đóng/mở.

## RED → GREEN

- `c858600`: năm ca đã chạy và RED vì chưa có module fit/paging/tabs.
- `a0d20f1`: năm ca GREEN sau khi thêm module. Sửa bộ DOM giả để insertBefore(undefined) có cùng hành vi DOM thật.
- Tích hợp chia mục cho check-in/mẫu thiệp, phân trang album/menu KOI, bước chọn món/tùy chỉnh ly ở mobile, avatar gọn hơn. Các kết quả game dùng chiều cao tự nhiên rồi fit toàn bộ khung; không che/cắt nội dung để giấu thanh cuộn. Chế độ clean của check-in giữ nguyên toàn màn hình.

## Bảo đảm và kiểm chứng

| Hành vi | Kiểm chứng |
| --- | --- |
| Fit đủ bốn cạnh, không phóng lớn, không NaN khi kích thước 0 | `tests/popup-layout.test.js` |
| Đổi mục giữ nguyên input/giá trị, hỗ trợ phím trái/phải và focus | Unit + browser chọn mẫu, khổ, ảnh, tạo dáng |
| Phân trang không bỏ sót món, clamp khi lọc, refresh theo viewport, dispose pager cũ | Unit + KOI tìm hồng trà và chuyển trang |
| Theo dõi thay đổi nội dung/resize, bỏ qua check-in toàn màn hình, dọn observer/listener | Unit + browser |
| Popup và các vùng con không có phần cần cuộn | DOM bounds/clientHeight/scrollHeight + ảnh kiểm chứng |
| Lưu PNG sau khi chuyển mục vẫn hoạt động | Download thật `check-in-20-10-may-story (1).png` 1080×1920 |

## Browser QA

- 1280×720: avatar vừa khung, lucky ticket mở có scale0.962 và đủ nội dung, quẻ hoàn tất không cuộn.
- 390×844: avatar, check-in cả ba mục, PNG download, mẫu thiệp / Story / Phóng to / mở chi tiết, album đổi trang và quầy KOI tìm món/tùy chỉnh đều hiện đầy đủ. Không gửi đơn nước.
- 375×667: avatar, vé đóng/mở, tarot đã chọn, quẻ hoàn tất, vòng quay hoàn tất, check-in mục Lưu + clean/Escape, sổ tay và album đều có bounds trong viewport; scrollHeight bằng clientHeight, không có descendant cuộn. Sai số tọa độ dưới 0.2px do làm tròn kích thước.
- Native dialog vẫn giữ focus và Escape. Nút điều khiển được giữ; không thay thuật toán bốc số hoặc kết nối Sheets. Không có warning/error console.
- JSON đo: `output/popup-fit-browser-proof.json`. Ảnh: `output/popup-ticket-fit-small.png`, `output/popup-checkin-tabs-mobile.png`, `output/popup-cards-fit-mobile.png`. Fixture chỉ ở output local, không deploy.

## Validation

- `npm test`:99/99 pass. `check:pages`:61 tài nguyên. `check:drinks`:bundle khớp.
- `node --experimental-test-coverage --test tests/popup-layout.test.js`:module100% lines/functions và95.45% branches.
- Không tuyên bố đã audit WCAG toàn bộ hay test browser ngoài phiên IAB; kiểm tra tập trung vào bố cục và đường bấm thay đổi.

## Các trường hợp hoàn thiện

- `9a95a5e` RED → `d11cd11` GREEN: mở lại ly đã lưu hoặc đang chờ phải đi thẳng vào phần tùy chỉnh, để người dùng xem được lựa chọn khi các nút menu đang khóa. Ca mới chạy method open thật với cả trạng thái mới/pending/confirmed.
- `d969f5c` RED → `28a2a09` GREEN: panel kỷ vật cũng phải được fit dù là section, không phải dialog. Album đổi sang một cột và gỡ giới hạn100px của đoạn kết quả cũ.
- Browser375×667 đã mở lại kết quả dài gồm số79,06·15·16·23·28·42 và nguyên câu8386: panel kỷ vật cao213px, không cuộn; trang kỷ vật trong album hiển thị đủ, không có descendant cuộn.
- Tổng cuối99 kiểm thử,61 tài nguyên. Sáu kiểm thử popup chạy GREEN; module100% lines/functions,95.45% branches.
