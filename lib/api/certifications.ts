import { apiClient } from './client';
import type {
  Certification,
  CertificationApiItem,
  CertificationListResponse,
  NormalizedCertificationListResponse,
} from '@/types/certifications';

// Chuẩn hóa dữ liệu chứng chỉ từ nhiều định dạng response khác nhau về một cấu trúc thống nhất cho FE.
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
  // Gọi API lấy danh sách chứng chỉ và trả về dữ liệu đã được chuẩn hóa để UI sử dụng trực tiếp.
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
