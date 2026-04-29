/**
 * Copyright(C) 2026 Luvina
 * [error.ts], 29/04/2026 tranledat
 */

/**
 * Hàm hỗ trợ trích xuất thông báo lỗi từ response của API Backend.
 * Xử lý được các trường hợp: 
 * - Mảng các đối tượng lỗi (Lỗi validate/nghiệp vụ 400).
 * - Đối tượng lỗi hệ thống (Lỗi 500) có message là String hoặc Object.
 * 
 * @param errorResponse Dữ liệu trả về từ apiError.response?.data
 * @param fallbackMessage Thông báo mặc định nếu không trích xuất được.
 * @returns string Thông báo lỗi dạng chuỗi.
 */
export const extractErrorMessage = (errorResponse: any, fallbackMessage: string): string => {
  if (!errorResponse) return fallbackMessage;

  // 1. Trường hợp là Mảng (Danh sách MessageResponse từ handleCustomException)
  if (Array.isArray(errorResponse) && errorResponse.length > 0) {
    return errorResponse[0].message || fallbackMessage;
  }

  // 2. Trường hợp là Đối tượng (ErrorResponse hoặc MessageResponse đơn lẻ)
  if (typeof errorResponse === 'object') {
    const { message } = errorResponse;
    
    if (!message) return fallbackMessage;

    // Nếu message là Object {code, params} (Cấu trúc cũ hoặc cấu trúc UpdateEmployeeResponse)
    if (typeof message === 'object') {
      return message.code || fallbackMessage;
    }

    // Nếu message là String (Cấu trúc mới của ErrorResponse 500)
    return String(message);
  }

  return fallbackMessage;
};
