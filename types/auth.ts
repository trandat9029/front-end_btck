// Dữ liệu gửi lên khi đăng nhập
export interface LoginRequest {
  username: string;
  password: string;
}

// Dữ liệu phản hồi sau khi đăng nhập thành công
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
}

// Dữ liệu giải mã từ token xác thực
export interface TokenPayload {
  exp: number;
  // Các claim khác nếu cần
}

