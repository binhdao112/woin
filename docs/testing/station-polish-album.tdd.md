# Trạm 6–8: animation, album chung và chọn thiệp

## Phạm vi

- Trạm 6 chờ animation hoàn tất mới hiện/lưu quẻ, hủy khi đóng, có chế độ giảm chuyển động.
- Trạm 7 tải album tĩnh do host chuẩn bị, tách khỏi ảnh cá nhân và giữ ảnh bằng mã ổn định.
- Trạm 8 có mẫu lớn 2×2, dấu chọn, bộ chọn khổ và footer tải PNG dễ chạm.

## RED → GREEN

- Checkpoint `e10a70a`: 10 lỗi / 4 đạt ở các kiểm thử mới và nhóm liên quan. Test chạy phần `renderFortune` thực từ source với DOM giả, chứng minh kỷ vật đang được lưu trước khi animation kết thúc. Các hợp đồng album dùng chung và lệnh nhập ảnh chưa có triển khai.
- Checkpoint `e66a93b`: 14 kiểm thử liên quan đạt sau khi tách animation và bộ nạp/nhập album.
- Checkpoint `bf44af9`: 32 kiểm thử đạt sau khi nối giao diện, tách hai nguồn ảnh và đổi bố cục studio.
- Lượt cuối: 36 kiểm thử đạt, 0 lỗi. Bổ sung giới hạn ảnh, MIME/giải mã lỗi, timeout, thứ tự số tự nhiên, JPEG/WebP và ảnh trùng nội dung.

## Kiểm tra tự động

- `npm test` và `npm run test:coverage`: 36/36 đạt.
- Coverage module mới: `fortune-animation.js` 100% dòng/nhánh/hàm; `memory-album.js` 100% dòng, 97.96% nhánh, 100% hàm; `prepare-album.mjs` 83.33% dòng, 95.65% nhánh, 100% hàm. Phần chưa chạy của script là CLI wrapper; CLI cũng được chạy trực tiếp khi dựng fixture.
- `npm run check:pages`: 17 tài nguyên bản mặc định tại `/woin/` đạt; checker cũng đọc manifest và phát hiện ảnh bị thiếu. Test riêng xác nhận ảnh tham chiếu trả 404 làm kiểm tra thất bại.
- `node --check` toàn bộ JavaScript trong `dist` và `scripts`; `git diff --check` đạt.
- Không tính coverage thư viện Three.js vendored thành chỉ số của tính năng.

## Kiểm tra trên trình duyệt thật

Dùng bản sao artifact trong `output/station-qa/` với 2 ảnh minh họa riêng cho QA; không đưa ảnh fixture vào album thật hoặc Git. Kiểm tra ở 1280×720 và 390×844.

- Trạm 6: trong khi lắc vẫn 5/7 kỷ vật, nút đi tiếp ẩn; đóng giữa chừng không lưu. Lắc lại thành công mới có 6/7. Chiều cao dialog trước/sau giống nhau: desktop 535.09 px, mobile 679.98 px; scrollTop đều 0. Giảm tải nền 3D trong dialog và không tích confetti đang bị dừng.
- Trạm 7: phiên mới tự có 2 ảnh host; chuyển 1/2 → 2/2. Thêm ảnh riêng chuyển đúng nguồn. Quay về album team vẫn đủ 2 ảnh. Gỡ ảnh riêng không mất ảnh host. Chọn ảnh host xuất hiện đúng trong thiệp; thử trên mobile có album và nút giữ khung.
- Bản `dist/` với manifest trống hiện đúng thông báo host chưa thêm ảnh, không có lỗi console, vẫn cho giữ khung minh họa.
- Trạm 8: đủ tên 4 mẫu và dấu chọn trên desktop/mobile, điều khiển bằng mũi tên đổi mẫu đúng. Đổi mẫu/khổ story và nút xem trước hoạt động; footer tải PNG luôn truy cập được.
- Download thật: `thiep-20-10-minh-anh-story-midnight.png`, header PNG xác nhận 1080×1920, 1,577,260 byte, có tên và ảnh host đã chọn. Không có lỗi/warning console.

Ảnh chụp và PNG kiểm tra nằm trong `output/` (gitignored). Album xuất bản mặc định chưa có ảnh của team; host thêm ảnh bằng lệnh trong `docs/host-album.md`.
