'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EmployeeFormConfirm from '@/components/form/EmployeeFormConfirm';
import { useAuth } from '@/hooks/useAuth';
import { useADM005 } from '@/hooks/useADM005';

// Điều hướng màn hình ADM005; nếu không có draft thì quay về ADM004.
export default function EmployeeConfirmPage() {
  useAuth();
  const router = useRouter();
  const employeeData = useADM005();

  useEffect(() => {
    if (!employeeData) {
      router.replace('/employees/adm004');
    }
  }, [employeeData, router]);

  if (!employeeData) {
    return null;
  }

  return (
    <div className="row">
      <EmployeeFormConfirm employeeData={employeeData} />
    </div>
  );
}
