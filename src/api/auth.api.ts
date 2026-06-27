import api from './api';

export interface RegisterPayload {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'DISTRIBUTOR' | 'CLIENT' | 'DRIVER';
  storeName?: string;
  region?: string;
  companyName?: string;
  address?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
}

export interface LoginPayload {
  phone?: string;
  email?: string;
  password: string;
}

// LOGIN
export const loginFn = async (data: LoginPayload) => {
  const response = await api.post('/api/auth/login', data);
  return response.data;
};

// REGISTER
export const registerFn = async (data: RegisterPayload) => {
  const response = await api.post('/api/auth/register', data);
  return response.data;
};

// GET PROFILE
export const getMeFn = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

// SEND OTP (Telegram bot)
export const sendOtpFn = async (phone: string) => {
  const response = await api.post('/api/auth/send-otp', { phone });
  return response.data;
};

// VERIFY OTP + REGISTER
export const verifyRegisterFn = async (data: RegisterPayload & { code: string }) => {
  const response = await api.post('/api/auth/verify-register', data);
  return response.data;
};

// TELEGRAM MINI APP — DRIVER AUTH
export const telegramDriverAuthFn = async (data: { initData: string; phone?: string }) => {
  const response = await api.post('/api/auth/telegram-driver', data);
  return response.data;
};

// TELEGRAM MINI APP — CLIENT AUTH
export const telegramClientAuthFn = async (data: { initData: string; phone?: string }) => {
  const response = await api.post('/api/auth/telegram-client', data);
  return response.data;
};