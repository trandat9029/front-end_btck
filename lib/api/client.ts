import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setupInterceptors(client: ReturnType<typeof axios.create>) {
  client.interceptors.request.use(
    (config) => {
      const token = sessionStorage.getItem('access_token');
      if (token) {
        if (config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('token_type');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } else if (error.response?.status === 500) {
        if (typeof window !== 'undefined') {
          const defaultMsg = 'システムエラーが発生しました。';
          let errorMsg = defaultMsg;
          
          if (error.response?.data) {
             const data = error.response.data;
             if (Array.isArray(data) && data.length > 0 && data[0].message) {
                 errorMsg = data[0].message;
             } else if (typeof data === 'object' && data.message) {
                 errorMsg = data.message;
             }
          }

          window.location.href = `/employees/systemError?msg=${encodeURIComponent(errorMsg)}`;
        }
      }
      return Promise.reject(error);
    }
  );
}

setupInterceptors(apiClient);

export { apiClient };

