/**
 * Copyright(C) 2024 Luvina
 * useADM005.ts, 24/04/2024 tranledat
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { isAxiosError } from 'axios';
import { certificationApi } from '@/lib/api/certifications';
import { departmentApi } from '@/lib/api/department';
import { employeeApi } from '@/lib/api/employee';
import { Certification } from '@/types/certifications';
import { Department } from '@/types/department';
import * as Messages from '@/constants/messages';
import { clearEmployeeFormDataStorage, loadEmployeeFormDataStorage } from '@/lib/storage/employee';
import { formatBackendMessage } from '@/lib/utils/message';
import { ROUTES } from '@/constants/routes';
import { STORAGE_KEYS, HTTP_STATUS } from '@/constants/system';
import { EDIT } from '@/constants/employee';
import { ER022 } from '@/constants/messages';

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
   * Điều hướng về màn hình lỗi hệ thống nếu không có dữ liệu trong storage (truy cập trực tiếp URL).
   */
  useEffect(() => {
    if (!storedSessionData) {
      sessionStorage.setItem(STORAGE_KEYS.SYSTEM_ERROR_CODE, ER022);
      router.replace(ROUTES.SYSTEM_ERROR);
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
          String(departmentResponse.code) === String(HTTP_STATUS.OK) ? departmentResponse.departments : []
        );
        setCertifications(
          String(certificationResponse.code) === String(HTTP_STATUS.OK)
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
          String(department.departmentId) === storedSessionData.formData.departmentId
      )?.departmentName ?? ''
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
          String(certification.certificationId) === storedSessionData.formData.certificationId
      )?.certificationName ?? ''
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
        mode === EDIT
          ? await employeeApi.updateEmployee(formData)
          : await employeeApi.addEmployee(formData);

      if (String(response.code) === String(HTTP_STATUS.OK)) {
        clearEmployeeFormDataStorage();
        // Thành công: Dịch mã MSG00x
        const successMsg = formatBackendMessage(response.message);
        router.push(`${ROUTES.ADM006}?msg=${encodeURIComponent(successMsg)}`);
      } else {
        // Lỗi nghiệp vụ (200 OK nhưng code != 200)
        const errorMsg = formatBackendMessage(response.message) || Messages.MSG_ERROR_SAVE_EMPLOYEE;
        setServerErrorMessage(errorMsg);
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      
      let errorMsg = Messages.MSG_ERROR_SYSTEM;
      let errorCode = '';

      if (isAxiosError(error)) {
        const backendError = error.response?.data?.message;
        errorMsg = formatBackendMessage(backendError) || Messages.MSG_ERROR_SYSTEM;
        errorCode = backendError?.code || '';
      }
      
      sessionStorage.setItem(STORAGE_KEYS.SYSTEM_ERROR_MESSAGE, errorMsg);
      if (errorCode) {
        sessionStorage.setItem(STORAGE_KEYS.SYSTEM_ERROR_CODE, errorCode);
      }
      router.push(ROUTES.SYSTEM_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }, [router, storedSessionData, isSubmitting]);

  /**
   * Xử lý quay lại màn hình nhập liệu (ADM004).
   */
  const handleCancel = useCallback(() => {
    if (storedSessionData?.mode === EDIT && storedSessionData.employeeId) {
      router.push(`${ROUTES.ADM004}?id=${storedSessionData.employeeId}&mode=back`);
      return;
    }

    router.push(`${ROUTES.ADM004}?mode=back`);
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
