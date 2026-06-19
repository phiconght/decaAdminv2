import { request } from '@umijs/max';
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserDetail,
  UserItem,
  UserQuery,
  UserStatus,
} from './data';

const BASE = '/api/v1/admin/users';

export async function queryUsers(params: UserQuery): Promise<{
  data: UserItem[];
  total: number;
  success: boolean;
}> {
  return request(BASE, { params });
}

export async function getUserDetail(
  id: number,
): Promise<{ success: boolean; data: UserDetail }> {
  return request(`${BASE}/${id}`);
}

export async function createUser(
  data: CreateUserPayload,
): Promise<{ success: boolean; data: UserDetail }> {
  return request(BASE, { method: 'POST', data });
}

export async function updateUser(
  id: number,
  data: UpdateUserPayload,
): Promise<{ success: boolean; data: UserDetail }> {
  return request(`${BASE}/${id}`, { method: 'PUT', data });
}

export async function updateUserStatus(
  id: number,
  status: UserStatus,
): Promise<{ success: boolean }> {
  return request(`${BASE}/${id}/status`, {
    method: 'PATCH',
    data: { status },
  });
}

export async function resetUserPassword(
  id: number,
  newPassword: string,
): Promise<{ success: boolean }> {
  return request(`${BASE}/${id}/reset-password`, {
    method: 'POST',
    data: { newPassword },
  });
}

export async function deleteUser(id: number): Promise<{ success: boolean }> {
  return request(`${BASE}/${id}`, { method: 'DELETE' });
}
