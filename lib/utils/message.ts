/**
 * Copyright(C) 2026 Luvina
 * message.ts, 03/05/2026 tranledat
 */
import { ERROR_MESSAGES } from '@/constants/messages';

/**
 * Format message với label (thay thế 画面項目名)
 */
export const formatMessage = (message: string, label: string) => {
  return message.replace('「画面項目名」', label).replace('画面項目名', label);
};

/**
 * Format message với label (thay thế 画面上の項目名)
 */
export const formatMessage2 = (message: string, label: string) => {
  return message.replace('「画面上の項目名」', label).replace('画面上の項目名', label);
};

export type BackendMessage = {
  code?: string | null;
  params?: string[] | null;
};

/**
 * Chuyển đổi MessageResponse { code, params } từ Backend thành chuỗi thông báo UI.
 * Sử dụng ERROR_MESSAGES và thay thế các placeholder (xxxx, xxx).
 */
export const formatBackendMessage = (backendMessage?: BackendMessage | null): string => {
  const code = backendMessage?.code || '';
  if (!code) return '';

  const template = ERROR_MESSAGES[code] || code;
  const params = backendMessage?.params?.filter((p) => p !== null && p !== undefined) as string[] | undefined;

  if (!params || params.length === 0) return template;

  let result = template;

  // Thay thế placeholder cho label (thông thường là params[0])
  result = formatMessage(result, params[0]);
  result = formatMessage2(result, params[0]);

  // Thay thế các placeholder còn lại (xxxx / xxx) theo thứ tự
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
