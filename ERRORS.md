# ERRORS.md - Automatic Error Tracking & Learning

## [2026-05-07 13:26] - ReferenceError: employeeApi is not defined in useADM004.ts

- **Type**: Agent
- **Severity**: Critical
- **File**: `hooks/useADM004.ts:129`
- **Agent**: tranledat
- **Root Cause**: Khi thực hiện dọn dẹp code (xóa OriginalCertData), Agent đã vô tình xóa mất dòng import `employeeApi` từ `@/lib/api/employee`, dẫn đến việc gọi API lấy thông tin nhân viên bị lỗi runtime và redirect sang màn hình systemError.
- **Error Message**: 
  ```
  ReferenceError: employeeApi is not defined
  ```
- **Fix Applied**: Thêm lại dòng `import { employeeApi } from '@/lib/api/employee';` vào file `hooks/useADM004.ts`.
- **Prevention**: Cẩn thận hơn khi xóa các import hàng loạt. Luôn kiểm tra lại xem các biến được sử dụng trong file có đầy đủ import hay không trước khi lưu file.
- **Status**: Fixed

---
