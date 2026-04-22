'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EmployeeFormConfirm from '@/components/form/EmployeeFormConfirm';
import { useAuth } from '@/hooks/useAuth';
import { useADM005 } from '@/hooks/useADM005';

// Dieu huong man hinh ADM005; neu khong co draft thi quay ve ADM004.
export default function EmployeeConfirmPage() {
  useAuth();
  const router = useRouter();
  const {
    draftEmployee,
    departmentName,
    certificationName,
    handleSubmit,
    handleCancel,
  } = useADM005();

  useEffect(() => {
    if (!draftEmployee) {
      router.replace('/employees/adm004');
    }
  }, [draftEmployee, router]);

  if (!draftEmployee) {
    return null;
  }

  return (
    <div className="row">
      <EmployeeFormConfirm
        draftEmployee={draftEmployee}
        departmentName={departmentName}
        certificationName={certificationName}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
