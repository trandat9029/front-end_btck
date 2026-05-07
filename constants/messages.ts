/**
 * Copyright(C) 2024 Luvina
 * messages.ts, 25/04/2024 tranledat
 */

// --- Mẫu tin nhắn gốc (Trước đây nằm trong messageCode.ts) ---
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
export const ER016 = '「アカウント名」 hoặc là 「パスワード」 là bất chínhです。';
export const ER017 = '「パスワード（確認」が不正です。';
export const ER018 = '「画面上の項目名」は半角で入力してください。';
export const ER019 = '「アカウント名」は(a-z, A-Z, 0-9 と _)の桁のみです. 最初の桁は数字ではない。';
export const ER020 = '管理者ユーザを削除することはできません。';
export const ER021 = 'ソートは (ASC, DESC) でなければなりません。';
export const ER022 = 'ページが見つかりません。';
export const ER023 = 'システムエラーが発生しました。';

export const MSG001 = 'ユーザの登録が完了しました。';
export const MSG002 = 'ユーザの更新が完了しました。';
export const MSG003 = 'ユーザ của xóa là hoàn thànhしました。';
export const MSG004 = '削除しますが、よろしいでしょうか。';
export const MSG005 = '検索条件に該当するユーザが見つかりません。';

// --- Nhãn UI & Tin nhắn hệ thống ---
export const MSG_ERROR_FETCH_EMPLOYEE_DETAIL = '社員情報の取得に失敗しました。';
export const MSG_ERROR_SERVER_CONNECTION = 'サーバとの接続に失敗しました。';
export const MSG_ERROR_FETCH_DEPARTMENTS = '部署リストの取得に失敗しました。';
export const MSG_ERROR_FETCH_CERTIFICATIONS = '資格リストの取得に失敗しました。';
export const MSG_ERROR_VALIDATE_FAILED = 'バリデーションに失敗しました。';
export const MSG_ERROR_SYSTEM = ER015;
export const BTN_BACK_TO_LIST = '一覧へ戻る';
export const MSG_ERROR_SAVE_EMPLOYEE = '社員情報の保存に失敗しました。';

// Tin nhắn riêng cho màn hình ADM003
export const MSG_INVALID_EMPLOYEE_ID = '無効な社員IDです。';
export const MSG_CONFIRM_DELETE = '削除しますが、よろしいですか？';
export const MSG_ERROR_DELETE_FAILED = '削除に失敗しました。';

// Tin nhắn cho màn hình hoàn thành (ADM006)
export const MSG_SUCCESS_COMPLETED = MSG001;

// Tiêu đề cho màn hình ADM004
export const TITLE_EMPLOYEE_EDIT = '会員情報編集';
export const TITLE_JAPANESE_ABILITY = '日本語能力';

// Nhãn cho các nút bấm
export const BTN_CONFIRM = '確認';
export const BTN_BACK = '戻る';
export const BTN_CANCEL = 'キャンセル';

/**
 * Object tra cứu thông báo theo mã lỗi (Key-Value)
 */
export const ERROR_MESSAGES: Record<string, string> = {
  ER001,
  ER002,
  ER003,
  ER004,
  ER005,
  ER006,
  ER007,
  ER008,
  ER009,
  ER010,
  ER011,
  ER012,
  ER013,
  ER014,
  ER015,
  ER016,
  ER017,
  ER018,
  ER019,
  ER020,
  ER021,
  ER022,
  ER023,
  MSG001,
  MSG002,
  MSG003,
  MSG004,
  MSG005,
};

/**
 * Map label từ backend về field trong form
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
