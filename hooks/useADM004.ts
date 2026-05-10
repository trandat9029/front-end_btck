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
 */
export const useADM004 = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- 1. States & Configurations (Trạng thái và Cấu hình) ---

  const employeeIdStr = searchParams.get('id');
  const isBack = searchParams.get('mode') === 'back';
  const id = (employeeIdStr && /^\d+$/.test(employeeIdStr)) ? Number(employeeIdStr) : undefined;
  const mode: EmployeeFormMode = id ? EDIT : ADD;

  const [masterData, setMasterData] = useState<{
    departments: Department[];
    certifications: Certification[];
  }>({
    departments: [],
    certifications: []
  });

  // Quản lý trạng thái giao diện (Loading, Thông báo lỗi)
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

  // Theo dõi giá trị Form để UI render reactive
  const watchedValues = watch();

  // Kiểm tra trạng thái chọn chứng chỉ Nhật ngữ
  const isCertificationSelected = !!watchedValues.certificationId;

  // Query string của ADM002 để quay lại đúng bộ lọc/phân trang cũ
  const returnQueryString = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('id');
    params.delete('mode');
    return params.toString();
  }, [searchParams]);

  // Danh sách các trường liên quan đến chứng chỉ để validate đồng thời
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
  const handleInputChange = useCallback((field: keyof EmployeeFormData, value: any) => {
    if (field === 'certificationId' && value === '') {
      // Nếu bỏ chọn chứng chỉ -> Reset toàn bộ thông tin liên quan
      setValue('certificationId', '');
      setValue('certificationStartDate', '');
      setValue('certificationEndDate', '');
      setValue('employeeCertificationScore', '');
      CERT_FIELDS.forEach(f => clearErrors(f as any));
    } else {
      setValue(field, value);
    }

    // Thực hiện validate
    if (CERT_FIELDS.includes(field as any)) {
      void trigger(CERT_FIELDS as any);
    } else {
      void trigger(field as any);
    }
  }, [setValue, trigger, clearErrors, CERT_FIELDS]);

  /**
   * handleInputBlur: Validate trường khi rời khỏi ô nhập liệu.
   */
  const handleInputBlur = useCallback((field: keyof EmployeeFormData) => {
    if (CERT_FIELDS.includes(field as any)) {
      void trigger(CERT_FIELDS as any);
    } else {
      void trigger(field as any);
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
  const handleProcessSystemError = (error: any) => {
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
