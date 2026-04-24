/**
 * Copyright(C) 2026 - Luvina
 * [EmployeeDetailForm.tsx], 24/04/2026 [tranledat]
 */
'use client';

import React from 'react';
import { EmployeeDetailResponse } from '@/types/employee';

/**
 * Component hiển thị thông tin chi tiết nhân viên dạng Read-only.
 * @author tranledat
 */
interface Props {
  employeeDetail: EmployeeDetailResponse;
  handleBack: () => void;
  handleEdit: () => void;
}

const EmployeeDetailForm: React.FC<Props> = ({ employeeDetail, handleBack, handleEdit }) => {
  // Lấy thông tin chứng chỉ đầu tiên (nếu có) để hiển thị theo design
  const cert =
    employeeDetail.certifications && employeeDetail.certifications.length > 0
      ? employeeDetail.certifications[0]
      : null;

  return (
    <div className="container mt-4">
      <div className="c-form box-shadow p-4 bg-white rounded">
        <h4 className="title mb-4 text-primary fw-bold border-bottom pb-2">
          Thông tin chi tiết nhân viên (ADM003)
        </h4>

        <table className="table table-bordered align-middle mt-3 shadow-sm">
          <tbody>
            <tr>
              <th className="bg-light" style={{ width: '250px' }}>Tên đăng nhập</th>
              <td>{employeeDetail.employeeLoginId}</td>
            </tr>
            <tr>
              <th className="bg-light">Nhóm</th>
              <td>{employeeDetail.departmentName}</td>
            </tr>
            <tr>
              <th className="bg-light">Họ và tên</th>
              <td>{employeeDetail.employeeName}</td>
            </tr>
            <tr>
              <th className="bg-light">Tên Kana</th>
              <td>{employeeDetail.employeeNameKana}</td>
            </tr>
            <tr>
              <th className="bg-light">Ngày sinh</th>
              <td>{employeeDetail.employeeBirthDate}</td>
            </tr>
            <tr>
              <th className="bg-light">Địa chỉ Email</th>
              <td>{employeeDetail.employeeEmail}</td>
            </tr>
            <tr>
              <th className="bg-light">Điện thoại</th>
              <td>{employeeDetail.employeeTelephone}</td>
            </tr>

            {/* Thông tin chứng chỉ tiếng Nhật */}
            <tr>
              <th colSpan={2} className="bg-secondary text-white text-center py-2 mt-3">
                Thông tin Chứng chỉ tiếng Nhật
              </th>
            </tr>
            <tr>
              <th className="bg-light">Trình độ tiếng Nhật</th>
              <td>{cert?.certificationName || 'Không có'}</td>
            </tr>
            {cert && (
              <>
                <tr>
                  <th className="bg-light">Ngày cấp</th>
                  <td>{cert.startDate}</td>
                </tr>
                <tr>
                  <th className="bg-light">Ngày hết hạn</th>
                  <td>{cert.endDate}</td>
                </tr>
                <tr>
                  <th className="bg-light">Điểm</th>
                  <td>{cert.score}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {/* Nút thao tác */}
        <div className="footer-buttons mt-5 d-flex justify-content-center gap-3">
          <button 
            type="button" 
            className="btn btn-secondary px-4 py-2" 
            onClick={handleBack}
          >
            Quay lại
          </button>
          <button 
            type="button" 
            className="btn btn-primary px-4 py-2" 
            onClick={handleEdit}
          >
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailForm;
