/**
 * Copyright(C) 2024 Luvina
 * page.tsx (ADM005), 24/04/2024 tranledat
 */

'use client';

import EmployeeFormConfirm from '@/components/form/EmployeeFormConfirm';
import { useAuth } from '@/hooks/useAuth';

/**
 * Trang xác nhận thông tin nhân viên (ADM005).
 * Vai trò: Chỉ đóng vai trò entry point và kiểm tra quyền truy cập.
 * Mọi logic và hiển thị được đẩy vào Component và Hook.
 * @author tranledat
 */
export default function EmployeeConfirmPage() {
  // Kiểm tra quyền truy cập
  useAuth();

  return (
    <div className="row">
      <EmployeeFormConfirm />
    </div>
  );
}
