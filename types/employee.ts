/**
 * Copyright(C) 2024 Luvina
 * employee.ts, 24/04/2024 tranledat
 */

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

// Thông tin lỗi của một trường dữ liệu từ Backend
export interface FieldError {
  field: string;
  message: string;
}

// Cấu trúc thông báo từ Backend (MessageResponse)
export interface MessageResponse {
  code: string;
  params: string[];
}

// Dữ liệu phản hồi từ API lấy danh sách nhân viên
export interface EmployeeListApiResponse {
  code: string;
  totalRecords?: number;
  employees?: EmployeeListItem[];
  message?: MessageResponse;
  params?: string[];
  fieldErrors?: FieldError[];
}

// Tham số gửi lên API để lấy danh sách nhân viên
export interface GetEmployeesParams {
  employeeNameSearch?: string;
  departmentIdFilter?: string;
  employeeNameSort?: SortOrder | '';
  certificationNameSort?: SortOrder | '';
  endDateSort?: SortOrder | '';
  offset?: number;
  limit?: number;
  page?: number; 
}

// Trạng thái tìm kiếm lưu trữ trong Hook useADM002
export interface SearchState {
  employeeName: string;
  departmentId: string;
  page: number;
  ordEmployeeName: SortOrder;
  ordCertificationName: SortOrder;
  ordEndDate: SortOrder;
}

// Tham số dùng cho hàm fetch nội bộ trong Hook ADM002
export interface FetchEmployeesParams {
  employeeName: string;
  departmentId: string;
  page?: number;
  limit?: number;
  ordEmployeeName?: SortOrder;
  ordCertificationName?: SortOrder;
  ordEndDate?: SortOrder;
}

// Dữ liệu form nhân viên dùng cho việc thêm mới hoặc cập nhật
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

// Chế độ của form nhân viên
export type EmployeeFormMode = 'add' | 'edit';

// Cấu trúc lưu trữ dữ liệu form nhân viên trong sessionStorage
export interface EmployeeFormDataStorage {
  formData: EmployeeFormData;
  mode: EmployeeFormMode;
  employeeId?: number;
}

// Chi tiết chứng chỉ của nhân viên
export interface EmployeeCertificationDetail {
  certificationId: number;
  certificationName: string;
  startDate: string;
  endDate: string;
  score: number;
}

// Dữ liệu phản hồi chi tiết một nhân viên từ API
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

// Dữ liệu phản hồi từ API cập nhật nhân viên
export interface EmployeeUpdateApiResponse {
  code: string;
  employeeId: number;
  message: MessageResponse;
}
