# Sửa nhóm ly trống trong Tổng hợp

Bản web đã tách lựa chọn theo người và bỏ nút bỏ qua. Bộ tổng hợp trên Google cần cập nhật riêng để bỏ qua dòng trống/không có món hợp lệ. Thao tác này giữ nguyên dữ liệu gốc, Sheet ID, event ID và URL /exec.

1. Mở dự án Apps Script đang gắn với bảng Order 20/10.
2. Thay nội dung Code.gs bằng toàn bộ file [Code.gs](../integrations/google-sheets/Code.gs) trong repo. Không tạo script hoặc Sheet mới.
3. Lưu, chọn hàm `rebuildKoiSummary` → Chạy. Nhóm trống sẽ không còn được tính; các ly hợp lệ vẫn giữ lại.
4. Chọn **Deploy → Manage deployments → Edit (bút chì) → Version: New version → Deploy** cho deployment đang dùng. Giữ nguyên URL /exec hiện tại để mọi lần đăng ký tiếp theo dùng bộ tổng hợp mới.
5. Mở tab Tổng hợp để kiểm tra, đối chiếu các dòng có tên/món hợp lệ trong tab Đăng ký. Không xóa các dòng nguồn trống trước khi kiểm tra.

Nếu Sheet có cập nhật mới trong lúc sửa, tổng ly có thể khác ảnh kiểm tra ban đầu. Hãy đối chiếu theo các đơn hiện tại, không cố định tổng về 1.
