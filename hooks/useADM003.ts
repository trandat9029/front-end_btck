/**
 * Copyright(C) 2024 Luvina
 * useADM003.ts, 24/04/2024 tranledat
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { employeeApi } from '@/lib/api/employee';
import { EmployeeDetailResponse } from '@/types/employee';

export const useADM003 = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('id');

  const [employeeDetail, setEmployeeDetail] = useState<EmployeeDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchEmployeeDetail = async () => {
      if (!employeeId) {
        setErrorMessage('Không tìm thấy ID nhân viên.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await employeeApi.getEmployeeById(employeeId);
        
        if (isMounted) {
          if (response && response.code === '200') {
            setEmployeeDetail(response);
            setErrorMessage(null);
          } else {
            setErrorMessage(response?.message || 'Đã xảy ra lỗi khi tải thông tin nhân viên.');
          }
        }
      } catch (error) {
        console.error('Error fetching employee detail:', error);
        if (isMounted) {
          setErrorMessage('Lỗi kết nối đến máy chủ.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchEmployeeDetail();

    return () => {
      isMounted = false;
    };
  }, [employeeId]);

  const handleBack = () => {
    router.push('/employees/adm002');
  };

  const handleEdit = () => {
    if (employeeId) {
      router.push(`/employees/adm004?mode=edit&id=${employeeId}`);
    }
  };

  return {
    employeeDetail,
    isLoading,
    errorMessage,
    handleBack,
    handleEdit,
  };
};
