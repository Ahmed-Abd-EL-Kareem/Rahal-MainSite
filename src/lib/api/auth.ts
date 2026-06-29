/* eslint-disable @typescript-eslint/no-explicit-any */
import { client } from './client';
import { User } from '@/types/user';
import { SuccessResponse } from '@/types/api';

export interface AuthResponse {
  status: 'success';
  message: string;
  token: string;
  data: {
    user: User;
  };
}

export const authApi = {
  signup: (body: any) =>
    client.post<AuthResponse>('/auth/signup', body),

  login: (body: any) =>
    client.post<AuthResponse>('/auth/login', body),

  forgotPassword: (email: string) =>
    client.post<SuccessResponse<null>>('/auth/forgot-password', { email }),

  verifyOtp: (email: string, otp: string) =>
    client.post<SuccessResponse<null>>('/auth/verify-otp', { email, otp }),

  resetPassword: (body: any) =>
    client.post<SuccessResponse<null>>('/auth/reset-password', body),

  getGoogleAuthUrl: () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    return `${apiBase}/auth/google`;
  },
};
