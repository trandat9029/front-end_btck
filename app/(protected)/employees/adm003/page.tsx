/**
 * Copyright(C) 2026 Luvina
 * [page.tsx], 26/04/2026 tranledat
 */

'use client';

import React, { Suspense } from 'react';
import EmployeeDetailForm from '@/components/form/EmployeeDetailForm';
import { useAuth } from '@/hooks/useAuth';

/**
 * ADM003Page: Màn hình hiển thị thông tin chi tiết một nhân viên.
 */
const ADM003Page = () => {
  // Kiểm tra quyền truy cập
  useAuth();

  return (
    <div className="row">
      <Suspense fallback={<div className="p-3">読み込み中...</div>}>
        <EmployeeDetailForm />
      </Suspense>
    </div>
  );
};

export default ADM003Page;
