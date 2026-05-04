/**
 * Copyright(C) 2024 Luvina
 * date.ts, 24/04/2024 tranledat
 */

import { format, parseISO, isValid } from 'date-fns';

/**
 * Định dạng chuỗi ngày tháng từ Backend sang định dạng hiển thị yyyy/MM/dd.
 * @param dateStr Chuỗi ngày tháng (ISO hoặc định dạng khác)
 * @param fallback Giá trị trả về nếu ngày không hợp lệ
 * @returns Chuỗi ngày đã định dạng hoặc fallback
 */
export const formatDateDisplay = (dateStr: string | null | undefined, fallback: string = ''): string => {
  if (!dateStr) return fallback;
  
  // Nếu đã đúng định dạng yyyy/MM/dd thì trả về luôn
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateStr)) return dateStr;
  
  // Thử parse và format
  try {
    // Thay thế gạch ngang bằng gạch chéo nếu cần
    const normalized = dateStr.includes('-') ? dateStr.replace(/-/g, '/') : dateStr;
    
    // Nếu là chuỗi ISO (có chữ T)
    if (dateStr.includes('T')) {
        const date = parseISO(dateStr);
        if (isValid(date)) return format(date, 'yyyy/MM/dd');
    }

    return normalized;
  } catch (error) {
    return dateStr;
  }
};
