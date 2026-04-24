/**
 * Copyright(C) 2026 - Luvina
 * [page.tsx] (ADM003), 24/04/2026 [tranledat]
 */
'use client';

import React from 'react';
import { useADM003 } from '@/hooks/useADM003';
import EmployeeDetailForm from '@/components/form/EmployeeDetailForm';

/**
 * Trang chi tiết nhân viên (ADM003).
 * Sử dụng useADM003 để quản lý logic gọi API và EmployeeDetailForm để hiển thị UI.
 * @author tranledat
 */
export default function EmployeeDetailPage() {
  const { employeeDetail, isLoading, errorMessage, handleBack, handleEdit } = useADM003();

  // Hiển thị trạng thái đang tải
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo lỗi (nếu có)
  if (errorMessage) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger shadow-sm" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {errorMessage}
        </div>
        <button className="btn btn-secondary mt-3" onClick={handleBack}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // Nếu không có dữ liệu và không lỗi (trường hợp hiếm)
  if (!employeeDetail) return null;

  return (
    <EmployeeDetailForm
      employeeDetail={employeeDetail}
      handleBack={handleBack}
      handleEdit={handleEdit}
    />
  );
}
