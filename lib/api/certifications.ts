/**
 * Copyright(C) 2024 Luvina
 * certifications.ts, 10/05/2026 tranledat
 */

import { apiClient } from './client';
import type {
  Certification,
  CertificationApiItem,
  CertificationListResponse,
  NormalizedCertificationListResponse,
} from '@/types/certifications';

/**
 * normalizeCertifications: Chuẩn hóa dữ liệu chứng chỉ từ API về cấu trúc thống nhất cho Frontend.
 */
function normalizeCertifications(payload: CertificationListResponse): Certification[] {
  if (Array.isArray(payload.certifications)) {
    return payload.certifications.map((certification: CertificationApiItem) => ({
      certificationId: certification.certificationId,
      certificationName: certification.certificationName,
    }));
  }

  if (Array.isArray(payload.data)) {
    return payload.data.map((certification: CertificationApiItem) => ({
      certificationId: certification.certificationId,
      certificationName: certification.certificationName,
    }));
  }

  return [];
}

/**
 * certificationApi: Các dịch vụ gọi API liên quan đến Chứng chỉ.
 */
export const certificationApi = {
  /**
   * getCertifications: Lấy danh sách toàn bộ chứng chỉ Nhật ngữ.
   */
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
