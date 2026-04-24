/**
 * Copyright(C) 2024 Luvina
 * page.tsx, 24/04/2024 tranledat
 */

'use client';

import EmployeeInputForm from '@/components/form/EmployeeInputForm';
import { useAuth } from '@/hooks/useAuth';

/**
 * Trang Đăng ký / Chỉnh sửa nhân viên (ADM004).
 * @author tranledat
 */
export default function EmployeeEditPage() {
  useAuth();

  return (
    <div className="row">
      <EmployeeInputForm />
    </div>
  );
}
