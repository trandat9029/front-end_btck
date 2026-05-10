/**
 * Copyright(C) 2024 Luvina
 * EmployeeDetailForm.tsx, 10/05/2026 tranledat
 */

'use client';

import React from 'react';
import { useADM003 } from '@/hooks/useADM003';
import { formatDateDisplay } from '@/lib/utils/date';

/**
 * Component hiển thị màn hình chi tiết thông tin nhân viên (ADM003).
 */
const EmployeeDetailForm = () => {
  const {
    employee,
    uiState,
    handleDeleteClick,
    handleEditClick,
    handleBackClick,
  } = useADM003();

  // Hiển thị trạng thái đang nạp dữ liệu
  if (uiState.isLoading) {
    return <div className="p-3">読み込み中...</div>;
  }

  // Trường hợp không tìm thấy nhân viên (đã bị xóa hoặc ID không tồn tại)
  if (!employee) {
    return <div className="p-3">データが見つかりません。</div>;
  }

  return (
    <form className="c-form box-shadow">
      <ul className="show-data">
        <li className="title">情報確認</li>

        {/* Thông tin tài khoản */}
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">アカウント名</label>
          <div className="col-sm col-sm-10">{employee.employeeLoginId}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">グループ</label>
          <div className="col-sm col-sm-10">{employee.departmentName}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">氏名</label>
          <div className="col-sm col-sm-10">{employee.employeeName}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">カタカナ氏名</label>
          <div className="col-sm col-sm-10">{employee.employeeNameKana}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">生年月日</label>
          <div className="col-sm col-sm-10">{formatDateDisplay(employee.employeeBirthDate)}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">メールアドレス</label>
          <div className="col-sm col-sm-10">{employee.employeeEmail}</div>
        </li>

        <li className="form-group row d-flex bor-none">
          <label className="col-form-label col-sm-2">電話番号</label>
          <div className="col-sm col-sm-10">{employee.employeeTelephone}</div>
        </li>

        {/* Hiển thị danh sách chứng chỉ (nếu có) */}
        {employee.certifications && employee.certifications.length > 0 && (
          <>
            <li className="title mt-12">
              <a href="#!">日本語能力</a>
            </li>
            {employee.certifications.map((cert, index) => (
              <React.Fragment key={cert.certificationId || index}>
                <li className="form-group row d-flex">
                  <label className="col-form-label col-sm-2">資格</label>
                  <div className="col-sm col-sm-10">{cert.certificationName}</div>
                </li>
                <li className="form-group row d-flex">
                  <label className="col-form-label col-sm-2">資格交付日</label>
                  <div className="col-sm col-sm-10">{formatDateDisplay(cert.startDate)}</div>
                </li>
                <li className="form-group row d-flex">
                  <label className="col-form-label col-sm-2">失効日</label>
                  <div className="col-sm col-sm-10">{formatDateDisplay(cert.endDate)}</div>
                </li>
                <li className="form-group row d-flex">
                  <label className="col-form-label col-sm-2">点数</label>
                  <div className="col-sm col-sm-10">{cert.score}</div>
                </li>
              </React.Fragment>
            ))}
          </>
        )}

        {/* Nhóm các nút điều hướng */}
        <li className="form-group row d-flex">
          <div className="btn-group col-sm col-sm-10 ml">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleEditClick}
            >
              編集
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleDeleteClick}
            >
              削除
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleBackClick}
            >
              戻る
            </button>
          </div>
        </li>
      </ul>
    </form>
  );
};

export default EmployeeDetailForm;
