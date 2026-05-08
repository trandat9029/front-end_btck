/**
 * Copyright(C) 2026 Luvina
 * [useADM002.ts], 08/05/2026 tranledat
 */

'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { isAxiosError } from 'axios';

// Constants & Types
import { DEFAULT_LIMIT, DEFAULT_SORTS } from '@/constants/employee';
import { HTTP_STATUS } from '@/constants/system';
import { departmentApi } from '@/lib/api/department';
import { employeeApi } from '@/lib/api/employee';
import {
  sanitizeEmployeeNameInput,
  validateEmployeeName,
} from '@/lib/validation/employee';
import { formatBackendMessage } from '@/lib/utils/message';
import { Department } from '@/types/department';
import {
  EmployeeListItem,
  SortOrder,
  SearchState,
  FetchEmployeesParams
} from '@/types/employee';

/**
 * Hook quản lý toàn bộ logic cho màn hình ADM002 (Danh sách nhân viên).
 * Chịu trách nhiệm: Lấy dữ liệu, Tìm kiếm, Phân trang, Sắp xếp và điều hướng.
 * @author tranledat
 */
export const useADM002 = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- 1. State quản lý dữ liệu Master Data & Danh sách nhân viên ---
  const [departments, setDepartments] = useState<Department[]>([]); // Danh sách phòng ban cho dropdown
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]); // Danh sách nhân viên hiển thị ở bảng
  const [totalRecords, setTotalRecords] = useState(0); // Tổng số bản ghi tìm thấy (để tính phân trang)
  const [isLoading, setIsLoading] = useState(true); // Trạng thái đang tải dữ liệu
  
  // --- 2. State quản lý thông báo lỗi (UI) ---
  const [errorMessage, setErrorMessage] = useState(''); // Lỗi chung khi lấy danh sách nhân viên
  const [departmentErrorMessage, setDepartmentErrorMessage] = useState(''); // Lỗi khi lấy danh mục phòng ban
  const [employeeNameErrorMessage, setEmployeeNameErrorMessage] = useState(''); // Lỗi validate tên nhân viên

  // --- 3. State quản lý các tiêu chí tìm kiếm (Search Criteria) ---
  const [employeeName, setEmployeeName] = useState(''); // Tên nhân viên nhập từ ô tìm kiếm
  const [departmentId, setDepartmentId] = useState(''); // ID phòng ban đã chọn
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [employeeNameSort, setEmployeeNameSort] = useState<SortOrder>(DEFAULT_SORTS.ordEmployeeName); // Thứ tự sắp xếp theo tên
  const [certificationSort, setCertificationSort] = useState<SortOrder>(DEFAULT_SORTS.ordCertificationName); // Thứ tự sắp xếp theo chứng chỉ
  const [endDateSort, setEndDateSort] = useState<SortOrder>(DEFAULT_SORTS.ordEndDate); // Thứ tự sắp xếp theo ngày hết hạn

  // --- 4. Tính toán logic Phân trang (Pagination) ---
  // Tính tổng số trang dựa trên tổng số bản ghi và số lượng bản ghi mỗi trang (limit)
  const totalPages = Math.max(1, Math.ceil(totalRecords / DEFAULT_LIMIT));

  /**
   * Hàm hỗ trợ xây dựng chuỗi Query String từ đối tượng SearchState.
   * Chức năng: Biến các state hiện tại thành URL params (ví dụ: ?employeeName=A&page=2).
   */
  const buildSearchStateQuery = useCallback((state: SearchState) => {
    const params = new URLSearchParams();
    if (state.employeeName.trim()) params.set('employeeName', state.employeeName.trim());
    if (state.departmentId) params.set('departmentId', state.departmentId);
    if (state.page > 1) params.set('page', String(state.page));
    
    // Chỉ đẩy lên URL nếu giá trị sắp xếp khác với mặc định (để URL gọn gàng)
    if (state.ordEmployeeName !== DEFAULT_SORTS.ordEmployeeName) params.set('ordEmployeeName', state.ordEmployeeName);
    if (state.ordCertificationName !== DEFAULT_SORTS.ordCertificationName) params.set('ordCertificationName', state.ordCertificationName);
    if (state.ordEndDate !== DEFAULT_SORTS.ordEndDate) params.set('ordEndDate', state.ordEndDate);
    
    return params.toString();
  }, []);

  /**
   * Hàm cập nhật URL trình duyệt (đồng bộ URL với State).
   * Sử dụng router.replace để không tạo thêm lịch sử duyệt web khi chỉ tìm kiếm/phân trang.
   */
  const replaceSearchState = useCallback(
    (state: SearchState) => {
      const queryString = buildSearchStateQuery(state);
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [buildSearchStateQuery, pathname, router]
  );

  /**
   * Hàm cốt lõi: Gọi API lấy danh sách nhân viên từ Backend.
   * Thực hiện: Reset lỗi cũ -> Call API -> Cập nhật State danh sách & tổng số bản ghi.
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
    }: FetchEmployeesParams) => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await employeeApi.getEmployees({
          employeeName: nextEmployeeName.trim(),
          departmentId: nextDepartmentId,
          ordEmployeeName: ordEmployeeName.toUpperCase() as any, // Backend yêu cầu chữ HOA (ASC/DESC)
          ordCertificationName: ordCertificationName.toUpperCase() as any,
          ordEndDate: ordEndDate.toUpperCase() as any,
          offset: Math.max(page - 1, 0) * limit, // Tính toán vị trí bắt đầu lấy dữ liệu
          limit,
        });

        if (String(data.code) !== String(HTTP_STATUS.OK)) {
          throw new Error(formatBackendMessage(data.message) || 'Failed to load employees.');
        }

        setEmployees(data.employees ?? []);
        setTotalRecords(data.totalRecords ?? 0);
      } catch (error) {
        console.error('Fetch employees error:', error);
        let responseMessage = 'Failed to load employees.';
        if (isAxiosError(error)) {
          const backendError = error.response?.data?.message;
          responseMessage = formatBackendMessage(backendError) || responseMessage;
        } else if (error instanceof Error) {
          responseMessage = error.message;
        }
        setEmployees([]);
        setTotalRecords(0);
        setErrorMessage(responseMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Hàm lấy danh sách phòng ban cho dropdown.
   * Thường được gọi 1 lần khi load trang.
   */
  const fetchDepartments = useCallback(async () => {
    try {
      const response = await departmentApi.getDepartments();
      if (String(response.code) === String(HTTP_STATUS.OK)) {
        setDepartments(response.departments);
        setDepartmentErrorMessage('');
        return;
      }
      setDepartments([]);
      setDepartmentErrorMessage(response.message || 'Failed to load departments.');
    } catch (error) {
      console.error('Fetch departments error:', error);
      setDepartments([]);
      let errorMsg = 'Failed to load departments.';
      if (isAxiosError(error)) {
        const backendError = error.response?.data?.message;
        errorMsg = formatBackendMessage(backendError) || errorMsg;
      }
      setDepartmentErrorMessage(errorMsg);
    }
  }, []);

  /**
   * Xử lý thay đổi tên nhân viên trong ô input.
   * Chức năng: Làm sạch ký tự lạ và kiểm tra tính hợp lệ của tên ngay lập tức.
   */
  const handleEmployeeNameChange = (value: string) => {
    const nextValue = sanitizeEmployeeNameInput(value);
    setEmployeeName(nextValue);
    setEmployeeNameErrorMessage(validateEmployeeName(nextValue));
  };

  /**
   * Xử lý hành động tìm kiếm khi nhấn nút "検索" hoặc Enter.
   * Chức năng: Reset về trang 1, validate tên và gọi API fetch dữ liệu mới.
   */
  const handleSearch = async (nextEmployeeName = employeeName) => {
    const validationMessage = validateEmployeeName(nextEmployeeName);
    if (validationMessage) {
      setEmployeeNameErrorMessage(validationMessage);
      return false;
    }
    const nextState: SearchState = {
      employeeName: nextEmployeeName,
      departmentId,
      page: 1, // Tìm kiếm luôn quay về trang đầu tiên
      ordEmployeeName: employeeNameSort,
      ordCertificationName: certificationSort,
      ordEndDate: endDateSort,
    };
    setCurrentPage(1);
    setEmployeeName(nextEmployeeName);
    setEmployeeNameErrorMessage('');
    replaceSearchState(nextState); // Cập nhật URL
    await fetchEmployees(nextState); // Gọi API
    return true;
  };

  /**
   * Xử lý khi người dùng nhấn vào số trang để chuyển trang.
   */
  const handlePageChange = useCallback(async (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage || isLoading) return;
    const nextState: SearchState = {
      employeeName,
      departmentId,
      page,
      ordEmployeeName: employeeNameSort,
      ordCertificationName: certificationSort,
      ordEndDate: endDateSort,
    };
    setCurrentPage(page);
    replaceSearchState(nextState);
    await fetchEmployees(nextState);
  }, [currentPage, departmentId, employeeName, employeeNameSort, certificationSort, endDateSort, isLoading, totalPages, replaceSearchState, fetchEmployees]);

  /**
   * Xử lý khi người dùng nhấn vào tiêu đề cột để sắp xếp dữ liệu.
   * Logic: Đảo chiều sắp xếp (asc <-> desc) và quay về trang 1.
   */
  const handleSortChange = async (sortKey: 'employeeName' | 'certification' | 'endDate') => {
    // Xác định chiều sắp xếp tiếp theo cho từng cột
    const nextEmployeeNameSort = sortKey === 'employeeName' ? (employeeNameSort === 'asc' ? 'desc' : 'asc') : employeeNameSort;
    const nextCertificationSort = sortKey === 'certification' ? (certificationSort === 'asc' ? 'desc' : 'asc') : certificationSort;
    const nextEndDateSort = sortKey === 'endDate' ? (endDateSort === 'asc' ? 'desc' : 'asc') : endDateSort;

    const nextState: SearchState = {
      employeeName,
      departmentId,
      page: 1,
      ordEmployeeName: nextEmployeeNameSort,
      ordCertificationName: nextCertificationSort,
      ordEndDate: nextEndDateSort,
    };

    setEmployeeNameSort(nextEmployeeNameSort);
    setCertificationSort(nextCertificationSort);
    setEndDateSort(nextEndDateSort);
    setCurrentPage(1);
    replaceSearchState(nextState);
    await fetchEmployees(nextState);
  };

  /**
   * Biến lưu trữ Query String hiện tại của trang (Search Params).
   * Dùng để truyền sang ADM004/ADM003 giúp việc nhấn "Back" quay lại đúng trạng thái tìm kiếm này.
   */
  const currentSearchStateQuery = buildSearchStateQuery({
    employeeName,
    departmentId,
    page: currentPage,
    ordEmployeeName: employeeNameSort,
    ordCertificationName: certificationSort,
    ordEndDate: endDateSort,
  });

  /**
   * Xử lý sự kiện Submit của Form tìm kiếm (Ngăn load lại trang).
   */
  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleSearch(employeeName.trim());
  };

  /**
   * Chuyển hướng sang màn hình đăng ký nhân viên mới (ADM004).
   * Có đính kèm query string để sau này quay lại ADM002 vẫn giữ nguyên bộ lọc.
   */
  const handleNavigateToADM004 = () => {
    router.push(
      currentSearchStateQuery ? `/employees/adm004?${currentSearchStateQuery}` : "/employees/adm004"
    );
  };

  // --- 5. Các Effect quản lý vòng đời (Lifecycle) ---

  /**
   * Effect khởi tạo: Chạy khi vào trang lần đầu hoặc URL Search Params thay đổi.
   * Chức năng: Đồng bộ dữ liệu từ URL vào State và thực hiện tìm kiếm ban đầu.
   */
  useEffect(() => {
    const initialState: SearchState = {
      employeeName: searchParams.get('employeeName') ?? '',
      departmentId: searchParams.get('departmentId') ?? '',
      page: (() => {
        const p = Number(searchParams.get('page'));
        return (!Number.isInteger(p) || p < 1) ? 1 : p;
      })(),
      ordEmployeeName: (searchParams.get('ordEmployeeName')?.toLowerCase() as SortOrder) || DEFAULT_SORTS.ordEmployeeName,
      ordCertificationName: (searchParams.get('ordCertificationName')?.toLowerCase() as SortOrder) || DEFAULT_SORTS.ordCertificationName,
      ordEndDate: (searchParams.get('ordEndDate')?.toLowerCase() as SortOrder) || DEFAULT_SORTS.ordEndDate,
    };

    void fetchDepartments(); // Lấy danh mục phòng ban
    
    // Đồng bộ vào State của React
    setEmployeeName(initialState.employeeName);
    setDepartmentId(initialState.departmentId);
    setCurrentPage(initialState.page);
    setEmployeeNameSort(initialState.ordEmployeeName);
    setCertificationSort(initialState.ordCertificationName);
    setEndDateSort(initialState.ordEndDate);

    // Thực hiện lấy dữ liệu lần đầu
    void fetchEmployees(initialState);
  }, [fetchDepartments, fetchEmployees, searchParams]);

  /**
   * Effect tự động điều chỉnh số trang:
   * Nếu người dùng đang ở trang 5 nhưng kết quả tìm kiếm mới chỉ có 2 trang, 
   * hệ thống sẽ tự động đưa họ về trang cuối cùng (trang 2).
   */
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      void handlePageChange(totalPages);
    }
  }, [currentPage, handlePageChange, totalPages]);

  // --- 6. Logic UI hiển thị (Computed States) ---
  
  /**
   * Mảng chứa các số trang sẽ hiển thị ở thanh Pagination (ví dụ: [1, 2, 3, 4, 10]).
   */
  const visiblePages = (() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, totalPages];
    if (currentPage >= totalPages - 2) return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
  })();

  // Xuất bản dữ liệu và các hàm xử lý ra ngoài cho Component sử dụng
  return {
    // Dữ liệu & Trạng thái
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
    searchStateQuery: currentSearchStateQuery,

    // Hàm xử lý sự kiện
    handleEmployeeNameChange,
    handleSearch,
    handlePageChange,
    handleSortChange,
    handleSearchSubmit,
    handleNavigateToADM004,
  };
};
