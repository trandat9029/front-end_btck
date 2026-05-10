/**
 * Copyright(C) 2024 Luvina
 * page.tsx (ADM005), 24/04/2024 tranledat
 */

'use client';

import React, { Suspense } from 'react';
import EmployeeFormConfirm from '@/components/form/EmployeeFormConfirm';
import { useAuth } from '@/hooks/useAuth';

/**
 * ADM005Page: Màn hình kiểm tra lại dữ liệu trước khi lưu vào DB.
 */
const ADM005Page = () => {
  // Kiểm tra quyền truy cập
  useAuth();

  return (
    <div className="row">
      <Suspense fallback={<div className="p-3">読み込み中...</div>}>
        <EmployeeFormConfirm />
      </Suspense>
    </div>
  );
};

export default ADM005Page;
