'use client';

import { useEffect } from 'react';
import EmpolyeeInputForm from '@/components/form/EmpolyeeInputForm';
import { ADD, EDIT } from '@/constants/employee';
import { useADM004 } from '@/hooks/useADM004';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { EmployeeFormMode } from '@/types/employee';

export default function EmployeeEditPage() {

  useAuth();
  const searchParams = useSearchParams();
  const rawEmployeeId = searchParams.get('id');
  const isBack = searchParams.get('mode') === 'back';

  const returnQueryParams = new URLSearchParams(searchParams.toString());
  returnQueryParams.delete('id');
  returnQueryParams.delete('mode'); // Xoa mode khoi return query string de khong bi anh huong khi quay lai ADM002
  const returnQueryString = returnQueryParams.toString();
  const employeeId =
    rawEmployeeId && /^\d+$/.test(rawEmployeeId)
      ? Number(rawEmployeeId)
      : undefined;
  const mode: EmployeeFormMode = employeeId ? EDIT : ADD;
 
  const {
    // ===== DATA =====
 
    departments, // danh sách phòng ban
    isLoadingDepartments, // trạng thái loading phòng ban
    departmentErrorMessage, // lỗi load phòng ban
 
    certifications, // danh sách chứng chỉ
    isCertificationSelected, // đã chọn certification chưa
    isLoadingCertifications, // loading chứng chỉ
    certificationErrorMessage, // lỗi chứng chỉ
 
    formData, // toàn bộ dữ liệu form
 
    isDataReady, // đã load xong data (sessionStorage) chưa
 
    // ===== ACTION =====
 
    updateFormField, // cập nhật từng field trong form
    saveFormData, // lưu dữ liệu vào sessionStorage (khi bấm confirm)
    clearFormData, // xóa dữ liệu sessionStorage (khi back hoặc submit)
    validate,
 
  } = useADM004(mode, isBack, employeeId);

  /**
   * Xoa mode=back khoi URL sau khi load xong draft
   * De cac lan reload (F5) tiep theo se clear draft dung yeu cau
   */
  useEffect(() => {
    if (isBack) {
      const url = new URL(window.location.href);
      url.searchParams.delete('mode');
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  }, [isBack]);

  /**
   * Render UI form
   * - truyền toàn bộ data + function xuống component
   */
  return (
    <div className="row">
      <EmpolyeeInputForm
        // ===== DATA =====
        departments={departments}
        isLoadingDepartments={isLoadingDepartments}
        departmentErrorMessage={departmentErrorMessage}

        certifications={certifications}
        isCertificationSelected={isCertificationSelected}
        isLoadingCertifications={isLoadingCertifications}
        certificationErrorMessage={certificationErrorMessage}

        formData={formData}
        isDataReady={isDataReady}

        // ===== ACTION =====
        onFormFieldChange={updateFormField} // xử lý khi user nhập
        onSaveData={saveFormData}           // khi bấm confirm
        onClearData={clearFormData}         // khi bấm back
        onValidate={validate}               // goi API validate o Backend

        /**
         * Query string để quay lại màn trước (ADM002)
         */
        returnQueryString={returnQueryString}
      />
    </div>
  );
}
