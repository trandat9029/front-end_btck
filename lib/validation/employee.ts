/**
 * Validate tên nhân viên trong form tìm kiếm ADM002.
 */
export function validateEmployeeName(value: string): string {
  if (value.length > 125) {
    return 'Employee name must be 125 characters or fewer.';
  }

  if (value.length > 0 && value.trim().length === 0) {
    return 'Employee name must not contain only whitespace.';
  }

  return '';
}

/**
 * Chuẩn hóa input tên nhân viên trước khi lưu vào state hoặc gửi tìm kiếm.
 */
export function sanitizeEmployeeNameInput(value: string): string {
  return value.replace(/^\s+/, '').replace(/\s{2,}/g, ' ');
}
