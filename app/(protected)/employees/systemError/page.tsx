/**
 * Copyright(C) 2026 Luvina
 * [page.tsx] (SystemError), 28/04/2026 tranledat
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { STORAGE_KEYS } from '@/constants/system';
import * as Messages from '@/constants/messages';

/**
 * SystemErrorPage: Hiển thị thông báo lỗi nghiêm trọng và cho phép quay lại danh sách.
 */
const SystemErrorPage = () => {
  const router = useRouter();
  const [errorInfo, setErrorInfo] = useState({
    message: '',
    code: ''
  });

  useEffect(() => {
    // Đọc thông báo lỗi từ sessionStorage (được thiết lập bởi Interceptor hoặc các Hooks)
    const storedMsg = sessionStorage.getItem(STORAGE_KEYS.SYSTEM_ERROR_MESSAGE);
    const storedCode = sessionStorage.getItem(STORAGE_KEYS.SYSTEM_ERROR_CODE);

    if (storedMsg) {
      setErrorInfo({
        message: storedMsg,
        code: storedCode || ''
      });
      // Xóa dữ liệu sau khi lấy để tránh hiển thị lại khi người dùng reload trang
      sessionStorage.removeItem(STORAGE_KEYS.SYSTEM_ERROR_MESSAGE);
      sessionStorage.removeItem(STORAGE_KEYS.SYSTEM_ERROR_CODE);
    } else {
      // Fallback: Lấy thông tin từ URL nếu truy cập trực tiếp
      const searchParams = new URLSearchParams(window.location.search);
      setErrorInfo({
        message: searchParams.get('msg') || Messages.MSG_ERROR_SYSTEM,
        code: searchParams.get('code') || ''
      });
    }
  }, []);

  /**
   * Quay lại màn hình danh sách ADM002.
   */
  const handleOkClick = () => {
    router.push(ROUTES.ADM002);
  };

  return (
    <div className="notification-box">
      <h1 className="note-err" style={{ fontWeight: 'bold', marginBottom: '20px' }}>
        {errorInfo.code ? `${errorInfo.code}: ` : ''}
        {errorInfo.message}
      </h1>
      <div className="notification-box-btn">
        <button
          type="button"
          onClick={handleOkClick}
          className="btn-default"
          style={{
            backgroundColor: '#5cb85c',
            color: 'white',
            border: 'none',
            padding: '10px 30px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default SystemErrorPage;
