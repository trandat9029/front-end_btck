/**
 * Copyright(C) [2026] - Luvina
 * [not-found.tsx], 07/05/2026 tranledat
 */
import { redirect } from 'next/navigation';
import { ER022 } from '@/constants/messages';

/**
 * Xử lý lỗi 404 (Không tìm thấy trang).
 * Chuyển hướng trực tiếp về màn hình System Error với mã lỗi ER022 qua URL parameter.
 * @author tranledat
 */
export default function NotFound() {
  redirect(`/employees/systemError?msg=${encodeURIComponent(ER022)}`);
}
