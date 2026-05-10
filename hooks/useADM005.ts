/**
 * Copyright(C) 2024 Luvina
 * useADM005.ts, 10/05/2026 tranledat
 * 
 * Hook quản lý logic cho màn hình ADM005 (Xác nhận thông tin trước khi lưu).
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';

// --- Imports (Constants, APIs, Types) ---
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

/**
 * Hook quản lý logic cho màn hình xác nhận thông tin trước khi lưu (ADM005).
 * Bao gồm: Nạp lại dữ liệu từ Storage, ánh xạ tên hiển thị và thực hiện lưu vào DB.
 * 
 * @author tranledat
 */
export const useADM005 = () => {
  const router = useRouter();

  // --- 1. States & Configurations (Trạng thái và Cấu hình) ---

  // Lấy dữ liệu tạm thời từ SessionStorage
  const storedData = useMemo(() => loadEmployeeFormDataStorage(), []);

  // Master Data phục vụ việc ánh xạ ID -> Tên hiển thị
  const [masterData, setMasterData] = useState<{
    departments: Department[];
    certifications: Certification[];
  }>({
    departments: [],
    certifications: []
  });

  // Trạng thái giao diện
  const [uiState, setUiState] = useState({
    isSubmitting: false, // Trạng thái đang gọi API lưu dữ liệu
  });

  // --- 2. Lifecycle (Vòng đời dữ liệu) ---

  /**
   * Effect: Bảo vệ trang. Nếu không có dữ liệu (truy cập trực tiếp URL) -> Đẩy sang trang lỗi.
   */
  useEffect(() => {
    if (!storedData) {
      sessionStorage.setItem(STORAGE_KEYS.SYSTEM_ERROR_CODE, Messages.ER022);
      router.replace(ROUTES.SYSTEM_ERROR);
    }
  }, [storedData, router]);

  /**
   * Effect: Nạp danh mục phòng ban và chứng chỉ.
   */
  useEffect(() => {
    let isMounted = true;
    const fetchMasterData = async () => {
      try {
        const [deptRes, certRes] = await Promise.all([
          departmentApi.getDepartments(),
          certificationApi.getCertifications(),
        ]);

        if (isMounted) {
          setMasterData({
            departments: String(deptRes.code) === String(HTTP_STATUS.OK) ? deptRes.departments : [],
            certifications: String(certRes.code) === String(HTTP_STATUS.OK) ? certRes.certifications : []
          });
        }
      } catch (err) {
        console.error('ADM005 Fetch Master Data Error:', err);
      }
    };

    void fetchMasterData();
    return () => { isMounted = false; };
  }, []);

  // --- 3. Handlers (Xử lý sự kiện) ---

  /**
   * handleSubmitClick: Xử lý khi người dùng nhấn nút OK (Xác nhận lưu).
   */
  const handleSubmitClick = useCallback(async () => {
    if (!storedData || uiState.isSubmitting) return;

    setUiState({ isSubmitting: true });

    try {
      const { formData, mode } = storedData;

      // Thực hiện thêm mới hoặc cập nhật dựa trên mode
      const response = mode === EDIT
        ? await employeeApi.updateEmployee(formData)
        : await employeeApi.addEmployee(formData);

      if (String(response.code) === String(HTTP_STATUS.OK)) {
        // Thành công: Xóa Storage và chuyển sang màn hình hoàn tất ADM006
        clearEmployeeFormDataStorage();
        const successMsg = formatBackendMessage(response.message);
        router.push(`${ROUTES.ADM006}?msg=${encodeURIComponent(successMsg)}`);
      } else {
        // Thất bại: Chuyển hướng sang trang lỗi hệ thống kèm thông báo từ Backend
        const errorMsg = formatBackendMessage(response.message) || Messages.MSG_ERROR_SYSTEM;
        const errorCode = response.message?.code || '';

        sessionStorage.setItem(STORAGE_KEYS.SYSTEM_ERROR_MESSAGE, errorMsg);
        if (errorCode) sessionStorage.setItem(STORAGE_KEYS.SYSTEM_ERROR_CODE, errorCode);
        router.push(ROUTES.SYSTEM_ERROR);
      }
    } catch (error) {
      handleProcessSystemError(error);
    } finally {
      setUiState({ isSubmitting: false });
    }
  }, [router, storedData, uiState.isSubmitting]);

  /**
   * handleBackClick: Quay lại màn hình nhập liệu (ADM004) kèm theo mode=back.
   */
  const handleBackClick = useCallback(() => {
    const query = storedData?.employeeId ? `?id=${storedData.employeeId}&mode=back` : '?mode=back';
    router.push(`${ROUTES.ADM004}${query}`);
  }, [storedData, router]);

  // --- 4. Helpers (Các hàm bổ trợ) ---

  /**
   * departmentName: Ánh xạ ID phòng ban sang tên hiển thị.
   */
  const departmentName = useMemo(() => {
    const deptId = storedData?.formData.departmentId;
    if (!deptId) return '';
    return masterData.departments.find(d => String(d.departmentId) === deptId)?.departmentName ?? '';
  }, [masterData.departments, storedData]);

  /**
   * certificationName: Ánh xạ ID chứng chỉ sang tên hiển thị.
   */
  const certificationName = useMemo(() => {
    const certId = storedData?.formData.certificationId;
    if (!certId) return '';
    return masterData.certifications.find(c => String(c.certificationId) === certId)?.certificationName ?? '';
  }, [masterData.certifications, storedData]);

  /**
   * handleProcessSystemError: Xử lý lỗi hệ thống tập trung.
   */
  const handleProcessSystemError = (error: any) => {
    console.error('ADM005 System Error:', error);
    let errorMsg = Messages.MSG_ERROR_SYSTEM;
    let errorCode = '';

    if (isAxiosError(error)) {
      const backendError = error.response?.data?.message;
      errorMsg = formatBackendMessage(backendError) || Messages.MSG_ERROR_SYSTEM;
      errorCode = backendError?.code || '';
    }

    sessionStorage.setItem(STORAGE_KEYS.SYSTEM_ERROR_MESSAGE, errorMsg);
    if (errorCode) sessionStorage.setItem(STORAGE_KEYS.SYSTEM_ERROR_CODE, errorCode);
    router.push(ROUTES.SYSTEM_ERROR);
  };

  return {
    // States & Metadata
    storedData,
    uiState,

    // Computed Values
    departmentName,
    certificationName,

    // Handlers
    handleSubmitClick,
    handleBackClick,
  };
};
