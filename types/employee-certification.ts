// Biểu diễn dữ liệu chứng chỉ của nhân viên
export interface EmployeeCertification {
  employee_certification_id: number;
  employee_id: number;
  certification_id: number;
  start_date: string; // Định dạng ngày
  end_date: string; // Định dạng ngày
  score: number; // Kiểu số thập phân
}
