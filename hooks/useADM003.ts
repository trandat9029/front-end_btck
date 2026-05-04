/**
 * Copyright(C) [2026] - Luvina
 * [useADM003.ts], 28/04/2026 tranledat
 */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { employeeApi } from "@/lib/api/employee";
import { EmployeeDetailResponse } from "@/types/employee";
import * as Messages from "@/constants/messages";
import { formatBackendMessage } from "@/lib/utils/message";

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
      sessionStorage.setItem('SYSTEM_ERROR_MESSAGE', Messages.MSG_INVALID_EMPLOYEE_ID);
      router.push('/employees/systemError');
      return;
    }

    try {
      setIsLoading(true);
      const data = await employeeApi.getEmployeeById(employeeId);
      setEmployee(data);
    } catch (error: any) {
      console.error("Error fetching employee detail:", error);
      // Chuyển hướng sang màn hình lỗi hệ thống khi có lỗi từ server kèm message
      const backendError = error.response?.data?.message;
      const errorMsg = formatBackendMessage(backendError) || Messages.MSG_ERROR_SERVER_CONNECTION;
      
      sessionStorage.setItem('SYSTEM_ERROR_MESSAGE', errorMsg);
      router.push('/employees/systemError');
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
        router.push(`/employees/adm006?msg=${encodeURIComponent(successMsg)}`);
      } catch (error: any) {
        console.error("Error deleting employee:", error);
        // TH API trả về lỗi hiển thị ở màn SystemError với mã message lấy từ API
        const backendError = error.response?.data?.message;
        const errorMsg = formatBackendMessage(backendError) || Messages.MSG_ERROR_DELETE_FAILED;

        sessionStorage.setItem('SYSTEM_ERROR_MESSAGE', errorMsg);
        router.push('/employees/systemError');
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
    router.push(`/employees/adm004?id=${employeeId}&mode=edit${query}`);
  };

  /**
   * Hàm xử lý quay lại màn hình danh sách nhân viên (ADM002).
   */
  const handleBack = () => {
    router.push(returnQueryString ? `/employees/adm002?${returnQueryString}` : "/employees/adm002");
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
