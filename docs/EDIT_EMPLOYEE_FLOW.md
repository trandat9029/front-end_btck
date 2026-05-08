# 🛠️ Quy trình End-to-End: Chỉnh sửa Nhân viên (Full Edit Flow)

Tài liệu này mô tả chi tiết luồng dữ liệu cập nhật từ lúc lấy thông tin cũ, chỉnh sửa, xác nhận cho đến khi lưu thay đổi vào Database.

---

## GIAI ĐOẠN 1: LẤY DỮ LIỆU & CHỈNH SỬA (ADM004)

1.  **Nạp dữ liệu cũ (Fetch Detail)**:
    *   *FE Dòng 158*: Gọi API `getEmployeeById` để hiển thị dữ liệu lên form.
    *   *BE Dòng 162*: `EmployeeController` xử lý request lấy chi tiết.
    *   *BE Dòng 171*: `EmployeeServiceImpl` truy vấn SQL qua `findDetailById`.
2.  **Xác nhận bước 1**:
    *   *FE Dòng 387*: Gọi API `validateEmployee` (Backend) kiểm tra logic.

---

## GIAI ĐOẠN 2: CHI TIẾT QUY TRÌNH VALIDATE (BACKEND)

Lớp `EmployeeValidate.java` xử lý logic đặc thù cho trường hợp Edit:

1.  **Kiểm tra sự tồn tại**: *BE Dòng 124* kiểm tra ID có tồn tại trong DB không (`ER013`).
2.  **Kiểm tra Login ID**:
    *   *BE Dòng 192*: Logic loại trừ chính mình khi kiểm tra trùng lặp (`existingEmployee.get().getEmployeeId().equals(request.getEmployeeId())`).
3.  **Kiểm tra mật khẩu**:
    *   *BE Dòng 158*: Chỉ thực hiện validate độ dài **nếu người dùng có nhập mật khẩu mới**.

---

## GIAI ĐOẠN 3: XÁC NHẬN & CẬP NHẬT (ADM005 -> BE)

1.  **Cập nhật chính thức**:
    *   *FE Dòng 131*: Gọi API `updateEmployee` (PUT).
2.  **Xử lý tại Controller**:
    *   *BE Dòng 198*: Tiếp nhận request cập nhật (PUT).
3.  **Xử lý tại Service (`EmployeeServiceImpl.java`)**:
    *   *BE Dòng 233*: `@Transactional` bảo vệ tính toàn vẹn.
    *   *BE Dòng 250*: Chỉ mã hóa và lưu nếu password mới khác null.
    *   *BE Dòng 255*: **Xóa toàn bộ chứng chỉ cũ** qua `deleteAllByEmployeeId`.
    *   *BE Dòng 257-267*: Lưu chứng chỉ mới vào Database.

---

## GIAI ĐOẠN 4: HOÀN TẤT

1.  **Thông báo**: Chuyển về màn hình ADM006 với thông báo thành công `MSG002`.

---
*Tài liệu quy trình Full-Stack được biên soạn bởi **tranledat** vào ngày 08/05/2026.*
