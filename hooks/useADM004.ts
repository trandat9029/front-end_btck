'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ADD, EDIT, EMPLOYEE_FORM_DATA_STORAGE_KEY } from '@/constants/employee';
import { certificationApi } from '@/lib/api/certifications';
import { departmentApi } from '@/lib/api/department';
import { Certification } from '@/types/certifications';
import { Department } from '@/types/department';
import { EmployeeFormData, EmployeeFormDataStorage, EmployeeFormMode } from '@/types/employee';
import { employeeApi } from '@/lib/api/employee';

// Tao du lieu mac dinh rong cho toan bo form nhan vien.
export const createEmptyEmployeeFormData = (): EmployeeFormData => ({
  employeeLoginId: '',
  departmentId: '',
  employeeName: '',
  employeeNameKana: '',
  employeeBirthDate: '',
  employeeEmail: '',
  employeeTelephone: '',
  employeeLoginPassword: '',
  employeeLoginPasswordConfirm: '',
  certificationId: '',
  certificationStartDate: '',
  certificationEndDate: '',
  employeeCertificationScore: '',
  employeeId: undefined,
});

// Tao object data tu du lieu form va mode hien tai.
export const createEmployeeFormDataStorage = (
  formData: EmployeeFormData,
  mode: EmployeeFormMode,
  employeeId?: number
): EmployeeFormDataStorage => ({
  formData,
  mode,
  employeeId,
});

// Chuyen chuoi JSON trong storage thanh object data hop le.
export const parseEmployeeFormDataStorage = (
  value: string | null | undefined
): EmployeeFormDataStorage | null => {
  if (!value) {
    return null;
  }
 
  try {
    const parsed = JSON.parse(value) as Partial<EmployeeFormDataStorage>;
 
    if (!parsed || typeof parsed !== 'object' || !parsed.formData) {
      return null;
    }
 
    return {
      formData: {
        ...createEmptyEmployeeFormData(),
        ...parsed.formData,
      },
      mode: parsed.mode === EDIT ? EDIT : ADD,
      employeeId:
        typeof parsed.employeeId === 'number' && Number.isInteger(parsed.employeeId)
          ? parsed.employeeId
          : undefined,
    };
  } catch {
    return null;
  }
};

// Doc data da luu trong sessionStorage.
export const loadEmployeeFormDataStorage = (): EmployeeFormDataStorage | null => {
  if (typeof window === 'undefined') {
    return null;
  }
 
  return parseEmployeeFormDataStorage(
    window.sessionStorage.getItem(EMPLOYEE_FORM_DATA_STORAGE_KEY)
  );
};

// Luu data vao sessionStorage.
export const saveEmployeeFormDataStorage = (dataStorage: EmployeeFormDataStorage) => {
  if (typeof window === 'undefined') {
    return;
  }
 
  window.sessionStorage.setItem(
    EMPLOYEE_FORM_DATA_STORAGE_KEY,
    JSON.stringify(dataStorage)
  );
};

// Xoa data khoi sessionStorage.
export const clearEmployeeFormDataStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }
 
  window.sessionStorage.removeItem(EMPLOYEE_FORM_DATA_STORAGE_KEY);
};

const getInitialFormData = (
  mode: EmployeeFormMode,
  isBack: boolean,
  employeeId?: number
): EmployeeFormData => {
  // Neu khong phai quay lai tu ADM005 (reload hoac vao moi), xoa data ngay lap tuc.
  if (!isBack) {
    clearEmployeeFormDataStorage();
    return createEmptyEmployeeFormData();
  }
 
  const employeeData = loadEmployeeFormDataStorage();
 
  if (
    employeeData?.formData &&
    employeeData.mode === mode &&
    employeeData.employeeId === employeeId
  ) {
    return employeeData.formData;
  }

  if (mode === EDIT && employeeId) {
    // Khung xu ly edit:
    // 1. Goi API lay chi tiet nhan vien theo employeeId.
    // 2. Map du lieu API sang EmployeeFormData.
    // 3. Tra ve du lieu da map de bind len form.
  }

  const data = createEmptyEmployeeFormData();
  data.employeeId = employeeId;
  return data;
};

