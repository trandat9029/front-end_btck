/**
 * Copyright(C) 2024 Luvina
 * employee.ts, 24/04/2024 tranledat
 */

import { ADD, EDIT, EMPLOYEE_FORM_DATA_STORAGE_KEY } from '@/constants/employee';
import { EmployeeFormData, EmployeeFormDataStorage, EmployeeFormMode } from '@/types/employee';

/**
 * createEmptyEmployeeFormData: Khởi tạo đối tượng dữ liệu Form rỗng cho nhân viên.
 * 
 * @returns Đối tượng EmployeeFormData với các giá trị mặc định
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
 * createEmployeeFormDataStorage: Đóng gói dữ liệu Form kèm Metadata để lưu vào Storage.
 * 
 * @param formData Dữ liệu form hiện tại
 * @param mode Chế độ thao tác (ADD/EDIT)
 * @param employeeId ID nhân viên (nếu có)
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
 * parseEmployeeFormDataStorage: Chuyển đổi chuỗi JSON từ Storage thành đối tượng dữ liệu hợp lệ.
 * 
 * @param value Chuỗi JSON cần parse
 * @returns Đối tượng dữ liệu đã được xử lý hoặc null nếu không hợp lệ
 */
export const parseEmployeeFormDataStorage = (
  value: string | null | undefined
): EmployeeFormDataStorage | null => {
  if (!value) return null;

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
  } catch (error) {
    console.error('Parse Storage Error:', error);
    return null;
  }
};

/**
 * loadEmployeeFormDataStorage: Đọc và parse dữ liệu từ sessionStorage.
 */
export const loadEmployeeFormDataStorage = (): EmployeeFormDataStorage | null => {
  if (typeof window === 'undefined') return null;

  return parseEmployeeFormDataStorage(
    window.sessionStorage.getItem(EMPLOYEE_FORM_DATA_STORAGE_KEY)
  );
};

/**
 * saveEmployeeFormDataStorage: Lưu dữ liệu vào sessionStorage dưới dạng chuỗi JSON.
 */
export const saveEmployeeFormDataStorage = (dataStorage: EmployeeFormDataStorage) => {
  if (typeof window === 'undefined') return;

  window.sessionStorage.setItem(
    EMPLOYEE_FORM_DATA_STORAGE_KEY,
    JSON.stringify(dataStorage)
  );
};

/**
 * clearEmployeeFormDataStorage: Xóa dữ liệu Form nhân viên khỏi sessionStorage.
 */
export const clearEmployeeFormDataStorage = () => {
  if (typeof window === 'undefined') return;

  window.sessionStorage.removeItem(EMPLOYEE_FORM_DATA_STORAGE_KEY);
};
