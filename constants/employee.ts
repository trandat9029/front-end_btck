/**
 * Copyright(C) 2024 Luvina
 * employee.ts, 10/05/2026 tranledat
 */

/**
 * Các hằng số liên quan đến nghiệp vụ Nhân viên.
 */

export const DEFAULT_LIMIT = 20;

export const DEFAULT_SORTS = {
  ordEmployeeName: 'asc' as const,
  ordCertificationName: 'asc' as const,
  ordEndDate: 'asc' as const,
};

export const MAX_LENGTH = 125;
export const EMPLOYEE_FORM_DATA_STORAGE_KEY = 'adm004-employee-form-data';

export const ADD = 'add';
export const EDIT = 'edit';
export const ACTION = 'action';

// Các chế độ validate tương ứng với Backend
export const VALIDATE_ACTION_ADD = 'add';
export const VALIDATE_ACTION_EDIT = 'edit';
