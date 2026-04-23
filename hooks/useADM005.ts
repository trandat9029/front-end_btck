'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearEmployeeFormDataStorage, loadEmployeeFormDataStorage } from '@/hooks/useADM004';
import { certificationApi } from '@/lib/api/certifications';
import { departmentApi } from '@/lib/api/department';
import { employeeApi } from '@/lib/api/employee';
import { Certification } from '@/types/certifications';
import { Department } from '@/types/department';

// Xu ly du lieu va hanh vi cho man hinh xac nhan ADM005.
export const useADM005 = () => {
  const router = useRouter();
  const storedEmployeeData = useMemo(() => loadEmployeeFormDataStorage(), []);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!storedEmployeeData?.formData.departmentId) {
      return '';
    }
 
    return (
      departments.find(
        (department) =>
          String(department.department_id) === storedEmployeeData.formData.departmentId
      )?.department_name ?? ''
    );
  }, [departments, storedEmployeeData]);

  const certificationName = useMemo(() => {
    if (!storedEmployeeData?.formData.certificationId) {
      return '';
    }
 
    return (
      certifications.find(
        (certification) =>
          String(certification.certification_id) === storedEmployeeData.formData.certificationId
      )?.certification_name ?? ''
    );
  }, [certifications, storedEmployeeData]);

  const handleSubmit = useCallback(async () => {
    if (!storedEmployeeData || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await employeeApi.addEmployee(storedEmployeeData.formData);
      
      if (response.code === '200') {
        clearEmployeeFormDataStorage();
        router.push('/employees/adm006');
      } else {
        // Co loi nghiep vu (vi du: trung loginId)
        alert(response.message || 'Có lỗi xảy ra khi lưu nhân viên');
      }
    } catch (error) {
      console.error('Lỗi khi gọi API addEmployee:', error);
      alert('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  }, [router, storedEmployeeData, isSubmitting]);

  const handleCancel = useCallback(() => {
    if (storedEmployeeData?.mode === 'edit' && storedEmployeeData.employeeId) {
      router.push(`/employees/adm004?id=${storedEmployeeData.employeeId}&mode=back`);
      return;
    }
 
    router.push('/employees/adm004?mode=back');
  }, [storedEmployeeData, router]);

  return {
    storedEmployeeData,
    departmentName,
    certificationName,
    isSubmitting,
    handleSubmit,
    handleCancel,
  };
};
