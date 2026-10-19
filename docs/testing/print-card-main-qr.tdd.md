# QR thiệp mở link chính · 19/10/2026

Yêu cầu trực tiếp: đổi QR sang `https://binhdao112.github.io/woin/` để tải bản đem in. Phạm vi: cả4mẫu,5tên/mẫu; cập nhật bản chính và preview KOI.

## RED → GREEN

- `4f854a9`: thêm scanner Vision độc lập với generator. `swift scripts/check-print-card-qr.swift 'https://binhdao112.github.io/woin/' dist/print-cards/assets` đã chạy RED:20ảnh mặt sau,0mã đúng; tất cả còn trỏ `previews/koi/?world=campus`.
- `0731f01`: generator dùng link chính, thêm chữ URL dưới QR, annotation URL có thể bấm trong PDF và metadata QRTarget. Xuất lại4PDF và20preview mặt sau. Mặt trước giữ nguyên.
- Render20mặt sau trực tiếp từ4PDF cuối bằng pdftoppm; chạy lại scanner trên `output/qr-main-print` GREEN20/20, mỗi ảnh chỉ chứa đúng QR link chính. Báo cáo: `output/print-qr-main-after.json`.

| Bảo đảm | Kiểm chứng |
| --- | --- |
| QR thật trên cả20thiệp mã hóa đúng link chính | Vision decode ảnh render từ các trang PDF mặt sau |
| Đủ5tên,10trang/mẫu,40trang tổng | pypdf kiểm tra tên từng trang và số trang |
| Khổ A6 và bleed không đổi | TrimBox148×105mm, BleedBox154×111mm |
| PDF tương tác và URL chữ đều đúng |20annotation URI + metadata QRTarget + extract_text không có previews |
| Người tải nhận bản mới | Gallery script/manifest/ảnh/PDF có revision main-qr-20261019-1; download filename có QR-chinh |
| File download đúng bản đã quét | Browser download thật PDF02; so sánh byte với artifact + đọc metadata |

## Kiểm tra cuối

- `npm test`:114/114 pass; `check:pages`:67resources; `check:drinks`:bundle khớp. JS syntax và git diff checks sạch.
- Browser IAB: chọn mặt sau, kiểm tra4download href có revision; download thật `02-dem-anh-kim-A6-5-ten-QR-chinh.pdf`; không warning/error console.
- Đã xem render PDF02 mặt sau có dấu cắt: chữ/QR/URL không chồng/cắt. Bản QR mới được kiểm tra trên ảnh render, chưa in thử bằng máy in vật lý.
- Cập nhật output ở workspace gốc, gồm4PDF có tên QR-chinh để phân biệt với bản tải trước.
- Scanner dùng macOS Vision, là kiểm chứng artifact tùy chọn; không thêm dependency vào app/CI Node. Font tiếng Việt vẫn được nhúng, ảnh team và nội dung lời chúc được giữ nguyên.
