import { z } from 'zod';
import {
  ER001,
  ER002,
  ER005,
  ER006,
  ER007,
  ER008,
  ER009,
  ER012,
  ER017,
  ER018,
  ER019,
} from '@/constants/messageCode';

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
    // - min(1): Kiểm tra bắt buộc nhập (lỗi ER001)
    // - max(50): Giới hạn độ dài tối đa 50 ký tự (lỗi ER006)
    // - regex(...): Chỉ cho phép ký tự a-z, A-Z, 0-9, dấu '_', và không được bắt đầu bằng số (lỗi ER019)
    employeeLoginId: z
      .string()
      .min(1, ER001.replace('「画面項目名」', 'アカウント名'))
      .max(50, ER006.replace('xxxx', '50').replace('「画面項目名」', 'アカウント名'))
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, ER019),

    // 1.2 Validate parameter [departmentId] (Phòng ban/Nhóm)
    // - min(1): Kiểm tra bắt buộc chọn (lỗi ER002)
    departmentId: z.string().min(1, ER002.replace('「画面項目名」', 'グループ')),

    // 1.2 Validate parameter [employeeName] (Họ tên)
    // - min(1): Kiểm tra bắt buộc nhập (lỗi ER001)
    // - max(125): Giới hạn độ dài tối đa 125 ký tự (lỗi ER006)
    employeeName: z
      .string()
      .min(1, ER001.replace('「画面項目名」', '氏名'))
      .max(125, ER006.replace('xxxx', '125').replace('「画面項目名」', '氏名')),

    // 1.3 Validate parameter [employeeNameKana] (Họ tên Katakana)
    // - min(1): Bắt buộc nhập (lỗi ER001)
    // - max(125): Giới hạn tối đa 125 ký tự (lỗi ER006)
    // - regex(...): Chỉ cho phép các ký tự Katakana toàn góc (ァ-ン, ヴ, ー) (lỗi ER009)
    employeeNameKana: z
      .string()
      .min(1, ER001.replace('「画面項目名」', 'カタカナ氏名'))
      .max(125, ER006.replace('xxxx', '125').replace('「画面項目名」', 'カタカナ氏名'))
      .regex(/^[ァ-ンヴー]+$/, ER009.replace('「画面項目名」', 'カタカナ氏名')),

    // 1.4 Validate parameter [employeeBirthDate] (Ngày sinh)
    // - min(1): Kiểm tra bắt buộc nhập (lỗi ER001)
    employeeBirthDate: z.string().min(1, ER001.replace('「画面項目名」', '生年月日')),

    // 1.5 Validate parameter [employeeEmail] (Địa chỉ Email)
    // - min(1): Bắt buộc nhập (lỗi ER001)
    // - max(125): Tối đa 125 ký tự (lỗi ER006)
    // - email(): Kiểm tra đúng định dạng email (lỗi ER005)
    employeeEmail: z
      .string()
      .min(1, ER001.replace('「画面項目名」', 'メールアドレス'))
      .max(125, ER006.replace('xxxx', '125').replace('「画面項目名」', 'メールアドレス'))
      .email(ER005.replace('「画面項目名」', 'メールアドレス').replace('xxx', 'メールアドレス')),

    // 1.6 Validate parameter [employeeTelephone] (Số điện thoại)
    // - min(1): Bắt buộc nhập (lỗi ER001)
    // - max(50): Tối đa 50 ký tự (lỗi ER006)
    // - regex(...): Chỉ cho phép ký tự 1 byte  (lỗi ER008)
    employeeTelephone: z
      .string()
      .min(1, ER001.replace('「画面項目名」', '電話番号'))
      .max(50, ER006.replace('xxxx', '50').replace('「画面項目名」', '電話番号'))
      .regex(/^[\x20-\x7E]+$/, ER008.replace('「画面項目名」', '電話番号')),

    // 1.7 Validate parameter [employeeLoginPassword] (Mật khẩu)
    // - min(1): Bắt buộc nhập (lỗi ER001)
    // - min(8): Tối thiểu 8 ký tự (lỗi ER007)
    // - max(50): Tối đa 50 ký tự (lỗi ER007)
    employeeLoginPassword: z
      .string()
      .min(1, ER001.replace('「画面項目名」', 'パスワード'))
      .min(
        8,
        ER007.replace('「画面項目名」', 'パスワード').replace('xxx', '8').replace('xxx', '50')
      )
      .max(
        50,
        ER007.replace('「画面項目名」', 'パスワード').replace('xxx', '8').replace('xxx', '50')
      ),

    // 1.8 Validate parameter [employeeLoginRePassword] (Xác nhận mật khẩu)
    // - min(1): Bắt buộc nhập (lỗi ER001)
    employeeLoginPasswordConfirm: z
      .string()
      .min(1, ER001.replace('「画面項目名」', 'パスワード（確認）')),

    // Các trường của phần Tiếng Nhật 
    // Đây là optional (có thể không chọn)
    certificationId: z.string().optional(),
    certificationStartDate: z.string().optional(),
    certificationEndDate: z.string().optional(),
    employeeCertificationScore: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // 1.8 Kiểm tra xem Mật khẩu và Xác nhận Mật khẩu có khớp nhau không
    // Nếu không khớp -> Báo lỗi ER017 ở trường employeeLoginPasswordConfirm
    if (data.employeeLoginPassword !== data.employeeLoginPasswordConfirm) {
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
          message: ER001.replace('「画面項目名」', '資格交付日'),
          path: ['certificationStartDate'],
        });
      }

      // 1.9.2 Kiểm tra "Ngày hết hạn" (certificationEndDate)
      // - Nếu để trống -> Báo lỗi ER001
      if (!data.certificationEndDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ER001.replace('「画面項目名」', '失効日'),
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
          message: ER001.replace('「画面項目名」', '点数'),
          path: ['employeeCertificationScore'],
        });
      } else if (!/^\d+$/.test(data.employeeCertificationScore)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ER018.replace('「画面上の項目名」', '点数'),
          path: ['employeeCertificationScore'],
        });
      }
    }
  });