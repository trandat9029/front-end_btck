import { apiClient } from './client';
import type { Department, DepartmentListResponse, NormalizedDepartmentListResponse } from '@/types/department';

/**
 * Chuẩn hóa response phòng ban từ backend về cấu trúc front-end đang dùng.
 */
function normalizeDepartments(payload: DepartmentListResponse): Department[] {
  if (Array.isArray(payload.departments)) {
    return payload.departments.map((department: any) => ({
      department_id: department.departmentId,
      department_name: department.departmentName,
    }));
  }

  if (Array.isArray(payload.data)) {
    return payload.data.map((department) => ({
      department_id: department.departmentId,
      department_name: department.departmentName,
    }));
  }

  return [];
}

export const departmentApi = {
  /**
   * Gọi API lấy toàn bộ phòng ban phục vụ bộ lọc nhóm của ADM002.
   */
  getDepartments: async (): Promise<NormalizedDepartmentListResponse> => {
    const response = await apiClient.get<DepartmentListResponse>('/departments');
    const statusCode = response.data.code ?? response.data.status ?? response.status;

    return {
      code: String(statusCode),
      message: response.data.message,
      departments: normalizeDepartments(response.data),
    };
  },
};
