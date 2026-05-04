/**
 * Copyright(C) 2024 Luvina
 * employee.ts, 24/04/2024 tranledat
 */

import { apiClient } from './client';
import { EmployeeDetailResponse, EmployeeFormData, EmployeeListApiResponse, EmployeeUpdateApiResponse, GetEmployeesParams } from '@/types/employee';

/**
 * Hàm hỗ trợ chuyển đổi EmployeeFormData (phẳng) sang cấu trúc Backend mong đợi (lồng nhau).
 * @param formData Dữ liệu form phẳng từ frontend
 * @return Đối tượng dữ liệu đã được cấu trúc lại
 */
const transformEmployeeRequest = (formData: EmployeeFormData) => {
  const {
    certificationId,
    certificationStartDate,
    certificationEndDate,
    employeeCertificationScore,
    ...employeeBaseData
  } = formData;

  // Nếu có chọn chứng chỉ thì mới gửi certificationRequest
  const certificationRequest = certificationId ? {
    certificationId,
    certificationStartDate,
    certificationEndDate,
    employeeCertificationScore
  } : null;

  return {
    ...employeeBaseData,
    certificationRequest
  };
};

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

    const response = await apiClient.get<EmployeeListApiResponse>('/employee', {
      params: cleanParams,
    });

    return response.data;
  },

  /**
   * Gọi API validate dữ liệu nhân viên cho ADM004.
   * @param formData Dữ liệu form nhân viên cần validate
   * @param mode Bước validate (SUBMIT hoặc CONFIRM)
   * @return Kết quả validate (200 OK hoặc mã lỗi kèm danh sách field lỗi)
   */
  validateEmployee: async (
    formData: EmployeeFormData,
    mode?: string
  ): Promise<EmployeeListApiResponse> => {
    const config = mode ? { params: { MODE: mode } } : undefined;
    const requestData = transformEmployeeRequest(formData);

    const response = await apiClient.post<EmployeeListApiResponse>(
      '/employee/validate',
      requestData,
      config
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
  ): Promise<EmployeeUpdateApiResponse> => {
    const requestData = transformEmployeeRequest(formData);
    const response = await apiClient.post<EmployeeUpdateApiResponse>(
      '/employee',
      requestData
    );
    return response.data;
  },

  /**
   * Gọi API thực hiện cập nhật nhân viên cho ADM005.
   * @param formData Dữ liệu nhân viên cần cập nhật
   * @return Kết quả thực hiện cập nhật
   */
  updateEmployee: async (
    formData: EmployeeFormData
  ): Promise<EmployeeUpdateApiResponse> => {
    const requestData = transformEmployeeRequest(formData);
    const response = await apiClient.put<EmployeeUpdateApiResponse>(
      '/employee',
      requestData
    );
    return response.data;
  },

  /**
   * Gọi API lấy thông tin chi tiết nhân viên theo ID.
   * @param id ID của nhân viên cần lấy thông tin
   * @return EmployeeDetailResponse Thông tin chi tiết của nhân viên bao gồm cả danh sách chứng chỉ
   */
  getEmployeeById: async (id: number): Promise<EmployeeDetailResponse> => {
    const response = await apiClient.get<EmployeeDetailResponse>(`/employee/${id}`);
    return response.data;
  },

  /**
   * Gọi API thực hiện xóa một nhân viên dựa trên ID.
   * @param id ID của nhân viên muốn xóa khỏi hệ thống
   * @return EmployeeListApiResponse Kết quả thực hiện xóa (thành công hoặc mã lỗi)
   */
  deleteEmployee: async (id: number): Promise<EmployeeListApiResponse> => {
    const response = await apiClient.delete<EmployeeListApiResponse>(`/employee/${id}`);
    return response.data;
  },
};
