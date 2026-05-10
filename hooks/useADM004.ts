/**
 * Copyright(C) 2024 Luvina
 * useADM004.ts, 24/04/2024 tranledat
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';

// --- Imports (Constants, APIs, Types) ---
import { employeeSchema } from '@/lib/validation/employee';
import { ADD, EDIT } from '@/constants/employee';
import { certificationApi } from '@/lib/api/certifications';
import { departmentApi } from '@/lib/api/department';
import { employeeApi } from '@/lib/api/employee';
import * as Messages from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import { STORAGE_KEYS, HTTP_STATUS } from '@/constants/system';
import { LABEL_TO_FIELD_MAP } from '@/constants/messages';
import {
  createEmptyEmployeeFormData,
  createEmployeeFormDataStorage,
  loadEmployeeFormDataStorage,
  saveEmployeeFormDataStorage,
  clearEmployeeFormDataStorage
} from '@/lib/storage/employee';
import { formatBackendMessage } from '@/lib/utils/message';
import { Certification } from '@/types/certifications';
import { Department } from '@/types/department';
import { EmployeeFormData, EmployeeFormMode, MessageResponse } from '@/types/employee';

/**
 * Hook quản lý toàn bộ luồng nghiệp vụ của màn hình nhập liệu thông tin nhân viên (ADM004).
 * Xử lý: Nạp Master Data, nạp dữ liệu chỉnh sửa, validate Form và điều hướng sang trang xác nhận.
 *
 * @author tranledat
 * @return Các state, form methods và handler cần thiết để render màn hình ADM004
 */
