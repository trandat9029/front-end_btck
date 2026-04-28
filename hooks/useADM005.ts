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

/**
 * Hook quản lý logic và hành vi cho màn hình xác nhận thông tin nhân viên (ADM005).
 * @author tranledat
 */
export const useADM005 = () => {
  const router = useRouter();
  const storedEmployeeData = useMemo(() => loadEmployeeFormDataStorage(), []);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrorMessage, setServerErrorMessage] = useState('');

  /**
   * Điều hướng về màn nhập liệu nếu không có dữ liệu trong storage (truy cập trực tiếp URL).
   */
  useEffect(() => {
    if (!storedEmployeeData) {
      router.replace('/employees/adm004');
    }
  }, [storedEmployeeData, router]);

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

  /**
   * Lấy tên chứng chỉ từ ID đã lưu.
   */
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

  /**
   * Xử lý xác nhận lưu thông tin nhân viên vào Database.
   */
  const handleSubmit = useCallback(async () => {
    if (!storedEmployeeData || isSubmitting) return;

    setIsSubmitting(true);
    setServerErrorMessage(''); // Reset thông báo lỗi

    try {
      const { formData, mode } = storedEmployeeData;
      const response =
        mode === 'edit'
          ? await employeeApi.updateEmployee(formData)
          : await employeeApi.addEmployee(formData);

      if (response.code === '200') {
        clearEmployeeFormDataStorage();
        // Lấy thông điệp thành công dựa trên mã trả về từ API (MSG001 hoặc MSG002)
        const successMsgCode = response.message.code;
        const successMsg = getErrorMessage(successMsgCode, '');
        router.push(`/employees/adm006?msg=${encodeURIComponent(successMsg)}`);
      } else {
        // Có lỗi từ Backend (Lỗi nghiệp vụ hoặc mã lỗi ERxxx)
        const errorMessage = getErrorMessage(response.code, response.message?.code ? getErrorMessage(response.message.code, response.message.code) : Messages.MSG_ERROR_SAVE_EMPLOYEE);
        setServerErrorMessage(errorMessage);
      }
    } catch (error) {
      setServerErrorMessage(Messages.MSG_ERROR_SYSTEM); // Lỗi hệ thống
    } finally {
      setIsSubmitting(false);
    }
  }, [router, storedEmployeeData, isSubmitting]);

  /**
   * Xử lý quay lại màn hình nhập liệu (ADM004).
   */
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
    serverErrorMessage,
    handleSubmit,
    handleCancel,
  };
};
