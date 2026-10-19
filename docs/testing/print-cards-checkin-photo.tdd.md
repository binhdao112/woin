# Bốn mẫu thiệp cứng và đổi ảnh check-in · 19/10/2026

Yêu cầu trực tiếp: bốn thiết kế có cùng ảnh tập thể, cá nhân hóa theo năm tên để host chọn trước khi in; thêm nút đổi/chụp ảnh riêng ngay ở phần check-in cuối. Chọn A6 ngang vì phù hợp ảnh nhóm. Đây là bộ chọn mẫu, chưa đặt in.

## Check-in: RED → GREEN

- `94a504e`: sáu ca RED vì chưa có decoder/photo picker.
- `3fca0c7`: sáu ca GREEN: loại/kích thước file, EXIF, giữ tỷ lệ/cạnh1600px, giải phóng bitmap, hủy chooser, chọn liên tiếp, đóng/reset khi decode còn chạy và khôi phục sau lỗi.
- `2155d1b`: ca tích hợp RED khi album tải muộn tự bật lại ảnh đã ẩn. `00724a5`: hai ca GREEN cho setting ẩn ảnh, ảnh riêng đang chọn/đang decode, model cũ và popup đóng.
- Nút **✎ Đổi ảnh** mở mục Đổi ảnh. Chọn file/chụp riêng qua file input native; dùng lại ảnh team. Đồng bộ ảnh tùy chỉnh với bốn mẫu thiệp online hiện có, không sửa album chung/tiến độ/đơn nước.
- `node --experimental-test-coverage --test tests/checkin-photo.test.js`:100% lines,91.30% branches,80% functions. Hai callback default liên quan browser được thử bằng browser thật.

## Thiệp in

- `scripts/prepare-print-cards.py`: ReportLab + font tiếng Việt nhúng, nhúng nguyên ảnh JPEG Khoảnh khắc19, đồ họa/chữ vector. Bốn phong cách khác nhau;40 trang PDF tương ứng20 thiệp hai mặt. Tên/mã đọc từ roster hiện có.
- Thành phẩm148×105mm, TrimBox chính xác, bleed3mm; MediaBox162×119mm có dấu cắt. PDF gộp10trang/mẫu theo cặp mặt trước/sau cho từng tên.
- Render bằng pdftoppm, đã xem ảnh bốn thiết kế, mặt sau với tên dài và bản PDF có dấu cắt. Sửa khoảng cách bảng so mẫu sau khi phát hiện tiêu đề hàng dưới chạm hàng trên; bản cuối không chồng/cắt chữ.
- Kiểm tra bằng pypdf trên cả40trang: đúng tên, đủ ký tự tiếng Việt, đúng trim/bleed/media;40preview có tồn tại. pdffonts xác nhận font chữ tiếng Việt được nhúng. Barcode detector Vision đọc đúng QR từ JPG render mặt sau.
- Trang `/print-cards/` chọn một trong5tên, xem mặt trước/sau cả4mẫu, tải PDF đủ5tên. Thông số nhà in và JPG xem mẫu đi kèm. Bộ mẫu chưa được gửi nhà in.

## Browser và kiểm chứng cuối

- IAB1280×720 và375×667: sân khấu đổi ảnh, chọn ảnh selfie thật từ file, PNG1080×1920 tải thật, đóng/mở giữ ảnh trong phiên app, khôi phục ảnh team; popup không cuộn (dialog667/667px, options335/335px).
- Camera: xác nhận input `capture=user` và đường mở chooser. Không có thiết bị camera điện thoại trong phiên này để kiểm tra ảnh chụp trực tiếp.
- Gallery đổi tên Nguyễn Trần Bảo Ngọc cập nhật đúng bốn ảnh/mặt sau; bốn ảnh load1600px, download thật PDF02. Responsive375px không tràn ngang. Không warning/error console.
- `npm test`:114/114 pass. `npm run check:pages`:67 linked resources dưới `/woin/`; `npm run check:drinks`:bundle khớp. HTTP cục bộ49trang/tài nguyên gallery đều200, bao gồm40JPG +4PDF. JS/Python syntax và git diff checks sạch.
- Không gửi đơn Sheets hay upload ảnh lên server. Ảnh đổi cho check-in dùng trong phiên app; không lưu qua reload.
- Bằng chứng local: `output/checkin-private-photo-mobile.png`, `output/checkin-restore-team-photo.png`, `output/print-gallery-mobile.png`, `output/print-cards-artifact-proof.json`, `output/pdf/print-cards/4-mau-thiep-A6.jpg`.

Tạo lại bộ in bằng Python có reportlab/Pillow/pypdf và pdftoppm: `python3 scripts/prepare-print-cards.py`. Mặc định output ở `output/pdf/print-cards/`; khi host chốt/sửa, sync kết quả vào `dist/print-cards/assets/` và kiểm tra render trước khi phát hành. Script dùng font Georgia/Arial trên macOS; bản web không phụ thuộc font cài cục bộ của người xem.
