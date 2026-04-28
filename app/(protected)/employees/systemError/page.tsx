/**
 * Copyright(C) 2026 Luvina
 * [page.tsx] (SystemError), 28/04/2026 tranledat
 */
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Màn hình hiển thị lỗi hệ thống (System Error).
 * Hiển thị thông báo lỗi và nút quay lại danh sách.
 * @author tranledat
 */
export default function SystemErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('msg') || 'Error message';

  return (
    <div className="box-shadow">
      <div className="notification-box">
        <h1 className="msg-title text-danger">{message}</h1>
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
