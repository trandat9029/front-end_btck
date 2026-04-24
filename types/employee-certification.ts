// Biểu diễn dữ liệu chứng chỉ của nhân viên
export interface EmployeeCertification {
  employeeCertificationId: number;
  employeeId: number;
  certificationId: number;
  startDate: string; // Định dạng ngày
  end_date: string; // Định dạng ngày
  score: number; // Kiểu số thập phân
}
