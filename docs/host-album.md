# Album chung ở trạm 7

Host đưa ảnh vào repo trước khi deploy. Người xem tự thấy album của team khi mở trạm 7; không cần đăng nhập hoặc tự chọn ảnh. Nút “Thêm ảnh riêng” vẫn dùng được, lưu riêng trên trình duyệt và không sửa album chung.

## Chuẩn bị ảnh

1. Đặt tối đa 24 ảnh JPG, PNG hoặc WebP trong một thư mục riêng, mỗi ảnh tối đa 20 MB. Nên xuất ảnh khoảng 1600–2000 px và dưới 1 MB để điện thoại tải nhanh. Script giữ nguyên byte ảnh gốc, không tự nén.
2. Đặt tên có thứ tự như `01 Cả team cùng nhau.jpg`, `02 Một ngày ở campus.webp`. Tên file trở thành chú thích, sắp theo số tự nhiên. Hai ảnh có nội dung giống hệt nhau chỉ nhập một lần.
3. Tại thư mục repo, chạy:

```sh
npm run album -- "/đường/dẫn/thư-mục-ảnh" "Khoảnh khắc cùng team"
npm test
npm run check:pages
```

4. Xem lại `dist/assets/memories/album.json`, commit cùng các ảnh trong `dist/assets/memories/photos/`, rồi xuất bản lại website.

Script kiểm tra toàn bộ đầu vào trước khi thay danh sách album. Ảnh sai định dạng hoặc vượt giới hạn khiến lệnh báo lỗi và giữ danh sách cũ. File có tên theo hash nội dung; chạy lại cùng ảnh giữ nguyên mã ảnh, kể cả khi đổi tên chú thích. Các file ảnh cũ không tự xóa; nếu muốn gỡ khỏi repo thì xóa riêng những file không còn dùng và deploy lại.

## Chỉnh danh sách bằng tay

Có thể chỉnh thứ tự, `title` hoặc `name` trong JSON. Giữ `id` của ảnh nếu chỉ đổi chú thích, vì kỷ vật đã lưu tham chiếu mã này.

```json
{
  "version": 1,
  "title": "Khoảnh khắc cùng team",
  "photos": [
    {
      "id": "team-unique-id",
      "name": "Một ngày ở campus",
      "src": "./photos/campus.jpg"
    }
  ]
}
```

Đường dẫn `src` phải nằm trong thư mục album, đúng chữ hoa/thường, dùng JPG/PNG/WebP; không dùng link ngoài hoặc đường dẫn bắt đầu bằng `/`. Chỉ chép ảnh vào thư mục mà chưa thêm vào `photos` sẽ chưa hiển thị. `npm run check:pages` đọc danh sách này và phát hiện ảnh bị thiếu hoặc đường dẫn sai.

## Xuất bản GitHub Pages

Repo đang xuất bản artifact từ gốc nhánh `gh-pages`. Chép toàn bộ nội dung `dist/` sang nhánh deploy để giữ đủ mã nguồn và thư mục ảnh. Nếu chỉ cập nhật bản xem riêng, chép vào `previews/koi/` trên `gh-pages`. Cùng album hoạt động ở cả `/woin/` và `/woin/previews/koi/` nhờ đường dẫn tương đối.

Commit album trên nhánh nguồn chưa tự thay website đang chạy; cần xuất bản snapshot mới lên `gh-pages`. Ảnh đã xuất bản có thể xem qua website. Khi chưa có ảnh thật, album hiện khung minh họa và vẫn cho đi tiếp.

## Hành vi với người xem

- “Album của team” luôn là nguồn mặc định nếu có ảnh tải được, kể cả khi trình duyệt đã có ảnh riêng từ trước.
- “Ảnh riêng của tôi” chứa ảnh IndexedDB của thiết bị đó; thêm hoặc gỡ ảnh riêng không thay album chung.
- Giữ khung ảnh lưu cả mã ảnh và chú thích. Thiệp tiếp tục dùng đúng ảnh đã chọn khi đổi nguồn ảnh hoặc đổi mẫu thiệp.
- Nếu một ảnh bị lỗi, ảnh khác vẫn xem được. Nếu cả album chưa tải được, người xem có thể dùng ảnh riêng hoặc khung minh họa.
- Album có thể dùng tối đa 24 ảnh. Trình duyệt tải và giải mã theo nhóm 3 ảnh, thu về canvas 1200×900 để trình chiếu và xuất thiệp.

## Đợt đồng bộ hiện tại

Đã nhập 19 ảnh JPG từ thư mục album của host. Ảnh được giữ nguyên byte và có mã theo hash; chú thích dùng “Khoảnh khắc 01” đến “Khoảnh khắc 19” vì tên file xuất tự động quá dài. Mỗi lần host thêm ảnh, chạy lại công cụ nhập rồi kiểm tra số ảnh, giữ nguyên ID của các ảnh cũ và cập nhật chú thích trước khi deploy. Đây là đồng bộ theo yêu cầu, chưa theo dõi thư mục tự động.
