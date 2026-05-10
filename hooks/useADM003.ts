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
 * @return Dữ liệu nhân viên, trạng thái UI và các handler điều hướng
 */
export const useADM003 = () => {
  /** Hook đọc query string từ URL hiện tại */
  const searchParams = useSearchParams();

  /** Hook điều hướng trang */
  const router = useRouter();

  // --- 1. States & Configurations (Trạng thái và Cấu hình) ---

  /** ID nhân viên được lấy từ URL (dạng chuỗi, chưa parse) */
  const employeeIdStr = searchParams.get('id');

  /** ID nhân viên (số nguyên) hoặc null nếu không có trong URL */
  const employeeId = employeeIdStr ? parseInt(employeeIdStr) : null;

  /**
   * Chuỗi query string (không bao gồm tham số 'id') dùng để quay lại
   * màn hình ADM002 với đúng bộ lọc và phân trang đã áp dụng trước đó.
   */
  const returnQueryString = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('id');
    return params.toString();
  }, [searchParams]);

  /** Dữ liệu chi tiết của nhân viên được nạp từ Backend */
  const [employee, setEmployee] = useState<EmployeeDetailResponse | null>(null);

  /**
   * Trạng thái giao diện:
   * - isLoading: true khi đang gọi API lấy dữ liệu nhân viên
   */
  const [uiState, setUiState] = useState({
    isLoading: true,
  });

  // --- 2. Lifecycle (Vòng đời dữ liệu) ---

  /**
   * Gọi API Backend để lấy thông tin chi tiết của nhân viên theo ID.
   * Nếu không có ID trong URL, tự động chuyển hướng sang trang lỗi hệ thống.
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

  /**
   * Effect khởi tạo: Tự động gọi fetchEmployeeDetail khi component được mount
   * hoặc khi employeeId thay đổi.
   */
  useEffect(() => {
    void fetchEmployeeDetail();
  }, [fetchEmployeeDetail]);

  // --- 3. Handlers (Xử lý sự kiện) ---

  /**
   * Xử lý khi người dùng nhấn nút Xóa nhân viên (削除).
   * Hiển thị hộp thoại xác nhận trước khi thực hiện xóa.
   * Khi xóa thành công, chuyển hướng sang màn hình hoàn tất (ADM006).
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
   * Chuyển hướng sang màn hình chỉnh sửa nhân viên (ADM004) ở chế độ EDIT.
   * Truyền kèm ID nhân viên và query string để có thể quay lại đúng vị trí.
   */
  const handleEditClick = useCallback(() => {
    if (!employeeId) return;
    /** Query string bổ sung để quay về ADM002 với đúng bộ lọc cũ sau khi chỉnh sửa xong */
    const query = returnQueryString ? `&${returnQueryString}` : '';
    router.push(`${ROUTES.ADM004}?id=${employeeId}&mode=${EDIT}${query}`);
  }, [employeeId, returnQueryString, router]);

  /**
   * Quay lại màn hình danh sách nhân viên (ADM002).
   * Khôi phục lại đúng bộ lọc và phân trang trước đó thông qua returnQueryString.
   */
  const handleBackClick = useCallback(() => {
    const path = returnQueryString ? `${ROUTES.ADM002}?${returnQueryString}` : ROUTES.ADM002;
    router.push(path);
  }, [returnQueryString, router]);

  // --- 4. Helpers (Các hàm bổ trợ) ---

  /**
   * Xử lý tập trung các lỗi hệ thống.
   * Trích xuất thông báo từ phản hồi Axios nếu có, sau đó lưu vào sessionStorage
   * và chuyển hướng người dùng sang trang lỗi hệ thống.
   *
   * @param error      - Đối tượng lỗi bắt được từ catch block
   * @param defaultMsg - Thông báo lỗi mặc định khi không parse được lỗi từ Backend
   */
  const handleProcessSystemError = (error: unknown, defaultMsg: string) => {
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
