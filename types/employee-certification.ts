/**
 * Copyright(C) 2024 Luvina
 * employee-certification.ts, 24/04/2024 tranledat
 */

// Biểu diễn dữ liệu chứng chỉ của nhân viên
export interface EmployeeCertification {
  employeeCertificationId: number;
  employeeId: number;
  certificationId: number;
  startDate: string; // Định dạng ngày
  endDate: string;   // Định dạng ngày
  score: number;     // Kiểu số thập phân
}
