'use client';

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
  const returnQueryParams = new URLSearchParams(searchParams.toString());
  returnQueryParams.delete('id');
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

    isDraftReady, // đã load xong draft (sessionStorage) chưa

    // ===== ACTION =====

    updateFormField, // cập nhật từng field trong form
    persistDraft, // lưu dữ liệu vào sessionStorage (khi bấm confirm)
    clearDraft, // xóa dữ liệu sessionStorage (khi back hoặc submit)

  } = useADM004(mode, employeeId);

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
        isDraftReady={isDraftReady}

        // ===== ACTION =====
        onFormFieldChange={updateFormField} // xử lý khi user nhập
        onPersistDraft={persistDraft}       // khi bấm confirm
        onClearDraft={clearDraft}           // khi bấm back

        /**
         * Query string để quay lại màn trước (ADM002)
         */
        returnQueryString={returnQueryString}
      />
    </div>
  );
}
