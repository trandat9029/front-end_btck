/**
 * Copyright(C) 2024 Luvina
 * useADM005.ts, 24/04/2024 tranledat
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { certificationApi } from '@/lib/api/certifications';
import { departmentApi } from '@/lib/api/department';
import { employeeApi } from '@/lib/api/employee';
import { Certification } from '@/types/certifications';
import { Department } from '@/types/department';
import * as Messages from '@/constants/messages';
import {
  clearEmployeeFormDataStorage,
  loadEmployeeFormDataStorage
} from '@/lib/storage/employee';
import { formatBackendMessage } from '@/lib/utils/message';

/**
 * Hook quản lý logic và hành vi cho màn hình xác nhận thông tin nhân viên (ADM005).
 * @author tranledat
 */
export const useADM005 = () => {
  const router = useRouter();
  const storedSessionData = useMemo(() => loadEmployeeFormDataStorage(), []);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrorMessage, setServerErrorMessage] = useState('');

  /**
   * Điều hướng về màn nhập liệu nếu không có dữ liệu trong storage (truy cập trực tiếp URL).
   */
  useEffect(() => {
    if (!storedSessionData) {
      router.replace('/employees/adm004');
    }
  }, [storedSessionData, router]);

  /**
   * Load danh mục Master Data để hiển thị tên thay vì ID.
   */
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [departmentResponse, certificationResponse] = await Promise.all([
          departmentApi.getDepartments(),
          certificationApi.getCertifications(),
        ]);

        if (!isMounted) return;

        setDepartments(
          String(departmentResponse.code) === '200' ? departmentResponse.departments : []
        );
        setCertifications(
          String(certificationResponse.code) === '200'
            ? certificationResponse.certifications
            : []
        );
      } catch (error) {
        console.error('Error loading master data for ADM005:', error);
        if (isMounted) {
          setDepartments([]);
          setCertifications([]);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);


  /**
   * Lấy tên phòng ban từ ID đã lưu.
   */
  const departmentName = useMemo(() => {
    if (!storedSessionData?.formData.departmentId) {
      return '';
    }

    return (
      departments.find(
        (department) =>
          String(department.department_id) === storedSessionData.formData.departmentId
      )?.department_name ?? ''
    );
  }, [departments, storedSessionData]);

  /**
   * Lấy tên chứng chỉ từ ID đã lưu.
   */
  const certificationName = useMemo(() => {
    if (!storedSessionData?.formData.certificationId) {
      return '';
    }

    return (
      certifications.find(
        (certification) =>
          String(certification.certification_id) === storedSessionData.formData.certificationId
      )?.certification_name ?? ''
    );
  }, [certifications, storedSessionData]);

  /**
   * Xử lý xác nhận lưu thông tin nhân viên vào Database.
   */
  const handleSubmit = useCallback(async () => {
    if (!storedSessionData || isSubmitting) return;

    setIsSubmitting(true);
    setServerErrorMessage(''); // Reset thông báo lỗi

    try {
      const { formData, mode } = storedSessionData;
      const response =
        mode === 'edit'
          ? await employeeApi.updateEmployee(formData)
          : await employeeApi.addEmployee(formData);

      if (String(response.code) === '200') {
        clearEmployeeFormDataStorage();
        // Thành công: Dịch mã MSG00x
        const successMsg = formatBackendMessage(response.message);
        router.push(`/employees/adm006?msg=${encodeURIComponent(successMsg)}`);
      } else {
        // Lỗi nghiệp vụ (200 OK nhưng code != 200)
        const errorMsg = formatBackendMessage(response.message) || Messages.MSG_ERROR_SAVE_EMPLOYEE;
        setServerErrorMessage(errorMsg);
      }
    } catch (error: any) {
      console.error('Error saving employee:', error);
      // Lỗi hệ thống (500)
      const backendError = error.response?.data?.message;
      const errorMsg = formatBackendMessage(backendError) || Messages.MSG_ERROR_SYSTEM;
      
      sessionStorage.setItem('SYSTEM_ERROR_MESSAGE', errorMsg);
      router.push('/employees/systemError');
    } finally {
      setIsSubmitting(false);
    }
  }, [router, storedSessionData, isSubmitting]);

  /**
   * Xử lý quay lại màn hình nhập liệu (ADM004).
   */
  const handleCancel = useCallback(() => {
    if (storedSessionData?.mode === 'edit' && storedSessionData.employeeId) {
      router.push(`/employees/adm004?id=${storedSessionData.employeeId}&mode=back`);
      return;
    }

    router.push('/employees/adm004?mode=back');
  }, [storedSessionData, router]);

  return {
    storedSessionData,
    departmentName,
    certificationName,
    isSubmitting,
    serverErrorMessage,
    handleSubmit,
    handleCancel,
  };
};
