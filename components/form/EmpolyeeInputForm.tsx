'use client';

import { format, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Certification } from '@/types/certifications';
import { Department } from '@/types/department';
import { EmployeeFormData } from '@/types/employee';

type EmployeeInputFormProps = {
  departments: Department[];
  isLoadingDepartments: boolean;
  departmentErrorMessage: string;
  certifications: Certification[];
  isLoadingCertifications: boolean;
  certificationErrorMessage: string;
  formData: EmployeeFormData;
  isCertificationSelected: boolean;
  isDraftReady: boolean;
  onFormFieldChange: <K extends keyof EmployeeFormData>(
    field: K,
    value: EmployeeFormData[K]
  ) => void;
  onPersistDraft: () => void;
  onClearDraft: () => void;
  returnQueryString?: string;
};

function EmpolyeeInputForm({
  departments,
  isLoadingDepartments,
  departmentErrorMessage,
  certifications,
  isLoadingCertifications,
  certificationErrorMessage,
  formData,
  isCertificationSelected,
  isDraftReady,
  onFormFieldChange,
  onPersistDraft,
  onClearDraft,
  returnQueryString = '',
}: EmployeeInputFormProps) {
  const router = useRouter();

  const getDateValue = (value: string) => {
    if (!value) {
      return null;
    }

    return parseISO(value);
  };

  const handleDateChange = (
    field:
      | 'employeeBirthDate'
      | 'certificationStartDate'
      | 'certificationEndDate',
    value: Date | null
  ) => {
    onFormFieldChange(field, value ? format(value, 'yyyy-MM-dd') : '');
  };

  const handleConfirm = () => {
    onPersistDraft();
    router.push('/employees/adm005');
  };

  const handleBack = () => {
    onClearDraft();
    router.push(
      returnQueryString
        ? `/employees/adm002?${returnQueryString}`
        : '/employees/adm002'
    );
  };

  return (
    <form className="c-form box-shadow">
      <ul>
        <li className="title">会員情報編集</li>
        {!isDraftReady && (
          <li className="box-err">
            <div className="box-err-content">Đang khôi phục dữ liệu biểu mẫu...</div>
          </li>
        )}
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
                onFormFieldChange('employeeLoginId', event.target.value)
              }
            />
          </div>
        </li>
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
                onFormFieldChange('departmentId', event.target.value)
              }
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
          </div>
        </li>
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
              onChange={(event) => onFormFieldChange('employeeName', event.target.value)}
            />
          </div>
        </li>
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
                onFormFieldChange('employeeNameKana', event.target.value)
              }
            />
          </div>
        </li>
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">
            <i className="relative">
              生年月日:<span className="note-red">*</span>
            </i>
          </label>
          <div className="col-sm col-sm-10 d-flex">
            <div className="datepicker-wrapper">
              <DatePicker
                selected={getDateValue(formData.employeeBirthDate)}
                onChange={(date) => handleDateChange('employeeBirthDate', date)}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                placeholderText="YYYY-MM-DD"
              />
              <span className="glyphicon-calendar" aria-hidden="true" />
            </div>
          </div>
        </li>
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
              onChange={(event) => onFormFieldChange('employeeEmail', event.target.value)}
            />
          </div>
        </li>
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
                onFormFieldChange('employeeTelephone', event.target.value)
              }
            />
          </div>
        </li>
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
                onFormFieldChange('employeeLoginPassword', event.target.value)
              }
            />
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
              value={formData.employeeLoginPasswordConfirm}
              onChange={(event) =>
                onFormFieldChange('employeeLoginPasswordConfirm', event.target.value)
              }
            />
          </div>
        </li>
        <li className="title mt-12">
          <a href="#!">日本語能力</a>
        </li>
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">
            <i className="relative">資格:</i>
          </label>
          <div className="col-sm col-sm-10">
            <select
              className="form-control"
              value={formData.certificationId}
              onChange={(event) =>
                onFormFieldChange('certificationId', event.target.value)
              }
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
          </div>
        </li>
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">
            <i className="relative">
              資格交付日:<span className="note-red">*</span>
            </i>
          </label>
          <div className="col-sm col-sm-10 d-flex">
            <div className="datepicker-wrapper">
              <DatePicker
                selected={getDateValue(formData.certificationStartDate)}
                onChange={(date) => handleDateChange('certificationStartDate', date)}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                placeholderText="YYYY-MM-DD"
                disabled={!isCertificationSelected}
              />
              <span className="glyphicon-calendar" aria-hidden="true" />
            </div>
          </div>
        </li>
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">
            <i className="relative">
              失効日:<span className="note-red">*</span>
            </i>
          </label>
          <div className="col-sm col-sm-10 d-flex">
            <div className="datepicker-wrapper">
              <DatePicker
                selected={getDateValue(formData.certificationEndDate)}
                onChange={(date) => handleDateChange('certificationEndDate', date)}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                placeholderText="YYYY-MM-DD"
                disabled={!isCertificationSelected}
              />
              <span className="glyphicon-calendar" aria-hidden="true" />
            </div>
          </div>
        </li>
        <li className="form-group row d-flex">
          <label className="col-form-label col-sm-2">
            <i className="relative">点数:</i>
          </label>
          <div className="col-sm col-sm-10">
            <input
              type="number"
              className="form-control"
              value={formData.score}
              onChange={(event) => onFormFieldChange('score', event.target.value)}
              disabled={!isCertificationSelected}
            />
          </div>
        </li>
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

export default EmpolyeeInputForm;
