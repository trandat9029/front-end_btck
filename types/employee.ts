// Biểu diễn dữ liệu phía backend/cơ sở dữ liệu
export interface EmployeeDB {
  employee_id: number;
  department_id: number;
  employee_name: string; // Bắt buộc
  employee_name_kana?: string;
  employee_birth_date?: string; // Định dạng ngày
  employee_email: string; // Bắt buộc
  employee_telephone?: string;
  employee_login_id: string; // Bắt buộc, liên kết với tài khoản đăng nhập
  employee_login_password?: string; // Không được frontend quản lý
}

// Biểu diễn dữ liệu hiển thị ở frontend (trên giao diện)
export interface Employee {
  id: string; // Ánh xạ từ employee_id
  name: string; // Ánh xạ từ employee_name (bắt buộc)
  nameKana?: string; // Ánh xạ từ employee_name_kana
  dateOfBirth?: string; // Ánh xạ từ employee_birth_date (YYYY-MM-DD)
  group?: string; // Suy ra từ department_id thông qua tra cứu phòng ban
  email: string; // Ánh xạ từ employee_email (bắt buộc)
  phone?: string; // Ánh xạ từ employee_telephone
  japaneseProficiency?: string; // Suy ra từ certifications
  expirationDate?: string; // Suy ra từ employees_certifications.end_date (YYYY-MM-DD)
  score?: number; // Suy ra từ employees_certifications.score
}

// Kiểu dữ liệu request/response của API
export interface EmployeeCreateRequest {
  employee_name: string; // Bắt buộc
  department_id: number; // Bắt buộc
  employee_email: string; // Bắt buộc
  employee_name_kana?: string;
  employee_birth_date?: string; // Định dạng ngày
  employee_telephone?: string;
  employee_login_id: string; // Bắt buộc
  // Lưu ý: employee_login_password không được đưa vào ở đây (quản lý riêng)
}

export interface EmployeeUpdateRequest {
  employee_id: number; // Bắt buộc cho PUT /employee (ID nằm trong body, không nằm trên path)
  employee_name: string; // Bắt buộc
  department_id: number; // Bắt buộc
  employee_email: string; // Bắt buộc
  employee_name_kana?: string;
  employee_birth_date?: string;
  employee_telephone?: string;
  employee_login_id: string; // Bắt buộc
}

export interface EmployeeListResponse {
  employees: Employee[]; // Định dạng hiển thị ở frontend
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EmployeeSearchParams {
  name?: string; // Tìm theo employee_name
  group?: string; // Lọc theo department_id (thông qua tra cứu phòng ban)
  page?: number;
  limit?: number;
}

// Kiểu sắp xếp tăng dần hoặc giảm dần
export type SortOrder = 'asc' | 'desc';

// Một bản ghi nhân viên trả về từ API danh sách
export interface EmployeeListItem {
  employeeId: number;
  employeeName: string;
  employeeBirthDate: string | null;
  departmentName: string | null;
  employeeEmail: string | null;
  employeeTelephone: string | null;
  certificationName: string | null;
  endDate: string | null;
  score: number | null;
}

// Dữ liệu phản hồi từ API lấy danh sách nhân viên
export interface EmployeeListApiResponse {
  code: string;
  totalRecords?: number;
  employees?: EmployeeListItem[];
  message?: string;
  params?: string[];
}

// Tham số gửi lên API để lấy danh sách nhân viên
export interface GetEmployeesParams {
  employee_name?: string;
  department_id?: string;
  ord_employee_name?: SortOrder | '';
  ord_certification_name?: SortOrder | '';
  ord_end_date?: SortOrder | '';
  offset?: number;
  limit?: number;
}

export interface EmployeeFormData {
  employeeLoginId: string;
  departmentId: string;
  employeeName: string;
  employeeNameKana: string;
  employeeBirthDate: string;
  employeeEmail: string;
  employeeTelephone: string;
  employeeLoginPassword: string;
  employeeLoginPasswordConfirm: string;
  certificationId: string;
  certificationStartDate: string;
  certificationEndDate: string;
  score: string;
}

export type EmployeeFormMode = 'add' | 'edit';

export interface EmployeeFormDraft {
  formData: EmployeeFormData;
  mode: EmployeeFormMode;
  employeeId?: number;
}
