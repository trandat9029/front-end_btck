'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearEmployeeFormDraft, loadEmployeeFormDraft } from '@/hooks/useADM004';
import { certificationApi } from '@/lib/api/certifications';
import { departmentApi } from '@/lib/api/department';
import { Certification } from '@/types/certifications';
import { Department } from '@/types/department';

// Xu ly du lieu va hanh vi cho man hinh xac nhan ADM005.
export const useADM005 = () => {
  const router = useRouter();
  const draftEmployee = useMemo(() => loadEmployeeFormDraft(), []);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [departmentResponse, certificationResponse] = await Promise.all([
          departmentApi.getDepartments(),
          certificationApi.getCertifications(),
        ]);

        if (!isMounted) {
          return;
        }

        setDepartments(
          departmentResponse.code === '200' ? departmentResponse.departments : []
        );
        setCertifications(
          certificationResponse.code === '200'
            ? certificationResponse.certifications
            : []
        );
      } catch {
        if (!isMounted) {
          return;
        }

        setDepartments([]);
        setCertifications([]);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const departmentName = useMemo(() => {
    if (!draftEmployee?.formData.departmentId) {
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
    if (!draftEmployee?.formData.certificationId) {
      return '';
    }

    return (
      certifications.find(
        (certification) =>
          String(certification.certification_id) === draftEmployee.formData.certificationId
      )?.certification_name ?? ''
    );
  }, [certifications, draftEmployee]);

  const handleSubmit = useCallback(() => {
    clearEmployeeFormDraft();
    router.push('/employees/adm006');
  }, [router]);

  const handleCancel = useCallback(() => {
    if (draftEmployee?.mode === 'edit' && draftEmployee.employeeId) {
      router.push(`/employees/adm004?id=${draftEmployee.employeeId}`);
      return;
    }

    router.push('/employees/adm004');
  }, [draftEmployee, router]);

  return {
    draftEmployee,
    departmentName,
    certificationName,
    handleSubmit,
    handleCancel,
  };
};
