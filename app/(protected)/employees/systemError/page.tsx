/**
 * Copyright(C) 2026 Luvina
 * [page.tsx] (SystemError), 28/04/2026 tranledat
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
    const msg = sessionStorage.getItem('SYSTEM_ERROR_MESSAGE');
    const code = sessionStorage.getItem('SYSTEM_ERROR_CODE');

    if (msg) {
      setErrorMessage(msg);
      setErrorCode(code || '');
      // Xóa sau khi đã lấy để tránh hiển thị lại khi reload trang không mong muốn
      sessionStorage.removeItem('SYSTEM_ERROR_MESSAGE');
      sessionStorage.removeItem('SYSTEM_ERROR_CODE');
    } else {
      // Fallback nếu không có msg trong storage (ví dụ từ URL cũ hoặc truy cập trực tiếp)
      const searchParams = new URLSearchParams(window.location.search);
      setErrorMessage(searchParams.get('msg') || 'システムエラーが発生しました。');
      setErrorCode(searchParams.get('code') || '');
    }
  }, []);

  return (
    <div className="box-shadow">
      <div className="notification-box">
        <h1 className="msg-title text-danger">
          {errorCode ? `${errorCode}: ` : ''}
          {errorMessage}
        </h1>
        <div className="notification-box-btn">
          <button
            type="button"
            onClick={() => router.push('/employees/adm002')}
            className="btn btn-primary btn-sm"
            style={{ backgroundColor: '#57b846', borderColor: '#57b846' }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
