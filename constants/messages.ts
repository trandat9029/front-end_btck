/**
 * Copyright(C) [2026] - Luvina
 * messages.ts, 28/04/2026 tranledat
 */
import * as MessageCode from './messageCode';

// General UI Messages
export const MSG_ERROR_FETCH_EMPLOYEE_DETAIL = '社員情報の取得に失敗しました。';
export const MSG_ERROR_SERVER_CONNECTION = 'サーバとの接続に失敗しました。';
export const MSG_ERROR_FETCH_DEPARTMENTS = '部署リストの取得に失敗しました。';
export const MSG_ERROR_FETCH_CERTIFICATIONS = '資格リストの取得に失敗しました。';
export const MSG_ERROR_VALIDATE_FAILED = 'バリデーションに失敗しました。';
export const MSG_ERROR_SYSTEM = 'システムエラーが発生しました。';
export const MSG_ERROR_SAVE_EMPLOYEE = '社員情報の保存に失敗しました。';

// ADM003 Specific
export const MSG_INVALID_EMPLOYEE_ID = '無効な社員IDです。';
export const MSG_CONFIRM_DELETE = '削除しますが、よろしいですか？';
export const MSG_ERROR_DELETE_FAILED = '削除に失敗しました。';

// Validation Messages (ADM004)
export const VALIDATE_LOGIN_ID_REQUIRED = MessageCode.ER001.replace('「画面項目名」', 'アカウント名');
export const VALIDATE_LOGIN_ID_MAX = MessageCode.ER006.replace('xxxx', '50').replace('「画面項目名」', 'アカウント名');

export const VALIDATE_GROUP_REQUIRED = MessageCode.ER002.replace('「画面項目名」', 'グループ');

export const VALIDATE_NAME_REQUIRED = MessageCode.ER001.replace('「画面項目名」', '氏名');
export const VALIDATE_NAME_MAX = MessageCode.ER006.replace('xxxx', '125').replace('「画面項目名」', '氏名');

export const VALIDATE_KANA_REQUIRED = MessageCode.ER001.replace('「画面項目名」', 'カタカナ氏名');
export const VALIDATE_KANA_MAX = MessageCode.ER006.replace('xxxx', '125').replace('「画面項目名」', 'カタカナ氏名');
export const VALIDATE_KANA_FORMAT = MessageCode.ER009.replace('「画面項目名」', 'カタカナ氏名');

export const VALIDATE_BIRTH_DATE_REQUIRED = MessageCode.ER001.replace('「画面項目名」', '生年月日');

export const VALIDATE_EMAIL_REQUIRED = MessageCode.ER001.replace('「画面項目名」', 'メールアドレス');
export const VALIDATE_EMAIL_MAX = MessageCode.ER006.replace('xxxx', '125').replace('「画面項目名」', 'メールアドレス');
export const VALIDATE_EMAIL_FORMAT = MessageCode.ER005.replace('「画面項目名」', 'メールアドレス').replace('xxx', 'メールアドレス');

export const VALIDATE_TEL_REQUIRED = MessageCode.ER001.replace('「画面項目名」', '電話番号');
export const VALIDATE_TEL_MAX = MessageCode.ER006.replace('xxxx', '50').replace('「画面項目名」', '電話番号');
export const VALIDATE_TEL_FORMAT = MessageCode.ER008.replace('「画面項目名」', '電話番号');

export const VALIDATE_PASSWORD_REQUIRED = MessageCode.ER001.replace('「画面項目名」', 'パスワード');
export const VALIDATE_PASSWORD_LENGTH = MessageCode.ER007.replace('「画面項目名」', 'パスワード').replace('xxx', '8').replace('xxx', '50');

export const VALIDATE_RE_PASSWORD_REQUIRED = MessageCode.ER001.replace('「画面項目名」', 'パスワード（確認）');

export const VALIDATE_CERT_START_DATE_REQUIRED = MessageCode.ER001.replace('「画面項目名」', '資格交付日');
export const VALIDATE_CERT_END_DATE_REQUIRED = MessageCode.ER001.replace('「画面項目名」', '失効日');

export const VALIDATE_SCORE_REQUIRED = MessageCode.ER001.replace('「画面項目名」', '点数');
export const VALIDATE_SCORE_FORMAT = MessageCode.ER018.replace('「画面上の項目名」', '点数');

// Completion Page Messages
export const MSG_SUCCESS_COMPLETED = 'ユーザの登録が完了しました。';

/**
 * Các message lỗi từ file out_message.txt.
 * Có thể gọi ra qua Object keys như ERROR_MESSAGES.ER015
 */
export const ERROR_MESSAGES: Record<string, string> = {
  ER001: '「画面項目名」を入力してください',
  ER002: '「画面項目名」を入力してください',
  ER003: '「画面項目名」は既に存在しています。',
  ER004: '「画面項目名」は存在していません。',
  ER005: '「画面項目名」をxxx形式で入力してください',
  ER006: 'xxxx桁以内の「画面項目名」を入力してください',
  ER007: '「画面項目名」をxxx＜＝桁数、＜＝xxx桁で入力してください',
  ER008: '「画面項目名」に半角英数を入力してください',
  ER009: '「画面項目名」をカタカナで入力してください',
  ER010: '「画面項目名」をひらがなで入力してください',
  ER011: '「画面項目名」は無効になっています。',
  ER012: '「失効日」は「資格交付日」より未来の日で入力してください。',
  ER013: '該当するユーザは存在していません。',
  ER014: '該当するユーザは存在していません。',
  ER015: 'システムエラーが発生しました。',
  ER016: '「アカウント名」または「パスワード」は不正です。',
  ER017: '「パスワード（確認」が不正です。',
  ER018: '「画面上の項目名」は半角で入力してください。',
  ER019: '[アカウント名]は(a-z, A-Z, 0-9 と _)の桁のみです。最初の桁 là số không phải.',
  ER020: '管理者ユーザを削除することはできません。',
  ER021: 'ソートは (ASC, DESC) でなければなりません。',
  ER022: 'ページが見つかりません。',
  ER023: 'システムエラーが発生しました。',
  MSG001: 'ユーザの登録が完了しました。',
  MSG002: 'ユーザの更新が完了しました。',
  MSG003: 'ユーザの削除が完了しました。',
  MSG004: '削除しますが、よろしいでしょうか。',
  MSG005: '検索条件に該当するユーザが見つかりません。',
} as const;

/**
 * Map label từ backend về field trong form
 */
export const LABEL_TO_FIELD_MAP: Record<string, string> = {
  'アカウント名': 'employeeLoginId',
  '氏名': 'employeeName',
  'カタカナ氏名': 'employeeNameKana',
  '生年月日': 'employeeBirthDate',
  'メールアドレス': 'employeeEmail',
  '電話番号': 'employeeTelephone',
  'パスワード': 'employeeLoginPassword',
  'グループ': 'departmentId',
  '資格': 'certificationId',
  '資格交付日': 'startDate',
  '失効日': 'endDate',
  '点数': 'score',
};
