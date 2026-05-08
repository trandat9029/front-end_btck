# 📋 Quy trình End-to-End: Danh sách Nhân viên (Full List Flow)

Tài liệu này mô tả chi tiết cách hệ thống xử lý tìm kiếm, phân trang và sắp xếp, bắt đầu từ lúc đăng nhập cho đến khi điều hướng giữa các màn hình.

---

## GIAI ĐOẠN 0: KHỞI ĐẦU & ĐIỀU HƯỚNG (Entry Points)

1.  **Từ ADM001 (Login)**:
    *   Người dùng đăng nhập thành công.
    *   *Dòng 82 (useLogin.ts)*: Hệ thống lưu Token và điều hướng sang trang chủ (ADM002).
2.  **Từ ADM003 (Detail - Xem chi tiết/Xóa)**:
    *   **Case 1: Xóa nhân viên**: 
        *   Người dùng nhấn "Xóa" và xác nhận. 
        *   *Dòng 245 (useADM003.ts)*: Gọi API xóa thành công, chuyển hướng sang ADM006 thông báo hoàn tất.
        *   Từ ADM006, người dùng nhấn "Quay lại danh sách" -> Về ADM002 (Danh sách đã được cập nhật mới).
    *   **Case 2: Nhấn nút Back**:
        *   *Dòng 310 (useADM003.ts)*: Hàm `handleBack` thực hiện quay lại màn hình trước đó.
        *   **Quan trọng**: URL chứa các tham số tìm kiếm (name, departmentId, sort...) được bảo toàn, giúp ADM002 hiển thị đúng kết quả người dùng đang xem dở.

---

## GIAI ĐOẠN 1: GIAO DIỆN & TƯƠNG TÁC (FE - ADM002)

1.  **Đồng bộ URL & State**:
    *   *FE Dòng 290 (useADM002.ts)*: `useEffect` nạp tiêu chí tìm kiếm từ URL vào State khi trang vừa tải.
2.  **Hành động Tìm kiếm/Sắp xếp/Phân trang**:
    *   Người dùng thay đổi tiêu chí hoặc click vào tiêu đề bảng để sắp xếp.
    *   *FE Dòng 111*: Gọi API `getEmployees` (GET) kèm các tham số: `name`, `departmentId`, `ordEmployeeName`, `ordCertificationName`, `offset`, `limit`.

---

## GIAI ĐOẠN 2: XỬ LÝ & VALIDATE TẠI BACKEND (BE)

1.  **Tiếp nhận tại Controller**:
    *   *BE Dòng 58*: `EmployeeController.getEmployees` tiếp nhận request.
2.  **Validate tham số**:
    *   *BE Dòng 384*: Gọi `validateEmployeeList` kiểm tra an toàn dữ liệu.
3.  **Thực thi nghiệp vụ (`EmployeeServiceImpl.java`)**:
    *   *BE Dòng 70*: Lấy tổng số bản ghi để tính toán phân trang.
    *   *BE Dòng 97*: Sử dụng `escapeLike` để chống SQL Injection.
    *   *BE Dòng 107-109*: Xây dựng logic sắp xếp động phức tạp.
4.  **Truy vấn Database**:
    *   Thực hiện `JOIN` các bảng `employees`, `departments`, `certifications` để lấy dữ liệu tối ưu trong 1 lần query.

---

## GIAI ĐOẠN 3: HIỂN THỊ KẾT QUẢ

1.  **Render**: 
    *   Dữ liệu được hiển thị lên bảng `EmployeeTable`.
    *   Thanh phân trang hiển thị tối đa 5 số trang gần nhất để người dùng dễ thao tác.

---
*Tài liệu quy trình Full-Stack được biên soạn bởi **tranledat** vào ngày 08/05/2026.*
