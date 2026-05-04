'use client';

import { AxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DEFAULT_LIMIT, DEFAULT_SORTS } from '@/constants/employee';
import { departmentApi } from '@/lib/api/department';
import { employeeApi } from '@/lib/api/employee';
import {
  sanitizeEmployeeNameInput,
  validateEmployeeName,
} from '@/lib/validation/employee';
import { formatBackendMessage } from '@/lib/utils/message';
import { Department } from '@/types/department';
import {
  EmployeeListApiResponse,
  EmployeeListItem,
  SortOrder,
} from '@/types/employee';

type FetchEmployeesParams = {
  employeeName: string;
  departmentId: string;
  page?: number;
  limit?: number;
  ordEmployeeName?: SortOrder;
  ordCertificationName?: SortOrder;
  ordEndDate?: SortOrder;
};

type SearchState = {
  employeeName: string;
  departmentId: string;
  page: number;
  ordEmployeeName: SortOrder;
  ordCertificationName: SortOrder;
  ordEndDate: SortOrder;
};

const parsePositiveInteger = (value: string | null, fallback: number) => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
};

const parseSortOrder = (value: string | null, fallback: SortOrder): SortOrder => {
  const lowerValue = value?.toLowerCase();
  return lowerValue === 'asc' || lowerValue === 'desc' ? lowerValue as SortOrder : fallback;
};

