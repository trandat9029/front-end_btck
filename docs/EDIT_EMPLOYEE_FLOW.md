# 🛠️ Quy trình End-to-End: Chỉnh sửa Nhân viên (ADM004 Edit Flow)

Tài liệu này mô tả chi tiết luồng dữ liệu cập nhật từ lúc lấy thông tin cũ, chỉnh sửa, xác nhận cho đến khi lưu thay đổi vào Database.

---

## GIAI ĐOẠN 0: ĐIỀU HƯỚNG VÀO ADM004 (Edit Mode)

- Từ ADM003 (Chi tiết nhân viên), nhấn nút **編集 (Chỉnh sửa)**.
- *`useADM003.ts` > `handleEditClick`*: Điều hướng sang `ADM004?id={employeeId}&mode=edit&{returnQueryString}`.

---

## GIAI ĐOẠN 1: NẠP DỮ LIỆU & CHỈNH SỬA (ADM004)

### Hook: `useADM004.ts` – Chế độ EDIT

| Bước | Phương thức | Mô tả |
|---|---|---|
| Phát hiện chế độ | `mode = id ? EDIT : ADD` | Nếu URL có `?id=...` → chế độ EDIT |
| Nạp Master Data | `Promise.all([getDepartments, getCertifications])` | Nạp danh sách phòng ban & chứng chỉ cho dropdown |
| Nạp dữ liệu cũ | `fetchEmployeeDetail(id)` | Gọi `employeeApi.getEmployeeById(id)` để hiển thị thông tin hiện tại lên form |
| Quay lại từ ADM005 | `isBack = true` | Nạp lại từ `sessionStorage` thay vì gọi API |
| Nhập liệu | `handleInputChange` | Cập nhật và validate theo thời gian thực |
| Đổi chứng chỉ | `handleInputChange` (`certificationId`, `value !== ''`) | Reset ngày tháng và điểm khi đổi chứng chỉ mới |
| Ẩn trường mật khẩu | Logic trong `EmployeeInputForm` | Trường mật khẩu được hiển thị nhưng không bắt buộc ở Edit mode |
| Nhấn Xác nhận | `handleConfirmClick` | Gọi API `validateEmployee` (BE) với `action=edit` |

### API: `GET /employee/{id}`
### Controller: `EmployeeController.java` – `getEmployeeDetailById` (dòng 154)
### Service: `EmployeeServiceImpl.java` – `getEmployeeDetailById` (dòng 195)

- Tìm nhân viên theo ID, ném `ER013` nếu không tồn tại.
- Nạp thêm tên phòng ban và danh sách chứng chỉ liên kết.

---

## GIAI ĐOẠN 2: VALIDATE TẠI BACKEND (BE)

### API: `POST /employee/validate?action=edit`
### Controller: `EmployeeController.java` – `validateEmployee` (dòng 97)

Lớp `EmployeeValidate.java` – Hàm `validateForSubmit` (dòng 100):

| Kiểm tra | Mô tả |
|---|---|
| `employeeId != null` | Bắt buộc phải có ID (`ER001`) |
| `employeeRepository.existsById(id)` | ID phải tồn tại trong DB (`ER013`) |

Nếu hợp lệ → Trả về HTTP 200. FE lưu dữ liệu vào `sessionStorage` và chuyển sang ADM005.

---

## GIAI ĐOẠN 3: XÁC NHẬN & CẬP NHẬT (ADM005 → BE)

### Hook: `useADM005.ts` – `handleSubmitClick`

1. Đọc dữ liệu từ `sessionStorage`.
2. Ánh xạ ID → tên hiển thị (phòng ban, chứng chỉ).
3. Khi nhấn **OK**: Gọi `employeeApi.updateEmployee` → `PUT /employee`.

### API: `PUT /employee`
### Controller: `EmployeeController.java` – `updateEmployee` (dòng 188)

Luôn validate lại toàn bộ qua `validateForConfirm` → `validateEmployee`:

| Thứ tự | Kiểm tra đặc thù EDIT mode | Ghi chú |
|---|---|---|
| 1 | Tồn tại nhân viên (`existsById`) | `ER013` nếu ID không còn trong DB |
| 2 | `validateLoginId` | Loại trừ chính mình khi kiểm tra trùng lặp (`!existing.getEmployeeId().equals(request.getEmployeeId())`) |
| 3–8 | Các trường cá nhân | Tương tự Add mode |
| 9 | `validatePassword` | **Chỉ validate nếu người dùng nhập mật khẩu mới** (không bắt buộc) |
| 10 | `validateCertification` | Tương tự Add mode nếu có chứng chỉ |

### Service: `EmployeeServiceImpl.java` – `updateEmployee` (dòng 256)

- **`@Transactional`**: Đảm bảo toàn vẹn, rollback nếu lỗi.
- Tìm nhân viên theo ID (ném `ER013` nếu không tìm thấy).
- **Không cập nhật** `employeeLoginId` (Login ID cố định sau khi tạo).
- **Chỉ cập nhật mật khẩu** nếu field password không rỗng → mã hóa bằng `BCrypt`.
- `deleteAllByEmployeeId`: Xóa toàn bộ chứng chỉ cũ trước khi lưu mới (chiến lược Delete-and-Insert).
- Lưu chứng chỉ mới vào `employees_certifications` nếu có.

---

## GIAI ĐOẠN 4: HOÀN TẤT (ADM006)

1. **Dọn dẹp**: `clearEmployeeFormDataStorage()` xóa dữ liệu tạm.
2. **Thông báo**: Điều hướng sang ADM006 kèm thông báo `MSG002` (cập nhật thành công).
3. **Quay lại**: Người dùng nhấn "Quay lại danh sách" → Về ADM002.

---

*Tài liệu quy trình Full-Stack – Cập nhật lần cuối bởi **tranledat** ngày 10/05/2026.*
