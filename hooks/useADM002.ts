/**
 * Copyright(C) 2026 Luvina Software
 * useADM002.ts, 09/05/2026 tranledat
 */

'use client';

import { FormEvent, useCallback, useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { isAxiosError } from 'axios';

// Constants & Types
import { DEFAULT_LIMIT, DEFAULT_SORTS } from '@/constants/employee';
import { HTTP_STATUS } from '@/constants/system';
import { departmentApi } from '@/lib/api/department';
import { employeeApi } from '@/lib/api/employee';
import { sanitizeEmployeeNameInput, validateEmployeeName } from '@/lib/validation/employee';
import { formatBackendMessage } from '@/lib/utils/message';
import { Department } from '@/types/department';
import { EmployeeListItem, SortOrder, SearchState, GetEmployeesParams } from '@/types/employee';

/**
 * Hook quản lý toàn bộ logic cho màn hình danh sách nhân viên (ADM002).
 * Bao gồm: Tìm kiếm, phân trang, sắp xếp và quản lý Master Data.
 * 
 * @author tranledat
 */
export const useADM002 = () => {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useSearchParams();

  // --- 1. States (Dữ liệu & Trạng thái UI) ---
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({
    general: '',
    department: '',
    employeeName: '',
  });

  // Quản lý thông số nhân viên (Tên, Nhóm, Phân trang, Sắp xếp)
  const [employeeParams, setEmployeeParams] = useState<SearchState>({
    employeeName: nextSearchParams.get('employeeName') ?? '',
    departmentId: nextSearchParams.get('departmentId') ?? '',
    page: Math.max(1, Number(nextSearchParams.get('page')) || 1),
    ordEmployeeName: (nextSearchParams.get('ordEmployeeName')?.toLowerCase() as SortOrder) || DEFAULT_SORTS.ordEmployeeName,
    ordCertificationName: (nextSearchParams.get('ordCertificationName')?.toLowerCase() as SortOrder) || DEFAULT_SORTS.ordCertificationName,
    ordEndDate: (nextSearchParams.get('ordEndDate')?.toLowerCase() as SortOrder) || DEFAULT_SORTS.ordEndDate,
  });

  // Tổng số trang tính toán dựa trên tổng số bản ghi
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalRecords / DEFAULT_LIMIT));
  }, [totalRecords]);

  // --- 2. Lifecycle (Khởi tạo dữ liệu) ---

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const res = await departmentApi.getDepartments();
        if (String(res.code) === String(HTTP_STATUS.OK)) {
          setDepartments(res.departments);
        }
      } catch (e) {
        setErrors(prev => ({ ...prev, department: 'Failed to load departments' }));
      }
      // Nạp danh sách nhân viên lần đầu dựa trên URL
      void fetchEmployeeList(employeeParams);
    };
    void loadInitialData();
  }, []);

  // --- 3. Handlers (Xử lý sự kiện từ UI) ---

  /**
   * handleSearchFieldChange: Cập nhật giá trị khi người dùng nhập liệu Search.
   */
  const handleSearchFieldChange = (field: keyof SearchState, value: any) => {
    let finalValue = value;
    if (field === 'employeeName') {
      finalValue = sanitizeEmployeeNameInput(value);
      setErrors(prev => ({ ...prev, employeeName: validateEmployeeName(finalValue) }));
    }
    setEmployeeParams(prev => ({ ...prev, [field]: finalValue }));
  };

  /**
   * handleSearchFormSubmit: Thực hiện tìm kiếm khi nhấn nút Search.
   */
  const handleSearchFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    void handleExecuteSearch({ page: 1 });
  };

  /**
   * handlePageChange: Xử lý chuyển trang.
   */
  const handlePageChange = async (page: number) => {
    if (page === employeeParams.page || page < 1 || page > totalPages) return;
    await handleExecuteSearch({ page });
  };

  /**
   * handleSortChange: Xử lý thay đổi thứ tự sắp xếp cột.
   */
  const handleSortChange = async (sortKey: 'employeeName' | 'certification' | 'endDate') => {
    const keyMap = {
      employeeName: 'ordEmployeeName',
      certification: 'ordCertificationName',
      endDate: 'ordEndDate'
    } as const;

    const field = keyMap[sortKey];
    const nextSort = employeeParams[field] === 'asc' ? 'desc' : 'asc';
    await handleExecuteSearch({ [field]: nextSort, page: 1 });
  };

  /**
   * handleNavigateToAddPage: Chuyển sang màn hình thêm mới (ADM004).
   * Giữ lại query search hiện tại để có thể quay lại đúng vị trí.
   */
  const handleNavigateToAddPage = () => {
    const query = new URLSearchParams(window.location.search).toString();
    router.push(query ? `/employees/adm004?${query}` : "/employees/adm004");
  };

  // --- 4. Internal Engine (Logic xử lý nội bộ) ---

  /**
   * handleExecuteSearch: Điều phối việc cập nhật state, URL và gọi API.
   */
  const handleExecuteSearch = async (updates: Partial<SearchState> = {}) => {
    const nextState = { ...employeeParams, ...updates, page: updates.page || 1 };

    // Validate trước khi gọi API
    const validation = validateEmployeeName(nextState.employeeName);
    if (validation) {
      setErrors(prev => ({ ...prev, employeeName: validation }));
      return;
    }

    setEmployeeParams(nextState);
    updateUrlFromEmployeeParams(nextState);
    await fetchEmployeeList(nextState);
  };

  /**
   * fetchEmployeeList: Gọi API lấy dữ liệu nhân viên từ Backend.
   */
  const fetchEmployeeList = useCallback(async (state: SearchState) => {
    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: '' }));

    try {
      const params: GetEmployeesParams = {
        employeeNameSearch: state.employeeName.trim(),
        departmentIdFilter: state.departmentId,
        employeeNameSort: state.ordEmployeeName.toUpperCase() as any,
        certificationNameSort: state.ordCertificationName.toUpperCase() as any,
        endDateSort: state.ordEndDate.toUpperCase() as any,
        offset: (state.page - 1) * DEFAULT_LIMIT,
        limit: DEFAULT_LIMIT,
      };

      const data = await employeeApi.getEmployees(params);

      if (String(data.code) === String(HTTP_STATUS.OK)) {
        setEmployees(data.employees ?? []);
        setTotalRecords(data.totalRecords ?? 0);
      } else {
        throw new Error(formatBackendMessage(data.message) || 'Failed to load data');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      let msg = 'Failed to load data';
      if (isAxiosError(error)) msg = formatBackendMessage(error.response?.data?.message) || msg;
      setEmployees([]);
      setTotalRecords(0);
      setErrors(prev => ({ ...prev, general: msg }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * updateUrlFromEmployeeParams: Đồng bộ state hiện tại lên thanh địa chỉ (URL).
   */
  const updateUrlFromEmployeeParams = useCallback((state: SearchState) => {
    const params = new URLSearchParams();
    if (state.employeeName.trim()) params.set('employeeName', state.employeeName.trim());
    if (state.departmentId) params.set('departmentId', state.departmentId);
    if (state.page > 1) params.set('page', String(state.page));

    if (state.ordEmployeeName !== DEFAULT_SORTS.ordEmployeeName) params.set('ordEmployeeName', state.ordEmployeeName);
    if (state.ordCertificationName !== DEFAULT_SORTS.ordCertificationName) params.set('ordCertificationName', state.ordCertificationName);
    if (state.ordEndDate !== DEFAULT_SORTS.ordEndDate) params.set('ordEndDate', state.ordEndDate);

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [pathname, router]);

  // --- 5. Computed Values (Tính toán cho giao diện) ---

  /**
   * visiblePages: Tính toán danh sách các nút phân trang hiển thị (Logic 1 2 3 ... N).
   */
  const visiblePages = useMemo(() => {
    const { page: curr } = employeeParams;
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (curr <= 3) return [1, 2, 3, 4, totalPages];
    if (curr >= totalPages - 2) return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, curr - 1, curr, curr + 1, totalPages];
  }, [employeeParams.page, totalPages]);

  return {
    // States & Metadata
    departments,
    employees,
    totalRecords,
    isLoading,
    errors,

    // Parameters & Computed
    employeeParams,
    totalPages,
    visiblePages,

    // Public Handlers
    handleSearchFieldChange,
    handlePageChange,
    handleSortChange,
    handleNavigateToAddPage,
    handleSearchFormSubmit,
    handleSearch: () => handleExecuteSearch({ page: 1 })
  };
};
