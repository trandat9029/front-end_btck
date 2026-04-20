'use client';

import EmpolyeeInputForm from '@/components/form/EmpolyeeInputForm';
import { useADM004 } from '@/hooks/useADM004';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';

export default function EmployeeEditPage() {
  useAuth();
  const searchParams = useSearchParams();
  const {
    certifications,
    certificationId,
    setCertificationId,
    isCertificationSelected,
    isLoadingCertifications,
    certificationErrorMessage,
  } = useADM004();

  return (
    <div className="row">
      <EmpolyeeInputForm
        certifications={certifications}
        certificationId={certificationId}
        onCertificationChange={setCertificationId}
        isCertificationSelected={isCertificationSelected}
        isLoadingCertifications={isLoadingCertifications}
        certificationErrorMessage={certificationErrorMessage}
        returnQueryString={searchParams.toString()}
      />
    </div>
  );
}

