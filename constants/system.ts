/**
 * Copyright(C) 2026 Luvina
 * [system.ts], 07/05/2026 tranledat
 */

export const STORAGE_KEYS = {
  SYSTEM_ERROR_MESSAGE: 'SYSTEM_ERROR_MESSAGE',
  SYSTEM_ERROR_CODE: 'SYSTEM_ERROR_CODE',
  ACCESS_TOKEN: 'access_token',
  TOKEN_TYPE: 'token_type',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  UNAUTHORIZED: 401,
  INTERNAL_SERVER_ERROR: 500,
} as const;
