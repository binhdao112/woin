# Đồng bộ album của host · 16/10/2026

Yêu cầu: đưa toàn bộ ảnh trong thư mục album do host cung cấp vào album chung ở trạm 7, có thể nhập lại khi host bổ sung ảnh.

## TDD

- `bf2d5f8` (RED): 12 kiểm thử album chạy, 8 đạt và 4 lỗi đúng nguyên nhân. Giới hạn cũ 12 ảnh từ chối nhập thư mục 16 ảnh và cắt danh sách khi tải; hai ca kiểm tra biên mới 24 ảnh cũng lỗi.
- `460f886` (GREEN): cùng 12 kiểm thử đều đạt. Album chung nhận tối đa 24 ảnh; ảnh riêng vẫn tối đa 12. Bộ nhập và bộ đọc dùng cùng hằng số giới hạn.
- Ca tăng thư mục từ 16 lên 20 ảnh xác nhận ID/thứ tự của 16 ảnh cũ không đổi. Giới hạn 25 ảnh bị từ chối trước khi thay manifest.
- `npm run test:coverage`: toàn bộ 80 kiểm thử đạt. `memory-album.js` có 100% lines/functions và 98.08% branches; `prepare-album.mjs` có 83.33% lines, 100% functions và 95.65% branches. Các dòng CLI báo lỗi chưa được đo trong bộ kiểm thử API.

## Dữ liệu và xác minh

- Đã nhập 16 file JPG riêng biệt, tổng 15.88 MiB. SHA-256 xác nhận toàn bộ ảnh xuất bản giữ nguyên byte của ảnh nguồn.
- Tên file xuất bản theo hash nội dung; chú thích “Khoảnh khắc 01” … “Khoảnh khắc 16” thay tên file xuất tự động dài. Không sửa/xóa thư mục gốc.
- `npm run check:pages`: 51 tài nguyên được liên kết chạy dưới `/woin/` (gồm 16 ảnh). `npm run check:drinks` vẫn đạt.
- Browser QA dùng fixture hành trình ở localhost, không xuất bản fixture và không gửi đơn nước. Trạm 7 mặc định chọn “Album của team”, tải đủ 16 ảnh, chuyển đến “16 / 16 · Khoảnh khắc 16”, và giữ thành kỷ vật “Khung ảnh từ Khoảnh khắc 16”. Không có lỗi/warning console trong lần kiểm tra này.
- Tăng phiên bản URL của entry/module album để người từng mở trang cũng tải được giới hạn mới. Manifest vẫn dùng `cache: no-cache`; các ảnh dùng hash nên có thể cache riêng.
- Đồng bộ theo yêu cầu. Host thêm ảnh vào cùng thư mục rồi nhắn lại; chưa thiết lập theo dõi tự động.
