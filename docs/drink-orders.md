# Quầy KOI và bảng tổng hợp đặt nước

Trạm cà phê dùng menu **KOI Thé · Trung Hòa** do host đưa sẵn vào repo. Người xem chọn món, cỡ ly, tên nhận nước, đường/đá và ghi chú. Google Sheets giữ danh sách và tổng hợp để host tự đặt nước trên Grab.

**Đã bật nhận đăng ký:** host chạy `setupKoiOrders` ngày 16/10/2026; bảng Order 20/10 có hai tab Đăng ký/Tổng hợp, endpoint nhận đúng mã đợt `team-2010-2026`. URL `/exec` đã được điền trong `dist/assets/drinks/order-config.json` với `enabled: true`. Nút **Gửi lựa chọn cho host** hiện ở bản xem KOI; khi sửa một ly đã được nhận, nút đổi thành **Cập nhật lựa chọn**.

Quầy có nút **Menu full ở đây** để xem ảnh KOI do host cung cấp, phóng to/thu nhỏ, kéo hoặc vuốt và mở ảnh gốc. Đóng bằng nút quay lại hoặc Escape vẫn giữ nguyên món, cỡ ly và ghi chú. Ảnh này là tham khảo; menu đặt nước và giá gửi lên Sheet vẫn lấy từ danh mục đã kiểm tra.

Giao diện chọn món, cỡ ly và xác nhận không hiện giá hay tổng tiền, kèm lời mời **“Gu của bạn, team bao. Chọn món mình mê, hôm nay cứ để được chiều!”**. Giá trong ảnh menu được giữ nguyên theo yêu cầu của host. Danh mục và Apps Script vẫn giữ giá tham khảo để host xem chi phí trong Sheet.

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

Mỗi người trong danh sách tên có mã riêng trong trình duyệt. Chọn sang người khác mở một lựa chọn trống; quay lại đúng người chỉ khôi phục ly của người đó. Sửa biệt danh check-in vẫn giữ tên nhận nước theo danh sách. Khách nhập tên ngoài danh sách có mã riêng và giữ mã khi sửa biệt danh. Đây chưa phải đăng nhập: dùng hai thiết bị hoặc xóa dữ liệu trình duyệt vẫn có thể tạo hai đăng ký. Host kiểm tra tên trùng trước khi chốt. Đơn cũ của trình duyệt chỉ được chuyển sang hồ sơ có tên trùng và chỉ một hồ sơ được nhận mã cũ; dữ liệu đã nằm trong Sheet không bị tự sửa/xóa.

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
- Khi đã được nhận, nút **Ly nước của tôi** cho mở lại và cập nhật. Mỗi lần gửi mới thay dòng của đúng hồ sơ trên trình duyệt đó, không thêm số ly. Thay đổi lựa chọn không làm tăng bộ đếm kỷ vật.
- Quầy không tự chọn món, không tạo đơn khi mở hoặc đổi tên, và không có nút bỏ qua để tự sinh một ly mặc định. Khi kết nối Sheet đang bật, chỉ được đi tiếp với lựa chọn đã được xác nhận; lần gửi đang chờ phải kiểm tra lại. Chức năng tự hủy đăng ký chưa có; host có thể chốt rồi chỉnh bảng nếu cần hủy.

## Dữ liệu và kiểm tra

Google Sheets chứa tên nhận nước và lựa chọn; web không có API đọc danh sách cả team. Điểm đọc công khai chỉ trả trạng thái theo mã gửi ngẫu nhiên, không trả tên hoặc ghi chú. Server dùng menu riêng để kiểm tra món/giá, khóa khi ghi để tránh tranh chấp, và xử lý tên/ghi chú bắt đầu bằng công thức như văn bản.

Apps Script trả receipt bằng [Content Service / JSONP](https://developers.google.com/apps-script/guides/content) để đọc được xác nhận từ web GitHub Pages. Receipt không chứa dữ liệu cá nhân; không dùng JSONP cho danh sách đăng ký.

Kiểm thử backend dùng bản mô phỏng API SpreadsheetApp chạy chính file `Code.gs`, cùng E2E hai trình duyệt lưu riêng. Kiểm tra dịch vụ Google thật xác nhận endpoint công khai, mã đợt và đường POST/JSONP bằng yêu cầu sai phiên bản menu có chủ đích; yêu cầu bị từ chối trước bước ghi, không tạo ly thử trong bảng. Lần đăng ký món thật đầu tiên cần đối chiếu thông báo **Đã ghi nhận 1 ly** với dòng trong tab **Đăng ký** và số ly trong **Tổng hợp**.
