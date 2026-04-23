'use client';

import { format, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Certification } from '@/types/certifications';
import { Department } from '@/types/department';
import { EmployeeFormData } from '@/types/employee';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema } from '@/lib/validation/employee';

type EmployeeInputFormProps = {
  departments: Department[];
  isLoadingDepartments: boolean;
  departmentErrorMessage: string;
  certifications: Certification[];
  isLoadingCertifications: boolean;
  certificationErrorMessage: string;
  formData: EmployeeFormData;
  isCertificationSelected: boolean;
  isDataReady: boolean;
  serverErrorMessage?: string;
  onFormFieldChange: <K extends keyof EmployeeFormData>(
    field: K,
    value: EmployeeFormData[K]
  ) => void;
  onSaveData: () => void;
  onClearData: () => void;
  onValidate: () => Promise<{ field: string; message: string }[]>;
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
  isDataReady,
  onFormFieldChange,
  onSaveData,
  onClearData,
  onValidate,
  returnQueryString = '',
}: EmployeeInputFormProps) {
  const router = useRouter();

  // Khởi tạo React Hook Form với Zod Schema (employeeSchema) để xử lý Validation
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }, // errors chứa toàn bộ các lỗi validation trả về từ Zod
    setValue,
    trigger, // Hàm trigger dùng để ép chạy validate thủ công
    setError, // Dùng để inject lỗi từ server vào form
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema), // Kết nối Zod Schema vào Hook Form
    defaultValues: formData, // Lấy dữ liệu mặc định từ state của component cha (qua useADM004)
    mode: 'onBlur', // Trigger validate khi người dùng click ra ngoài (blur)
    reValidateMode: 'onChange' // Validate lại liên tục khi người dùng bắt đầu gõ để sửa lỗi
  });

  // Đồng bộ dữ liệu từ cha vào Hook Form khi load xong (ví dụ quay lại từ màn ADM005)
  useEffect(() => {
    if (isDataReady) {
      reset(formData);
    }
  }, [isDataReady, reset]); // Chỉ chạy khi data từ sessionStorage đã sẵn sàng
 
  // Hàm trung gian xử lý khi một field thay đổi giá trị
  const handleFieldChange = (field: keyof EmployeeFormData, value: any) => {
    // 1. Đồng bộ giá trị lên state formData ở component cha (để phục vụ việc lưu data/submit)
    onFormFieldChange(field, value);
    // 2. Cập nhật giá trị vào React Hook Form và ép chạy validate (bắn lỗi Zod nếu có) ngay lập tức
    setValue(field, value, { shouldValidate: true });
  };

  // Hàm xử lý khi người dùng focus vào field rồi nhấn click ra ngoài (blur)
  const handleFieldBlur = (field: keyof EmployeeFormData) => {
    // Báo cho Hook Form kiểm tra lỗi riêng trường này
    trigger(field);
  };

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
    const strValue = value ? format(value, 'yyyy-MM-dd') : '';
    onFormFieldChange(field, strValue);
    setValue(field, strValue, { shouldValidate: true });
  };

  // Xử lý khi click nút "Xác nhận" (Confirm)
  // Được bọc trong handleSubmit của React Hook Form: 
  // -> Chỉ khi KHÔNG CÓ LỖI VALIDATION nào ở Client (Zod) thì code callback bên trong mới được chạy
  const handleConfirm = handleSubmit(async () => {
    // Gọi API validate ở Backend
    const serverErrors = await onValidate();
 
    if (serverErrors.length === 0) {
      onSaveData(); // Lưu form data hiện tại vào sessionStorage
      router.push('/employees/adm005'); // Chuyển sang màn hình Xác nhận
    } else {
      // Nếu có lỗi từ server, inject vào Hook Form để hiển thị dưới từng field tương ứng
      serverErrors.forEach((error) => {
        setError(error.field as any, {
          type: 'server',
          message: error.message
        });
      });
    }
  });

  const handleBack = () => {
    onClearData();
    router.push(
      returnQueryString
        ? `/employees/adm002?${returnQueryString}`
        : '/employees/adm002'
    );
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
                // Khi gõ sẽ gọi hàm handleFieldChange để vừa update state cha, vừa báo cho Zod Validate
                handleFieldChange('employeeLoginId', event.target.value)
              }
              onBlur={() => handleFieldBlur('employeeLoginId')}
            />
            {/* Nếu Zod bắt được lỗi ở trường này, errors.employeeLoginId sẽ có giá trị và hiển thị message lỗi màu đỏ */}
            {errors.employeeLoginId && <div className="text-danger mt-1 error-message">{errors.employeeLoginId.message}</div>}
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
