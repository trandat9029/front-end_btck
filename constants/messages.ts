/**
 * Copyright(C) 2024 Luvina
 * messages.ts, 25/04/2024 tranledat
 */

// --- Mẫu tin nhắn gốc (Dựa trên thiết kế DB/API) ---
export const ER001 = '「画面項目名」を入力してください';
export const ER002 = '「画面項目名」を入力してください';
export const ER003 = '「画面項目名」は既に存在しています。';
export const ER004 = '「画面項目名」は存在していません。';
export const ER005 = '「画面項目名」をxxx形式で入力してください';
export const ER006 = 'xxxx桁以内の「画面項目名」を入力してください';
export const ER007 = '「画面項目名」をxxx＜＝桁数、＜＝xxx桁で入力してください';
export const ER008 = '「画面項目名」に半角英数を入力してください';
export const ER009 = '「画面項目名」をカタカナで入力してください';
export const ER010 = '「画面項目名」をひらがなで入力してください';
export const ER011 = '「画面項目名」は無効になっています。';
export const ER012 = '「失効日」は「資格交付日」より未来の日で入力してください。';
export const ER013 = '該当するユーザは存在していません。';
export const ER014 = '該当するユーザは存在していません。';
export const ER015 = 'システムエラーが発生しました。';
export const ER016 = '「アカウント名」または「パスワード」が不正です。';
export const ER017 = '「パスワード（確認）」が不正です。';
export const ER018 = '「画面項目名」は半角数字で入力してください。';
export const ER019 = '「アカウント名」は(a-z, A-Z, 0-9 と _)のみ nhập可能です。最初の文字は数字以外にしてください。';
export const ER020 = '管理者ユーザを削除することはできません。';
export const ER021 = 'ソートは (ASC, DESC) でなければなりません。';
export const ER022 = 'ページが見つかりません。';
export const ER023 = 'システムエラーが発生しました。';

export const MSG001 = 'ユーザの登録が完了しました。';
export const MSG002 = 'ユーザの更新が完了しました。';
export const MSG003 = 'ユーザの削除が完了しました。';
export const MSG004 = '削除しますが、よろしいでしょうか。';
export const MSG005 = '検索条件に該当するユーザが見つかりません。';

// --- Nhãn UI & Tin nhắn hệ thống (Custom) ---
export const MSG_ERROR_FETCH_EMPLOYEE_DETAIL = '社員情報の取得に失敗しました。';
export const MSG_ERROR_SERVER_CONNECTION = 'サーバとの接続に失敗しました。';
export const MSG_ERROR_FETCH_DEPARTMENTS = '部署リストの取得に失敗しました。';
export const MSG_ERROR_FETCH_CERTIFICATIONS = '資格リストの取得に失敗しました。';
export const MSG_ERROR_VALIDATE_FAILED = 'バリデーションに失敗しました。';
export const MSG_ERROR_SYSTEM = ER015;
export const MSG_ERROR_SAVE_EMPLOYEE = '社員情報の保存に失敗しました。';
export const MSG_INVALID_EMPLOYEE_ID = '無効な社員IDです。';
export const MSG_CONFIRM_DELETE = '削除しますが、よろしいですか？';
export const MSG_ERROR_DELETE_FAILED = '削除に失敗しました。';

export const BTN_BACK_TO_LIST = '一覧へ戻る';
export const MSG_SUCCESS_COMPLETED = MSG001;

// Tiêu đề cho các màn hình
export const TITLE_EMPLOYEE_EDIT = '会員情報編集';
export const TITLE_JAPANESE_ABILITY = '日本語能力';

/**
 * ERROR_MESSAGES: Object tra cứu thông báo theo mã lỗi trả về từ Backend.
 */
export const ERROR_MESSAGES: Record<string, string> = {
  ER001, ER002, ER003, ER004, ER005, ER006, ER007, ER008, ER009, ER010,
  ER011, ER012, ER013, ER014, ER015, ER016, ER017, ER018, ER019, ER020,
  ER021, ER022, ER023, MSG001, MSG002, MSG003, MSG004, MSG005,
};

/**
 * LABEL_TO_FIELD_MAP: Ánh xạ tên nhãn tiếng Nhật sang tên trường trong dữ liệu Form.
 */
export const LABEL_TO_FIELD_MAP: Record<string, string> = {
  'アカウント名': 'employeeLoginId',
  '[アカウント名]': 'employeeLoginId',
  '氏名': 'employeeName',
  '[氏名]': 'employeeName',
  'カタカナ氏名': 'employeeNameKana',
  '[カタカナ氏名]': 'employeeNameKana',
  '生年月日': 'employeeBirthDate',
  '[生年月日]': 'employeeBirthDate',
  'メールアドレス': 'employeeEmail',
  '[メールアドレス]': 'employeeEmail',
  '電話番号': 'employeeTelephone',
  '[電話番号]': 'employeeTelephone',
  'パスワード': 'employeeLoginPassword',
  '[パスワード]': 'employeeLoginPassword',
  'グループ': 'departmentId',
  '[グループ]': 'departmentId',
  '資格': 'certificationId',
  '[資格]': 'certificationId',
  '資格交付日': 'certificationStartDate',
  '[資格交付日]': 'certificationStartDate',
  '失効日': 'certificationEndDate',
  '[失効日]': 'certificationEndDate',
  '点数': 'employeeCertificationScore',
  '[点数]': 'employeeCertificationScore',
};

/**
 * FIELD_LABELS: Các nhãn hiển thị cho từng trường dữ liệu.
 */
export const FIELD_LABELS = {
  LOGIN_ID: 'アカウント名',
  DEPARTMENT: 'グループ',
  NAME: '氏名',
  NAME_KANA: 'カタカナ氏名',
  BIRTH_DATE: '生年月日',
  EMAIL: 'メールアドレス',
  TELEPHONE: '電話番号',
  PASSWORD: 'パスワード',
  PASSWORD_CONFIRM: 'パスワード（確認）',
  CERTIFICATION: '資格',
  CERT_START_DATE: '資格交付日',
  CERT_END_DATE: '失効日',
  CERT_SCORE: '点数',
};

/**
 * UI_LABELS: Các nhãn văn bản cố định trên giao diện.
 */
export const UI_LABELS = {
  SELECT_DEFAULT: '選択してください',
  TITLE_EMPLOYEE_INFO: '会員情報編集',
  TITLE_JAPANESE_ABILITY: '日本語能力',
};
