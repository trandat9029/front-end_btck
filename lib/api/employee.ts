import { apiClient } from './client';
import { EmployeeFormData, EmployeeListApiResponse, GetEmployeesParams } from '@/types/employee';

export const employeeApi = {
  /**
   * Gọi API lấy danh sách nhân viên cho ADM002.
   * Tự loại bỏ các query param rỗng trước khi gửi request.
   */
  getEmployees: async (
    params: GetEmployeesParams
  ): Promise<EmployeeListApiResponse> => {
    const cleanParams: Record<string, string | number> = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        cleanParams[key] = value;
      }
    });

    const response = await apiClient.get<EmployeeListApiResponse>('/employees', {
      params: cleanParams,
    });

    return response.data;
  },

  /**
   * Gọi API validate dữ liệu nhân viên cho ADM004.
   */
  validateEmployee: async (
    formData: EmployeeFormData
  ): Promise<EmployeeListApiResponse> => {
    const response = await apiClient.post<EmployeeListApiResponse>(
      '/employees/validate',
      formData
    );
    return response.data;
  },

  /**
   * Gọi API thực hiện lưu (Thêm mới) nhân viên cho ADM005.
   */
  addEmployee: async (
    formData: EmployeeFormData
  ): Promise<EmployeeListApiResponse> => {
    const response = await apiClient.post<EmployeeListApiResponse>(
      '/employees',
      formData
    );
    return response.data;
  },
};
