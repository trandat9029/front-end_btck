export interface Certification {
  certification_id: number;
  certification_name: string;
}

export interface CertificationApiItem {
  certificationId: number;
  certificationName: string;
}

export interface CertificationListResponse {
  code?: number | string;
  status?: number;
  message?: string;
  certifications?: CertificationApiItem[];
  data?: CertificationApiItem[];
}

export interface NormalizedCertificationListResponse {
  code: string;
  message?: string;
  certifications: Certification[];
}
