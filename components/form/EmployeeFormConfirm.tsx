/**
 * Copyright(C) 2024 Luvina
 * EmployeeFormConfirm.tsx, 24/04/2024 tranledat
 */

'use client';

import { useADM005 } from '@/hooks/useADM005';

/**
 * Component hiển thị màn hình xác nhận thông tin nhân viên trước khi lưu (ADM005).
 * Thực hiện kết nối trực tiếp với useADM005 để lấy logic và dữ liệu.
 * @author tranledat
 */
function EmployeeFormConfirm() {
  const {
    storedEmployeeData,
    departmentName,
    certificationName,
    isSubmitting,
    serverErrorMessage,
    handleSubmit,
    handleCancel,
  } = useADM005();

  // Nếu chưa có dữ liệu , không render gì cả
  if (!storedEmployeeData) {
    return null;
  }

  // Kiểm tra xem người dùng có chọn chứng chỉ nào không
  const hasCertification = !!storedEmployeeData.formData.certificationId;

  return (
    <form className="c-form box-shadow">
      <ul className="show-data">
        <li className="title">
          <p>情報確認</p>
          <p>入力された情報をOKボタンクリックでDBへ保存してください</p>
        </li>



        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">アカウント名</label>
          <div className="col-sm col-sm-10">{storedEmployeeData.formData.employeeLoginId}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">グループ</label>
          <div className="col-sm col-sm-10">{departmentName}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">氏名</label>
          <div className="col-sm col-sm-10">{storedEmployeeData.formData.employeeName}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">カナ氏名</label>
          <div className="col-sm col-sm-10">{storedEmployeeData.formData.employeeNameKana}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">生年月日</label>
          <div className="col-sm col-sm-10">{storedEmployeeData.formData.employeeBirthDate}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">メールアドレス</label>
          <div className="col-sm col-sm-10">{storedEmployeeData.formData.employeeEmail}</div>
        </li>

        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">電話番号</label>
          <div className="col-sm col-sm-10">{storedEmployeeData.formData.employeeTelephone}</div>
        </li>

        {/* Chỉ hiển thị phần chứng chỉ nếu người dùng có chọn */}
        {hasCertification && (
          <>
            <li className="title mt-12">
              <a href="#!">日本語能力</a>
            </li>
            <li className="form-group row d-flex">
              <label className="col-form-label col-sm-2">資格</label>
              <div className="col-sm col-sm-10">{certificationName}</div>
            </li>
            <li className="form-group row d-flex">
              <label className="col-form-label col-sm-2">資格交付日</label>
              <div className="col-sm col-sm-10">{storedEmployeeData.formData.certificationStartDate}</div>
            </li>
            <li className="form-group row d-flex">
              <label className="col-form-label col-sm-2">失効日</label>
              <div className="col-sm col-sm-10">{storedEmployeeData.formData.certificationEndDate}</div>
            </li>
            <li className="form-group row d-flex">
              <label className="col-form-label col-sm-2">点数</label>
              <div className="col-sm col-sm-10">{storedEmployeeData.formData.employeeCertificationScore}</div>
            </li>
          </>
        )}

        <li className="form-group row d-flex">
          <div className="btn-group col-sm col-sm-10 ml">
            <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-primary btn-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : 'OK'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary btn-sm"
              disabled={isSubmitting}
            >
              戻る
            </button>
          </div>
        </li>
      </ul>
    </form>
  );
}

export default EmployeeFormConfirm;
