/**
 * Copyright(C) 2024 Luvina
 * page.tsx, 24/04/2024 tranledat
 */

'use client';

import React, { Suspense } from 'react';
import EmployeeInputForm from '@/components/form/EmployeeInputForm';
import { useAuth } from '@/hooks/useAuth';

/**
 * ADM004Page: Màn hình nhập liệu thông tin nhân viên.
 */
const ADM004Page = () => {
  // Kiểm tra quyền truy cập
  useAuth();

  return (
    <div className="row">
      <Suspense fallback={<div className="p-3">読み込み中...</div>}>
        <EmployeeInputForm />
      </Suspense>
    </div>
  );
};

export default ADM004Page;
