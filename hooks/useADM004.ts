'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { certificationApi } from '@/lib/api/certifications';
import { Certification } from '@/types/certifications';
import { departmentApi } from '@/lib/api/department';
import { Department } from '@/types/department';

export const useADM004 = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentId, setDepartmentId] = useState('');
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [departmentErrorMessage, setDepartmentErrorMessage] = useState('');
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [certificationId, setCertificationId] = useState('');
  const [isLoadingCertifications, setIsLoadingCertifications] = useState(true);
  const [certificationErrorMessage, setCertificationErrorMessage] = useState('');

  // Tải danh sách phòng ban từ API để hiển thị cho combobox nhóm trên màn hình ADM004.
  const fetchDepartments = useCallback(async () => {
    setIsLoadingDepartments(true);
    setDepartmentErrorMessage('');

    try {
      const response = await departmentApi.getDepartments();

      if (response.code !== '200') {
        setDepartments([]);
        setDepartmentErrorMessage(response.message || 'Failed to load departments.');
        return;
      }

      setDepartments(response.departments);
    } catch (error) {
      setDepartments([]);
      setDepartmentErrorMessage(
        error instanceof Error ? error.message : 'Failed to load departments.'
      );
    } finally {
      setIsLoadingDepartments(false);
    }
  }, []);

  // Tải danh sách chứng chỉ từ API, đồng thời cập nhật trạng thái loading và lỗi cho màn hình.
  const fetchCertifications = useCallback(async () => {
    setIsLoadingCertifications(true);
    setCertificationErrorMessage('');

    try {
      const response = await certificationApi.getCertifications();

      if (response.code !== '200') {
        setCertifications([]);
        setCertificationErrorMessage(
          response.message || 'Failed to load certifications.'
        );
        return;
      }

      setCertifications(response.certifications);
    } catch (error) {
      setCertifications([]);
      setCertificationErrorMessage(
        error instanceof Error ? error.message : 'Failed to load certifications.'
      );
    } finally {
      setIsLoadingCertifications(false);
    }
  }, []);

  useEffect(() => {
    void fetchDepartments();
    void fetchCertifications();
  }, [fetchCertifications, fetchDepartments]);

  // Tìm thông tin chi tiết của chứng chỉ đang được chọn dựa trên certificationId hiện tại.
  const selectedCertification = useMemo(
    () =>
      certifications.find(
        (certification) => String(certification.certification_id) === certificationId
      ) ?? null,
    [certifications, certificationId]
  );

  const isCertificationSelected = certificationId !== '';

  return {
    departments,
    departmentId,
    setDepartmentId,
    isLoadingDepartments,
    departmentErrorMessage,
    certifications,
    certificationId,
    setCertificationId,
    selectedCertification,
    isCertificationSelected,
    isLoadingCertifications,
    certificationErrorMessage,
  };
};
