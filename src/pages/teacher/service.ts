import { request } from '@umijs/max';
import type { ClassItem } from '@/pages/class/data';
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserDetail,
  UserItem,
  UserQuery,
  UserStatus,
} from './data';

const BASE = '/api/v1/admin/users';

export async function queryTeachers(params: UserQuery): Promise<{
  data: UserItem[];
  total: number;
  success: boolean;
}> {
  return request(BASE, { params });
}

export async function getTeacherDetail(
  id: number,
): Promise<{ success: boolean; data: UserDetail }> {
  return request(`${BASE}/${id}`);
}

export async function createTeacher(
  data: CreateUserPayload,
): Promise<{ success: boolean; data: UserDetail }> {
  return request(BASE, { method: 'POST', data });
}

export async function updateTeacher(
  id: number,
  data: UpdateUserPayload,
): Promise<{ success: boolean; data: UserDetail }> {
  return request(`${BASE}/${id}`, { method: 'PUT', data });
}

export async function updateTeacherStatus(
  id: number,
  status: UserStatus,
): Promise<{ success: boolean }> {
  return request(`${BASE}/${id}/status`, {
    method: 'PATCH',
    data: { status },
  });
}

export async function resetTeacherPassword(
  id: number,
  newPassword: string,
): Promise<{ success: boolean }> {
  return request(`${BASE}/${id}/reset-password`, {
    method: 'POST',
    data: { newPassword },
  });
}

export async function deleteTeacher(id: number): Promise<{ success: boolean }> {
  return request(`${BASE}/${id}`, { method: 'DELETE' });
}

// Danh sách khóa học mà 1 giáo viên phụ trách.
export async function queryTeacherClasses(
  userId: number,
): Promise<{ success: boolean; data: ClassItem[] }> {
  return request(`/api/v1/classes/by-teacher/${userId}`);
}
