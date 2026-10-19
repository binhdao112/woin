# VNG Campus · Một vòng cùng team · 20/10

Website tĩnh dùng Three.js, với không gian VNG Campus: đi qua 8 trạm, nhận 7 kỷ vật và tải thiệp PNG cá nhân hóa. Không cần backend hoặc bước build.

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

## Chọn nước KOI và thống kê cho host

Quầy cà phê có menu KOI Thé · Trung Hòa, tìm món không dấu, chọn cỡ, đường/đá, tên nhận nước và ghi chú. Nút **Ly nước của tôi** cho quay lại sửa lựa chọn. Google Sheets có danh sách từng đăng ký và bảng gom số ly theo cấu hình để host tự đặt nước.

**Đã bật kết nối Google Sheets** trên bản xem KOI sau khi host chạy `setupKoiOrders`, tạo hai tab Đăng ký/Tổng hợp và endpoint nhận đúng mã đợt. Chọn ly rồi bấm **Gửi lựa chọn cho host**; chỉ thông báo **Đã ghi nhận 1 ly** khi Google trả đúng xác nhận. [Hướng dẫn kết nối và chốt danh sách](docs/drink-orders.md).

Chỉ hiện đã nhận sau khi Google xác nhận đúng mã gửi. Gửi lại sau lỗi mạng không thêm ly; đổi món cập nhật dòng cũ của cùng trình duyệt. Giá là tham khảo, host kiểm tra lại khi đặt.

## Campus thu nhỏ

Ngay màn chào, mỗi người có thể tự phối nhân vật 3D: 4 kiểu tóc, 5 màu tóc, 3 trang phục, 6 màu trang phục, 5 tông da và 5 lựa chọn phụ kiện (**9.000 cách phối**). Phòng thử đồ cho xem trước, xoay trái/phải và phối ngẫu nhiên. Bấm nút tên/nhân vật trên thanh công cụ để đổi lại giữa hành trình; lưu mới áp dụng, nút hủy hoặc Escape giữ diện mạo cũ. Nhân vật đã chọn xuất hiện trong campus, được giữ khi tải lại trong cùng phiên. Hành trình cũ dùng diện mạo mặc định và giữ nguyên kỷ vật.

Ứng dụng chỉ dùng **VNG Campus**. Link cũ có `?world=cloud` tự đổi thành `?world=campus`, giữ nguyên đường dẫn preview, tham số khác và hash. Cảnh mây, nút đổi không gian và tên cũ trên các mẫu thiệp đã được gỡ bỏ.

