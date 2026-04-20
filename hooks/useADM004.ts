'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { certificationApi } from '@/lib/api/certifications';
import { Certification } from '@/types/certifications';

export const useADM004 = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [certificationId, setCertificationId] = useState('');
  const [isLoadingCertifications, setIsLoadingCertifications] = useState(true);
  const [certificationErrorMessage, setCertificationErrorMessage] = useState('');

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
    void fetchCertifications();
  }, [fetchCertifications]);

  const selectedCertification = useMemo(
    () =>
      certifications.find(
        (certification) => String(certification.certification_id) === certificationId
      ) ?? null,
    [certifications, certificationId]
  );

  const isCertificationSelected = certificationId !== '';

  return {
    certifications,
    certificationId,
    setCertificationId,
    selectedCertification,
    isCertificationSelected,
    isLoadingCertifications,
    certificationErrorMessage,
  };
};
