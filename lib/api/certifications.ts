import { apiClient } from './client';
import type {
  Certification,
  CertificationApiItem,
  CertificationListResponse,
  NormalizedCertificationListResponse,
} from '@/types/certifications';

function normalizeCertifications(payload: CertificationListResponse): Certification[] {
  if (Array.isArray(payload.certifications)) {
    return payload.certifications.map((certification) => ({
      certification_id: certification.certificationId,
      certification_name: certification.certificationName,
    }));
  }

  if (Array.isArray(payload.data)) {
    return payload.data.map((certification: CertificationApiItem) => ({
      certification_id: certification.certificationId,
      certification_name: certification.certificationName,
    }));
  }

  return [];
}

export const certificationApi = {
  getCertifications: async (): Promise<NormalizedCertificationListResponse> => {
    const response = await apiClient.get<CertificationListResponse>('/certifications');
    const statusCode = response.data.code ?? response.data.status ?? response.status;

    return {
      code: String(statusCode),
      message: response.data.message,
      certifications: normalizeCertifications(response.data),
    };
  },
};
