# 🚀 Quy trình End-to-End: Thêm mới Nhân viên (ADM004 Add Flow)

Tài liệu này mô tả chi tiết luồng dữ liệu xuyên suốt từ giao diện người dùng (FE), qua các bước xác nhận, đến logic xử lý lưu trữ tại máy chủ (BE).

---

## GIAI ĐOẠN 1: NHẬP LIỆU (ADM004)

### Hook: `useADM004.ts` – Chế độ ADD

| Bước | Phương thức | Mô tả |
|---|---|---|
| Khởi tạo | `initialize` (trong `useEffect`) | Nạp Master Data (phòng ban + chứng chỉ), reset form về trạng thái trống |
| Quay lại từ ADM005 | `isBack = true` | Nạp lại dữ liệu từ `sessionStorage` thay vì reset |
| Nhập liệu | `handleInputChange` | Cập nhật giá trị trường, kích hoạt validate Zod theo thời gian thực |
| Đổi chứng chỉ | `handleInputChange` (`field='certificationId'`, `value !== ''`) | Reset toàn bộ trường ngày và điểm khi đổi sang chứng chỉ khác |
| Bỏ chọn chứng chỉ | `handleInputChange` (`value === ''`) | Reset toàn bộ trường chứng chỉ và xóa lỗi liên quan |
| Nhấn Xác nhận | `handleConfirmClick` | Submit form: validate Zod cục bộ → gọi API `validateEmployee` (BE) |

---

## GIAI ĐOẠN 2: VALIDATE TẠI BACKEND (BE)

### API: `POST /employee/validate?action=add`
### Controller: `EmployeeController.java` – `validateEmployee` (dòng 97)

Lớp `EmployeeValidate.java` thực hiện theo cơ chế **Checklist Fail-fast** (dừng ngay tại lỗi đầu tiên):

| Thứ tự | Hàm validate | Kiểm tra |
|---|---|---|
| 1 | `validateForSubmit` (dòng 100) | Chỉ kiểm tra `employeeLoginId` (mode ADD) |
| 2 | `validateLoginId` (dòng 175) | Bắt buộc, ≤50 ký tự, đúng định dạng, không trùng lặp (`ER001`, `ER006`, `ER019`, `ER003`) |

Nếu hợp lệ → Trả về HTTP 200. FE lưu dữ liệu vào `sessionStorage` và chuyển sang ADM005.

---

## GIAI ĐOẠN 3: XÁC NHẬN & LƯU TRỮ (ADM005 → BE)

### Hook: `useADM005.ts` – `handleSubmitClick`

1. Đọc dữ liệu từ `sessionStorage` (đã lưu ở giai đoạn 2).
2. Ánh xạ `departmentId` → `departmentName`, `certificationId` → `certificationName` để hiển thị.
3. Khi nhấn **OK**: Gọi `employeeApi.addEmployee` → `POST /employee`.

### API: `POST /employee`
### Controller: `EmployeeController.java` – `addEmployee` (dòng 125)

Luôn validate lại toàn bộ trước khi lưu (gọi `validateForConfirm`):

| Thứ tự | Hàm validate | Kiểm tra |
|---|---|---|
| 1 | Tồn tại nhân viên (Edit mode) | Bỏ qua (Add mode) |
| 2 | `validateLoginId` | Đầy đủ như Giai đoạn 2 |
| 3 | `validateDepartment` (dòng 201) | Bắt buộc, ID tồn tại trong DB (`ER002`, `ER004`) |
| 4 | `validateEmployeeName` (dòng 223) | Bắt buộc, ≤125 ký tự (`ER001`, `ER006`) |
| 5 | `validateEmployeeNameKana` (dòng 239) | Bắt buộc, ≤125, phải là Katakana half-width (`ER001`, `ER006`, `ER009`) |
| 6 | `validateBirthDate` (dòng 257) | Bắt buộc, đúng định dạng `yyyy/MM/dd` (`ER001`, `ER005`) |
| 7 | `validateEmail` (dòng 273) | Bắt buộc, ≤125, đúng cú pháp email (`ER001`, `ER006`, `ER005`) |
| 8 | `validateTelephone` (dòng 291) | Bắt buộc, ≤50, chỉ ký tự half-width (`ER001`, `ER006`, `ER008`) |
| 9 | `validatePassword` (dòng 309) | Bắt buộc (Add mode), 8–50 ký tự (`ER001`, `ER007`) |
| 10 | `validateCertification` (dòng 325) | Nếu có chứng chỉ: kiểm tra tồn tại, ngày hợp lệ, end ≥ start, điểm dương ≤3 chữ số |

### Service: `EmployeeServiceImpl.java` – `addEmployee` (dòng 154)

- **`@Transactional`**: Đảm bảo toàn vẹn dữ liệu, rollback nếu có lỗi.
- Mã hóa mật khẩu bằng `BCrypt` trước khi lưu.
- Lưu nhân viên vào bảng `employees`.
- Nếu có chứng chỉ: Lưu vào bảng `employees_certifications`.

---

## GIAI ĐOẠN 4: HOÀN TẤT (ADM006)

1. **Dọn dẹp**: `clearEmployeeFormDataStorage()` xóa dữ liệu tạm khỏi `sessionStorage`.
2. **Thông báo**: Điều hướng sang ADM006 kèm thông báo `MSG001` (thêm mới thành công).
3. **Quay lại**: Người dùng nhấn "Quay lại danh sách" → Về ADM002.

---

*Tài liệu quy trình Full-Stack – Cập nhật lần cuối bởi **tranledat** ngày 10/05/2026.*
