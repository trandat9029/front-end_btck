/**
 * Copyright(C) 2026 Luvina
 * [page.tsx], 12/04/2026 tranledat
 */

'use client';

import React, { Suspense } from 'react';
import EmployeeListForm from '@/components/form/EmployeeListForm';
import { useAuth } from '@/hooks/useAuth';

/**
 * ADM002Page: Màn hình tìm kiếm và hiển thị danh sách nhân viên.
 */
const ADM002Page = () => {
  // Kiểm tra quyền truy cập
  useAuth();

  return (
    <Suspense fallback={<div className="p-3">読み込み中...</div>}>
      <EmployeeListForm />
    </Suspense>
  );
};

export default ADM002Page;
