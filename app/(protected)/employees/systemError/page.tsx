/**
 * Copyright(C) 2026 Luvina
 * [page.tsx] (SystemError), 28/04/2026 tranledat
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { STORAGE_KEYS } from '@/constants/system';
import * as Messages from '@/constants/messages';

/**
 * Màn hình hiển thị lỗi hệ thống (System Error).
 * Hiển thị thông báo lỗi và nút quay lại danh sách.
 * @author tranledat
 */
export default function SystemErrorPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState('');

  useEffect(() => {
    // Đọc thông báo lỗi từ sessionStorage (được set bởi interceptor hoặc hook)
    const msg = sessionStorage.getItem(STORAGE_KEYS.SYSTEM_ERROR_MESSAGE);
    const code = sessionStorage.getItem(STORAGE_KEYS.SYSTEM_ERROR_CODE);

    if (msg) {
      setErrorMessage(msg);
      setErrorCode(code || '');
      // Xóa sau khi đã lấy để tránh hiển thị lại khi reload trang không mong muốn
      sessionStorage.removeItem(STORAGE_KEYS.SYSTEM_ERROR_MESSAGE);
      sessionStorage.removeItem(STORAGE_KEYS.SYSTEM_ERROR_CODE);
    } else {
      // Fallback nếu không có msg trong storage (ví dụ từ URL cũ hoặc truy cập trực tiếp)
      const searchParams = new URLSearchParams(window.location.search);
      setErrorMessage(searchParams.get('msg') || Messages.MSG_ERROR_SYSTEM);
      setErrorCode(searchParams.get('code') || '');
    }
  }, []);

  return (
    <div className="notification-box">
      <h1 className="note-err" style={{ fontWeight: 'bold', marginBottom: '20px' }}>
        {errorCode ? `${errorCode}: ` : ''}
        {errorMessage}
      </h1>
      <div className="notification-box-btn">
        <button
          type="button"
          onClick={() => router.push(ROUTES.ADM002)}
          className="btn-default"
          style={{ backgroundColor: '#5cb85c', color: 'white', border: 'none', padding: '10px 30px', borderRadius: '4px', cursor: 'pointer' }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
