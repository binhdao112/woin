# Chọn tên và sửa biệt danh · 19/10/2026

Yêu cầu trực tiếp: chọn một trong năm họ tên + mã đã cung cấp để tạo nhân vật/thiệp, có nút sửa bên cạnh cho người muốn dùng biệt danh khi check-in. Giữ bố cục popup không cần cuộn.

## RED → GREEN

- `ec0ebc0`: chạy `node --test tests/name-picker.test.js`, 7 ca RED vì module chọn tên chưa tồn tại.
- `cc90abc`: cùng lệnh, 7/7 GREEN. Module dùng một nháp; chỉ form lưu nhân vật mới cập nhật hồ sơ/hành trình.

| Bảo đảm | Kiểm chứng |
| --- | --- |
| Đúng năm tên và mã, không chọn nhầm người đầu tiên tự động | Unit: catalog chính xác, placeholder rỗng; browser submit rỗng vẫn ở popup |
| Chọn tên truyền nguyên chuỗi vào hồ sơ, preview và thiệp | Unit duyệt cả năm lựa chọn; browser chọn Nguyễn Trần Bảo Ngọc - NgocNTB12, mở check-in |
| Nút sửa điền sẵn tên, chuyển focus và validation sang input hiện hữu | Unit + browser sửa Ngọc cute, lưu và reload giữ biệt danh |
| Quay lại danh sách, hủy/reopen không lưu tên nháp | Unit + browser nút Hủy rồi mở lại khôi phục lựa chọn trước |
| Tên tùy chỉnh cũ vẫn mở đúng, chuẩn hóa khoảng trắng và giới hạn40 ký tự | Unit + browser fixture Mây từ hành trình cũ |
| Control bị ẩn được disabled, lỗi chỉ báo trên ô đang dùng | Unit; browser required selector giữ focus đúng |
| Tên dài không phá popup/thiệp | Browser375×667: popup bounds x37.34/y12.43/w300.32/h642.14, scrollHeight=clientHeight=760; desktop1280×720: x150/y52.83/w980/h614.34, scrollHeight=clientHeight=612 |
| Tải PNG với tên đã chọn và đổi tên cập nhật check-in | Download thật check-in-20-10-nguyen-tran-bao-ngoc-ngocntb12-story.png; status1080×1920. Mở lại với Ngọc cute cập nhật aria-label/canvas |

## Kết quả

- `npm test`:106/106 pass; `npm run check:pages`:62 linked resources; `npm run check:drinks`:bundle khớp menu/validation. Tất cả JS dưới dist qua `node --check`, `git diff --check` sạch.
- `node --experimental-test-coverage --test tests/name-picker.test.js`:name-picker.js100% lines/functions,97.06% branches.
- Browser IAB:375×667 và1280×720, không warning/error console. Không gửi đơn nước, không ghi Google Sheets. Chỉ dùng fixture trong output local, không deploy.
- Ảnh local: output/name-picker-mobile.png và output/name-picker-checkin.png. Đây là kiểm tra tập trung vào phần đổi tên; không tuyên bố audit accessibility hay các browser khác.
- Năm tên nằm trong dist/name-picker.js để host có thể bổ sung sau. Tên lưu theo phiên trình duyệt giống hành trình trước đó.
