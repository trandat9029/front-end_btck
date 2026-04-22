'use client';

import { EmployeeFormDraft } from '@/types/employee';

type EmployeeFormConfirmProps = {
  draftEmployee: EmployeeFormDraft;
  departmentName: string;
  certificationName: string;
  onSubmit: () => void;
  onCancel: () => void;
};

// Hien thi man hinh xac nhan thong tin nhan vien truoc khi luu.
function EmployeeFormConfirm({
  draftEmployee,
  departmentName,
  certificationName,
  onSubmit,
  onCancel,
}: EmployeeFormConfirmProps) {
  return (
    <form className="c-form box-shadow">
      <ul className="show-data">
        <li className="title">
          <p>情報確認</p>
          <p>入力された情報をOKボタンクリックでDBへ保存してください</p>
        </li>
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">アカウント名</label>
          <div className="col-sm col-sm-10">{draftEmployee.formData.employeeLoginId}</div>
        </li>
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">グループ</label>
          <div className="col-sm col-sm-10">{departmentName}</div>
        </li>
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">氏名</label>
          <div className="col-sm col-sm-10">{draftEmployee.formData.employeeName}</div>
        </li>
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">カナ氏名</label>
          <div className="col-sm col-sm-10">{draftEmployee.formData.employeeNameKana}</div>
        </li>
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">生年月日</label>
          <div className="col-sm col-sm-10">{draftEmployee.formData.employeeBirthDate}</div>
        </li>
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">メールアドレス</label>
          <div className="col-sm col-sm-10">{draftEmployee.formData.employeeEmail}</div>
        </li>
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">電話番号</label>
          <div className="col-sm col-sm-10">{draftEmployee.formData.employeeTelephone}</div>
        </li>
        <li className="title mt-12">
          <a href="#!">日本語能力</a>
        </li>
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">資格</label>
          <div className="col-sm col-sm-10">{certificationName}</div>
        </li>
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">資格交付日</label>
          <div className="col-sm col-sm-10">{draftEmployee.formData.certificationStartDate}</div>
        </li>
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">失効日</label>
          <div className="col-sm col-sm-10">{draftEmployee.formData.certificationEndDate}</div>
        </li>
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">点数</label>
          <div className="col-sm col-sm-10">{draftEmployee.formData.score}</div>
        </li>
        <li className="form-group row d-flex">
          <div className="btn-group col-sm col-sm-10 ml">
            <button type="button" onClick={onSubmit} className="btn btn-primary btn-sm">
              OK
            </button>
            <button type="button" onClick={onCancel} className="btn btn-secondary btn-sm">
              戻る
            </button>
          </div>
        </li>
      </ul>
    </form>
  );
}

export default EmployeeFormConfirm;
