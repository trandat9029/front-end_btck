/**
 * Copyright(C) 2026 Luvina
 * [EmployeeFormConfirm.tsx], 24/04/2026 tranledat
 */

'use client';

import React from 'react';
import { useADM005 } from '@/hooks/useADM005';

/**
 * Component hiển thị màn hình xác nhận thông tin nhân viên (ADM005).
 * Kết nối với hook useADM005 để xử lý lưu dữ liệu vào DB.
 * 
 * @author tranledat
 */
const EmployeeFormConfirm = () => {
  const {
    storedData,
    departmentName,
    certificationName,
    uiState,
    handleSubmitClick,
    handleBackClick,
  } = useADM005();

  // Nếu không có dữ liệu (đang redirect), không render gì cả
  if (!storedData) return null;

  const { formData } = storedData;

  return (
    <form className="c-form box-shadow">
      <ul className="show-data">
        <li className="title">
          <p>情報確認</p>
          <p>入力された情報をOKボタンクリックでDBへ保存してください</p>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">アカウント名</label>
          <div className="col-sm col-sm-10">{formData.employeeLoginId}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">グループ</label>
          <div className="col-sm col-sm-10">{departmentName}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">氏名</label>
          <div className="col-sm col-sm-10">{formData.employeeName}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">カナ氏名</label>
          <div className="col-sm col-sm-10">{formData.employeeNameKana}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">生年月日</label>
          <div className="col-sm col-sm-10">{formData.employeeBirthDate}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">メールアドレス</label>
          <div className="col-sm col-sm-10">{formData.employeeEmail}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">電話番号</label>
          <div className="col-sm col-sm-10">{formData.employeeTelephone}</div>
        </li>

        {/* Japanese Proficiency Section */}
        <li className="title mt-12">
          <a href="#!">日本語能力</a>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">資格</label>
          <div className="col-sm col-sm-10">{certificationName || ''}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">資格交付日</label>
          <div className="col-sm col-sm-10">{formData.certificationStartDate}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">失効日</label>
          <div className="col-sm col-sm-10">{formData.certificationEndDate}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">点数</label>
          <div className="col-sm col-sm-10">{formData.employeeCertificationScore}</div>
        </li>

        <li className="form-group row d-flex">
          <div className="btn-group col-sm col-sm-10 ml">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSubmitClick}
              disabled={uiState.isSubmitting}
            >
              {uiState.isSubmitting ? '保存中...' : 'OK'}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleBackClick}
              disabled={uiState.isSubmitting}
            >
              戻る
            </button>
          </div>
        </li>
      </ul>
    </form>
  );
};

export default EmployeeFormConfirm;
