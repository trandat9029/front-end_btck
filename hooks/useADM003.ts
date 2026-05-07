/**
 * Copyright(C) [2026] - Luvina
 * [useADM003.ts], 28/04/2026 tranledat
 */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios, { isAxiosError } from "axios";
import { employeeApi } from "@/lib/api/employee";
import { EmployeeDetailResponse } from "@/types/employee";
import * as Messages from "@/constants/messages";
import { formatBackendMessage } from "@/lib/utils/message";
import { ROUTES } from "@/constants/routes";
import { STORAGE_KEYS } from "@/constants/system";
import { EDIT } from "@/constants/employee";

/**
 * Hook xử lý logic cho màn hình chi tiết nhân viên (ADM003).
 * @author tranledat
 */
export const useADM003 = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const employeeIdStr = searchParams.get("id");
  const employeeId = employeeIdStr ? parseInt(employeeIdStr) : null;

  const returnQueryString = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('id');
    return params.toString();
  }, [searchParams]);

  const [employee, setEmployee] = useState<EmployeeDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Hàm thực hiện lấy thông tin chi tiết nhân viên từ API.
   * Sử dụng employeeId lấy từ URL để truy vấn dữ liệu.
   */
  const fetchEmployeeDetail = useCallback(async () => {
    // Nếu không có employeeId trong URL, chuyển sang màn hình lỗi hệ thống
    if (!employeeId) {
      sessionStorage.setItem(STORAGE_KEYS.SYSTEM_ERROR_MESSAGE, Messages.MSG_INVALID_EMPLOYEE_ID);
      router.push(ROUTES.SYSTEM_ERROR);
      return;
    }

    try {
      setIsLoading(true);
      const data = await employeeApi.getEmployeeById(employeeId);
      setEmployee(data);
    } catch (error) {
      console.error("Error fetching employee detail:", error);
      
      let errorMsg = Messages.MSG_ERROR_SERVER_CONNECTION;
      if (isAxiosError(error)) {
        const backendError = error.response?.data?.message;
        errorMsg = formatBackendMessage(backendError) || Messages.MSG_ERROR_SERVER_CONNECTION;
      }
      
      sessionStorage.setItem(STORAGE_KEYS.SYSTEM_ERROR_MESSAGE, errorMsg);
      router.push(ROUTES.SYSTEM_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, router]);

  useEffect(() => {
    void fetchEmployeeDetail();
  }, [fetchEmployeeDetail]);

  /**
   * Hàm xử lý khi người dùng nhấn nút Xóa.
   * Hiển thị xác nhận trước khi gọi API xóa nhân viên.
   */
  const handleDelete = async () => {
    if (!employeeId) return;

    if (confirm(Messages.MSG_CONFIRM_DELETE)) {
      try {
        const response = await employeeApi.deleteEmployee(employeeId);
        // TH API trả về trạng thái thành công: di chuyển sang MH complete với mã message được trả về từ API
        const successMsg = formatBackendMessage(response.message);
        router.push(`${ROUTES.ADM006}?msg=${encodeURIComponent(successMsg)}`);
      } catch (error) {
        console.error("Error deleting employee:", error);
        
        let errorMsg = Messages.MSG_ERROR_DELETE_FAILED;
        if (isAxiosError(error)) {
          const backendError = error.response?.data?.message;
          errorMsg = formatBackendMessage(backendError) || Messages.MSG_ERROR_DELETE_FAILED;
        }

        sessionStorage.setItem(STORAGE_KEYS.SYSTEM_ERROR_MESSAGE, errorMsg);
        router.push(ROUTES.SYSTEM_ERROR);
      }
    }
  };

  /**
   * Hàm điều hướng sang màn hình chỉnh sửa nhân viên (ADM004).
   * Truyền theo ID nhân viên và mode là 'edit'.
   */
  const handleEdit = () => {
    if (!employeeId) return;
    const query = returnQueryString ? `&${returnQueryString}` : "";
    router.push(`${ROUTES.ADM004}?id=${employeeId}&mode=${EDIT}${query}`);
  };

  /**
   * Hàm xử lý quay lại màn hình danh sách nhân viên (ADM002).
   */
  const handleBack = () => {
    router.push(returnQueryString ? `${ROUTES.ADM002}?${returnQueryString}` : ROUTES.ADM002);
  };

  return {
    employee,
    isLoading,
    errorMessage,
    handleDelete,
    handleEdit,
    handleBack,
  };
};
