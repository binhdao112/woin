# Check-in cuối hành trình — 2026-10-16

## RED → GREEN

- `758c934`: thêm 8 kiểm thử mô hình thiệp và vòng đời clip; RED vì hai module mới chưa tồn tại.
- `7ca98a1`: triển khai mô hình, canvas hai định dạng / hai mood và bộ ghi có hủy; cả 8 kiểm thử GREEN.
- `7634dea`: thêm regression ưu tiên MIME MP4/H264; RED khi generic MP4 được chọn trước codec cụ thể.
- `cce6764`: ưu tiên H264 cụ thể rồi mới fallback theo hỗ trợ; 9 kiểm thử GREEN.

Kiểm thử bao gồm điều kiện đủ bảy kỷ vật thật, giữ số/ảnh/diện mạo đã chọn, dữ liệu cũ, tên dài, hai định dạng, theme fallback, đúng MIME/đuôi file, clip tám giây, hủy không tải nhầm, dừng track, lỗi constructor/encoder và dữ liệu video rỗng.

## Kiểm chứng tích hợp

- `npm test`: **89/89 pass**.
- `npm run check:pages`: **55 tài nguyên pass** dưới `/woin/`.
- `npm run check:drinks`: Apps Script bundle khớp menu và validation.
- Browser thật, fixture local đủ bảy kỷ vật: mở từ trạm cuối; tải PNG thành công ở 1080 × 1920; clip MP4 tải thành công, ffprobe xác nhận 1080 × 1920 và khoảng tám giây.
- Viewport điện thoại 390 × 844: chế độ ẩn giao diện hiển thị đầy đủ thiệp; Esc trở lại điều khiển và giữ dialog mở. Ảnh kiểm chứng local `output/checkin-clean-mobile.png`.
- Điều khiển có tên truy cập, trạng thái được đọc qua live region; hỗ trợ reduced-motion. Ghi clip không cần camera hoặc microphone, hủy khi rời tab/đóng dialog.
- Không gửi đăng ký nước trong kiểm thử và không thay đổi endpoint Google Sheets.

Bản xuất bản cập nhật riêng `previews/koi/`; root và `previews/campus/` giữ nguyên.
