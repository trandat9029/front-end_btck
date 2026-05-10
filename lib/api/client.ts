import axios from 'axios';

/**
 * Cấu hình Axios Client dùng chung cho toàn bộ ứng dụng.
 * Bao gồm cấu hình Base URL và các Interceptors để xử lý Token/Lỗi.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Thiết lập các Interceptors cho Request và Response.
 */
export function setupInterceptors(client: ReturnType<typeof axios.create>) {
  // Request Interceptor: Tự động đính kèm Token vào Header nếu có
  client.interceptors.request.use(
    (config) => {
      const token = sessionStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor: Chuẩn hóa dữ liệu trả về và xử lý lỗi hệ thống (401)
  client.interceptors.response.use(
    (response) => {
      // Đảm bảo mã phản hồi (code) luôn ở dạng chuỗi để dễ so sánh
      if (response.data && response.data.code !== undefined) {
        response.data.code = String(response.data.code);
      }
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        // Xử lý khi Token hết hạn hoặc không hợp lệ
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('token_type');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
}

setupInterceptors(apiClient);

export { apiClient };
