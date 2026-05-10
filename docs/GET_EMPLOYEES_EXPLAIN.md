# 🔍 Luồng xử lý: getEmployees (Lấy danh sách nhân viên)

---

## 📌 Sơ đồ luồng (Flow Diagram)

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLIENT (Browser)                                                   │
│  GET /employee?employeeNameSearch=...&departmentIdFilter=...        │
│               &employeeNameSort=ASC&offset=0&limit=10               │
└───────────────────────┬─────────────────────────────────────────────┘
                        │ HTTP Request
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  [1] EmployeeController.java – dòng 62                              │
│  getEmployees(EmployeeListRequest employeeListRequest)              │
│                                                                     │
│  ① Validate tham số (dòng 64)                                       │
│     employeeValidator.validateEmployeeList(employeeListRequest)     │
│     → Kiểm tra sort order (ASC/DESC), offset, limit hợp lệ         │
│     → Nếu sai: throw BaseException (HTTP 500)                       │
│                                                                     │
│  ② Đếm tổng bản ghi (dòng 70)                                       │
│     employeeService.getTotalRecords(name, departmentId)             │
│                                                                     │
│  ③ Phân nhánh (dòng 72):                                            │
│     - total > 0 → Gọi getEmployees lấy danh sách                   │
│     - total = 0 → Trả mảng rỗng []                                  │
│                                                                     │
│  ④ Đặt kết quả (dòng 85–86):                                        │
│     response.setCode(200)                                           │
│     response.setTotalRecords(total)                                 │
└───────────────────────┬─────────────────────────────────────────────┘
                        │ gọi service
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  [2] EmployeeServiceImpl.java – dòng 64                             │
│  getTotalRecords(String employeeName, Long departmentId)            │
│                                                                     │
│  ① escapeLike(employeeName)                                         │
│     "50%"    → "50!%"    (% không còn là wildcard)                 │
│     "test_1" → "test!_1" (_ không còn là wildcard)                 │
│                                                                     │
│  ② employeeRepository.countEmployees(escapedName, departmentId)    │
│     → Trả về: Long (tổng số nhân viên thỏa điều kiện)              │
└───────────────────────┬─────────────────────────────────────────────┘
                        │ nếu total > 0
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  [3] EmployeeServiceImpl.java – dòng 82                             │
│  getEmployees(name, deptId, ordName, ordCert, ordDate,             │
│               offset, limit)                                        │
│                                                                     │
│  ① escapeLike(employeeName)   → chống wildcard                      │
│  ② pageSize   = limit  != null && > 0 ? limit  : 10 (DEFAULT)      │
│  ③ pageOffset = offset != null         ? offset : 0                 │
│                                                                     │
│  ④ employeeRepository.getEmployees(...)                             │
│     → Trả về: List<Object[]> (mảng thô từ SQL)                     │
│                                                                     │
│  ⑤ results.stream()                                                  │
│       .map(this::mapToEmployeeDTO)                                  │
│       .collect(Collectors.toList())                                 │
│     → Trả về: List<EmployeeDTO>                                     │
└───────────────────────┬─────────────────────────────────────────────┘
                        │ gọi repository
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  [4] EmployeeRepository.java – dòng 57                              │
│  @Query (Native SQL) getEmployees(...)                              │
│                                                                     │
│  SELECT                                                             │
│    e.employee_id,          ← Cột 0                                  │
│    e.employee_name,        ← Cột 1                                  │
│    e.employee_birth_date,  ← Cột 2                                  │
│    d.department_name,      ← Cột 3                                  │
│    e.employee_email,       ← Cột 4                                  │
│    e.employee_telephone,   ← Cột 5                                  │
│    c.certification_name,   ← Cột 6 (NULL nếu chưa có chứng chỉ)   │
│    ec.end_date,            ← Cột 7 (NULL nếu chưa có chứng chỉ)   │
│    ec.score                ← Cột 8 (NULL nếu chưa có chứng chỉ)   │
│  FROM employees e                                                   │
│    INNER JOIN departments d ...                                     │
│    LEFT JOIN employees_certifications ec ...                        │
│    LEFT JOIN certifications c ...                                   │
│  WHERE e.employee_login_id != 'admin'                               │
│    AND (name LIKE ... ESCAPE '!')                                   │
│    AND (departmentId = ...)                                         │
│  ORDER BY [sort động theo tham số]                                  │
│  LIMIT :limit OFFSET :offset                                        │
└───────────────────────┬─────────────────────────────────────────────┘
                        │ trả về List<Object[]>
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  [5] EmployeeServiceImpl.java – dòng 112                            │
│  mapToEmployeeDTO(Object[] row)                                     │
│                                                                     │
│  row[0] → dto.setEmployeeId(...)       Long                         │
│  row[1] → dto.setEmployeeName(...)     String                       │
│  row[2] → dto.setEmployeeBirthDate()  Date                          │
│  row[3] → dto.setDepartmentName(...)  String                        │
│  row[4] → dto.setEmployeeEmail(...)   String                        │
│  row[5] → dto.setEmployeeTelephone()  String                        │
│  row[6] → dto.setCertificationName()  String (nullable)             │
│  row[7] → dto.setEndDate(...)         Date (nullable)               │
│  row[8] → dto.setScore(...)           BigDecimal (nullable)         │
│                                                                     │
│  → Trả về: EmployeeDTO                                              │
└───────────────────────┬─────────────────────────────────────────────┘
                        │ HTTP Response
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  CLIENT nhận:                                                       │
│  {                                                                  │
│    "code": 200,                                                     │
│    "totalRecords": 25,                                              │
│    "employees": [ {...}, {...}, ... ]                               │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Bảng tóm tắt các điểm dừng

| Bước | File | Dòng | Nhiệm vụ |
|------|------|------|----------|
| 1 | `EmployeeController.java` | 62 | Nhận request, validate, điều phối |
| 2 | `EmployeeServiceImpl.java` | 64 | Đếm tổng số bản ghi |
| 3 | `EmployeeServiceImpl.java` | 82 | Xử lý phân trang, gọi query |
| 4 | `EmployeeRepository.java` | 57 | Thực thi Native SQL |
| 5 | `EmployeeServiceImpl.java` | 112 | Mapping Object[] → EmployeeDTO |

---

## ⚠️ Điểm cần chú ý

1. **Thứ tự cột SQL = thứ tự index `row[]`**: Nếu đổi vị trí cột trong SQL mà không cập nhật `mapToEmployeeDTO` → dữ liệu bị nhảy loạn.
2. **`LEFT JOIN` certifications**: Nhân viên không có chứng chỉ vẫn xuất hiện trong danh sách, các cột `row[6]`, `row[7]`, `row[8]` sẽ là `null`.
3. **`escapeLike`**: Phải gọi trước khi truyền vào SQL để tránh wildcard không mong muốn.

---

*Tài liệu giải thích kỹ thuật – Biên soạn bởi **tranledat** ngày 10/05/2026.*
