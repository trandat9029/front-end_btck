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
 * @return Các state, giá trị tính toán và handler cần thiết cho màn hình ADM002
 */
export const useADM002 = () => {
  /** Hook điều hướng trang */
  const router = useRouter();

  /** Đường dẫn URL hiện tại (không bao gồm query string) */
  const pathname = usePathname();

  /** Hook đọc query string từ URL hiện tại */
  const nextSearchParams = useSearchParams();

  // --- 1. States (Dữ liệu & Trạng thái UI) ---

  /** Danh sách phòng ban từ Backend dùng cho dropdown tìm kiếm */
  const [departments, setDepartments] = useState<Department[]>([]);

  /** Danh sách nhân viên hiện tại đang hiển thị trên bảng */
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);

  /** Tổng số bản ghi nhân viên phù hợp với điều kiện tìm kiếm (dùng để tính phân trang) */
  const [totalRecords, setTotalRecords] = useState(0);

  /** Trạng thái đang tải dữ liệu từ Backend */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Đối tượng chứa các thông báo lỗi hiển thị trên Form tìm kiếm:
   * - general: Lỗi chung khi gọi API thất bại
   * - department: Lỗi khi nạp danh sách phòng ban
   * - employeeName: Lỗi validate tên nhân viên
   */
  const [errors, setErrors] = useState({
    general: '',
    department: '',
    employeeName: '',
  });

  /**
   * Thông số tìm kiếm và phân trang hiện tại.
   * Được khởi tạo từ query string trên URL để hỗ trợ bookmark và chia sẻ đường dẫn.
   */
  const [employeeParams, setEmployeeParams] = useState<SearchState>({
    /** Từ khóa tên nhân viên để lọc */
    employeeName: nextSearchParams.get('employeeName') ?? '',
    /** ID phòng ban được chọn để lọc (rỗng = Tất cả) */
    departmentId: nextSearchParams.get('departmentId') ?? '',
    /** Trang hiện tại (tối thiểu là 1) */
    page: Math.max(1, Number(nextSearchParams.get('page')) || 1),
    /** Thứ tự sắp xếp theo tên nhân viên: 'asc' hoặc 'desc' */
    ordEmployeeName: (nextSearchParams.get('ordEmployeeName')?.toLowerCase() as SortOrder) || DEFAULT_SORTS.ordEmployeeName,
    /** Thứ tự sắp xếp theo tên chứng chỉ: 'asc' hoặc 'desc' */
    ordCertificationName: (nextSearchParams.get('ordCertificationName')?.toLowerCase() as SortOrder) || DEFAULT_SORTS.ordCertificationName,
    /** Thứ tự sắp xếp theo ngày hết hạn chứng chỉ: 'asc' hoặc 'desc' */
    ordEndDate: (nextSearchParams.get('ordEndDate')?.toLowerCase() as SortOrder) || DEFAULT_SORTS.ordEndDate,
  });

  /**
   * Tổng số trang được tính toán tự động từ tổng số bản ghi và giới hạn mỗi trang.
   * Giá trị tối thiểu là 1 (kể cả khi không có dữ liệu).
   */
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalRecords / DEFAULT_LIMIT));
  }, [totalRecords]);

  // --- 2. Lifecycle (Khởi tạo dữ liệu) ---

  /**
   * Effect khởi tạo: Nạp danh sách phòng ban và danh sách nhân viên
   * lần đầu tiên khi component được mount vào DOM.
   * Tham số tìm kiếm được lấy từ URL (hỗ trợ refresh trang).
   */
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
   * Cập nhật giá trị của một trường trên Form tìm kiếm khi người dùng thay đổi.
   * Nếu là trường employeeName, tự động sanitize và validate trước khi lưu state.
   *
   * @param field - Tên trường trong SearchState cần cập nhật
   * @param value - Giá trị mới được nhập vào
   */
  const handleSearchFieldChange = (field: keyof SearchState, value: SearchState[keyof SearchState]) => {
    let finalValue = value;
    if (field === 'employeeName') {
      // Loại bỏ ký tự đặc biệt không hợp lệ và validate
      finalValue = sanitizeEmployeeNameInput(value as string);
      setErrors(prev => ({ ...prev, employeeName: validateEmployeeName(finalValue as string) }));
    }
    setEmployeeParams(prev => ({ ...prev, [field]: finalValue }));
  };

  /**
   * Xử lý sự kiện submit Form tìm kiếm (nhấn nút 検索).
   * Ngăn chặn hành vi mặc định của form và kích hoạt tìm kiếm từ trang 1.
   *
   * @param e - Sự kiện submit của form
   */
  const handleSearchFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    void handleExecuteSearch({ page: 1 });
  };

  /**
   * Xử lý sự kiện chuyển trang trong bảng phân trang.
   * Bỏ qua nếu đang ở trang hiện tại hoặc trang không hợp lệ.
   *
   * @param page - Số trang muốn chuyển đến
   */
  const handlePageChange = async (page: number) => {
    if (page === employeeParams.page || page < 1 || page > totalPages) return;
    await handleExecuteSearch({ page });
  };

  /**
   * Xử lý sự kiện nhấn vào tiêu đề cột để thay đổi thứ tự sắp xếp.
   * Toggle giữa 'asc' và 'desc', đồng thời reset về trang 1.
   *
   * @param sortKey - Tên cột muốn sắp xếp: 'employeeName' | 'certification' | 'endDate'
   */
  const handleSortChange = async (sortKey: 'employeeName' | 'certification' | 'endDate') => {
    /** Bảng ánh xạ từ tên cột hiển thị sang tên trường trong SearchState */
    const keyMap = {
      employeeName: 'ordEmployeeName',
      certification: 'ordCertificationName',
      endDate: 'ordEndDate'
    } as const;

    const field = keyMap[sortKey];
    // Toggle: nếu đang ASC thì chuyển DESC và ngược lại
    const nextSort = employeeParams[field] === 'asc' ? 'desc' : 'asc';
    await handleExecuteSearch({ [field]: nextSort, page: 1 });
  };

  /**
   * Chuyển hướng người dùng sang màn hình thêm mới nhân viên (ADM004).
   * Giữ lại toàn bộ query string hiện tại để sau khi thêm có thể quay về đúng kết quả tìm kiếm.
   */
  const handleNavigateToAddPage = () => {
    const query = new URLSearchParams(window.location.search).toString();
    router.push(query ? `/employees/adm004?${query}` : "/employees/adm004");
  };

  // --- 4. Internal Engine (Logic xử lý nội bộ) ---

  /**
   * Điều phối việc cập nhật state, đồng bộ URL và gọi API tìm kiếm.
   * Đây là hàm trung tâm được gọi bởi tất cả các handler tìm kiếm/sắp xếp/phân trang.
   *
   * @param updates - Các thay đổi cần áp dụng lên SearchState hiện tại (partial update)
   */
  const handleExecuteSearch = async (updates: Partial<SearchState> = {}) => {
    const nextState = { ...employeeParams, ...updates, page: updates.page || 1 };

    // Validate tên nhân viên trước khi gọi API
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
   * Gọi API Backend để lấy danh sách nhân viên theo điều kiện tìm kiếm.
   * Cập nhật state employees và totalRecords sau khi nhận được phản hồi.
   *
   * @param state - Trạng thái tìm kiếm hiện tại bao gồm bộ lọc, phân trang và sắp xếp
   */
  const fetchEmployeeList = useCallback(async (state: SearchState) => {
    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: '' }));

    try {
      /** Tham số gửi lên API Backend */
      const params: GetEmployeesParams = {
        employeeNameSearch: state.employeeName.trim(),
        departmentIdFilter: state.departmentId,
        employeeNameSort: state.ordEmployeeName.toUpperCase() as any,
        certificationNameSort: state.ordCertificationName.toUpperCase() as any,
        endDateSort: state.ordEndDate.toUpperCase() as any,
        /** Vị trí bản ghi bắt đầu (offset = (page - 1) * limit) */
        offset: (state.page - 1) * DEFAULT_LIMIT,
        /** Số lượng bản ghi mỗi trang */
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
   * Đồng bộ hóa SearchState hiện tại lên thanh địa chỉ trình duyệt (URL).
   * Chỉ thêm các tham số có giá trị khác mặc định để giữ URL gọn gàng.
   *
   * @param state - Trạng thái tìm kiếm cần phản ánh lên URL
   */
  const updateUrlFromEmployeeParams = useCallback((state: SearchState) => {
    const params = new URLSearchParams();
    if (state.employeeName.trim()) params.set('employeeName', state.employeeName.trim());
    if (state.departmentId) params.set('departmentId', state.departmentId);
    if (state.page > 1) params.set('page', String(state.page));

    // Chỉ thêm sort params nếu khác giá trị mặc định
    if (state.ordEmployeeName !== DEFAULT_SORTS.ordEmployeeName) params.set('ordEmployeeName', state.ordEmployeeName);
    if (state.ordCertificationName !== DEFAULT_SORTS.ordCertificationName) params.set('ordCertificationName', state.ordCertificationName);
    if (state.ordEndDate !== DEFAULT_SORTS.ordEndDate) params.set('ordEndDate', state.ordEndDate);

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [pathname, router]);

  // --- 5. Computed Values (Tính toán cho giao diện) ---

  /**
   * Danh sách số trang hiển thị trên thanh phân trang.
   * Áp dụng logic "sliding window" để không hiển thị quá nhiều nút:
   * - Tổng ≤ 5 trang: Hiển thị tất cả
   * - Trang đầu: [1, 2, 3, 4, N]
   * - Trang cuối: [1, N-3, N-2, N-1, N]
   * - Trang giữa: [1, curr-1, curr, curr+1, N]
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
