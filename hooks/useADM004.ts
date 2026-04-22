'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ADD, EDIT, EMPLOYEE_FORM_DRAFT_STORAGE_KEY } from '@/constants/employee';
import { certificationApi } from '@/lib/api/certifications';
import { departmentApi } from '@/lib/api/department';
import { Certification } from '@/types/certifications';
import { Department } from '@/types/department';
import { EmployeeFormData, EmployeeFormDraft, EmployeeFormMode } from '@/types/employee';

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
  score: '',
});

// Tao object data tu du lieu form va mode hien tai.
export const createEmployeeFormDraft = (
  formData: EmployeeFormData,
  mode: EmployeeFormMode,
  employeeId?: number
): EmployeeFormDraft => ({
  formData,
  mode,
  employeeId,
});

// Chuyen chuoi JSON trong storage thanh object data hop le.
export const parseEmployeeFormDraft = (
  value: string | null | undefined
): EmployeeFormDraft | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<EmployeeFormDraft>;

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
export const loadEmployeeFormDraft = (): EmployeeFormDraft | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return parseEmployeeFormDraft(
    window.sessionStorage.getItem(EMPLOYEE_FORM_DRAFT_STORAGE_KEY)
  );
};

// Luu data vao sessionStorage.
export const saveEmployeeFormDraft = (draft: EmployeeFormDraft) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(
    EMPLOYEE_FORM_DRAFT_STORAGE_KEY,
    JSON.stringify(draft)
  );
};

// Xoa data khoi sessionStorage.
export const clearEmployeeFormDraft = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(EMPLOYEE_FORM_DRAFT_STORAGE_KEY);
};

const getInitialFormData = (
  mode: EmployeeFormMode,
  employeeId?: number
): EmployeeFormData => {
  const employeeData = loadEmployeeFormDraft();

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

  return createEmptyEmployeeFormData();
};

export const useADM004 = (mode: EmployeeFormMode, employeeId?: number) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [departmentErrorMessage, setDepartmentErrorMessage] = useState('');
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoadingCertifications, setIsLoadingCertifications] = useState(true);
  const [certificationErrorMessage, setCertificationErrorMessage] = useState('');
  const [formData, setFormData] = useState<EmployeeFormData>(createEmptyEmployeeFormData);
  const [isDraftReady, setIsDraftReady] = useState(false);

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
    let isMounted = true;

    const initialize = async () => {
      if (isMounted) {
        setIsLoadingDepartments(true);
        setIsLoadingCertifications(true);
        setIsDraftReady(false);
      }

      const initialFormData = getInitialFormData(mode, employeeId);
      if (isMounted) {
        setFormData(initialFormData);
        setIsDraftReady(true);
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
  }, [employeeId, mode, fetchCertifications, fetchDepartments]);

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
            score: '',
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
  const persistDraft = useCallback(() => {
    const employeeData = createEmployeeFormDraft(formData, mode, employeeId);
    saveEmployeeFormDraft(employeeData);
    return employeeData;
  }, [employeeId, formData, mode]);

  const clearDraft = useCallback(() => {
    clearEmployeeFormDraft();
  }, []);

  return {
    departments,
    isLoadingDepartments,
    departmentErrorMessage,
    certifications,
    isLoadingCertifications,
    certificationErrorMessage,
    formData,
    isDraftReady,
    selectedCertification,
    isCertificationSelected,
    updateFormField,
    persistDraft,
    clearDraft,
  };
};
