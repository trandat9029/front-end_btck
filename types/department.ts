// Biểu diễn dữ liệu phòng ban
export interface Department {
  department_id: number;
  department_name: string;
}

// Một phần tử phòng ban theo định dạng API trả về
export interface DepartmentApiItem {
  departmentId: number;
  departmentName: string;
}

// Dữ liệu phản hồi danh sách phòng ban từ API
export interface DepartmentListResponse {
  code?: number | string;
  status?: number;
  message?: string;
  departments?: Department[];
  data?: DepartmentApiItem[];
}

// Dữ liệu phòng ban đã được chuẩn hóa để dùng ở frontend
export interface NormalizedDepartmentListResponse {
  code: string;
  message?: string;
  departments: Department[];
}
