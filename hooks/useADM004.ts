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
import axios, { isAxiosError } from 'axios';
import { employeeSchema } from '@/lib/validation/employee';
import { ADD, EDIT, VALIDATE_STEP_INPUT } from '@/constants/employee';
import { certificationApi } from '@/lib/api/certifications';
import { departmentApi } from '@/lib/api/department';
import { Certification } from '@/types/certifications';
import { Department } from '@/types/department';
import { EmployeeFormData, EmployeeFormMode, MessageResponse } from '@/types/employee';
import { employeeApi } from '@/lib/api/employee';
import * as Messages from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import { STORAGE_KEYS, HTTP_STATUS } from '@/constants/system';
import {
  createEmptyEmployeeFormData,
  createEmployeeFormDataStorage,
  loadEmployeeFormDataStorage,
  saveEmployeeFormDataStorage,
  clearEmployeeFormDataStorage
} from '@/lib/storage/employee';
import { formatBackendMessage } from '@/lib/utils/message';
import { LABEL_TO_FIELD_MAP, ERROR_MESSAGES } from '@/constants/messages';

/**
 * Hook quản lý logic cho màn hình ADM004 (Đăng ký/Chỉnh sửa nhân viên).
 * @author tranledat
 */
export const useADM004 = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawEmployeeId = searchParams.get('id');
  const isBack = searchParams.get('mode') === 'back';

  const employeeId =
    rawEmployeeId && /^\d+$/.test(rawEmployeeId)
      ? Number(rawEmployeeId)
      : undefined;
  const mode: EmployeeFormMode = employeeId ? EDIT : ADD;

  const returnQueryString = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('id');
    params.delete('mode');
    return params.toString();
  }, [searchParams]);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [departmentErrorMessage, setDepartmentErrorMessage] = useState('');
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoadingCertifications, setIsLoadingCertifications] = useState(true);
  const [certificationErrorMessage, setCertificationErrorMessage] = useState('');
  const [formData, setFormData] = useState<EmployeeFormData>(createEmptyEmployeeFormData);
  const [isDataReady, setIsDataReady] = useState(false);

  // Khởi tạo React Hook Form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    trigger,
    setError,
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: formData,
    mode: 'onBlur',
    reValidateMode: 'onChange'
  });

  /**
   * Khởi tạo dữ liệu cho trang (Master Data & Form Data).
   * Sử dụng duy nhất 1 useEffect để đảm bảo tính nhất quán.
   */
  useEffect(() => {
    let isMounted = true;

    const initializePage = async () => {
      // 1. Khởi động loading
      setIsLoadingDepartments(true);
      setIsLoadingCertifications(true);
      setIsDataReady(false);

      // 2. Load Master Data (Concurrent)
      try {
        const [deptRes, certRes] = await Promise.all([
          departmentApi.getDepartments(),
          certificationApi.getCertifications()
        ]);

        if (!isMounted) return;

        // Cập nhật Master Data
        if (String(deptRes.code) === String(HTTP_STATUS.OK)) {
          setDepartments(deptRes.departments);
        } else {
          setDepartmentErrorMessage(deptRes.message || Messages.MSG_ERROR_FETCH_DEPARTMENTS);
        }

        if (String(certRes.code) === String(HTTP_STATUS.OK)) {
          setCertifications(certRes.certifications);
        } else {
          setCertificationErrorMessage(certRes.message || Messages.MSG_ERROR_FETCH_CERTIFICATIONS);
        }

        // 3. Xác định Dữ liệu Form ban đầu (Sử dụng cấu trúc ưu tiên rõ ràng)
        let initialData: EmployeeFormData = createEmptyEmployeeFormData();
        const storedSessionData = loadEmployeeFormDataStorage();

        // Kiểm tra xem dữ liệu trong storage có khớp với ngữ cảnh hiện tại (ID và Mode) không
        const isStorageMatched = storedSessionData &&
          storedSessionData.mode === mode &&
          storedSessionData.employeeId === employeeId;

        if (isStorageMatched && isBack) {
          // TRƯỜNG HỢP 1: Chắc chắn là quay lại từ ADM005 (có isBack) -> Lấy từ Storage
          initialData = storedSessionData.formData;
        } else if (mode === EDIT && employeeId) {
          // TRƯỜNG HỢP 2: Chế độ Edit nhưng không có dữ liệu storage khớp -> Lấy từ API
          try {
            const employeeDetail = await employeeApi.getEmployeeById(employeeId);
            if (employeeDetail) {
              const cert = employeeDetail.certifications?.[0];
              initialData = {
                employeeId: employeeDetail.employeeId,
                employeeName: employeeDetail.employeeName,
                employeeNameKana: employeeDetail.employeeNameKana,
                employeeBirthDate: employeeDetail.employeeBirthDate,
                employeeEmail: employeeDetail.employeeEmail,
                employeeTelephone: employeeDetail.employeeTelephone,
                employeeLoginId: employeeDetail.employeeLoginId,
                employeeLoginPassword: '',
                employeeLoginPasswordConfirm: '',
                departmentId: String(employeeDetail.departmentId),
                certificationId: cert ? String(cert.certificationId) : '',
                certificationStartDate: cert ? cert.startDate : '',
                certificationEndDate: cert ? cert.endDate : '',
                employeeCertificationScore: cert ? String(cert.score) : '',
              };
            }
          } catch (error) {
            console.error('Error fetching employee detail for edit:', error);
            let errorMsg = Messages.MSG_ERROR_SYSTEM;
            let errorCode = '';

            if (isAxiosError(error)) {
              const backendError = error.response?.data?.message;
              errorMsg = formatBackendMessage(backendError) || Messages.MSG_ERROR_SYSTEM;
              errorCode = backendError?.code || '';
            }

            sessionStorage.setItem(STORAGE_KEYS.SYSTEM_ERROR_MESSAGE, errorMsg);
            if (errorCode) {
              sessionStorage.setItem(STORAGE_KEYS.SYSTEM_ERROR_CODE, errorCode);
            }
            router.push(ROUTES.SYSTEM_ERROR);
            return;
          }
        }

        // Xóa storage nếu không phải quay lại từ màn ADM005 (tức là F5 reload hoặc vào mới từ ADM002)
        if (!isBack) {
          clearEmployeeFormDataStorage();
        }

        // 4. Đồng bộ State và Hook Form
        setFormData(initialData);
        reset(initialData);
        setIsDataReady(true);

        // 5. Dọn dẹp URL (Xóa mode=back để tránh reload bị quay lại trạng thái back)
        if (isBack && typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('mode');
          window.history.replaceState(null, '', url.pathname + url.search);
        }

      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        if (isMounted) {
          setIsLoadingDepartments(false);
          setIsLoadingCertifications(false);
        }
      }
    };

    void initializePage();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, mode, reset]);

  /**
   * Cập nhật giá trị của một trường trong form.
   * @param field Tên trường
   * @param value Giá trị mới
   */
  const updateFormField = useCallback(
    <K extends keyof EmployeeFormData>(field: K, value: EmployeeFormData[K]) => {
      setFormData((currentFormData) => {
        if (field === 'certificationId' && value === '') {
          return {
            ...currentFormData,
            certificationId: '',
            certificationStartDate: '',
            certificationEndDate: '',
            employeeCertificationScore: '',
          };
        }

        return {
          ...currentFormData,
          [field]: value,
        };
      });
    },
    []
  );


  const selectedCertification = useMemo(
    () =>
      certifications.find(
        (certification) =>
          String(certification.certificationId) === formData.certificationId
      ) ?? null,
    [certifications, formData.certificationId]
  );

  const isCertificationSelected = formData.certificationId !== '';

  /**
   * Lưu dữ liệu form vào sessionStorage.
   * @return Dữ liệu đã lưu
   */
  const saveFormData = useCallback(() => {
    const employeeData = createEmployeeFormDataStorage(formData, mode, employeeId);
    saveEmployeeFormDataStorage(employeeData);
    return employeeData;
  }, [employeeId, formData, mode]);

  /**
   * Xóa dữ liệu form khỏi sessionStorage.
   */
  const clearFormData = useCallback(() => {
    clearEmployeeFormDataStorage();
  }, []);

  /**
   * Map message từ backend về đúng field trong form
   */
  const getFieldFromBackendValidateMessage = useCallback((message?: MessageResponse | null): keyof EmployeeFormData | null => {
    let label = (message?.params?.[0] as string | undefined) || '';
    // Loại bỏ dấu ngoặc vuông nếu có (ví dụ: [アカウント名] -> アカウント名)
    label = label.replace(/^\[/, '').replace(/\]$/, '');
    return (LABEL_TO_FIELD_MAP[label] as keyof EmployeeFormData) || null;
  }, []);

  /**
   * Gọi API validate dữ liệu ở Backend.
   * @return Danh sách lỗi server
   */

  /**
   * Xử lý thay đổi giá trị trường.
   * @param field Tên trường
   * @param value Giá trị
   */
  const handleFieldChange = useCallback((field: keyof EmployeeFormData, value: string | number) => {
    updateFormField(field, value as any);
    setValue(field, value as any, { shouldValidate: true });
  }, [updateFormField, setValue]);

  /**
   * Xử lý sự kiện blur.
   * @param field Tên trường
   */
  const handleFieldBlur = useCallback((field: keyof EmployeeFormData) => {
    trigger(field);
  }, [trigger]);

  /**
   * Xử lý thay đổi ngày tháng.
   * @param field Tên trường ngày
   * @param value Đối tượng Date
   */
  const handleDateChange = useCallback((
    field: 'employeeBirthDate' | 'certificationStartDate' | 'certificationEndDate',
    value: Date | null
  ) => {
    const strValue = value ? format(value, 'yyyy/MM/dd') : '';
    handleFieldChange(field, strValue);
  }, [handleFieldChange]);

  /**
   * Xử lý xác nhận form.
   */
  const handleConfirm = handleSubmit(async () => {
    try {
      setDepartmentErrorMessage('');
      setCertificationErrorMessage('');

      // 1. Gọi API validate dữ liệu ở Backend.
      const response = await employeeApi.validateEmployee(formData, VALIDATE_STEP_INPUT);

      if (String(response.code) === String(HTTP_STATUS.OK)) {
        // Validate thành công
        saveFormData();
        router.push(ROUTES.ADM005);
      } else {
        // Lỗi nghiệp vụ (Mã lỗi ERxxx trả về từ validator)
        const message = response.message;
        const field = getFieldFromBackendValidateMessage(message);
        const errorMessage = formatBackendMessage(message) || Messages.MSG_ERROR_VALIDATE_FAILED;

        if (field) {
          setError(field as any, { type: 'server', message: errorMessage }, { shouldFocus: true });
        } else {
          setDepartmentErrorMessage(errorMessage);
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      
      if (isAxiosError(error)) {
        const status = error.response?.status;

        // Nếu là lỗi validation trả về 500 kèm message object
        if (status === 500 && error.response?.data?.message) {
          const message = error.response.data.message;
          const field = getFieldFromBackendValidateMessage(message);
          const errorMessage = formatBackendMessage(message) || Messages.MSG_ERROR_VALIDATE_FAILED;

          if (field) {
            setError(field as any, { type: 'server', message: errorMessage }, { shouldFocus: true });
          } else {
            setDepartmentErrorMessage(errorMessage);
          }
        } else {
          // Lỗi hệ thống thực sự
          const backendError = error.response?.data?.message;
          const errorMsg = formatBackendMessage(backendError) || Messages.MSG_ERROR_SYSTEM;
          const errorCode = backendError?.code || '';

          sessionStorage.setItem(STORAGE_KEYS.SYSTEM_ERROR_MESSAGE, errorMsg);
          if (errorCode) {
            sessionStorage.setItem(STORAGE_KEYS.SYSTEM_ERROR_CODE, errorCode);
          }
          router.push(ROUTES.SYSTEM_ERROR);
        }
      } else {
        // Lỗi không phải từ Axios
        sessionStorage.setItem(STORAGE_KEYS.SYSTEM_ERROR_MESSAGE, Messages.MSG_ERROR_SYSTEM);
        router.push(ROUTES.SYSTEM_ERROR);
      }
    }
  });

  /**
   * Xử lý quay lại màn danh sách.
   */
  const handleBack = useCallback(() => {
    clearFormData();
    if (mode === EDIT && employeeId) {
      // Nếu là Edit, quay lại màn hình chi tiết ADM003
      router.push(`${ROUTES.ADM003}?id=${employeeId}`);
    } else {
      // Nếu là Add, quay lại màn hình danh sách ADM002
      router.push(
        returnQueryString
          ? `${ROUTES.ADM002}?${returnQueryString}`
          : ROUTES.ADM002
      );
    }
  }, [clearFormData, router, returnQueryString, mode, employeeId]);

  return {
    // Dữ liệu (Data)
    departments,
    isLoadingDepartments,
    departmentErrorMessage,
    certifications,
    isLoadingCertifications,
    certificationErrorMessage,
    formData,
    isDataReady,
    isCertificationSelected,
    errors,
    control,
    register,

    // Hàm xử lý (Handlers)
    mode,
    handleFieldChange,
    handleFieldBlur,
    handleDateChange,
    handleConfirm,
    handleBack,
  };
};
