# Văn phòng trên mây · 20/10

Website tĩnh dùng Three.js, với hai không gian VNG Campus và đảo trên mây: đi qua 8 trạm, nhận 7 kỷ vật và tải thiệp PNG cá nhân hóa. Không cần backend hoặc bước build.

## Chạy và kiểm tra

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
```

Mở <http://127.0.0.1:8765>. Cần chạy HTTP server vì ứng dụng dùng JavaScript modules; không mở trực tiếp bằng `file://`.

Kiểm thử bằng Node.js 18 trở lên, không cần cài thư viện:

```sh
npm test
npm run test:coverage
npm run check:pages
```

## Campus thu nhỏ

Không gian mặc định là **VNG Campus** (`?world=campus`). Dùng nút **Đảo trên mây** (`?world=cloud`) để xem cảnh cũ; cả hai dùng chung tiến trình trong cùng tab.

Campus là mô hình minh họa lấy cảm hứng từ [ảnh ngoại thất VNG công khai](https://vng.com.vn/news/enterprise/van-phong-vng-3969.html): hai cánh nhà trắng thấp tầng, dải kính, mái pin mặt trời, bậc cây xanh và sân trong. Đây là bố cục cách điệu cho sự kiện, không phải bản sao mặt bằng hay mô hình kiến trúc chính xác.

Tám điểm dừng kết nối thành lối đi quanh sân; quay lại trạm cũ cũng đi theo tuyến thay vì băng qua nhà. Màu điểm dừng phản ánh cùng bộ sưu tập 7 kỷ vật. Các khối lặp dùng `InstancedMesh`; không cần tải mô hình 3D hoặc thư viện mới. Camera toàn cảnh co theo tỷ lệ màn hình; trên điện thoại danh sách trạm cuộn ngang đến trạm hiện tại.

## Hành trình và thiệp

- Nhận kỷ vật ở trạm hiện tại để mở trạm tiếp theo. Nút chính dẫn đến trải nghiệm còn thiếu.
- Vé và đồ uống được lưu khi xác nhận. Các trò chơi tự lưu kết quả thành kỷ vật ngay khi có kết quả; đóng trò chơi không làm mất món đã nhận.
- Trạm ảnh giữ đúng khung hình đang xem. Có thể giữ khung minh họa nếu chưa chọn ảnh.
- Bộ đếm và các thanh tiến độ đều lấy từ cùng bộ sưu tập 7 kỷ vật.
- Thiệp cuối giữ nguyên lời chúc trong chuyến đi. PNG có tên, kết quả của từng trạm và ảnh kỷ niệm đã chọn nếu ảnh còn trong thư viện trình duyệt.
- Màn thiệp có preview và ba bản tải: bài đăng 1080×1350 (4:5), story 1080×1920 (9:16), hoặc bản kỷ niệm đầy đủ. Hai bản social dùng nền hoa minh họa và một lời nhắn ngắn, giữ số may mắn như một dấu ấn của hành trình.
- Có 4 mẫu social với thumbnail riêng: **Mây hoa**, **Bìa tạp chí**, **Sổ tay vui** và **Đêm sao**. Mỗi mẫu có bố cục dành cho cả khổ bài đăng/story, có hoặc không có ảnh. Đổi mẫu giữ nguyên tên, ảnh và dữ liệu hành trình; lựa chọn mẫu được nhớ trong cùng phiên trình duyệt. Tên file PNG phân biệt từng mẫu.
- Có thể chọn thêm ảnh check-in cho khung Polaroid hoặc dùng thiệp hoa không có ảnh. Ảnh check-in bổ sung chỉ nằm trong bộ nhớ của trang, mất khi tải lại; không thay album IndexedDB và không tải lên máy chủ. Bản kỷ niệm đầy đủ vẫn dùng ảnh của hành trình.
- Nút “Chép caption” chuẩn bị nội dung để bạn tự đăng. Ứng dụng không tự đăng lên mạng xã hội.
- Tiến trình và tên lưu trong `sessionStorage`, dùng lại khi tải lại trang trong cùng tab. Đóng tab có thể kết thúc phiên. Ảnh lưu riêng trong IndexedDB và không tự mất cùng phiên hành trình.

## Ảnh nằm ở đâu khi deploy từ Git?

| Loại ảnh | Nơi lưu | Ai xem được? |
| --- | --- | --- |
| Ảnh chọn bằng nút “Chọn ảnh trên máy” hiện tại | IndexedDB của trình duyệt, sau khi thu về canvas 1200×900 | Chỉ trình duyệt trên thiết bị đã chọn ảnh |
| Ảnh dùng chung cho cả team, đưa sẵn khi deploy | File trong repo, ví dụ `dist/assets/memories/`, hoặc dịch vụ lưu ảnh riêng | Người có quyền truy cập website hoặc dịch vụ ảnh |
| Thiệp PNG tải xuống | Thư mục tải xuống do trình duyệt quyết định | Người giữ file PNG |

Deploy hoặc push Git không đưa các ảnh đã chọn trong trình duyệt lên repo. Ảnh hiện tại không được tải lên máy chủ, không đồng bộ giữa thiết bị. Xóa dữ liệu website hoặc dùng trình duyệt khác có thể khiến album cá nhân không còn.

Để có một album chung, phương án đơn giản là đặt ảnh đã tối ưu trong `dist/assets/memories/` và thêm danh sách ảnh cùng bộ nạp cho ứng dụng. **Bản hiện tại chưa tự đọc thư mục này**; không chỉ chép ảnh vào thư mục là chúng sẽ xuất hiện. Khi muốn cho đồng nghiệp tải ảnh lên và mọi người cùng thấy, cần bổ sung dịch vụ lưu trữ/API như object storage hoặc một backend phù hợp.

## Deploy

Xuất bản toàn bộ nội dung thư mục `dist/` trên hosting tĩnh. Giữ nguyên các file modules và tên file; không cần `npm install` hay `npm run build`. Các đường dẫn tài nguyên là tương đối, phù hợp cả khi website nằm dưới `/woin/`.

Có hai workflow GitHub Actions:

- **Checks** chạy trên PR vào `main` và khi push `main`/`codex/**`: kiểm tra cú pháp, chạy kiểm thử, kiểm tra 13 tài nguyên dưới đường dẫn `/woin/` và lưu artifact `website-dist` cho reviewer tải về.
- **Deploy GitHub Pages** chạy sau khi merge vào `main`, hoặc chạy thủ công trên `main`. Workflow kiểm thử trước, đóng gói đúng `dist/`, rồi dùng các action Pages chính thức để deploy. Nhánh review không tự ghi đè website đang chạy.

Repo đã có nhánh `gh-pages` cho website cũ. Khi áp dụng workflow mới sau review, quản trị viên chọn **Settings → Pages → Build and deployment → Source → GitHub Actions** một lần. Sau đó merge PR vào `main` hoặc chạy workflow **Deploy GitHub Pages** trên `main`. Kiểm tra job **Publish website** thành công và mở URL được trả trong deployment. Không chọn thư mục gốc của nhánh source làm nội dung website, vì `index.html` nằm trong `dist/`.

`npm run check:pages` phục vụ artifact thật ở `/woin/`, kiểm tra HTTP/content type của HTML, JavaScript modules, CSS và nền hoa; đồng thời phát hiện đường dẫn tuyệt đối sai hoặc sai chữ hoa/thường. Thư mục `dist/` tự đủ để deploy, không phụ thuộc file trong `output/`. [Tài liệu workflow GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

`.openai/hosting.json` là cấu hình hosting Sites hiện có và được giữ nguyên.

## Các file chính

- `dist/app.js`: cảnh 3D, điều hướng, album và kết nối giao diện.
- `dist/campus.js`, `dist/campus.css`: mô hình campus, tuyến đi, trạng thái trạm và bố cục responsive.
- `dist/journey.js`: quy tắc sưu tầm, tiến độ và mở khóa trạm.
- `dist/wish-card.js`: dữ liệu thiệp, xuống dòng, vẽ canvas và mã hóa PNG.
- `dist/social-card.js`, `dist/card-studio.css`: bố cục social, khung ảnh và giao diện preview.
- `dist/card-templates.js`: danh sách mẫu và các bố cục tạp chí, scrapbook, đêm sao; ba mẫu này vẽ bằng canvas, không cần tải thêm ảnh nền.
- `dist/assets/social-bloom.png`: minh họa hoa và mây, lưu ngay trong repo để deploy cùng website.
- `dist/experience.js`: trò chơi tại trạm và nhạc nền.
- `tests/`: kiểm thử logic hành trình và xuất thiệp.

Ảnh chụp kiểm tra và thiệp mẫu trong `output/` chỉ là kết quả local, được loại khỏi Git.
