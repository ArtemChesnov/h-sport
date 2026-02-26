/**
 * Типы для модуля авторизации
 */

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: Date | null;
  name: string | null;
  role: "USER" | "ADMIN";
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirmRequest {
  token: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
}
