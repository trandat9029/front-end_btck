/**
 * Copyright(C) 2026 Luvina
 * message.ts, 03/05/2026 tranledat
 */

import { ERROR_MESSAGES } from '@/constants/messages';

/**
 * formatMessage: Thay thế placeholder "画面項目名" bằng nhãn thực tế.
 * 
 * @param message Nội dung tin nhắn mẫu
 * @param label Tên nhãn hiển thị thực tế
 */
export const formatMessage = (message: string, label: string) => {
  return message.replace('「画面項目名」', label).replace('画面項目名', label);
};

/**
 * formatMessage2: Thay thế placeholder "画面上の項目名" bằng nhãn thực tế.
 */
export const formatMessage2 = (message: string, label: string) => {
  return message.replace('「画面上の項目名」', label).replace('画面上の項目名', label);
};

/**
 * formatValidationMessage: Tạo thông báo lỗi Validation cho Frontend.
 * 
 * @param code Mã lỗi (ER001, ER006,...)
 * @param label Tên nhãn của trường đang lỗi
 * @param params Các giá trị tham số đi kèm (như độ dài tối đa)
 */
export const formatValidationMessage = (code: string, label: string, ...params: string[]): string => {
  const template = ERROR_MESSAGES[code] || code;
  let result = formatMessage(template, label);
  result = formatMessage2(result, label);

  params.forEach((value) => {
    if (result.includes('xxxx')) {
      result = result.replace('xxxx', value);
    } else if (result.includes('xxx')) {
      result = result.replace('xxx', value);
    }
  });

  return result;
};

export type BackendMessage = {
  code?: string | null;
  params?: string[] | null;
};

/**
 * formatBackendMessage: Chuyển đổi phản hồi lỗi từ Backend thành văn bản hiển thị.
 * Tự động ánh xạ mã lỗi và thay thế các tham số động.
 * 
 * @param backendMessage Đối tượng message { code, params } từ API
 */
export const formatBackendMessage = (backendMessage?: BackendMessage | null): string => {
  const code = backendMessage?.code || '';
  if (!code) return '';

  const template = ERROR_MESSAGES[code] || code;
  const params = backendMessage?.params?.filter((p) => p !== null && p !== undefined) as string[] | undefined;

  if (!params || params.length === 0) return template;

  let result = template;

  // Thay thế tham số đầu tiên (thường là nhãn của trường)
  result = formatMessage(result, params[0]);
  result = formatMessage2(result, params[0]);

  // Thay thế các tham số còn lại vào các vị trí xxxx hoặc xxx
  const remaining = params.slice(1);
  remaining.forEach((value) => {
    if (result.includes('xxxx')) {
      result = result.replace('xxxx', value);
      return;
    }
    if (result.includes('xxx')) {
      result = result.replace('xxx', value);
    }
  });

  return result;
};
