export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface VerifyEmailRequest {
  email: string;
  transactionId: string;
  otp: string;
}

export interface GenerateOtpRequest {
  email: string;
  password: string;
}

export interface GenerateOtpResponse {
  transactionId: string;
  message: string;
}

export interface ValidateOtpRequest {
  transactionId: string;
  otp: string;
}

export interface ValidateOtpResponse {
  token: string;
  tokenType?: string;
  userId?: string;
  email?: string;
  name?: string;
  message?: string;
  enabled: boolean;
}

export interface RegisterResponse {
  token: string;
  tokenType?: string;
  userId?: string | null;
  email?: string;
  name?: string;
  message?: string;
  enabled?: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    enabled?: boolean;
  };
}

export interface LoginResponse {
  needsVerification: boolean;
  email?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  register: (credentials: RegisterCredentials) => Promise<RegisterResponse>;
  generateOtp: (email: string, password: string) => Promise<GenerateOtpResponse>;
  validateOtp: (email: string, transactionId: string, otp: string) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => Promise<void>;
}