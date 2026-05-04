/**
 * Copyright(C) 2026 Luvina
 * [employee.ts], 26/04/2026 tranledat
 */
// Biểu diễn dữ liệu phía backend/cơ sở dữ liệu
export interface EmployeeDB {
  employeeId: number;
  departmentId: number;
  employeeName: string; // Bắt buộc
  employeeNameKana?: string;
  employeeBirthDate?: string; // Định dạng ngày
  employeeEmail: string; // Bắt buộc
  employeeTelephone?: string;
  employeeLoginId: string; // Bắt buộc, liên kết với tài khoản đăng nhập
  employeeLoginPassword?: string; // Không được frontend quản lý
}

// Biểu diễn dữ liệu hiển thị ở frontend (trên giao diện)
export interface Employee {
  employeeId: string; // Ánh xạ từ employeeId
  employeeName: string; // Ánh xạ từ employeeName (bắt buộc)
  employeeNameKana?: string; // Ánh xạ từ employeeNameKana
  employeeBirthDate?: string; // Ánh xạ từ employeeBirthDate (YYYY-MM-DD)
  departmentName?: string; // Suy ra từ departmentId thông qua tra cứu phòng ban
  employeeEmail: string; // Ánh xạ từ employeeEmail (bắt buộc)
  employeeTelephone?: string; // Ánh xạ từ employeeTelephone
  certificationName?: string; // Suy ra từ certifications
  certificationEndDate?: Date; // Suy ra từ employees_certifications.endDate (YYYY-MM-DD)
  certificationScore?: number; // Suy ra từ employees_certifications.score
}

// Kiểu dữ liệu request/response của API
export interface EmployeeCreateRequest {
  employeeName: string; // Bắt buộc
  departmentId: number; // Bắt buộc
  employeeEmail: string; // Bắt buộc
  employeeNameKana?: string;
  employeeBirthDate?: string; // Định dạng ngày
  employeeTelephone?: string;
  employeeLoginId: string; // Bắt buộc
  // Lưu ý: employee_login_password không được đưa vào ở đây (quản lý riêng)
}

export interface EmployeeUpdateRequest {
  employeeId: number; // Bắt buộc cho PUT /employee (ID nằm trong body, không nằm trên path)
  employeeName: string; // Bắt buộc
  departmentId: number; // Bắt buộc
  employeeEmail: string; // Bắt buộc
  employeeNameKana?: string;
  employeeBirthDate?: string;
  employeeTelephone?: string;
  employeeLoginId: string; // Bắt buộc
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

/**
 * Kiểu sắp xếp tăng dần hoặc giảm dần
 * @author tranledat
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Một bản ghi nhân viên trả về từ API danh sách
 * @author tranledat
 */
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

/**
 * Thông tin lỗi của một trường dữ liệu từ Backend
 * @author tranledat
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Cấu trúc thông báo từ Backend (MessageResponse)
 * @author tranledat
 */
export interface MessageResponse {
  code: string;
  params: string[];
}

/**
 * Dữ liệu phản hồi từ API lấy danh sách nhân viên
 * @author tranledat
 */
export interface EmployeeListApiResponse {
  code: string;
  totalRecords?: number;
  employees?: EmployeeListItem[];
  message?: MessageResponse;
  params?: string[];
  fieldErrors?: FieldError[];
}

/**
 * Tham số gửi lên API để lấy danh sách nhân viên
 * @author tranledat
 */
export interface GetEmployeesParams {
  employeeName?: string;
  departmentId?: string;
  ordEmployeeName?: SortOrder | '';
  ordCertificationName?: SortOrder | '';
  ordEndDate?: SortOrder | '';
  offset?: number;
  limit?: number;
}

/**
 * Dữ liệu form nhân viên dùng cho việc thêm mới hoặc cập nhật
 * @author tranledat
 */
export interface EmployeeFormData {
  employeeId?: number;
  employeeLoginId: string;
  departmentId: string;
  employeeName: string;
  employeeNameKana: string;
  employeeBirthDate: string;
  employeeEmail: string;
  employeeTelephone: string;
  employeeLoginPassword: string;
  employeeLoginPasswordConfirm: string;
  certificationId?: string;
  certificationStartDate?: string;
  certificationEndDate?: string;
  employeeCertificationScore?: string;
}

/**
 * Chế độ của form nhân viên
 * @author tranledat
 */
export type EmployeeFormMode = 'add' | 'edit';

/**
 * Cấu trúc lưu trữ dữ liệu form nhân viên trong sessionStorage
 * @author tranledat
 */
export interface EmployeeFormDataStorage {
  formData: EmployeeFormData;
  mode: EmployeeFormMode;
  employeeId?: number;
}

/**
 * Chi tiết chứng chỉ của nhân viên
 * @author tranledat
 */
export interface EmployeeCertificationDetail {
  certificationId: number;
  certificationName: string;
  startDate: string;
  endDate: string;
  score: number;
}

/**
 * Dữ liệu phản hồi chi tiết một nhân viên từ API
 * @author tranledat
 */
export interface EmployeeDetailResponse {
  code: string;
  employeeId: number;
  employeeName: string;
  employeeNameKana: string;
  employeeBirthDate: string;
  employeeEmail: string;
  employeeTelephone: string;
  employeeLoginId: string;
  departmentId: number;
  departmentName: string;
  certifications: EmployeeCertificationDetail[];
}

/**
 * Dữ liệu phản hồi từ API cập nhật nhân viên
 * @author tranledat
 */
export interface EmployeeUpdateApiResponse {
  code: string;
  employeeId: number;
  message: MessageResponse;
}
