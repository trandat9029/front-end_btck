/**
 * Copyright(C) 2024 Luvina
 * employee.ts, 24/04/2024 tranledat
 */

import { apiClient } from './client';
import { EmployeeDetailResponse, EmployeeFormData, EmployeeListApiResponse, GetEmployeesParams } from '@/types/employee';

/**
 * Các phương thức gọi API liên quan đến nhân viên.
 * @author tranledat
 */
export const employeeApi = {
  /**
   * Gọi API lấy danh sách nhân viên cho ADM002.
   * Tự loại bỏ các query param rỗng trước khi gửi request.
   * @param params Các tham số tìm kiếm, phân trang và sắp xếp
   * @return Danh sách nhân viên và thông tin phân trang
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
   * @param formData Dữ liệu form nhân viên cần validate
   * @return Kết quả validate (200 OK hoặc mã lỗi kèm danh sách field lỗi)
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
   * @param formData Dữ liệu nhân viên đã qua validate
   * @return Kết quả thực hiện lưu
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

  /**
   * Gọi API lấy thông tin chi tiết nhân viên theo ID.
   * @param id ID của nhân viên cần lấy thông tin
   * @return EmployeeDetailResponse Thông tin chi tiết của nhân viên bao gồm cả danh sách chứng chỉ
   */
  getEmployeeById: async (id: number): Promise<EmployeeDetailResponse> => {
    const response = await apiClient.get<EmployeeDetailResponse>(`/employees/${id}`);
    return response.data;
  },

  /**
   * Gọi API thực hiện xóa một nhân viên dựa trên ID.
   * @param id ID của nhân viên muốn xóa khỏi hệ thống
   * @return EmployeeListApiResponse Kết quả thực hiện xóa (thành công hoặc mã lỗi)
   */
  deleteEmployee: async (id: number): Promise<EmployeeListApiResponse> => {
    const response = await apiClient.delete<EmployeeListApiResponse>(`/employees/${id}`);
    return response.data;
  },
};
