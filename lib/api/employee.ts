import { apiClient } from './client';
import { EmployeeListApiResponse, GetEmployeesParams } from '@/types/employee';

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
};
