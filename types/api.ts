/**
 * Copyright(C) 2024 Luvina
 * api.ts, 24/04/2024 tranledat
 */

// Cấu trúc lỗi chung từ API
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Tham số phân trang gửi lên API
export interface PaginationParams {
  page: number;
  limit: number;
}

// Thông tin phân trang trả về từ API
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
