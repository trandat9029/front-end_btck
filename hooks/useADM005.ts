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
import * as MessageCode from '@/constants/messageCode';
import * as Messages from '@/constants/messages';
import {
  clearEmployeeFormDataStorage,
  loadEmployeeFormDataStorage
} from '@/lib/storage/employee';
import { extractErrorMessage } from '@/lib/utils/error';

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
          departmentResponse.code === '200' ? departmentResponse.departments : []
        );
        setCertifications(
          certificationResponse.code === '200'
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
   * Ánh xạ mã lỗi từ Backend sang thông điệp hiển thị.
   * @param code Mã lỗi (ví dụ: ER001, ER015)
   * @param fallbackMessage Thông điệp dự phòng nếu không tìm thấy mã
   * @returns Thông điệp tiếng Việt
   */
  const getErrorMessage = (code: string, fallbackMessage: string): string => {
    const errorMap: Record<string, string> = {
      'ER001': MessageCode.ER001,
      'ER002': MessageCode.ER002,
      'ER003': MessageCode.ER003,
      'ER004': MessageCode.ER004,
      'ER005': MessageCode.ER005,
      'ER006': MessageCode.ER006,
      'ER007': MessageCode.ER007,
      'ER008': MessageCode.ER008,
      'ER009': MessageCode.ER009,
      'ER011': MessageCode.ER011,
      'ER012': MessageCode.ER012,
      'ER013': MessageCode.ER013,
      'ER014': MessageCode.ER014,
      'ER015': MessageCode.ER015,
      'ER023': MessageCode.ER023,
      'MSG001': MessageCode.MSG001,
      'MSG002': MessageCode.MSG002,
      'MSG003': MessageCode.MSG003,
    };

    return errorMap[code] || fallbackMessage;
  };

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

      if (response.code === '200') {
        clearEmployeeFormDataStorage();
        // Ưu tiên lấy message từ backend nếu có, nếu không thì tự dịch ở frontend
        const successMsg = response.message.message || getErrorMessage(response.message.code, '');
        router.push(`/employees/adm006?msg=${encodeURIComponent(successMsg)}`);
      } else {
        // Có lỗi nghiệp vụ từ Backend (mã lỗi ERxxx)
        const errorMsg = extractErrorMessage(response, Messages.MSG_ERROR_SAVE_EMPLOYEE);
        // Nếu extract được mã lỗi, thử map qua bảng thông báo tiếng Việt
        setServerErrorMessage(getErrorMessage(errorMsg, errorMsg));
      }
    } catch (error: any) {
      console.error('Error saving employee:', error);
      const errorMsg = extractErrorMessage(error.response?.data, Messages.MSG_ERROR_SYSTEM);
      setServerErrorMessage(getErrorMessage(errorMsg, errorMsg));
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