export const useADM002 = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
   * Xây dựng query string cho URL, giữ nguyên snake_case cho URL nhưng map từ camelCase state.
   */
  const buildSearchStateQuery = useCallback((state: SearchState) => {
    const params = new URLSearchParams();

    if (state.employeeName.trim()) {
      params.set('employeeName', state.employeeName.trim());
    }

    if (state.departmentId) {
      params.set('departmentId', state.departmentId);
    }

    if (state.page > 1) {
      params.set('page', String(state.page));
    }

    if (state.ordEmployeeName !== DEFAULT_SORTS.ordEmployeeName) {
      params.set('ordEmployeeName', state.ordEmployeeName);
    }

    if (state.ordCertificationName !== DEFAULT_SORTS.ordCertificationName) {
      params.set('ordCertificationName', state.ordCertificationName);
    }

    if (state.ordEndDate !== DEFAULT_SORTS.ordEndDate) {
      params.set('ordEndDate', state.ordEndDate);
    }

    return params.toString();
  }, []);

  const replaceSearchState = useCallback(
    (state: SearchState) => {
      const queryString = buildSearchStateQuery(state);
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [buildSearchStateQuery, pathname, router]
  );

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
        // Map tham số sang camelCase và viết hoa ASC/DESC cho Backend
        const data = await employeeApi.getEmployees({
          employeeName: nextEmployeeName.trim(),
          departmentId: nextDepartmentId,
          ordEmployeeName: ordEmployeeName.toUpperCase() as any,
          ordCertificationName: ordCertificationName.toUpperCase() as any,
          ordEndDate: ordEndDate.toUpperCase() as any,
          offset: Math.max(page - 1, 0) * limit,
          limit,
        });

        if (String(data.code) !== '200') {
          throw new Error(data.message || 'Failed to load employees.');
        }

        setEmployees(data.employees ?? []);
        setTotalRecords(data.totalRecords ?? 0);
      } catch (error: any) {
        const backendError = error.response?.data?.message;
        const responseMessage = formatBackendMessage(backendError) || 'Failed to load employees.';

        setEmployees([]);
        setTotalRecords(0);
        setErrorMessage(responseMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await departmentApi.getDepartments();

      if (String(response.code) === '200') {
        setDepartments(response.departments);
        setDepartmentErrorMessage('');
        return;
      }

      setDepartments([]);
      setDepartmentErrorMessage(response.message || 'Failed to load departments.');
    } catch (error: any) {
      setDepartments([]);
      const backendError = error.response?.data?.message;
      setDepartmentErrorMessage(formatBackendMessage(backendError) || 'Failed to load departments.');
    }
  }, []);

  useEffect(() => {
    const initialState: SearchState = {
      employeeName: searchParams.get('employeeName') ?? '',
      departmentId: searchParams.get('departmentId') ?? '',
      page: parsePositiveInteger(searchParams.get('page'), 1),
      ordEmployeeName: parseSortOrder(
        searchParams.get('ordEmployeeName'),
        DEFAULT_SORTS.ordEmployeeName
      ),
      ordCertificationName: parseSortOrder(
        searchParams.get('ordCertificationName'),
        DEFAULT_SORTS.ordCertificationName
      ),
      ordEndDate: parseSortOrder(
        searchParams.get('ordEndDate'),
        DEFAULT_SORTS.ordEndDate
      ),
    };

    void fetchDepartments();
    setEmployeeName(initialState.employeeName);
    setDepartmentId(initialState.departmentId);
    setCurrentPage(initialState.page);
    setEmployeeNameSort(initialState.ordEmployeeName);
    setCertificationSort(initialState.ordCertificationName);
    setEndDateSort(initialState.ordEndDate);

    void fetchEmployees({
      employeeName: initialState.employeeName,
      departmentId: initialState.departmentId,
      page: initialState.page,
      ordEmployeeName: initialState.ordEmployeeName,
      ordCertificationName: initialState.ordCertificationName,
      ordEndDate: initialState.ordEndDate,
    });
  }, [fetchDepartments, fetchEmployees, searchParams]);

  const totalPages = Math.max(1, Math.ceil(totalRecords / DEFAULT_LIMIT));

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

  const handleEmployeeNameChange = (value: string) => {
    const nextValue = sanitizeEmployeeNameInput(value);

    setEmployeeName(nextValue);
    setEmployeeNameErrorMessage(validateEmployeeName(nextValue));
  };

  const handleSearch = async (nextEmployeeName = employeeName) => {
    const validationMessage = validateEmployeeName(nextEmployeeName);

    if (validationMessage) {
      setEmployeeNameErrorMessage(validationMessage);
      return false;
    }

    const nextState: SearchState = {
      employeeName: nextEmployeeName,
      departmentId,
      page: 1,
      ordEmployeeName: employeeNameSort,
      ordCertificationName: certificationSort,
      ordEndDate: endDateSort,
    };

    setCurrentPage(1);
    setEmployeeName(nextEmployeeName);
    setEmployeeNameErrorMessage('');
    replaceSearchState(nextState);

    await fetchEmployees({
      employeeName: nextState.employeeName,
      departmentId: nextState.departmentId,
      page: nextState.page,
      ordEmployeeName: nextState.ordEmployeeName,
      ordCertificationName: nextState.ordCertificationName,
      ordEndDate: nextState.ordEndDate,
    });

    return true;
  };

  const handlePageChange = async (page: number) => {
    const maxPage = Math.max(1, Math.ceil(totalRecords / DEFAULT_LIMIT));

    if (page < 1 || page > maxPage || page === currentPage || isLoading) {
      return;
    }

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

    await fetchEmployees({
      employeeName: nextState.employeeName,
      departmentId: nextState.departmentId,
      page: nextState.page,
      ordEmployeeName: nextState.ordEmployeeName,
      ordCertificationName: nextState.ordCertificationName,
      ordEndDate: nextState.ordEndDate,
    });
  };

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

    await fetchEmployees({
      employeeName: nextState.employeeName,
      departmentId: nextState.departmentId,
      page: nextState.page,
      ordEmployeeName: nextState.ordEmployeeName,
      ordCertificationName: nextState.ordCertificationName,
      ordEndDate: nextState.ordEndDate,
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
    searchStateQuery: buildSearchStateQuery({
      employeeName,
      departmentId,
      page: currentPage,
      ordEmployeeName: employeeNameSort,
      ordCertificationName: certificationSort,
      ordEndDate: endDateSort,
    }),
    handleEmployeeNameChange,
    handleSearch,
    handlePageChange,
    handleSortChange,
  };
};
