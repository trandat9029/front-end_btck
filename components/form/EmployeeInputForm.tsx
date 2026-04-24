'use client';

import { parseISO } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useADM004 } from '@/hooks/useADM004';

function EmployeeInputForm() {
  const {
    departments,
    isLoadingDepartments,
    departmentErrorMessage,
    certifications,
    isLoadingCertifications,
    certificationErrorMessage,
    formData,
    isCertificationSelected,
    errors,
    handleFieldChange,
    handleFieldBlur,
    handleDateChange,
    handleConfirm,
    handleBack,
  } = useADM004();

  const getDateValue = (value: string) => {
    if (!value) {
      return null;
    }
    // Chuyển dấu / thành - để Date object hiểu được định dạng ISO chuẩn khi khởi tạo
    return new Date(value.replace(/\//g, '-'));
  };

  return (
    <form className="c-form box-shadow" onSubmit={(e) => { e.preventDefault(); }}>
      <ul>
        <li className="title">会員情報編集</li>
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">
            <i className="relative">
              アカウント名:<span className="note-red">*</span>
            </i>
          </label>
          <div className="col-sm col-sm-10">
            <input
              type="text"
              className="form-control"
              value={formData.employeeLoginId}
              onChange={(event) =>
                // Khi gõ sẽ gọi hàm handleFieldChange để vừa update state, vừa báo cho Zod Validate
                handleFieldChange('employeeLoginId', event.target.value)
              }
              onBlur={() => handleFieldBlur('employeeLoginId')}
            />
            {/* Nếu Zod bắt được lỗi ở trường này, errors.employeeLoginId sẽ có giá trị và hiển thị message lỗi màu đỏ */}
            {errors.employeeLoginId && <div className="text-danger mt-1 error-message">{errors.employeeLoginId.message}</div>}
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
              value={formData.departmentId}
              onChange={(event) =>
                handleFieldChange('departmentId', event.target.value)
              }
              onBlur={() => handleFieldBlur('departmentId')}
              disabled={isLoadingDepartments}
            >
              <option value="">選択してください</option>
              {departments.map((department) => (
                <option
                  key={department.department_id}
                  value={String(department.department_id)}
                >
                  {department.department_name}
                </option>
              ))}
            </select>
            {departmentErrorMessage && (
              <div className="text-danger mt-1">{departmentErrorMessage}</div>
            )}
            {errors.departmentId && <div className="text-danger mt-1 error-message">{errors.departmentId.message}</div>}
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
              value={formData.employeeName}
              onChange={(event) => handleFieldChange('employeeName', event.target.value)}
              onBlur={() => handleFieldBlur('employeeName')}
            />
            {errors.employeeName && <div className="text-danger mt-1 error-message">{errors.employeeName.message}</div>}
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
              value={formData.employeeNameKana}
              onChange={(event) =>
                handleFieldChange('employeeNameKana', event.target.value)
              }
              onBlur={() => handleFieldBlur('employeeNameKana')}
            />
            {errors.employeeNameKana && <div className="text-danger mt-1 error-message">{errors.employeeNameKana.message}</div>}
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
                selected={getDateValue(formData.employeeBirthDate)}
                onChange={(date) => handleDateChange('employeeBirthDate', date)}
                onBlur={() => handleFieldBlur('employeeBirthDate')}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                placeholderText="YYYY-MM-DD"
              />
              <span className="glyphicon-calendar" aria-hidden="true" />
            </div>
            {errors.employeeBirthDate && <div className="text-danger mt-1 error-message">{errors.employeeBirthDate.message}</div>}
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
              value={formData.employeeEmail}
              onChange={(event) => handleFieldChange('employeeEmail', event.target.value)}
              onBlur={() => handleFieldBlur('employeeEmail')}
            />
            {errors.employeeEmail && <div className="text-danger mt-1 error-message">{errors.employeeEmail.message}</div>}
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
              value={formData.employeeTelephone}
              onChange={(event) =>
                handleFieldChange('employeeTelephone', event.target.value)
              }
              onBlur={() => handleFieldBlur('employeeTelephone')}
            />
            {errors.employeeTelephone && <div className="text-danger mt-1 error-message">{errors.employeeTelephone.message}</div>}
          </div>
        </li>

        {/* Mật khẩu */}
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
              value={formData.employeeLoginPassword}
              onChange={(event) =>
                handleFieldChange('employeeLoginPassword', event.target.value)
              }
              onBlur={() => handleFieldBlur('employeeLoginPassword')}
            />
            {errors.employeeLoginPassword && <div className="text-danger mt-1 error-message">{errors.employeeLoginPassword.message}</div>}
          </div>
        </li>

        {/* Xác nhận mật khẩu */}
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">
            <i className="relative">パスワード（確認）:</i>
          </label>
          <div className="col-sm col-sm-10">
            <input
              type="password"
              className="form-control"
              value={formData.employeeLoginPasswordConfirm}
              onChange={(event) =>
                handleFieldChange('employeeLoginPasswordConfirm', event.target.value)
              }
              onBlur={() => handleFieldBlur('employeeLoginPasswordConfirm')}
            />
            {errors.employeeLoginPasswordConfirm && <div className="text-danger mt-1 error-message">{errors.employeeLoginPasswordConfirm.message}</div>}
          </div>
        </li>
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
              value={formData.certificationId}
              onChange={(event) =>
                handleFieldChange('certificationId', event.target.value)
              }
              onBlur={() => handleFieldBlur('certificationId')}
              disabled={isLoadingCertifications}
            >
              <option value="">選択してください</option>
              {certifications.map((certification) => (
                <option
                  key={certification.certification_id}
                  value={String(certification.certification_id)}
                >
                  {certification.certification_name}
                </option>
              ))}
            </select>
            {certificationErrorMessage && (
              <div className="text-danger mt-1">{certificationErrorMessage}</div>
            )}
            {errors.certificationId && <div className="text-danger mt-1 error-message">{errors.certificationId.message}</div>}
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
                selected={getDateValue(formData.certificationStartDate)}
                onChange={(date) => handleDateChange('certificationStartDate', date)}
                onBlur={() => handleFieldBlur('certificationStartDate')}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                placeholderText="YYYY-MM-DD"
                disabled={!isCertificationSelected}
              />
              <span className="glyphicon-calendar" aria-hidden="true" />
            </div>
            {errors.certificationStartDate && <div className="text-danger mt-1 error-message">{errors.certificationStartDate.message}</div>}
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
                selected={getDateValue(formData.certificationEndDate)}
                onChange={(date) => handleDateChange('certificationEndDate', date)}
                onBlur={() => handleFieldBlur('certificationEndDate')}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                placeholderText="YYYY-MM-DD"
                disabled={!isCertificationSelected}
              />
              <span className="glyphicon-calendar" aria-hidden="true" />
            </div>
            {errors.certificationEndDate && <div className="text-danger mt-1 error-message">{errors.certificationEndDate.message}</div>}
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
              value={formData.employeeCertificationScore}
              onChange={(event) => handleFieldChange('employeeCertificationScore', event.target.value)}
              onBlur={() => handleFieldBlur('employeeCertificationScore')}
              disabled={!isCertificationSelected}
            />
            {errors.employeeCertificationScore && <div className="text-danger mt-1 error-message">{errors.employeeCertificationScore.message}</div>}
          </div>
        </li>

        {/* Nút bấm điều hướng */}
        <li className="form-group row d-flex">
          <div className="btn-group col-sm col-sm-10 ml">
            <button type="button" onClick={handleConfirm} className="btn btn-primary btn-sm">
              確認
            </button>
            <button type="button" onClick={handleBack} className="btn btn-secondary btn-sm">
              戻る
            </button>
          </div>
        </li>
      </ul>
    </form>
  );
}

export default EmployeeInputForm;
