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
