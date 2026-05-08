# 🚀 Quy trình End-to-End: Thêm mới Nhân viên (Full Add Flow)

Tài liệu này mô tả chi tiết luồng dữ liệu xuyên suốt từ giao diện người dùng (FE), qua các bước xác nhận, đến logic xử lý lưu trữ tại máy chủ (BE).

---

## GIAI ĐOẠN 1: NHẬP LIỆU (ADM004)

1.  **Khởi tạo (Initialization)**:
    *   Hook `useADM004` nạp dữ liệu trống và sẵn sàng hiển thị.
2.  **Tương tác & Validate tại chỗ (Local Validation)**:
    *   Người dùng nhập liệu. Zod Schema thực hiện validate định dạng.
3.  **Xác nhận bước 1 (Confirm Input)**:
    *   *FE Dòng 381*: `handleConfirm` được kích hoạt.
    *   *FE Dòng 387*: Gọi API `validateEmployee` (Backend) với `mode=CONFIRM`. 

---

## GIAI ĐOẠN 2: CHI TIẾT QUY TRÌNH VALIDATE (BACKEND)

Khi Backend nhận yêu cầu, lớp `EmployeeValidate.java` thực hiện kiểm tra:

1.  **Điều phối chung**: *BE Dòng 109* (`validateForConfirm`) gọi hàm validate tổng quát.
2.  **Kiểm tra Login ID**:
    *   *BE Dòng 178*: Hàm `validateLoginId` kiểm tra định dạng và độ dài.
    *   *BE Dòng 190*: Truy vấn Database kiểm tra tính duy nhất (`ER003`).
3.  **Kiểm tra Phòng ban**:
    *   *BE Dòng 205*: Hàm `validateDepartment` kiểm tra ID có tồn tại trong hệ thống không (`ER004`).
4.  **Kiểm tra Chứng chỉ**:
    *   *BE Dòng 330*: Hàm `validateCertification` kiểm tra logic ngày tháng.
    *   *BE Dòng 361*: So sánh ngày bắt đầu/kết thúc (`ER012`).

---

## GIAI ĐOẠN 3: XÁC NHẬN & LƯU TRỮ (ADM005 -> BE)

1.  **Xác nhận tại ADM005**:
    *   *FE Dòng 121*: Hàm `handleSubmit` được gọi khi nhấn "Đăng ký".
    *   *FE Dòng 132*: Gọi API `addEmployee` (POST).
2.  **Xử lý tại Controller**:
    *   *BE Dòng 96*: `EmployeeController` tiếp nhận request.
    *   *BE Dòng 112*: Gọi Service để thực hiện lưu trữ.
3.  **Xử lý tại Service (`EmployeeServiceImpl.java`)**:
    *   *BE Dòng 125*: `@Transactional` đảm bảo an toàn dữ liệu.
    *   *BE Dòng 138*: Mã hóa mật khẩu bằng `BCrypt`.
    *   *BE Dòng 141*: Lưu nhân viên vào bảng `employees`.
    *   *BE Dòng 152*: Lưu chứng chỉ vào bảng `employees_certifications`.

---

## GIAI ĐOẠN 4: HOÀN TẤT (ADM006)

1.  **Dọn dẹp**: *FE Dòng 135* gọi `clearEmployeeFormDataStorage()` xóa sạch dữ liệu tạm.
2.  **Thông báo**: *FE Dòng 138* điều hướng về màn hình hoàn tất kèm thông báo thành công.

---
*Tài liệu quy trình Full-Stack được biên soạn bởi **tranledat** vào ngày 08/05/2026.*