export const useADM004 = () => {
  /** Hook điều hướng trang */
  const router = useRouter();

  /** Hook đọc query string từ URL hiện tại */
  const searchParams = useSearchParams();

  // --- 1. States & Configurations (Trạng thái và Cấu hình) ---

  /** ID nhân viên dạng chuỗi từ URL (undefined nếu ở chế độ thêm mới) */
  const employeeIdStr = searchParams.get('id');

  /** Cờ xác định người dùng đang quay lại từ trang xác nhận ADM005 */
  const isBack = searchParams.get('mode') === 'back';

  /** ID nhân viên (số nguyên) hoặc undefined nếu đang ở chế độ thêm mới */
  const id = (employeeIdStr && /^\d+$/.test(employeeIdStr)) ? Number(employeeIdStr) : undefined;

  /** Chế độ hoạt động: ADD (thêm mới) hoặc EDIT (chỉnh sửa) */
  const mode: EmployeeFormMode = id ? EDIT : ADD;

  /**
   * Dữ liệu danh mục (Master Data) dùng để render các dropdown:
   * - departments: Danh sách phòng ban
   * - certifications: Danh sách chứng chỉ Nhật ngữ
   */
  const [masterData, setMasterData] = useState<{
    departments: Department[];
    certifications: Certification[];
  }>({
    departments: [],
    certifications: []
  });

  /**
   * Trạng thái giao diện:
   * - isLoading: true khi đang gọi API (hiển thị spinner)
   * - isDataReady: true khi dữ liệu đã nạp xong và Form sẵn sàng hiển thị
   * - errorMessage: Thông báo lỗi chung của cả màn hình (không gắn vào trường cụ thể)
   */
  const [uiStatus, setUiStatus] = useState({
    isLoading: true,    // Đang gọi API
    isDataReady: false, // Dữ liệu đã nạp xong và sẵn sàng hiển thị Form
    errorMessage: ''    // Thông báo lỗi chung của cả màn hình
  });

  // Khởi tạo React Hook Form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    trigger,
    setError,
    clearErrors,
    reset,
    watch,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: createEmptyEmployeeFormData(),
    mode: 'onBlur',
  });

  /**
   * Theo dõi (subscribe) toàn bộ giá trị Form theo thời gian thực.
   * Dùng để UI tự động re-render khi người dùng thay đổi bất kỳ trường nào.
   */
  const watchedValues = watch();

  /**
   * Cờ xác định người dùng đã chọn chứng chỉ Nhật ngữ hay chưa.
   * true = đã chọn -> hiển thị các trường ngày tháng và điểm số.
   * false = chưa chọn -> ẩn các trường đó.
   */
  const isCertificationSelected = !!watchedValues.certificationId;

  /**
   * Chuỗi query string (không bao gồm 'id' và 'mode') để quay lại
   * màn hình ADM002 với đúng bộ lọc và phân trang đã áp dụng trước đó.
   */
  const returnQueryString = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('id');
    params.delete('mode');
    return params.toString();
  }, [searchParams]);

  /**
   * Danh sách tên các trường liên quan đến thông tin chứng chỉ.
   * Dùng để validate đồng thời tất cả các trường này khi một trong số chúng thay đổi.
   */
  const CERT_FIELDS = useMemo(() => [
    'certificationId', 'certificationStartDate', 'certificationEndDate', 'employeeCertificationScore'
  ] as const, []);

  // --- 2. Lifecycle (Vòng đời và Khởi tạo dữ liệu) ---

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      setUiStatus(prev => ({ ...prev, isLoading: true, isDataReady: false }));

      try {
        // Nạp Master Data (Phòng ban & Chứng chỉ)
        const [deptRes, certRes] = await Promise.all([
          departmentApi.getDepartments(),
          certificationApi.getCertifications()
        ]);

        if (!isMounted) return;

        if (String(deptRes.code) === String(HTTP_STATUS.OK) && String(certRes.code) === String(HTTP_STATUS.OK)) {
          setMasterData({
            departments: deptRes.departments,
            certifications: certRes.certifications
          });
        }

        // Quyết định dữ liệu ban đầu cho Form
        let initialData = createEmptyEmployeeFormData();
        const stored = loadEmployeeFormDataStorage();
        const isStorageMatched = stored && stored.mode === mode && stored.employeeId === id;

        if (isStorageMatched && isBack) {
          // Quay lại từ trang xác nhận ADM005
          initialData = stored.formData;
        } else if (mode === EDIT && id) {
          // Chế độ chỉnh sửa: Lấy dữ liệu chi tiết từ API
          initialData = await fetchEmployeeDetail(id);
        }

        // Dọn dẹp Storage nếu không phải luồng "Back"
        if (!isBack) clearEmployeeFormDataStorage();

        reset(initialData);
        setUiStatus(prev => ({ ...prev, isDataReady: true }));

        // Xóa tham số mode=back khỏi URL sau khi xử lý xong
        if (isBack && typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('mode');
          window.history.replaceState(null, '', url.pathname + url.search);
        }

      } catch (err) {
        console.error('ADM004 Initialization Error:', err);
        setUiStatus(prev => ({ ...prev, errorMessage: Messages.MSG_ERROR_SYSTEM }));
      } finally {
        if (isMounted) setUiStatus(prev => ({ ...prev, isLoading: false }));
      }
    };

    void initialize();
    return () => { isMounted = false; };
  }, [id, mode, reset]);

  // --- 3. Handlers (Xử lý sự kiện) ---

  /**
   * handleInputChange: Cập nhật giá trị trường và thực hiện validate.
   */
  const handleInputChange = useCallback((field: keyof EmployeeFormData, value: EmployeeFormData[keyof EmployeeFormData]) => {
    if (field === 'certificationId' && value === '') {
      // Nếu bỏ chọn chứng chỉ -> Reset toàn bộ thông tin liên quan
      setValue('certificationId', '');
      setValue('certificationStartDate', '');
      setValue('certificationEndDate', '');
      setValue('employeeCertificationScore', '');
      CERT_FIELDS.forEach(f => clearErrors(f));
    } else if (field === 'certificationId' && value !== '') {
      // Nếu chọn chứng chỉ KHÁC -> Set ID mới và xóa dữ liệu cũ của chứng chỉ
      setValue('certificationId', value as string);
      setValue('certificationStartDate', '');
      setValue('certificationEndDate', '');
      setValue('employeeCertificationScore', '');
      clearErrors('certificationStartDate');
      clearErrors('certificationEndDate');
      clearErrors('employeeCertificationScore');
    } else {
      setValue(field, value as string);
    }

    // Thực hiện validate
    if (CERT_FIELDS.includes(field as (typeof CERT_FIELDS)[number])) {
      void trigger([...CERT_FIELDS]);
    } else {
      void trigger(field);
    }
  }, [setValue, trigger, clearErrors, CERT_FIELDS]);

  /**
   * handleInputBlur: Validate trường khi rời khỏi ô nhập liệu.
   */
  const handleInputBlur = useCallback((field: keyof EmployeeFormData) => {
    if (CERT_FIELDS.includes(field as (typeof CERT_FIELDS)[number])) {
      void trigger([...CERT_FIELDS]);
    } else {
      void trigger(field);
    }
  }, [trigger, CERT_FIELDS]);

  /**
   * handleDateChange: Xử lý thay đổi ngày tháng từ DatePicker.
   */
  const handleDateChange = useCallback((
    field: 'employeeBirthDate' | 'certificationStartDate' | 'certificationEndDate',
    value: Date | null
  ) => {
    const strValue = value ? format(value, 'yyyy/MM/dd') : '';
    handleInputChange(field, strValue);
  }, [handleInputChange]);

  /**
   * handleConfirmClick: Xử lý khi nhấn nút "Xác nhận". Gọi API validate ở Backend.
   */
  const handleConfirmClick = handleSubmit(async (data) => {
    try {
      setUiStatus(prev => ({ ...prev, errorMessage: '' }));

      const res = await employeeApi.validateEmployee(data, mode);

      if (String(res.code) === String(HTTP_STATUS.OK)) {
        // Lưu dữ liệu vào Storage và chuyển hướng sang ADM005
        saveEmployeeFormDataStorage(createEmployeeFormDataStorage(data, mode, id));
        router.push(ROUTES.ADM005);
      } else {
        // Ánh xạ lỗi nghiệp vụ từ Backend vào Form
        handleMapBackendErrors(res.message);
      }
    } catch (error) {
      handleProcessSystemError(error);
    }
  });

  /**
   * handleBackClick: Quay lại màn hình trước đó.
   */
  const handleBackClick = useCallback(() => {
    clearEmployeeFormDataStorage();
    if (mode === EDIT && id) {
      router.push(`${ROUTES.ADM003}?id=${id}`);
    } else {
      const path = returnQueryString ? `${ROUTES.ADM002}?${returnQueryString}` : ROUTES.ADM002;
      router.push(path);
    }
  }, [id, mode, router, returnQueryString]);

  // --- 4. Internal Helpers (Các hàm bổ trợ) ---

  /**
   * fetchEmployeeDetail: Lấy chi tiết nhân viên và chuẩn hóa cho Form.
   */
  const fetchEmployeeDetail = async (targetId: number): Promise<EmployeeFormData> => {
    const detail = await employeeApi.getEmployeeById(targetId);
    if (!detail) throw new Error('Employee not found');

    const cert = detail.certifications?.[0];
    return {
      ...detail,
      departmentId: String(detail.departmentId),
      certificationId: cert ? String(cert.certificationId) : '',
      certificationStartDate: cert ? cert.startDate : '',
      certificationEndDate: cert ? cert.endDate : '',
      employeeCertificationScore: cert ? String(cert.score) : '',
      employeeLoginPassword: '',
      employeeLoginPasswordConfirm: '',
    };
  };

  /**
   * handleMapBackendErrors: Ánh xạ mã lỗi từ Backend vào các trường của React Hook Form.
   */
  const handleMapBackendErrors = (message?: MessageResponse | null) => {
    if (!message) return;

    const targetField = message.code === 'ER012' ? 'certificationEndDate' :
      getFieldFromLabel(message.params?.[0] as string);

    const errorText = formatBackendMessage(message) || Messages.MSG_ERROR_VALIDATE_FAILED;

    if (targetField) {
      setError(targetField as any, { type: 'server', message: errorText }, { shouldFocus: true });
    } else {
      setUiStatus(prev => ({ ...prev, errorMessage: errorText }));
    }
  };

  /**
   * getFieldFromLabel: Chuyển đổi nhãn tiếng Nhật sang tên trường (Field Name).
   */
  const getFieldFromLabel = (label?: string): keyof EmployeeFormData | null => {
    if (!label) return null;
    const cleanLabel = label.replace(/^\[/, '').replace(/\]$/, '');
    return (LABEL_TO_FIELD_MAP[cleanLabel] as keyof EmployeeFormData) || null;
  };

  /**
   * handleProcessSystemError: Xử lý lỗi hệ thống và điều hướng trang.
   */
  const handleProcessSystemError = (error: unknown) => {
    console.error('System Error:', error);
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
    // Master Data & UI States
    masterData,
    uiStatus,
    isDataReady: uiStatus.isDataReady,
    mode,

    // Form Values & States
    watchedValues,
    isCertificationSelected,
    errors,
    control,
    register,

    // Handlers
    handleInputChange,
    handleInputBlur,
    handleDateChange,
    handleConfirmClick,
    handleBackClick,
  };
};