export const useADM004 = (
  mode: EmployeeFormMode,
  isBack: boolean,
  employeeId?: number
) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [departmentErrorMessage, setDepartmentErrorMessage] = useState('');
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoadingCertifications, setIsLoadingCertifications] = useState(true);
  const [certificationErrorMessage, setCertificationErrorMessage] = useState('');
  const [formData, setFormData] = useState<EmployeeFormData>(createEmptyEmployeeFormData);
  const [isDataReady, setIsDataReady] = useState(false);
  // Flag de dam bao chi khoi tao du lieu mot lan duy nhat khi mount
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setIsLoadingDepartments(true);
    setDepartmentErrorMessage('');

    try {
      const response = await departmentApi.getDepartments();

      if (response.code !== '200') {
        setDepartments([]);
        setDepartmentErrorMessage(response.message || 'Failed to load departments.');
        return;
      }

      setDepartments(response.departments);
    } catch (error) {
      setDepartments([]);
      setDepartmentErrorMessage(
        error instanceof Error ? error.message : 'Failed to load departments.'
      );
    } finally {
      setIsLoadingDepartments(false);
    }
  }, []);

  const fetchCertifications = useCallback(async () => {
    setIsLoadingCertifications(true);
    setCertificationErrorMessage('');

    try {
      const response = await certificationApi.getCertifications();

      if (response.code !== '200') {
        setCertifications([]);
        setCertificationErrorMessage(
          response.message || 'Failed to load certifications.'
        );
        return;
      }

      setCertifications(response.certifications);
    } catch (error) {
      setCertifications([]);
      setCertificationErrorMessage(
        error instanceof Error ? error.message : 'Failed to load certifications.'
      );
    } finally {
      setIsLoadingCertifications(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    let isMounted = true;

    const initialize = async () => {
      if (isMounted) {
        setIsLoadingDepartments(true);
        setIsLoadingCertifications(true);
        setIsDataReady(false);
      }

      const initialFormData = getInitialFormData(mode, isBack, employeeId);
      if (isMounted) {
        setFormData(initialFormData);
        setIsDataReady(true);
        setIsInitialized(true);
      }

      await Promise.all([fetchDepartments(), fetchCertifications()]);

      if (!isMounted) {
        return;
      }
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, [employeeId, mode, isBack, isInitialized, fetchCertifications, fetchDepartments]);

  // Cập nhật giá trị của một trường trong form vào state (formData)
  const updateFormField = useCallback(
    <K extends keyof EmployeeFormData>(field: K, value: EmployeeFormData[K]) => {
      setFormData((currentFormData) => {
        // [Nghiệp vụ] Nếu người dùng hủy chọn Bằng cấp/Chứng chỉ (chọn lại giá trị rỗng)
        // thì tự động clear các trường ngày cấp, ngày hết hạn và điểm số liên quan đi kèm
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
          String(certification.certification_id) === formData.certificationId
      ) ?? null,
    [certifications, formData.certificationId]
  );

  const isCertificationSelected = formData.certificationId !== '';

  // Chi luu sessionStorage khi user bam Confirm o ADM004.
  const saveFormData = useCallback(() => {
    const employeeData = createEmployeeFormDataStorage(formData, mode, employeeId);
    saveEmployeeFormDataStorage(employeeData);
    return employeeData;
  }, [employeeId, formData, mode]);

  const clearFormData = useCallback(() => {
    clearEmployeeFormDataStorage();
  }, []);

  /**
   * Gọi API validate dữ liệu ở Backend.
   * Tra ve danh sach loi theo field de EmpolyeeInputForm inject vao React Hook Form.
   * Neu hop le tra ve mang rong.
   */
  const validate = useCallback(async (): Promise<{ field: string; message: string }[]> => {
    try {
      const response = await employeeApi.validateEmployee(formData);

      if (response.code !== '200') {
        // Server tra ve danh sach loi theo tung field
        if (response.fieldErrors && response.fieldErrors.length > 0) {
          return response.fieldErrors as { field: string; message: string }[];
        }
        // Fallback: loi chung khong co field cu the
        return [{ field: 'employeeLoginId', message: response.message || 'Validation failed.' }];
      }

      return [];
    } catch (error) {
      return [{
        field: 'employeeLoginId',
        message: error instanceof Error ? error.message : 'System error occurred.'
      }];
    }
  }, [formData]);

  return {
    departments,
    isLoadingDepartments,
    departmentErrorMessage,
    certifications,
    isLoadingCertifications,
    certificationErrorMessage,
    formData,
    isDataReady,
    selectedCertification,
    isCertificationSelected,
    updateFormField,
    saveFormData,
    clearFormData,
    validate,
  };
};
