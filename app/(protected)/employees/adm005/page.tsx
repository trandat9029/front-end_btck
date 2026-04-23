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
    storedEmployeeData,
    departmentName,
    certificationName,
    isSubmitting,
    handleSubmit,
    handleCancel,
  } = useADM005();
 
  useEffect(() => {
    if (!storedEmployeeData) {
      router.replace('/employees/adm004');
    }
  }, [storedEmployeeData, router]);
 
  if (!storedEmployeeData) {
    return null;
  }
 
  return (
    <div className="row">
      <EmployeeFormConfirm
        storedEmployeeData={storedEmployeeData}
        departmentName={departmentName}
        certificationName={certificationName}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
