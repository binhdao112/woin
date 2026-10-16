# Quầy KOI và bảng tổng hợp đặt nước

Trạm cà phê dùng menu **KOI Thé · Trung Hòa** do host đưa sẵn vào repo. Người xem chọn món, cỡ ly, tên nhận nước, đường/đá và ghi chú. Google Sheets giữ danh sách và tổng hợp để host tự đặt nước trên Grab.

**Hiện tại là bản thử:** `dist/assets/drinks/order-config.json` có `enabled: false`, chưa nối với tài khoản Google của host. Giao diện ghi rõ lựa chọn chỉ dùng trong hành trình. Chỉ bật gửi thật sau khi triển khai script bên dưới và thử xác nhận nhận dữ liệu.

## Kết nối một lần bằng tài khoản Google của host

1. Tạo một [Google Sheet](https://sheets.google.com/create), đặt tên như **20/10 · Đăng ký KOI**. Giữ bảng riêng tư; chỉ chia sẻ cho người cùng phụ trách đặt nước nếu cần.
2. Trong Sheet, mở **Extensions / Tiện ích mở rộng → Apps Script**. Thay nội dung `Code.gs` bằng toàn bộ file [`integrations/google-sheets/Code.gs`](../integrations/google-sheets/Code.gs) của repo. File này đã gồm menu và kiểm tra dữ liệu, không cần chép thêm module.
3. Chọn hàm **`setupKoiOrders`**, bấm **Run / Chạy**. Google sẽ yêu cầu host đăng nhập và cấp quyền cho script ghi bảng; host tự thực hiện bước tài khoản này. Script tạo hai tab **Đăng ký** và **Tổng hợp**.
4. Chọn **Deploy → New deployment → Web app**. Đặt **Execute as: Me**, **Who has access: Anyone**, rồi deploy. Đây là quyền gọi web app đăng ký, không phải công khai Google Sheet. Một số tài khoản Workspace có chính sách giới hạn tùy chọn này.
5. Lấy **Web app URL** kết thúc bằng **`/exec`**, gửi URL đó để nối vào website. Không dùng URL `/dev`, vì URL thử nghiệm chỉ dành cho người sửa script. [Hướng dẫn web app chính thức của Google](https://developers.google.com/apps-script/guides/web).
6. Khi có URL, sửa cấu hình dưới đây, chạy kiểm tra và xuất bản lại `dist/` lên `gh-pages`. Thử gửi một ly và kiểm tra cả hai tab của Sheet trước khi gửi link cho team.

```json
{
  "eventId": "team-2010-2026",
  "endpoint": "https://script.google.com/macros/s/DEPLOYMENT_ID/exec",
  "enabled": true
}
```

URL `/exec` là địa chỉ dịch vụ công khai của form, không phải mật khẩu. Không đưa token Google, service account hoặc khóa quản trị vào repo. Bảng dữ liệu vẫn thuộc tài khoản Google của host.

## Host xem và chốt danh sách

- **Đăng ký**: mỗi trình duyệt có một dòng hiện tại, gồm tên, món, cỡ, đường, đá, ghi chú và giá tham khảo. Gửi lại hoặc đổi món cập nhật dòng đó. Các mã kỹ thuật ở bốn cột đầu được ẩn.
- **Tổng hợp**: gom các ly có cùng món, cỡ, đường, đá và ghi chú; hiển thị số ly, đơn giá, thành tiền tham khảo và tên nhận nước. Khác đường/đá/ghi chú được tách thành dòng riêng.
- Tải lại Sheet để hiện menu **Quầy KOI**. Chọn **Chốt / đóng đăng ký** trước khi đặt; đăng ký mới và thay đổi sau đó bị từ chối. **Mở đăng ký** cho phép chỉnh tiếp. Lần gửi đã được nhận vẫn có thể kiểm tra lại sau khi chốt.
- Chọn tab **Tổng hợp**, dùng **File → Download** để tải CSV hoặc Excel. Host đối chiếu với menu Grab và tự đặt; website chỉ thu thập lựa chọn.
- Nếu host sửa/xóa dòng thủ công, chốt đăng ký trước rồi chọn **Quầy KOI → Cập nhật tổng hợp**. Không đổi tên tab hoặc cấu trúc cột mà chưa sửa script.

Mã nhận diện gắn với trình duyệt, không phải tài khoản nhân viên. Cùng tên vẫn có thể là hai người; dùng hai thiết bị hoặc xóa dữ liệu trình duyệt có thể tạo hai đăng ký. Host kiểm tra tên trùng trước khi chốt. Không dùng chung một trình duyệt để đăng ký thay nhiều người.

## Phạm vi menu và giá

[`dist/assets/drinks/koi-menu.json`](../dist/assets/drinks/koi-menu.json) lưu 88 tên món, 177 lựa chọn cỡ/nhiệt độ đang thấy trên [menu Grab cửa hàng bạn gửi](https://food.grab.com/vn/vi/restaurant/koi-th%C3%A9-trung-h%C3%B2a-delivery/5-C8BJVKKJFCLTE2), kiểm tra ngày **16/10/2026**. Không đưa quyền lợi thành viên riêng hoặc món đang không cho chọn vào danh sách. Website Grab có thể hiển thị ít món hơn ứng dụng và menu này không tự đồng bộ theo thời gian thực.

Giá là giá tham khảo của từng biến thể, chưa gồm phí giao hàng, khuyến mãi hoặc topping thêm. Đường/đá là yêu cầu gửi cho host; các tùy chọn chi tiết của Grab yêu cầu đăng nhập nên không coi chúng là cam kết của quán. Topping thêm ghi ở ô ghi chú, không tự cộng một mức giá chưa xác minh.

Khi cập nhật menu, đổi `version`, chạy:

```sh
npm run prepare:drinks
npm test
npm run check:drinks
npm run check:pages
```

Sau đó cập nhật lại `Code.gs` trên Google và phát hành phiên bản deployment mới, đồng thời deploy lại website. Client và server cùng kiểm tra `menuVersion`; gửi từ menu cũ bị từ chối để tránh nhận sai món/giá. `eventId` trong cấu hình web phải trùng Script Property **EVENT_ID**. Một đợt đăng ký mới cần đổi cả hai; không tự đổi ID giữa đợt.

## Khi mạng yếu hoặc người xem muốn đổi ly

- Chỉ hiện “Đã ghi nhận” sau khi nhận đúng mã xác nhận từ Google Sheets. POST trả response không đọc được không đủ để coi là gửi thành công.
- Trong lúc chưa xác nhận, lựa chọn và mã gửi được giữ trong `localStorage`. Bấm thử lại hoặc tải lại trang dùng lại đúng mã, không tạo thêm ly. Không cho sửa một lần gửi còn đang chờ.
- Có thể tiếp tục hành trình trong lúc chờ; giao diện và kỷ vật ghi rõ chưa xác nhận. Việc đi tiếp không hủy một yêu cầu có thể đã tới Google.
- Khi đã được nhận, nút **Ly nước của tôi** cho mở lại và cập nhật. Mỗi lần gửi mới thay dòng của trình duyệt đó, không thêm số ly. Thay đổi lựa chọn không làm tăng bộ đếm kỷ vật.
- Nếu chọn đi tiếp khi còn thay đổi chưa gửi, vẫn giữ ly đã đăng ký trước đó. Chức năng tự hủy đăng ký chưa có; host có thể chốt rồi chỉnh bảng nếu cần hủy.

## Dữ liệu và kiểm tra

Google Sheets chứa tên nhận nước và lựa chọn; web không có API đọc danh sách cả team. Điểm đọc công khai chỉ trả trạng thái theo mã gửi ngẫu nhiên, không trả tên hoặc ghi chú. Server dùng menu riêng để kiểm tra món/giá, khóa khi ghi để tránh tranh chấp, và xử lý tên/ghi chú bắt đầu bằng công thức như văn bản.

Apps Script trả receipt bằng [Content Service / JSONP](https://developers.google.com/apps-script/guides/content) để đọc được xác nhận từ web GitHub Pages. Receipt không chứa dữ liệu cá nhân; không dùng JSONP cho danh sách đăng ký.

Kiểm thử backend dùng bản mô phỏng API SpreadsheetApp chạy chính file `Code.gs`, cùng E2E hai trình duyệt lưu riêng. **Chưa kiểm tra end-to-end trên một Google Sheet thật** cho tới khi host triển khai và gửi URL `/exec`.
