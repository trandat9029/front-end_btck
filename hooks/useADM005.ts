'use client';

import { useMemo } from 'react';
import { loadEmployeeFormDraft } from '@/hooks/useADM004';

// Lấy dữ liệu nháp đã lưu để màn hình ADM005 dùng cho bước xác nhận.
export const useADM005 = () => {
  return useMemo(() => loadEmployeeFormDraft(), []);
};
