/**
 * Copyright(C) [2026] - Luvina
 * [useADM003.ts], 28/04/2026 tranledat
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';

// --- Imports (Constants, APIs, Types) ---
import { employeeApi } from '@/lib/api/employee';
import { EmployeeDetailResponse } from '@/types/employee';
import * as Messages from '@/constants/messages';
import { formatBackendMessage } from '@/lib/utils/message';
import { ROUTES } from '@/constants/routes';
import { STORAGE_KEYS } from '@/constants/system';
import { EDIT } from '@/constants/employee';

/**
 * Hook quản lý logic cho màn hình chi tiết nhân viên (ADM003).
 * Bao gồm: Lấy thông tin chi tiết, xử lý xóa và chuyển hướng sang trang chỉnh sửa.
 * 
 * @author tranledat
 */
export const useADM003 = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // --- 1. States & Configurations (Trạng thái và Cấu hình) ---

  // Lấy ID nhân viên từ URL
  const employeeIdStr = searchParams.get('id');
  const employeeId = employeeIdStr ? parseInt(employeeIdStr) : null;

  // Chuỗi query để quay lại màn hình danh sách (ADM002) với đúng bộ lọc/phân trang cũ
  const returnQueryString = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('id');
    return params.toString();
  }, [searchParams]);

  // Dữ liệu chi tiết nhân viên
  const [employee, setEmployee] = useState<EmployeeDetailResponse | null>(null);

  // Trạng thái giao diện
  const [uiState, setUiState] = useState({
    isLoading: true, // Trạng thái đang tải dữ liệu
  });

  // --- 2. Lifecycle (Vòng đời dữ liệu) ---

  /**
   * fetchEmployeeDetail: Lấy dữ liệu chi tiết nhân viên từ Server.
   */
  const fetchEmployeeDetail = useCallback(async () => {
    // Nếu không có ID trong URL -> Đẩy sang trang lỗi hệ thống
    if (!employeeId) {
      sessionStorage.setItem(STORAGE_KEYS.SYSTEM_ERROR_MESSAGE, Messages.MSG_INVALID_EMPLOYEE_ID);
      router.push(ROUTES.SYSTEM_ERROR);
      return;
    }

    try {
      setUiState({ isLoading: true });
      const data = await employeeApi.getEmployeeById(employeeId);
      setEmployee(data);
    } catch (error) {
      handleProcessSystemError(error, Messages.MSG_ERROR_SERVER_CONNECTION);
    } finally {
      setUiState({ isLoading: false });
    }
  }, [employeeId, router]);

  useEffect(() => {
    void fetchEmployeeDetail();
  }, [fetchEmployeeDetail]);

  // --- 3. Handlers (Xử lý sự kiện) ---

  /**
   * handleDeleteClick: Xử lý khi nhấn nút "Xóa".
   */
  const handleDeleteClick = useCallback(async () => {
    if (!employeeId) return;

    if (window.confirm(Messages.MSG_CONFIRM_DELETE)) {
      try {
        const response = await employeeApi.deleteEmployee(employeeId);
        // Thành công: Chuyển sang màn hình hoàn tất ADM006 kèm thông báo từ Backend
        const successMsg = formatBackendMessage(response.message);
        router.push(`${ROUTES.ADM006}?msg=${encodeURIComponent(successMsg)}`);
      } catch (error) {
        handleProcessSystemError(error, Messages.MSG_ERROR_DELETE_FAILED);
      }
    }
  }, [employeeId, router]);

  /**
   * handleEditClick: Chuyển hướng sang màn hình nhập liệu (ADM004) ở chế độ EDIT.
   */
  const handleEditClick = useCallback(() => {
    if (!employeeId) return;
    const query = returnQueryString ? `&${returnQueryString}` : '';
    router.push(`${ROUTES.ADM004}?id=${employeeId}&mode=${EDIT}${query}`);
  }, [employeeId, returnQueryString, router]);

  /**
   * handleBackClick: Quay lại màn hình danh sách (ADM002).
   */
  const handleBackClick = useCallback(() => {
    const path = returnQueryString ? `${ROUTES.ADM002}?${returnQueryString}` : ROUTES.ADM002;
    router.push(path);
  }, [returnQueryString, router]);

  // --- 4. Helpers (Các hàm bổ trợ) ---

  /**
   * handleProcessSystemError: Xử lý tập trung các lỗi hệ thống và điều hướng.
   */
  const handleProcessSystemError = (error: any, defaultMsg: string) => {
    console.error('ADM003 System Error:', error);
    let errorMsg = defaultMsg;

    if (isAxiosError(error)) {
      const backendError = error.response?.data?.message;
      errorMsg = formatBackendMessage(backendError) || defaultMsg;
    }

    sessionStorage.setItem(STORAGE_KEYS.SYSTEM_ERROR_MESSAGE, errorMsg);
    router.push(ROUTES.SYSTEM_ERROR);
  };

  return {
    // States
    employee,
    uiState,

    // Handlers
    handleDeleteClick,
    handleEditClick,
    handleBackClick,
  };
};
