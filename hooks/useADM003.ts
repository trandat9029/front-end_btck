/**
 * Copyright(C) 2026 Luvina
 * [useADM003.ts], 26/04/2026 tranledat
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { employeeApi } from "@/lib/api/employee";
import { EmployeeDetailResponse } from "@/types/employee";

/**
 * Hook xử lý logic cho màn hình chi tiết nhân viên (ADM003).
 * @returns Các trạng thái và hàm xử lý cho ADM003
 */
export const useADM003 = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const employeeIdStr = searchParams.get("id");
  const employeeId = employeeIdStr ? parseInt(employeeIdStr) : null;

  const [employee, setEmployee] = useState<EmployeeDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Hàm thực hiện lấy thông tin chi tiết nhân viên từ API.
   * Sử dụng employeeId lấy từ URL để truy vấn dữ liệu.
   */
  const fetchEmployeeDetail = useCallback(async () => {
    if (!employeeId) {
      setErrorMessage("無効な社員IDです。");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await employeeApi.getEmployeeById(employeeId);
      setEmployee(data);
    } catch (error: any) {
      console.error("Error fetching employee detail:", error);
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("システムエラーが発生しました。");
      }
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    void fetchEmployeeDetail();
  }, [fetchEmployeeDetail]);

  /**
   * Hàm xử lý khi người dùng nhấn nút Xóa.
   * Hiển thị xác nhận trước khi gọi API xóa nhân viên.
   */
  const handleDelete = async () => {
    if (!employeeId) return;

    if (confirm("削除しますが、よろしいですか？")) {
      try {
        await employeeApi.deleteEmployee(employeeId);
        router.push("/employees/adm002");
      } catch (error: any) {
        console.error("Error deleting employee:", error);
        alert("削除に失敗しました。");
      }
    }
  };

  /**
   * Hàm điều hướng sang màn hình chỉnh sửa nhân viên (ADM004).
   * Truyền theo ID nhân viên và mode là 'edit'.
   */
  const handleEdit = () => {
    if (!employeeId) return;
    router.push(`/employees/adm004?id=${employeeId}&mode=edit`);
  };

  /**
   * Hàm xử lý quay lại màn hình danh sách nhân viên (ADM002).
   */
  const handleBack = () => {
    router.push("/employees/adm002");
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
