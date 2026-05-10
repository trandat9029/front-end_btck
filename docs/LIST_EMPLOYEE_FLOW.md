# 📋 Quy trình End-to-End: Danh sách Nhân viên (ADM002 Full Flow)

Tài liệu này mô tả chi tiết cách hệ thống xử lý tìm kiếm, phân trang và sắp xếp danh sách nhân viên, từ lúc đăng nhập cho đến khi điều hướng giữa các màn hình.

---

## GIAI ĐOẠN 0: KHỞI ĐẦU & ĐIỀU HƯỚNG (Entry Points)

1. **Từ ADM001 (Login)**:
   - Người dùng đăng nhập thành công.
   - Token được lưu vào `localStorage`, hệ thống điều hướng sang ADM002.

2. **Từ ADM003 (Chi tiết / Xóa nhân viên)**:
   - **Case 1 – Xóa nhân viên**:
     - *`useADM003.ts` > `handleDeleteClick`*: Sau khi xóa thành công, chuyển hướng sang ADM006 kèm thông báo thành công.
     - Từ ADM006, người dùng nhấn "Quay lại" → Về ADM002 (danh sách đã cập nhật mới).
   - **Case 2 – Nhấn nút Back**:
     - *`useADM003.ts` > `handleBackClick`*: Quay lại ADM002 với `returnQueryString` (URL chứa các tham số tìm kiếm cũ: name, departmentId, sort...) được bảo toàn.

---

## GIAI ĐOẠN 1: GIAO DIỆN & TƯƠNG TÁC (FE – ADM002)

### Hook: `useADM002.ts`

| Điểm quan trọng | Vị trí | Mô tả |
|---|---|---|
| Khởi tạo State từ URL | `employeeParams` (useState) | Đọc query string hiện tại, khởi tạo tên, phòng ban, trang, sort |
| Nạp dữ liệu ban đầu | `useEffect` (gọi `loadInitialData`) | Mount lần đầu: nạp danh sách phòng ban + danh sách nhân viên |
| Tìm kiếm / Sắp xếp / Phân trang | `handleExecuteSearch` | Điều phối cập nhật state, đồng bộ URL và gọi API |
| Đồng bộ URL | `updateUrlFromEmployeeParams` | Phản ánh state tìm kiếm lên thanh địa chỉ trình duyệt |
| Gọi API lấy nhân viên | `fetchEmployeeList` | Gọi `employeeApi.getEmployees` với đầy đủ tham số lọc và phân trang |
| Tính phân trang | `visiblePages` (useMemo) | Sliding window hiển thị tối đa 5 nút trang gần nhất |

---

## GIAI ĐOẠN 2: XỬ LÝ TẠI BACKEND (BE)

### Controller: `EmployeeController.java` – `getEmployees` (dòng 59)

1. **Validate tham số** (dòng 61–64):
   - `employeeValidator.validateEmployeeList` kiểm tra sort order (`ASC`/`DESC`) và giá trị phân trang hợp lệ.
   - Nếu sai → ném `BaseException` với mã `ER021`/`ER018`.

2. **Đếm tổng bản ghi** (dòng 67):
   - `employeeService.getTotalRecords(name, departmentId)` → trả về tổng số nhân viên thỏa điều kiện.

3. **Lấy danh sách** (dòng 70–80):
   - Nếu `total > 0`: Gọi `employeeService.getEmployees(...)` với đầy đủ tham số sort và phân trang.
   - Nếu `total = 0`: Trả về mảng rỗng.

### Service: `EmployeeServiceImpl.java`

| Bước | Phương thức | Mô tả |
|---|---|---|
| Escape ký tự đặc biệt | `CommonUtils.escapeLike` | Chuyển `%`, `_`, `\` thành `!%`, `!_`, `!\` trước khi đưa vào LIKE |
| Truy vấn tổng số | `EmployeeRepository.countEmployees` | Native SQL `COUNT` với `INNER JOIN departments`, lọc theo tên và phòng ban |
| Truy vấn danh sách | `EmployeeRepository.getEmployees` | Native SQL `SELECT` với `LEFT JOIN` certifications, sắp xếp động, `LIMIT`/`OFFSET` |
| Mapping kết quả | `mapToEmployeeDTO(Object[] row)` | Chuyển mảng Object từ Native Query sang `EmployeeDTO` (theo thứ tự cột 0–8) |

---

## GIAI ĐOẠN 3: HIỂN THỊ KẾT QUẢ (FE)

1. **Bảng dữ liệu**: Component `EmployeeTable` render danh sách nhân viên với các cột: ID, Tên, Sinh nhật, Email, SĐT, Tên chứng chỉ, Ngày hết hạn, Điểm.
2. **Phân trang**: Thanh phân trang hiển thị tối đa 5 số trang gần nhất theo logic sliding window.
3. **Điều hướng chi tiết**: Nhấn vào dòng nhân viên → Chuyển sang ADM003 kèm `id` và `returnQueryString`.

---

*Tài liệu quy trình Full-Stack – Cập nhật lần cuối bởi **tranledat** ngày 10/05/2026.*
