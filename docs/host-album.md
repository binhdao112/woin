# Album chung ở trạm 7

Host đưa ảnh vào repo trước khi deploy. Người xem tự thấy album của team khi mở trạm 7; không cần đăng nhập hoặc tự chọn ảnh. Nút “Thêm ảnh riêng” vẫn dùng được, lưu riêng trên trình duyệt và không sửa album chung.

## Chuẩn bị ảnh

1. Đặt tối đa 48 ảnh JPG, PNG hoặc WebP trong một thư mục riêng, mỗi ảnh tối đa 20 MB. Nên xuất ảnh khoảng 1600–2200 px và dưới 1 MB để điện thoại tải nhanh. Script giữ nguyên byte ảnh đầu vào, không tự nén. Với ảnh gốc quá nặng, tạo bản web ở thư mục tạm rồi nhập bản đó; giữ nguyên folder gốc của host.
2. Đặt tên có thứ tự như `01 Cả team cùng nhau.jpg`, `02 Một ngày ở campus.webp`. Tên file trở thành chú thích, sắp theo số tự nhiên. Hai ảnh có nội dung giống hệt nhau chỉ nhập một lần.
3. Tại thư mục repo, chạy:

```sh
npm run album -- "/đường/dẫn/thư-mục-ảnh" "Khoảnh khắc cùng team"
npm test
npm run check:pages
```

4. Xem lại `dist/assets/memories/album.json`, commit cùng các ảnh trong `dist/assets/memories/photos/`, rồi xuất bản lại website.

## Gắn ảnh theo người

Thư mục ảnh gốc của host: `/Users/lap15111/Downloads/album`.

Đặt prefix theo mã tên: `NhanCk_01.jpg`, `ThaoNTK_01.jpg`, `LyHK_01.jpg`, `NgocNTB12_01.jpg`, `HanNHG2_01.jpg`. Ảnh tập thể dùng `team_01.jpg`. Có nhiều ảnh thì tăng `_02`, `_03`…; ảnh có số đầu tiên của mỗi prefix là ảnh chính mặc định. Prefix không phân biệt hoa/thường.

Lệnh nhập album đồng thời tạo `dist/assets/memories/portraits.json`: ảnh chính theo mã người, danh sách `albums` gồm mọi ảnh của từng prefix và ảnh tập thể mặc định. Đổi tên không đổi mã hash hay byte ảnh. Ảnh chưa có prefix vẫn xem được trong album, nhưng không tự gán cho ai. Nếu chưa gán ảnh riêng, thiệp dùng ảnh tập thể đã chỉ định; không tự lấy chân dung đang hiện tại trạm 7. Nếu ảnh chính bị lỗi, dùng ảnh tập thể; không có ảnh tập thể tải được thì thiệp không chèn ảnh thay thế của người khác.

Trong màn check-in cuối, mục **Đổi ảnh** hiển thị các ảnh có prefix của đúng người đang chọn:4ảnh/trang trên desktop,2ảnh/trang trên điện thoại. Bấm ảnh cập nhật khung check-in và các mẫu thiệp/PNG, bao gồm bản kỷ niệm đầy đủ. Nút **Chọn / chụp ảnh riêng** mở tùy chọn ảnh từ máy hoặc camera; nút quay lại hiện danh sách ảnh có sẵn. Danh sách loại ảnh trùng và bỏ ảnh chưa tải được; không đưa ảnh của prefix khác vào lựa chọn. Hiện có LyHK8ảnh, NgocNTB126ảnh, HanNHG23ảnh, ThaoNTK3ảnh và NhanCk1ảnh.

Ảnh tự chọn và trạng thái ẩn ảnh trong check-in được giữ theo mã người trong phiên app, độc lập với biệt danh. Đổi người không kế thừa ảnh tự chọn; ảnh đang giải mã chỉ cập nhật đúng người bắt đầu chọn. Ảnh này không upload lên server và không lưu qua tải lại trang. Khi xuất bản, chép cả `portraits.json`, `album.json` và ảnh vào artifact.

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
- Giữ khung ảnh lưu cả mã ảnh và chú thích cho kỷ vật ở trạm 7. Thiệp check-in dùng ảnh đã gắn theo mã người hoặc ảnh tự chọn của đúng người đó, độc lập với ảnh đang trình chiếu.
- Nếu một ảnh bị lỗi, ảnh khác vẫn xem được. Nếu cả album chưa tải được, người xem có thể dùng ảnh riêng hoặc khung minh họa.
- Album có thể dùng tối đa 48 ảnh. Trình duyệt tải và giải mã theo nhóm 3 ảnh, thu về canvas 1200×900 để trình chiếu và xuất thiệp.

## Đợt đồng bộ hiện tại

Ngày19/10/2026: đã nhập26file được host đổi prefix, tương ứng25ảnh khác nhau. Hai file `lyhk_DSC00772.jpg` và `thaontk_DSC00772 copy.jpg` có cùng nội dung nên dùng chung một asset; cả hai liên kết mã người vẫn được giữ. Đủ5mã người và5ảnh có prefixteam. Các ảnh chính được chọn theo thứ tự tên file; ảnh tập thể mặc định giữ bức đã dùng cho thiệp in. Chú thích rút gọn theo mã tên thay cho chuỗi timestamp dài.

Sáu file JPEG lớn (gồm một bản trùng) được tạo bản web cạnh dài tối đa2200px, JPEG88, có xử lý hướng EXIF. Tổng26file từ170,55MiB còn26,38MiB; toàn bộ26file gốc được kiểm tra SHA-256 và không thay đổi.18IDảnh cũ còn trong album;7asset mới được thêm. Những asset cũ không còn trong danh sách vẫn giữ trong repo để không phá tài nguyên đã xuất bản hoặc bộ thiệp in. Mỗi lần host thêm ảnh, đồng bộ theo yêu cầu và kiểm tra lại bindings trước khi deploy; chưa theo dõi thư mục tự động.
