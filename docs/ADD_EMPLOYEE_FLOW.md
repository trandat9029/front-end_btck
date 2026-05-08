# 🚀 Quy trình Chức năng Thêm mới Nhân viên (Add Employee Flow)

Tài liệu này mô tả chi tiết luồng đi của dữ liệu và thứ tự gọi các hàm, kèm theo số dòng tham chiếu trong file `useADM004.ts`.

---

## 1. Khởi đầu: Từ màn hình Danh sách (ADM002)
*   **Hành động**: Người dùng nhấn nút **"Đăng ký" (Add)**.
*   **Sự kiện**: Router thực hiện điều hướng sang URL: `/employees/adm004`.
*   **Trạng thái**: Lúc này URL không có tham số `id`, hệ thống tự hiểu là chế độ **ADD**.

---

## 2. Giai đoạn tại màn hình Nhập liệu (ADM004)

### Bước A: Khởi tạo trang (Initialization)
Khi trang ADM004 vừa load, Hook `useADM004` sẽ chạy:
1.  **Xác định Mode**: Kiểm tra URL Search Params. 
    *   *Dòng 50*: Lấy `id` từ URL.
    *   *Dòng 51*: `const mode = employeeId ? EDIT : ADD;` -> Xác định là chế độ **ADD**.
2.  **Chạy `useEffect`**: 
    *   *Dòng 101*: Hook `useEffect` bắt đầu chạy.
    *   *Dòng 102*: Khai báo hàm bất đồng bộ `initializePage()`.
    *   *Dòng 209*: Lệnh gọi thực thi `void initializePage()`.
3.  **Lấy Master Data**:
    *   *Dòng 114 - 117*: Gọi đồng thời API lấy Phòng ban & Chứng chỉ bằng `Promise.all`.
4.  **Khởi tạo Dữ liệu**:
    *   *Dòng 138*: `initialData` được khởi tạo là bộ dữ liệu trống (`createEmptyEmployeeFormData`).
    *   *Dòng 181*: (Trường hợp 3) Giữ nguyên dữ liệu trống cho chế độ ADD.
5.  **Nạp dữ liệu vào Form**:
    *   *Dòng 202*: `reset(initialData)` -> Nạp dữ liệu vào các ô input của thư viện Form.
6.  **Sẵn sàng hiển thị (UI)**:
    *   *Dòng 204*: `setIsDataReady(true)` -> Bật flag cho phép render giao diện.

### Bước B: Người dùng nhập liệu (User Interaction)
1.  **Thay đổi giá trị**:
    *   *Dòng 301*: Hàm `handleFieldChange` cập nhật giá trị khi người dùng gõ phím.
2.  **Rời ô nhập liệu (Blur)**:
    *   *Dòng 310*: Hàm `handleFieldBlur` kích hoạt validate tại chỗ (Zod).

### Bước C: Nhấn nút "Xác nhận" (Confirm)
1.  **Kích hoạt Submit**: 
    *   *Dòng 326*: Hàm `handleConfirm` được gọi.
2.  **Kiểm tra Backend**:
    *   *Dòng 332*: Gọi API `employeeApi.validateEmployee` để kiểm tra nghiệp vụ trên Server.
3.  **Lưu tạm và Điều hướng**:
    *   *Dòng 336*: Nếu thành công, gọi `saveFormData()` để lưu vào Storage.
    *   *Dòng 337*: `router.push(ROUTES.ADM005)` -> Chuyển sang màn hình xác nhận.

---

## 3. Giai đoạn tại màn hình Xác nhận (ADM005)
*   **Nhấn "Back"**: Quay lại ADM004 kèm tham số `?mode=back`.
*   **Logic khôi phục (Dòng 150)**: `useADM004` kiểm tra điều kiện `isBack`, nếu đúng sẽ lấy lại dữ liệu từ Storage nạp vào Form thay vì dùng bộ dữ liệu trống.

---
*Tài liệu được cập nhật bởi **tranledat** với tham chiếu code thực tế.*
