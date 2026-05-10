/**
 * Copyright(C) 2024 Luvina
 * department.ts, 10/05/2026 tranledat
 */

import { apiClient } from './client';
import type {
  Department,
  DepartmentApiItem,
  DepartmentListResponse,
  NormalizedDepartmentListResponse
} from '@/types/department';

/**
 * normalizeDepartments: Chuẩn hóa dữ liệu phòng ban từ API về cấu trúc thống nhất cho Frontend.
 */
function normalizeDepartments(payload: DepartmentListResponse): Department[] {
  if (Array.isArray(payload.departments)) {
    return payload.departments.map((department: Department) => ({
      departmentId: department.departmentId,
      departmentName: department.departmentName,
    }));
  }

  if (Array.isArray(payload.data)) {
    return payload.data.map((department: DepartmentApiItem) => ({
      departmentId: department.departmentId,
      departmentName: department.departmentName,
    }));
  }

  return [];
}

/**
 * departmentApi: Các dịch vụ gọi API liên quan đến Phòng ban (Group).
 */
export const departmentApi = {
  /**
   * getDepartments: Lấy danh sách toàn bộ phòng ban.
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
