/**
 * Copyright(C) 2024 Luvina
 * employee.ts, 24/04/2024 tranledat
 */

import { ADD, EDIT, EMPLOYEE_FORM_DATA_STORAGE_KEY } from '@/constants/employee';
import { EmployeeFormData, EmployeeFormDataStorage, EmployeeFormMode } from '@/types/employee';

/**
 * Tạo dữ liệu mặc định rỗng cho toàn bộ form nhân viên.
 * @return Dữ liệu form nhân viên rỗng
 */
export const createEmptyEmployeeFormData = (): EmployeeFormData => ({
  employeeLoginId: '',
  departmentId: '',
  employeeName: '',
  employeeNameKana: '',
  employeeBirthDate: '',
  employeeEmail: '',
  employeeTelephone: '',
  employeeLoginPassword: '',
  employeeLoginPasswordConfirm: '',
  certificationId: '',
  certificationStartDate: '',
  certificationEndDate: '',
  employeeCertificationScore: '',
  employeeId: undefined,
});

/**
 * Tạo object data từ dữ liệu form và mode hiện tại để lưu storage.
 * @param formData Dữ liệu form hiện tại
 * @param mode Chế độ (ADD/EDIT)
 * @param employeeId ID nhân viên (nếu có)
 * @return Đối tượng lưu trữ dữ liệu form
 */
export const createEmployeeFormDataStorage = (
  formData: EmployeeFormData,
  mode: EmployeeFormMode,
  employeeId?: number
): EmployeeFormDataStorage => ({
  formData,
  mode,
  employeeId,
});

/**
 * Chuyển chuỗi JSON trong storage thành object data hợp lệ.
 * @param value Chuỗi JSON từ storage
 * @return Đối tượng dữ liệu đã parse hoặc null nếu không hợp lệ
 */
export const parseEmployeeFormDataStorage = (
  value: string | null | undefined
): EmployeeFormDataStorage | null => {
  if (!value) {
    return null;
  }
 
  try {
    const parsed = JSON.parse(value) as Partial<EmployeeFormDataStorage>;
 
    if (!parsed || typeof parsed !== 'object' || !parsed.formData) {
      return null;
    }
 
    return {
      formData: {
        ...createEmptyEmployeeFormData(),
        ...parsed.formData,
      },
      mode: parsed.mode === EDIT ? EDIT : ADD,
      employeeId:
        typeof parsed.employeeId === 'number' && Number.isInteger(parsed.employeeId)
          ? parsed.employeeId
          : undefined,
    };
  } catch {
    return null;
  }
};

/**
 * Đọc dữ liệu đã lưu trong sessionStorage.
 * @return Đối tượng lưu trữ dữ liệu hoặc null
 */
export const loadEmployeeFormDataStorage = (): EmployeeFormDataStorage | null => {
  if (typeof window === 'undefined') {
    return null;
  }
 
  return parseEmployeeFormDataStorage(
    window.sessionStorage.getItem(EMPLOYEE_FORM_DATA_STORAGE_KEY)
  );
};

/**
 * Lưu dữ liệu vào sessionStorage.
 * @param dataStorage Dữ liệu cần lưu
 */
export const saveEmployeeFormDataStorage = (dataStorage: EmployeeFormDataStorage) => {
  if (typeof window === 'undefined') {
    return;
  }
 
  window.sessionStorage.setItem(
    EMPLOYEE_FORM_DATA_STORAGE_KEY,
    JSON.stringify(dataStorage)
  );
};

/**
 * Xóa dữ liệu khỏi sessionStorage.
 */
export const clearEmployeeFormDataStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }
 
  window.sessionStorage.removeItem(EMPLOYEE_FORM_DATA_STORAGE_KEY);
};
