import { z } from 'zod';
import {
  ER012,
  ER017,
  ER019,
} from '@/constants/messageCode';
import * as Messages from '@/constants/messages';

/**
 * Validate tên nhân viên trong form tìm kiếm ADM002.
 */
export function validateEmployeeName(value: string): string {
  if (value.length > 125) {
    return 'Employee name must be 125 characters or fewer.';
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

export const employeeSchema = z
  .object({
    // 1.1 Validate parameter [employeeLoginId] (Tên tài khoản)
    employeeLoginId: z
      .string()
      .min(1, Messages.VALIDATE_LOGIN_ID_REQUIRED)
      .max(50, Messages.VALIDATE_LOGIN_ID_MAX)
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, ER019),

    // 1.2 Validate parameter [departmentId] (Phòng ban/Nhóm)
    departmentId: z.string().min(1, Messages.VALIDATE_GROUP_REQUIRED),

    // 1.2 Validate parameter [employeeName] (Họ tên)
    // - min(1): Kiểm tra bắt buộc nhập (lỗi ER001)
    // - max(125): Giới hạn độ dài tối đa 125 ký tự (lỗi ER006)
    employeeName: z
      .string()
      .min(1, Messages.VALIDATE_NAME_REQUIRED)
      .max(125, Messages.VALIDATE_NAME_MAX),

    // 1.3 Validate parameter [employeeNameKana] (Họ tên Katakana)
    // - min(1): Bắt buộc nhập (lỗi ER001)
    // - max(125): Giới hạn tối đa 125 ký tự (lỗi ER006)
    // - regex(...): Chỉ cho phép các ký tự Katakana toàn góc (ァ-ン, ヴ, ー) (lỗi ER009)
    employeeNameKana: z
      .string()
      .min(1, Messages.VALIDATE_KANA_REQUIRED)
      .max(125, Messages.VALIDATE_KANA_MAX)
      .regex(/^[\uFF61-\uFF9F]+$/, Messages.VALIDATE_KANA_FORMAT),

    // 1.4 Validate parameter [employeeBirthDate] (Ngày sinh)
    employeeBirthDate: z.string().min(1, Messages.VALIDATE_BIRTH_DATE_REQUIRED),

    // 1.5 Validate parameter [employeeEmail] (Địa chỉ Email)
    // - min(1): Bắt buộc nhập (lỗi ER001)
    // - max(125): Tối đa 125 ký tự (lỗi ER006)
    // - email(): Kiểm tra đúng định dạng email (lỗi ER005)
    employeeEmail: z
      .string()
      .min(1, Messages.VALIDATE_EMAIL_REQUIRED)
      .max(125, Messages.VALIDATE_EMAIL_MAX)
      .email(Messages.VALIDATE_EMAIL_FORMAT),

    // 1.6 Validate parameter [employeeTelephone] (Số điện thoại)
    // - min(1): Bắt buộc nhập (lỗi ER001)
    // - max(50): Tối đa 50 ký tự (lỗi ER006)
    // - regex(...): Chỉ cho phép ký tự 1 byte  (lỗi ER008)
    employeeTelephone: z
      .string()
      .min(1, Messages.VALIDATE_TEL_REQUIRED)
      .max(50, Messages.VALIDATE_TEL_MAX)
      .regex(/^[\x20-\x7E]+$/, Messages.VALIDATE_TEL_FORMAT),

    // 1.7 Validate parameter [employeeLoginPassword] (Mật khẩu)
    employeeLoginPassword: z
      .string()
      .max(50, Messages.VALIDATE_PASSWORD_LENGTH),

    // 1.8 Validate parameter [employeeLoginRePassword] (Xác nhận mật khẩu)
    employeeLoginPasswordConfirm: z
      .string(),

    // Các trường của phần Tiếng Nhật 
    // Đây là optional (có thể không chọn)
    employeeId: z.number().optional(),
    certificationId: z.string().optional(),
    certificationStartDate: z.string().optional(),
    certificationEndDate: z.string().optional(),
    employeeCertificationScore: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // 1.7.1 Kiểm tra Mật khẩu bắt buộc và độ dài nếu là chế độ THÊM MỚI (không có employeeId)
    if (!data.employeeId) {
      if (!data.employeeLoginPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: Messages.VALIDATE_PASSWORD_REQUIRED,
          path: ['employeeLoginPassword'],
        });
      } else if (data.employeeLoginPassword.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: Messages.VALIDATE_PASSWORD_LENGTH,
          path: ['employeeLoginPassword'],
        });
      }

      if (!data.employeeLoginPasswordConfirm) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: Messages.VALIDATE_RE_PASSWORD_REQUIRED,
          path: ['employeeLoginPasswordConfirm'],
        });
      }
    }

    // 1.8 Kiểm tra xem Mật khẩu và Xác nhận Mật khẩu có khớp nhau không
    // Nếu có nhập mật khẩu (thêm mới hoặc muốn đổi) thì mới check khớp
    if (data.employeeLoginPassword && data.employeeLoginPassword !== data.employeeLoginPasswordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: ER017,
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
          message: Messages.VALIDATE_CERT_START_DATE_REQUIRED,
          path: ['certificationStartDate'],
        });
      }

      // 1.9.2 Kiểm tra "Ngày hết hạn" (certificationEndDate)
      // - Nếu để trống -> Báo lỗi ER001
      if (!data.certificationEndDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: Messages.VALIDATE_CERT_END_DATE_REQUIRED,
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
            message: ER012,
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
          message: Messages.VALIDATE_SCORE_REQUIRED,
          path: ['employeeCertificationScore'],
        });
      } else if (!/^\d+$/.test(data.employeeCertificationScore)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: Messages.VALIDATE_SCORE_FORMAT,
          path: ['employeeCertificationScore'],
        });
      }
    }
  });