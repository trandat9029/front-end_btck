/**
 * Copyright(C) 2026 Luvina
 * [certifications.ts], 04/05/2026 tranledat
 */

/**
 * Interface đại diện cho thông tin chứng chỉ
 * @author tranledat
 */
export interface Certification {
  certificationId: number;
  certificationName: string;
}

/**
 * Interface đại diện cho một chứng chỉ trả về từ API
 * @author tranledat
 */
export interface CertificationApiItem {
  certificationId: number;
  certificationName: string;
}

/**
 * Interface đại diện cho phản hồi từ API lấy danh sách chứng chỉ
 * @author tranledat
 */
export interface CertificationListResponse {
  code?: number | string;
  status?: number;
  message?: string;
  certifications?: CertificationApiItem[];
  data?: CertificationApiItem[];
}

/**
 * Interface đại diện cho dữ liệu chứng chỉ sau khi đã chuẩn hóa
 * @author tranledat
 */
export interface NormalizedCertificationListResponse {
  code: string;
  message?: string;
  certifications: Certification[];
}
