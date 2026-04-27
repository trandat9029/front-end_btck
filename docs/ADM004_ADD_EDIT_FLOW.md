# Tài liệu phân luồng `ADM004` (Add/Edit dùng chung màn hình)

## 1. Mục tiêu

Tài liệu này chuẩn hóa cách phân luồng `Add` và `Edit` cho màn hình `ADM004`, bao gồm điều hướng sang `ADM005` (Confirm) và `ADM006` (Complete), để FE implement đúng đặc tả trong `TKMH.xlsx`.

## 2. Quy tắc xác định mode của `ADM004`

1. Có `employeeId` trong router state => mode `Edit`.
2. Không có `employeeId` => mode `Add`.
3. Nếu quay lại từ `ADM005` và có `formData` thì ưu tiên bind lại `formData` thay vì gọi lại dữ liệu người dùng đã nhập.

## 3. Router contract đề xuất

```ts
type Adm004State = {
  mode: "add" | "edit";
  employeeId?: number; // bắt buộc khi mode=edit
  formData?: EmployeeFormData; // dùng khi quay lại từ ADM005
  returnToListQuery?: string; // giữ page/filter/sort khi quay về ADM002
};

type Adm005State = {
  mode: "add" | "edit";
  employeeId?: number; // có khi edit
  formData: EmployeeFormData; // luôn có
  returnToListQuery?: string;
};
```

## 4. Flow `Add`

1. `ADM002` click Add -> điều hướng `ADM004` (không có `employeeId`).
2. `ADM004` xác định mode `Add`.
3. Gọi API list departments + list certifications để bind dropdown (có option rỗng đầu tiên).
4. Khởi tạo form rỗng.
5. Validate realtime khi user nhập.
6. Password/Re-password ở `Add`: bắt buộc nhập và validate đầy đủ.
7. Click `Cancel` ở `ADM004` -> quay về `ADM002`, giữ trạng thái page/filter/sort trước đó.
8. Click `Confirm`, nếu có lỗi thì hiển thị lỗi tại field/global.
9. Nếu không lỗi -> sang `ADM005`, truyền toàn bộ `formData` (không có `employeeId`).
10. `ADM005` click `OK` -> gọi API Add (`POST /employee`).
11. Thành công -> `ADM006` hiển thị `MSG001`, click `OK` về `ADM002`.

## 5. Flow `Edit`

1. `ADM003` click Edit -> điều hướng `ADM004` kèm `employeeId` (không để ID trên URL theo spec).
2. `ADM004` xác định mode `Edit`.
3. Gọi API list departments + list certifications để bind dropdown.
4. Nếu không phải luồng quay về từ `ADM005`, gọi API Get employee theo `employeeId`.
5. API Get employee lỗi/không tồn tại -> chuyển `System Error`.
6. API Get employee thành công -> bind dữ liệu lên form.
7. Password/Re-password ở `Edit`: ban đầu để trống, chỉ validate khi user có nhập.
8. Click `Cancel` ở `ADM004` -> quay lại `ADM003` (kèm `employeeId`).
9. Click `Confirm`, nếu không lỗi -> sang `ADM005`, truyền `formData` + `employeeId`.
10. `ADM005` click `OK` -> gọi API Update (`PUT /employee`).
11. Thành công -> `ADM006` hiển thị `MSG002`, click `OK` về `ADM002`.

## 6. Rule chung cho phần chứng chỉ tiếng Nhật (áp dụng Add/Edit)

1. Khi chưa chọn chứng chỉ (dropdown rỗng): disable 3 field `startDate`, `endDate`, `score`, đồng thời clear value + clear lỗi.
2. Khi chọn chứng chỉ khác rỗng: enable 3 field trên.
3. Khi có chứng chỉ thì 3 field trên trở thành required theo rule validate tương ứng.
4. `endDate` phải lớn hơn `startDate`.

## 7. Khác biệt validate chính giữa Add và Edit

| Hạng mục          | Add                  | Edit                                   |
| ----------------- | -------------------- | -------------------------------------- |
| Dữ liệu khởi tạo  | Rỗng                 | Lấy từ API Get employee                |
| Password          | Bắt buộc             | Không bắt buộc (chỉ validate khi nhập) |
| Re-password       | Bắt buộc + phải khớp | Chỉ check khớp khi có nhập password    |
| Cancel ở ADM004   | Về ADM002            | Về ADM003                              |
| API tại ADM005/OK | POST `/employee`     | PUT `/employee`                        |
| Message Complete  | `MSG001`             | `MSG002`                               |

## 8. API liên quan

1. List departments: `GET /department`
2. List certifications: `GET /certification`
3. Get employee: `GET /employee/:id`
4. Add employee: `POST /employee`
5. Update employee: `PUT /employee`

## 9. Mapping nhanh giữa màn hình

1. `ADM002` -> `ADM004` (Add)
2. `ADM003` -> `ADM004` (Edit)
3. `ADM004` -> `ADM005` (Confirm)
4. `ADM005` -> `ADM004` (Cancel, trả lại data đã nhập)
5. `ADM005` -> `ADM006` (OK thành công)
6. `ADM006` -> `ADM002` (OK)

## 10. Nguồn đặc tả trong `TKMH.xlsx`

1. Sheet `Chi tiết xử lý`: mục `3.6`, `4.3`, `5.1`, `5.2`, `5.3`, `5.4`, `6.1`, `6.2`, `6.3`, `7.1`
2. Sheet `Định nghĩa hạng mục`: section `ADM004`, `ADM005`, `ADM006`
3. Sheet `Layout MH`: note `ADM004/ADM005/ADM006`
4. Sheet `API sử dụng`: dòng API Add/Edit/Get/List liên quan employee