Campus là mô hình minh họa lấy cảm hứng từ [ảnh ngoại thất VNG công khai](https://vng.com.vn/news/enterprise/van-phong-vng-3969.html): hai cánh nhà trắng thấp tầng, dải kính, mái pin mặt trời, bậc cây xanh và sân trong. Đây là bố cục cách điệu cho sự kiện, không phải bản sao mặt bằng hay mô hình kiến trúc chính xác.

Giữ **WASD** hoặc **phím mũi tên** để tự đi bộ theo góc camera; kéo cảnh để xoay, cuộn để thu phóng. Điện thoại có bốn nút chạm để giữ và di chuyển. Bấm **E · Tương tác** khi đứng gần trạm đã mở. Đi bộ tự do không mở khóa trạm hoặc nhận quà thay bạn. Va chạm chặn các khối nhà, bậc thềm, hồ và mép đất. Bấm tên trạm/nút đi đến để tự tìm đường an toàn từ vị trí hiện tại; có thể ngắt bằng phím đi bộ. Tải lại trang trở về trạm đang lưu.

Nút **♡ Biểu cảm** mở góc camera cận với sáu động tác: thả tim, vẫy tay, nhún nhảy, ôm một cái, tạo dáng và **67!** (hai bàn tay nâng hạ luân phiên). Chọn động tác mới để thay ngay; **Đứng yên**, Escape, di chuyển hoặc mở cửa sổ khác đều dừng và trả về tư thế bình thường. Chế độ giảm chuyển động dùng tư thế tĩnh và hiệu ứng đứng yên. Không cần âm thanh hoặc tài nguyên tải ngoài.

Tám điểm dừng có thể tự tìm đường từ vị trí hiện tại, đi vòng các khối nhà. Màu điểm dừng phản ánh cùng bộ sưu tập 7 kỷ vật. Các khối lặp dùng `InstancedMesh`; không cần tải mô hình 3D hoặc thư viện mới. Camera toàn cảnh co theo tỷ lệ màn hình; trên điện thoại danh sách trạm cuộn ngang đến trạm hiện tại.

## Hành trình và thiệp

- Nhận kỷ vật ở trạm hiện tại để mở trạm tiếp theo. Nút chính dẫn đến trải nghiệm còn thiếu.
- Vé và đồ uống được lưu khi xác nhận. Các trò chơi tự lưu kết quả thành kỷ vật ngay khi có kết quả; đóng trò chơi không làm mất món đã nhận.
- Trạm 6 lắc ống quẻ xong mới hiện thông điệp và lưu kỷ vật; đóng giữa chừng có thể mở lại để lắc tiếp. Trạm ảnh tự tải album do host chuẩn bị sẵn, giữ đúng khung hình đang xem. Có thể giữ khung minh họa nếu album chưa có ảnh.
- Bộ đếm và các thanh tiến độ đều lấy từ cùng bộ sưu tập 7 kỷ vật.
- Trạm số may mắn có hai lượt: chạm quả cầu để nhận số 01–99, rồi chạm vé Vietlott vừa xuất hiện để mở bộ số vui 6/45: sáu số khác nhau từ 01–45, sắp tăng dần. Bộ số có nút chép, được lưu cùng hành trình và xuất lên cả bốn mẫu thiệp social, caption và bản kỷ niệm đầy đủ. Hành trình cũ không tự bốc thêm số khi tải lại.
- Thiệp cuối giữ nguyên lời chúc trong chuyến đi. PNG có tên, kết quả của từng trạm và ảnh kỷ niệm đã chọn nếu ảnh còn trong thư viện trình duyệt.
- Màn thiệp có preview và ba bản tải: bài đăng 1080×1350 (4:5), story 1080×1920 (9:16), hoặc bản kỷ niệm đầy đủ. Hai bản social dùng nền hoa minh họa và một lời nhắn ngắn, giữ số may mắn như một dấu ấn của hành trình.
- Có 4 mẫu social với thumbnail lớn, bố cục 2×2, dấu chọn rõ ràng và nút tải luôn hiện ở cuối màn thiệp: **Mây hoa**, **Bìa tạp chí**, **Sổ tay vui** và **Đêm sao**. Mỗi mẫu có bố cục dành cho cả khổ bài đăng/story, có hoặc không có ảnh. Đổi mẫu giữ nguyên tên, ảnh và dữ liệu hành trình; lựa chọn mẫu được nhớ trong cùng phiên trình duyệt. Tên file PNG phân biệt từng mẫu.
- Có thể chọn thêm ảnh check-in cho khung Polaroid hoặc dùng thiệp hoa không có ảnh. Ảnh check-in bổ sung chỉ nằm trong bộ nhớ của trang, mất khi tải lại; không thay album IndexedDB và không tải lên máy chủ. Bản kỷ niệm đầy đủ vẫn dùng ảnh của hành trình.
- Nút “Chép caption” chuẩn bị nội dung để bạn tự đăng. Ứng dụng không tự đăng lên mạng xã hội.
- Tiến trình, tên và diện mạo nhân vật lưu trong `sessionStorage`, dùng lại khi tải lại trang trong cùng tab. Đóng tab có thể kết thúc phiên. Ảnh lưu riêng trong IndexedDB và không tự mất cùng phiên hành trình.

## Ảnh nằm ở đâu khi deploy từ Git?

| Loại ảnh | Nơi lưu | Ai xem được? |
| --- | --- | --- |
| Ảnh chọn bằng nút “Thêm ảnh riêng” | IndexedDB của trình duyệt, sau khi thu về canvas 1200×900 | Chỉ trình duyệt trên thiết bị đã chọn ảnh |
| Ảnh dùng chung cho cả team, đưa sẵn khi deploy | File trong repo tại `dist/assets/memories/`, tự tải theo `album.json` | Mọi người mở website |
| Thiệp PNG tải xuống | Thư mục tải xuống do trình duyệt quyết định | Người giữ file PNG |

Deploy hoặc push Git không đưa ảnh riêng đã chọn trong trình duyệt lên repo. Ảnh riêng không được tải lên máy chủ, không đồng bộ giữa thiết bị. Xóa dữ liệu website hoặc dùng trình duyệt khác có thể khiến album cá nhân không còn. Album của team được giữ riêng, luôn ưu tiên hiển thị và không bị thao tác “Gỡ ảnh riêng” thay đổi.

Host chuẩn bị tối đa 24 ảnh JPG, PNG hoặc WebP trong một thư mục rồi chạy:

```sh
npm run album -- "/đường/dẫn/thư-mục-ảnh" "Khoảnh khắc cùng team"
npm test
npm run check:pages
```

Lệnh chép ảnh và tạo danh sách `dist/assets/memories/album.json`; commit toàn bộ thư mục này rồi xuất bản lại `dist/`. Mọi người mở trạm 7 sẽ thấy album chung, không cần chọn ảnh trên máy. Album hiện có **19 ảnh của team**, được đồng bộ từ thư mục host cung cấp. Thêm ảnh vào thư mục đó rồi chạy lại lệnh để nhập đợt mới; mã ảnh cũ được giữ theo nội dung. [Hướng dẫn thêm ảnh và deploy album](docs/host-album.md).

## Check-in cuối hành trình

Sau khi giữ đủ bảy kỷ vật, bấm **Check-in cùng nhân vật** tại trạm 8. Sân khấu tổng hợp tên, nhân vật đã custom, ảnh kỷ niệm đã chọn, bảy kỷ vật và bộ số vui đã bốc. Chọn Story 9:16 hoặc bài đăng 4:5, hai mood Vườn hồng / Đêm sao và một trong sáu biểu cảm.

- **Quay / chụp toàn màn hình** ẩn điều khiển; chạm để hiện nút trở lại hoặc nhấn Esc.
- **Tải PNG** xuất ảnh 1080 × 1920 hoặc 1080 × 1350.
- **Lưu clip 8 giây** xuất chuyển động không âm thanh bằng định dạng trình duyệt hỗ trợ (ưu tiên MP4/H264). Có thể thêm nhạc trong ứng dụng social. Trình duyệt thiếu chức năng ghi vẫn có PNG và quay màn hình.
- **Xem 4 mẫu thiệp** mở lại bộ thiệp hiện có. Check-in xử lý trên thiết bị, không gửi ảnh cá nhân lên máy chủ.

## Popup vừa màn hình

Popup kết quả tự căn và thu vừa khung nhìn khi cần, hiển thị trọn nội dung để chụp check-in. Các phần nhiều lựa chọn dùng từng mục hoặc trang thay vì cuộn: check-in có Khung hình / Tạo dáng / Lưu & chia sẻ, mẫu thiệp có Mẫu / Khổ / Ảnh, album hành trình xem từng kỷ vật, quầy KOI phân trang món và tách chọn món / tùy chỉnh ly trên điện thoại. Các lựa chọn vẫn được giữ khi đổi mục.

Nút **Phóng to thiệp** trong phòng thiệp và **Quay / chụp toàn màn hình** trong check-in dành cho chụp/quay lại kết quả. `dist/popup-layout.js` và `dist/popup-layout.css` quản lý bố cục này.

## Deploy trên GitHub Pages

Repo xuất bản từ **`gh-pages` → `/`**, giữ nguyên cấu hình Pages và environment đang có. Nội dung của `dist/` phải nằm ngay ở gốc nhánh `gh-pages` (`index.html`, `app.js`, `assets/`...). Không merge nguyên nhánh mã nguồn vào `gh-pages`, vì như vậy file HTML mới vẫn nằm trong `dist/`, còn HTML ở gốc có thể vẫn là bản cũ.

- Website: <https://binhdao112.github.io/woin/>
- Bản xem riêng: <https://binhdao112.github.io/woin/previews/campus/>
- Bản xem mới có quầy KOI và bộ số vui: <https://binhdao112.github.io/woin/previews/koi/?world=campus>
- Nhánh nguồn giữ code, tests và docs để review. Nhánh `gh-pages` giữ artifact tĩnh để xuất bản.

Trước khi đưa artifact lên `gh-pages`, chạy `npm test` và `npm run check:pages`. Sao chép toàn bộ nội dung `dist/` vào gốc nhánh deploy trong một checkout riêng, giữ `.git/` và các snapshot `previews/` hiện có, commit rồi push `gh-pages`. Push bằng tài khoản Git có quyền ghi sẽ tự kích hoạt workflow **pages build and deployment** của GitHub. Chờ cả build và deploy thành công trước khi kiểm tra URL.

Muốn cập nhật riêng bản xem thử mà giữ trang chính: chỉ chép artifact vào `previews/campus/` trên `gh-pages`. Các tài nguyên dùng đường dẫn tương đối nên cùng một artifact chạy được ở cả `/woin/` và `/woin/previews/campus/`. `version.json` trên nhánh deploy ghi commit nguồn của snapshot hiện tại.

**Checks** tiếp tục chạy cho PR vào `main` và push `main`/`codex/**`: kiểm tra cú pháp, 99 kiểm thử, 61 tài nguyên dưới `/woin/`, rồi lưu artifact `website-dist` cho reviewer. Không cần backend, `npm install` hoặc bước build.

Workflow deploy trực tiếp từ `main` đã được tắt trên GitHub; PR #2 gỡ file workflow cũ: environment `github-pages` chỉ cho nhánh `gh-pages` triển khai. Không cần đổi Pages Source sang GitHub Actions hoặc nới quy tắc environment để dùng cách xuất bản hiện tại.

`.openai/hosting.json` là cấu hình hosting Sites hiện có, độc lập với GitHub Pages và được giữ nguyên.

## Các file chính

- `dist/app.js`: cảnh 3D, điều hướng, album và kết nối giao diện.
- `dist/campus.js`, `dist/campus.css`: mô hình campus, tuyến đi, trạng thái trạm và bố cục responsive.
- `dist/journey.js`: quy tắc sưu tầm, tiến độ và mở khóa trạm.
- `dist/wish-card.js`: dữ liệu thiệp, xuống dòng, vẽ canvas và mã hóa PNG.
- `dist/social-card.js`, `dist/card-studio.css`: bố cục social, khung ảnh và giao diện preview.
- `dist/card-templates.js`: danh sách mẫu và các bố cục tạp chí, scrapbook, đêm sao; ba mẫu này vẽ bằng canvas, không cần tải thêm ảnh nền.
- `dist/assets/social-bloom.png`: minh họa hoa và mây, lưu ngay trong repo để deploy cùng website.
- `dist/experience.js`, `dist/fortune-animation.js`, `dist/station-polish.css`: trò chơi tại trạm, animation quẻ và nhạc nền.
- `dist/lucky-numbers.js`: bốc số ngẫu nhiên, kiểm tra và định dạng bộ số vui 6/45.
- `dist/avatar-profile.js`, `dist/avatar-rig.js`, `dist/avatar-studio.js`, `dist/avatar-studio.css`: danh mục diện mạo, nhân vật 3D dùng chung và phòng thử đồ.
- `dist/memory-album.js`, `dist/assets/memories/album.json`: album dùng chung do host chuẩn bị.
- `scripts/prepare-album.mjs`: nhập thư mục ảnh của host, tạo tên file và danh sách cho album.
- `dist/drink-counter.js`, `dist/drink-counter.css`: quầy KOI và giao diện đăng ký.
- `dist/drink-orders.js`, `dist/drink-order-client.js`, `dist/drink-registration.js`: kiểm tra lựa chọn, xác nhận và chống gửi trùng.
- `integrations/google-sheets/Code.gs`: gói triển khai Google Sheets cho host.
- `tests/`: kiểm thử hành trình, xuất thiệp và đăng ký nước.

Ảnh chụp kiểm tra và thiệp mẫu trong `output/` chỉ là kết quả local, được loại khỏi Git.
