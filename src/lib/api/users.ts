import { client } from './client';
import { User } from '@/types/user';
import { SuccessResponse } from '@/types/api';

export const usersApi = {
  getUser: (id: string) =>
    client.get<SuccessResponse<{ user: User }>>(`/users/${id}`),

  updateUser: (id: string, body: any) =>
    client.patch<SuccessResponse<{ user: User }>>(`/users/${id}`, body),

  changePassword: (body: any) =>
    client.patch<SuccessResponse<null>>('/users/change-password', body),
};
