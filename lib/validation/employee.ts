/**
 * Copyright(C) 2026 Luvina
 * employee.ts, 24/04/2024 tranledat
 */

import { z } from 'zod';
import * as MessageCode from '@/constants/messages';
import { formatValidationMessage } from '@/lib/utils/message';

/**
 * Validate tên nhân viên trong form tìm kiếm ADM002.
 */
export function validateEmployeeName(value: string): string {
  if (value.length > 125) {
    return formatValidationMessage(MessageCode.ER006, '氏名', '125');
  }

  if (value.length > 0 && value.trim().length === 0) {
    return 'Employee name must not contain only whitespace.';
  }

  return '';
}

/**
 * Chuẩn hóa input tên nhân viên trước khi lưu vào state hoặc gửi tìm kiếm.
 */
export function sanitizeEmployeeNameInput(value: string): string {
  return value.replace(/^\s+/, '').replace(/\s{2,}/g, ' ');
}

/**
 * Schema validation cho thông tin nhân viên (ADM004).
 */
export const employeeSchema = z
  .object({
    // 1.1 Validate parameter [employeeLoginId] (Tên tài khoản)
    employeeLoginId: z
      .string()
      .trim()
      .min(1, formatValidationMessage(MessageCode.ER001, 'アカウント名'))
      .max(50, formatValidationMessage(MessageCode.ER006, 'アカウント名', '50'))
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, MessageCode.ER019),

    // 1.2 Phòng ban/Nhóm
    departmentId: z.string().min(1, formatValidationMessage(MessageCode.ER002, 'グループ')),

    // 1.2 Validate parameter [employeeName] (Họ tên)
    // - min(1): Kiểm tra bắt buộc nhập (lỗi ER001)
    // - max(125): Giới hạn độ dài tối đa 125 ký tự (lỗi ER006)
    employeeName: z
      .string()
      .trim()
      .min(1, formatValidationMessage(MessageCode.ER001, '氏名'))
      .max(125, formatValidationMessage(MessageCode.ER006, '氏名', '125')),

    // 1.3 Validate parameter [employeeNameKana] (Họ tên Katakana)
    // - min(1): Bắt buộc nhập (lỗi ER001)
    // - max(125): Giới hạn tối đa 125 ký tự (lỗi ER006)
    // - regex(...): Chỉ cho phép các ký tự Katakana toàn góc (ァ-ン, ヴ, ー) (lỗi ER009)
    employeeNameKana: z
      .string()
      .trim()
      .min(1, formatValidationMessage(MessageCode.ER001, 'カタカナ氏名'))
      .max(125, formatValidationMessage(MessageCode.ER006, 'カタカナ氏名', '125'))
      .regex(/^[\uFF61-\uFF9F]+$/, formatValidationMessage(MessageCode.ER009, 'カタカナ氏名')),

    // 1.4 Ngày sinh
    employeeBirthDate: z.string().min(1, formatValidationMessage(MessageCode.ER001, '生年月日')),

    // 1.5 Validate parameter [employeeEmail] (Địa chỉ Email)
    // - min(1): Bắt buộc nhập (lỗi ER001)
    // - max(125): Tối đa 125 ký tự (lỗi ER006)
    // - email(): Kiểm tra đúng định dạng email (lỗi ER005)
    employeeEmail: z
      .string()
      .trim()
      .min(1, formatValidationMessage(MessageCode.ER001, 'メールアドレス'))
      .max(125, formatValidationMessage(MessageCode.ER006, 'メールアドレス', '125'))
      .email(formatValidationMessage(MessageCode.ER005, 'メールアドレス', 'メールアドレス')),

    // 1.6 Validate parameter [employeeTelephone] (Số điện thoại)
    // - min(1): Bắt buộc nhập (lỗi ER001)
    // - max(50): Tối đa 50 ký tự (lỗi ER006)
    // - regex(...): Chỉ cho phép ký tự 1 byte  (lỗi ER008)
    employeeTelephone: z
      .string()
      .trim()
      .min(1, formatValidationMessage(MessageCode.ER001, '電話番号'))
      .max(50, formatValidationMessage(MessageCode.ER006, '電話番号', '50'))
      .regex(/^[\x20-\x7E]+$/, formatValidationMessage(MessageCode.ER008, '電話番号')),

    // 1.7 Mật khẩu
    employeeLoginPassword: z
      .string()
      .max(50, formatValidationMessage(MessageCode.ER006, 'パスワード', '50')),

    // 1.8 Xác nhận mật khẩu
    employeeLoginPasswordConfirm: z.string(),

    // Các trường của phần Tiếng Nhật 
    // Đây là optional (có thể không chọn)
    employeeId: z.number().optional(),
    certificationId: z.string().optional(),
    certificationStartDate: z.string().optional(),
    certificationEndDate: z.string().optional(),
    employeeCertificationScore: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // 1.7.1 Kiểm tra Mật khẩu bắt buộc và độ dài nếu là chế độ THÊM MỚI
    if (!data.employeeId) {
      if (!data.employeeLoginPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: formatValidationMessage(MessageCode.ER001, 'パスワード'),
          path: ['employeeLoginPassword'],
        });
      } else if (data.employeeLoginPassword.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: formatValidationMessage(MessageCode.ER007, 'パスワード', '8', '50'),
          path: ['employeeLoginPassword'],
        });
      }

      if (!data.employeeLoginPasswordConfirm) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: formatValidationMessage(MessageCode.ER001, 'パスワード（確認）'),
          path: ['employeeLoginPasswordConfirm'],
        });
      }
    }

    // 1.8 Kiểm tra xem Mật khẩu và Xác nhận Mật khẩu có khớp nhau không
    // Nếu có nhập mật khẩu (thêm mới hoặc muốn đổi) thì mới check khớp
    if (data.employeeLoginPassword && data.employeeLoginPassword !== data.employeeLoginPasswordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MessageCode.ER017,
        path: ['employeeLoginPasswordConfirm'],
      });
    }

    // 1.9 Validate parameter [certifications]
    // Nếu người dùng đã chọn một bằng cấp (có certificationId) thì bắt đầu check chi tiết
    if (data.certificationId) {
      // 1.9.1 Kiểm tra "Ngày cấp" (certificationStartDate)
      // - Nếu để trống -> Báo lỗi ER001
      if (!data.certificationStartDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: formatValidationMessage(MessageCode.ER001, '資格交付日'),
          path: ['certificationStartDate'],
        });
      }

      // 1.9.2 Kiểm tra "Ngày hết hạn" (certificationEndDate)
      // - Nếu để trống -> Báo lỗi ER001
      if (!data.certificationEndDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: formatValidationMessage(MessageCode.ER001, '失効日'),
          path: ['certificationEndDate'],
        });
      }

      // 1.9.3 So sánh Ngày hết hạn và Ngày cấp
      // - Nếu đã nhập cả hai, kiểm tra certificationEndDate < certificationStartDate
      // - Nếu ngày hết hạn xảy ra TRƯỚC ngày cấp -> Báo lỗi ER012
      if (data.certificationStartDate && data.certificationEndDate) {
        const start = new Date(data.certificationStartDate);
        const end = new Date(data.certificationEndDate);
        if (end < start) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: MessageCode.ER012,
            path: ['certificationEndDate'],
          });
        }
      }

      // 1.9.4 Kiểm tra "Điểm số" (employeeCertificationScore)
      // - Nếu trống -> Báo lỗi ER001
      // - Nếu có nhập nhưng KHÔNG phải là số nguyên dương (regex ^\d+$) -> Báo lỗi ER018
      if (!data.employeeCertificationScore) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: formatValidationMessage(MessageCode.ER001, '点数'),
          path: ['employeeCertificationScore'],
        });
      } else if (!/^\d+$/.test(data.employeeCertificationScore)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: formatValidationMessage(MessageCode.ER018, '点数'),
          path: ['employeeCertificationScore'],
        });
      } else if (data.employeeCertificationScore.length > 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: formatValidationMessage(MessageCode.ER006, '点数', '3'),
          path: ['employeeCertificationScore'],
        });
      }
    }
  });