'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearEmployeeFormDraft } from '@/hooks/useADM004';
import { certificationApi } from '@/lib/api/certifications';
import { departmentApi } from '@/lib/api/department';
import { Certification } from '@/types/certifications';
import { Department } from '@/types/department';
import { EmployeeFormDraft } from '@/types/employee';

type EmployeeFormConfirmProps = {
  draftEmployee: EmployeeFormDraft;
};

// Hiển thị màn hình xác nhận thông tin nhân viên trước khi lưu.
function EmployeeFormConfirm({ draftEmployee }: EmployeeFormConfirmProps) {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  useEffect(() => {
    // Tải dữ liệu danh mục để hiển thị tên thay vì chỉ hiện ID đã lưu trong draft.
    const loadData = async () => {
      try {
        const [departmentResponse, certificationResponse] = await Promise.all([
          departmentApi.getDepartments(),
          certificationApi.getCertifications(),
        ]);

        if (departmentResponse.code === '200') {
          setDepartments(departmentResponse.departments);
        }

        if (certificationResponse.code === '200') {
          setCertifications(certificationResponse.certifications);
        }
      } catch {
        setDepartments([]);
        setCertifications([]);
      }
    };

    void loadData();
  }, []);

  const departmentName = useMemo(() => {
    // Tìm tên phòng ban theo departmentId người dùng đã chọn.
    if (!draftEmployee.formData.departmentId) {
      return '';
    }

    return (
      departments.find(
        (department) =>
          String(department.department_id) === draftEmployee.formData.departmentId
      )?.department_name ?? ''
    );
  }, [departments, draftEmployee]);

  const certificationName = useMemo(() => {
    // Tìm tên chứng chỉ theo certificationId người dùng đã chọn.
    if (!draftEmployee.formData.certificationId) {
      return '';
    }

    return (
      certifications.find(
        (certification) =>
          String(certification.certification_id) === draftEmployee.formData.certificationId
      )?.certification_name ?? ''
    );
  }, [certifications, draftEmployee]);

  // Xóa dữ liệu nháp và chuyển sang màn hình hoàn tất khi người dùng bấm OK.
  const handleSubmit = () => {
    clearEmployeeFormDraft();
    router.push('/employees/adm006');
  };

  // Quay lại ADM004 và giữ nguyên query string trước đó nếu có.
  const handleCancel = () => {
    if (draftEmployee.mode === 'edit' && draftEmployee.employeeId) {
      router.push(`/employees/adm004?id=${draftEmployee.employeeId}`);
      return;
    }

    router.push('/employees/adm004');
  };

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
          <label className="col-form-label col-sm-2">カタカナ氏名</label>
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
            <button type="button" onClick={handleSubmit} className="btn btn-primary btn-sm">
              OK
            </button>
            <button type="button" onClick={handleCancel} className="btn btn-secondary btn-sm">
              戻る
            </button>
          </div>
        </li>
      </ul>
    </form>
  );
}

export default EmployeeFormConfirm;
