/**
 * Copyright(C) 2026 Luvina
 * [EmployeeInputForm.tsx], 26/04/2026 tranledat
 */

'use client';

import React, { useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useADM004 } from '@/hooks/useADM004';
import { ADD, EDIT } from '@/constants/employee';


/**
 * Component hiển thị form nhập liệu thông tin nhân viên (ADM004).
 * Kết nối với hook useADM004 để quản lý trạng thái form và validate.
 * 
 * @author tranledat
 */
const EmployeeInputForm = () => {
  const {
    masterData,
    uiStatus,
    watchedValues,
    isCertificationSelected,
    isDataReady,
    errors,
    mode,
    handleInputChange,
    handleInputBlur,
    handleDateChange,
    handleConfirmClick,
    handleBackClick,
  } = useADM004();

  const { departments, certifications } = masterData;

  // Ref để thực hiện auto focus vào ô nhập liệu đầu tiên
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Effect: Auto focus khi dữ liệu đã sẵn sàng và đang ở chế độ thêm mới (ADD)
  useEffect(() => {
    if (isDataReady && mode === ADD && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isDataReady, mode]);

  /**
   * Chuyển đổi chuỗi ngày tháng sang đối tượng Date cho DatePicker.
   */
  const parseToDate = (value: string | undefined) => {
    if (!value) return null;
    return new Date(value.replace(/\//g, '-'));
  };

  return (
    <form className="c-form box-shadow" onSubmit={handleConfirmClick}>
      <ul>
        {/* Hiển thị lỗi hệ thống hoặc lỗi nghiệp vụ từ Server */}
        {uiStatus.errorMessage && (
          <li className="p-3 mb-4 bg-red-50 text-red-500 border border-red-200 rounded">
            {uiStatus.errorMessage}
          </li>
        )}

        <li className="title">会員情報編集</li>

        {/* Account ID */}
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">
            <i className="relative">
              アカウント名:{mode === ADD && <span className="note-red">*</span>}
            </i>
          </label>
          <div className="col-sm col-sm-10">
            <input
              type="text"
              id="employeeLoginId"
              className="form-control"
              ref={firstInputRef}
              value={watchedValues.employeeLoginId}
              onChange={(e) => handleInputChange('employeeLoginId', e.target.value)}
              onBlur={() => handleInputBlur('employeeLoginId')}
              disabled={mode === EDIT}
            />
            {errors.employeeLoginId && (
              <div className="error-message mt-1">{errors.employeeLoginId.message}</div>
            )}
          </div>
        </li>

        {/* Nhóm (Department) */}
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">
            <i className="relative">
              グループ:<span className="note-red">*</span>
            </i>
          </label>
          <div className="col-sm col-sm-10">
            <select
              className="form-control"
              value={watchedValues.departmentId}
              onChange={(e) => handleInputChange('departmentId', e.target.value)}
              onBlur={() => handleInputBlur('departmentId')}
              disabled={uiStatus.isLoading}
            >
              <option value="">選択してください</option>
              {departments.map((dept) => (
                <option key={dept.departmentId} value={String(dept.departmentId)}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <div className="error-message mt-1">{errors.departmentId.message}</div>
            )}
          </div>
        </li>

        {/* Tên nhân viên */}
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">
            <i className="relative">
              氏名:<span className="note-red">*</span>
            </i>
          </label>
          <div className="col-sm col-sm-10">
            <input
              type="text"
              className="form-control"
              value={watchedValues.employeeName}
              onChange={(e) => handleInputChange('employeeName', e.target.value)}
              onBlur={() => handleInputBlur('employeeName')}
            />
            {errors.employeeName && (
              <div className="error-message mt-1">{errors.employeeName.message}</div>
            )}
          </div>
        </li>

        {/* Tên Kana */}
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">
            <i className="relative">
              カタカナ氏名:<span className="note-red">*</span>
            </i>
          </label>
          <div className="col-sm col-sm-10">
            <input
              type="text"
              className="form-control"
              value={watchedValues.employeeNameKana}
              onChange={(e) => handleInputChange('employeeNameKana', e.target.value)}
              onBlur={() => handleInputBlur('employeeNameKana')}
            />
            {errors.employeeNameKana && (
              <div className="error-message mt-1">{errors.employeeNameKana.message}</div>
            )}
          </div>
        </li>

        {/* Ngày sinh */}
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">
            <i className="relative">
              生年月日:<span className="note-red">*</span>
            </i>
          </label>
          <div className="col-sm col-sm-10 d-flex flex-column">
            <div className="datepicker-wrapper">
              <DatePicker
                selected={parseToDate(watchedValues.employeeBirthDate)}
                onChange={(date) => handleDateChange('employeeBirthDate', date)}
                onBlur={() => handleInputBlur('employeeBirthDate')}
                dateFormat="yyyy/MM/dd"
                className="form-control"
                placeholderText="YYYY/MM/DD"
              />
              <span className="glyphicon-calendar" aria-hidden="true" />
            </div>
            {errors.employeeBirthDate && (
              <div className="error-message mt-1">{errors.employeeBirthDate.message}</div>
            )}
          </div>
        </li>

        {/* Email */}
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">
            <i className="relative">
              メールアドレス:<span className="note-red">*</span>
            </i>
          </label>
          <div className="col-sm col-sm-10">
            <input
              type="email"
              className="form-control"
              value={watchedValues.employeeEmail}
              onChange={(e) => handleInputChange('employeeEmail', e.target.value)}
              onBlur={() => handleInputBlur('employeeEmail')}
            />
            {errors.employeeEmail && (
              <div className="error-message mt-1">{errors.employeeEmail.message}</div>
            )}
          </div>
        </li>

        {/* Số điện thoại */}
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">
            <i className="relative">
              電話番号:<span className="note-red">*</span>
            </i>
          </label>
          <div className="col-sm col-sm-10">
            <input
              type="text"
              className="form-control"
              value={watchedValues.employeeTelephone}
              onChange={(e) => handleInputChange('employeeTelephone', e.target.value)}
              onBlur={() => handleInputBlur('employeeTelephone')}
            />
            {errors.employeeTelephone && (
              <div className="error-message mt-1">{errors.employeeTelephone.message}</div>
            )}
          </div>
        </li>

        {/* Mật khẩu (Chỉ hiển thị khi thêm mới) */}
        {mode === ADD && (
          <>
            <li className="form-group row d-flex">
              <label className="col-form-label col-sm-2">
                <i className="relative">
                  パスワード:<span className="note-red">*</span>
                </i>
              </label>
              <div className="col-sm col-sm-10">
                <input
                  type="password"
                  className="form-control"
                  value={watchedValues.employeeLoginPassword}
                  onChange={(e) => handleInputChange('employeeLoginPassword', e.target.value)}
                  onBlur={() => handleInputBlur('employeeLoginPassword')}
                />
                {errors.employeeLoginPassword && (
                  <div className="error-message mt-1">{errors.employeeLoginPassword.message}</div>
                )}
              </div>
            </li>

            <li className="form-group row d-flex">
              <label className="col-form-label col-sm-2">
                <i className="relative">パスワード（確認）:</i>
              </label>
              <div className="col-sm col-sm-10">
                <input
                  type="password"
                  className="form-control"
                  value={watchedValues.employeeLoginPasswordConfirm}
                  onChange={(e) => handleInputChange('employeeLoginPasswordConfirm', e.target.value)}
                  onBlur={() => handleInputBlur('employeeLoginPasswordConfirm')}
                />
                {errors.employeeLoginPasswordConfirm && (
                  <div className="error-message mt-1">{errors.employeeLoginPasswordConfirm.message}</div>
                )}
              </div>
            </li>
          </>
        )}

        <li className="title mt-12">
          <a href="#!">日本語能力</a>
        </li>

        {/* Chứng chỉ Nhật ngữ */}
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">
            <i className="relative">資格:</i>
          </label>
          <div className="col-sm col-sm-10">
            <select
              className="form-control"
              value={watchedValues.certificationId}
              onChange={(e) => handleInputChange('certificationId', e.target.value)}
              onBlur={() => handleInputBlur('certificationId')}
              disabled={uiStatus.isLoading}
            >
              <option value="">選択してください</option>
              {certifications.map((cert) => (
                <option key={cert.certificationId} value={String(cert.certificationId)}>
                  {cert.certificationName}
                </option>
              ))}
            </select>
            {errors.certificationId && (
              <div className="error-message mt-1">{errors.certificationId.message}</div>
            )}
          </div>
        </li>

        {/* Ngày cấp chứng chỉ */}
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">
            <i className="relative">
              資格交付日:<span className="note-red">*</span>
            </i>
          </label>
          <div className="col-sm col-sm-10 d-flex flex-column">
            <div className="datepicker-wrapper">
              <DatePicker
                selected={parseToDate(watchedValues.certificationStartDate)}
                onChange={(date) => handleDateChange('certificationStartDate', date)}
                onBlur={() => handleInputBlur('certificationStartDate')}
                dateFormat="yyyy/MM/dd"
                className="form-control"
                placeholderText="YYYY/MM/DD"
                disabled={!isCertificationSelected}
              />
              <span className="glyphicon-calendar" aria-hidden="true" />
            </div>
            {errors.certificationStartDate && (
              <div className="error-message mt-1">{errors.certificationStartDate.message}</div>
            )}
          </div>
        </li>

        {/* Ngày hết hạn */}
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">
            <i className="relative">
              失効日:<span className="note-red">*</span>
            </i>
          </label>
          <div className="col-sm col-sm-10 d-flex flex-column">
            <div className="datepicker-wrapper">
              <DatePicker
                selected={parseToDate(watchedValues.certificationEndDate)}
                onChange={(date) => handleDateChange('certificationEndDate', date)}
                onBlur={() => handleInputBlur('certificationEndDate')}
                dateFormat="yyyy/MM/dd"
                className="form-control"
                placeholderText="YYYY/MM/DD"
                disabled={!isCertificationSelected}
              />
              <span className="glyphicon-calendar" aria-hidden="true" />
            </div>
            {errors.certificationEndDate && (
              <div className="error-message mt-1">{errors.certificationEndDate.message}</div>
            )}
          </div>
        </li>

        {/* Điểm số */}
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">
            <i className="relative">点数:</i>
          </label>
          <div className="col-sm col-sm-10">
            <input
              type="text"
              className="form-control"
              value={watchedValues.employeeCertificationScore}
              onChange={(e) => handleInputChange('employeeCertificationScore', e.target.value)}
              onBlur={() => handleInputBlur('employeeCertificationScore')}
              disabled={!isCertificationSelected}
              maxLength={3}
            />
            {errors.employeeCertificationScore && (
              <div className="error-message mt-1">{errors.employeeCertificationScore.message}</div>
            )}
          </div>
        </li>

        {/* Nút bấm */}
        <li className="form-group row d-flex">
          <div className="btn-group col-sm col-sm-10 ml">
            <button
              type="submit"
              className="btn btn-primary btn-sm"
            >
              確認
            </button>
            <button
              type="button"
              onClick={handleBackClick}
              className="btn btn-secondary btn-sm"
            >
              戻る
            </button>
          </div>
        </li>
      </ul>
    </form>
  );
};

export default EmployeeInputForm;
