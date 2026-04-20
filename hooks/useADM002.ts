'use client';

import { AxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_LIMIT, DEFAULT_SORTS } from '@/constants/employee';
import { departmentApi } from '@/lib/api/department';
import { employeeApi } from '@/lib/api/employee';
import {
  sanitizeEmployeeNameInput,
  validateEmployeeName,
} from '@/lib/validation/employee';
import { Department } from '@/types/department';
import {
  EmployeeListApiResponse,
  EmployeeListItem,
  SortOrder,
} from '@/types/employee';

type fetchEmployeesParams = {
  employeeName: string;
  departmentId: string;
  page?: number;
  limit?: number;
  ordEmployeeName?: SortOrder;
  ordCertificationName?: SortOrder;
  ordEndDate?: SortOrder;
};

/**
 * Hook quản lý state và nghiệp vụ cho màn hình ADM002.
 */
export const useADM002 = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [departmentErrorMessage, setDepartmentErrorMessage] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeNameErrorMessage, setEmployeeNameErrorMessage] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [employeeNameSort, setEmployeeNameSort] = useState<SortOrder>(
    DEFAULT_SORTS.ordEmployeeName
  );
  const [certificationSort, setCertificationSort] = useState<SortOrder>(
    DEFAULT_SORTS.ordCertificationName
  );
  const [endDateSort, setEndDateSort] = useState<SortOrder>(DEFAULT_SORTS.ordEndDate);

  /**
   * Tải danh sách nhân viên theo điều kiện tìm kiếm, sắp xếp và phân trang.
   */
  const fetchEmployees = useCallback(
    async ({
      employeeName: nextEmployeeName,
      departmentId: nextDepartmentId,
      page = 1,
      limit = DEFAULT_LIMIT,
      ordEmployeeName = DEFAULT_SORTS.ordEmployeeName,
      ordCertificationName = DEFAULT_SORTS.ordCertificationName,
      ordEndDate = DEFAULT_SORTS.ordEndDate,
    }: fetchEmployeesParams) => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await employeeApi.getEmployees({
          employee_name: nextEmployeeName.trim(),
          department_id: nextDepartmentId,
          ord_employee_name: ordEmployeeName,
          ord_certification_name: ordCertificationName,
          ord_end_date: ordEndDate,
          offset: Math.max(page - 1, 0) * limit,
          limit,
        });

        if (data.code !== '200') {
          throw new Error(data.message || 'Failed to load employees.');
        }

        setEmployees(data.employees ?? []);
        setTotalRecords(data.totalRecords ?? 0);
      } catch (error) {
        const apiError = error as AxiosError<EmployeeListApiResponse>;
        const responseMessage = apiError.response?.data?.message;

        setEmployees([]);
        setTotalRecords(0);
        setErrorMessage(
          responseMessage ||
            (error instanceof Error ? error.message : 'Failed to load employees.')
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Tải danh sách phòng ban để hiển thị dropdown nhóm trên ADM002.
   */
  const fetchDepartments = useCallback(async () => {
    try {
      const response = await departmentApi.getDepartments();

      if (response.code === '200') {
        setDepartments(response.departments);
        setDepartmentErrorMessage('');
        return;
      }

      setDepartments([]);
      setDepartmentErrorMessage('Failed to load departments.');
    } catch {
      setDepartments([]);
      setDepartmentErrorMessage('Failed to load departments.');
    }
  }, []);

  /**
   * Khởi tạo dữ liệu ban đầu cho ADM002: tải danh sách phòng ban và danh sách nhân viên ở trạng thái tìm kiếm mặc định.
   */
  useEffect(() => {
    void fetchDepartments();
    void fetchEmployees({
      employeeName: '',
      departmentId: '',
      page: 1,
      ordEmployeeName: DEFAULT_SORTS.ordEmployeeName,
      ordCertificationName: DEFAULT_SORTS.ordCertificationName,
      ordEndDate: DEFAULT_SORTS.ordEndDate,
    });
  }, [fetchDepartments, fetchEmployees]);

  /**
   * Tính tổng số trang từ tổng số bản ghi hiện tại.
   */
  const totalPages = Math.max(1, Math.ceil(totalRecords / DEFAULT_LIMIT));

  /**
   * Sinh dãy số trang cần hiển thị trên thanh phân trang.
   */
  const visiblePages = (() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
  })();

  /**
   * Chuẩn hóa và validate tên nhân viên khi người dùng thay đổi input tìm kiếm.
   */
  const handleEmployeeNameChange = (value: string) => {
    const nextValue = sanitizeEmployeeNameInput(value);

    setEmployeeName(nextValue);
    setEmployeeNameErrorMessage(validateEmployeeName(nextValue));
  };

  /**
   * Validate điều kiện tìm kiếm rồi tải lại danh sách nhân viên từ trang đầu tiên.
   */
  const handleSearch = async (nextEmployeeName = employeeName) => {
    const validationMessage = validateEmployeeName(nextEmployeeName);

    if (validationMessage) {
      setEmployeeNameErrorMessage(validationMessage);
      return false;
    }

    setCurrentPage(1);
    setEmployeeName(nextEmployeeName);
    setEmployeeNameErrorMessage('');

    await fetchEmployees({
      employeeName: nextEmployeeName,
      departmentId,
      page: 1,
      ordEmployeeName: employeeNameSort,
      ordCertificationName: certificationSort,
      ordEndDate: endDateSort,
    });

    return true;
  };

  /**
   * Chuyển trang hiện tại và tải dữ liệu tương ứng với trang được chọn.
   */
  const handlePageChange = async (page: number) => {
    const totalPages = Math.max(1, Math.ceil(totalRecords / DEFAULT_LIMIT));

    if (page < 1 || page > totalPages || page === currentPage || isLoading) {
      return;
    }

    setCurrentPage(page);

    await fetchEmployees({
      employeeName,
      departmentId,
      page,
      ordEmployeeName: employeeNameSort,
      ordCertificationName: certificationSort,
      ordEndDate: endDateSort,
    });
  };

  /**
   * Đảo chiều sort của cột được chọn rồi tải lại danh sách nhân viên.
   */
  const handleSortChange = async (
    sortKey: 'employeeName' | 'certification' | 'endDate'
  ) => {
    const nextEmployeeNameSort =
      sortKey === 'employeeName'
        ? employeeNameSort === 'asc'
          ? 'desc'
          : 'asc'
        : employeeNameSort;
    const nextCertificationSort =
      sortKey === 'certification'
        ? certificationSort === 'asc'
          ? 'desc'
          : 'asc'
        : certificationSort;
    const nextEndDateSort =
      sortKey === 'endDate'
        ? endDateSort === 'asc'
          ? 'desc'
          : 'asc'
        : endDateSort;

    setEmployeeNameSort(nextEmployeeNameSort);
    setCertificationSort(nextCertificationSort);
    setEndDateSort(nextEndDateSort);
    setCurrentPage(1);

    await fetchEmployees({
      employeeName,
      departmentId,
      page: 1,
      ordEmployeeName: nextEmployeeNameSort,
      ordCertificationName: nextCertificationSort,
      ordEndDate: nextEndDateSort,
    });
  };

  return {
    departments,
    employees,
    totalRecords,
    isLoading,
    errorMessage,
    departmentErrorMessage,
    employeeName,
    employeeNameErrorMessage,
    departmentId,
    setDepartmentId,
    currentPage,
    totalPages,
    visiblePages,
    employeeNameSort,
    certificationSort,
    endDateSort,
    handleEmployeeNameChange,
    handleSearch,
    handlePageChange,
    handleSortChange,
  };
};
