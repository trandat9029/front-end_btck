/**
 * Copyright(C) 2024 Luvina
 * app/(protected)/employees/adm006/page.tsx, 10/05/2026 tranledat
 * 
 * Trang hoàn tất thao tác (ADM006).
 */

'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import * as Messages from '@/constants/messages';
import { ROUTES } from '@/constants/routes';

/**
 * ADM006Content: Nội dung thông báo hoàn tất.
 */
const ADM006Content = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('msg') || Messages.MSG_SUCCESS_COMPLETED;

  const handleOkClick = () => {
    router.push(ROUTES.ADM002);
  };

  return (
    <div className="box-shadow">
      <div className="notification-box">
        <h1 className="msg-title">{decodeURIComponent(message)}</h1>
        <div className="notification-box-btn">
          <button 
            type="button" 
            onClick={handleOkClick} 
            className="btn btn-primary btn-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ADM006Page: Màn hình thông báo đăng ký/cập nhật/xóa thành công.
 */
const ADM006Page = () => {
  // Kiểm tra quyền truy cập
  useAuth();

  return (
    <Suspense fallback={<div className="p-3">読み込み中...</div>}>
      <ADM006Content />
    </Suspense>
  );
};

export default ADM006Page;
