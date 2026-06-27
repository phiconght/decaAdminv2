import { request } from '@umijs/max';
import type { GuardianRelationship, RelativeItem } from '@/pages/student/data';
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserDetail,
  UserItem,
  UserQuery,
  UserStatus,
} from './data';

const BASE = '/api/v1/admin/users';
const ADMIN = '/api/v1/admin';

export async function queryParents(params: UserQuery): Promise<{
  data: UserItem[];
  total: number;
  success: boolean;
}> {
  return request(BASE, { params });
}

export async function getParentDetail(
  id: number,
): Promise<{ success: boolean; data: UserDetail }> {
  return request(`${BASE}/${id}`);
}

export async function createParent(
  data: CreateUserPayload,
): Promise<{ success: boolean; data: UserDetail }> {
  return request(BASE, { method: 'POST', data });
}

export async function updateParent(
  id: number,
  data: UpdateUserPayload,
): Promise<{ success: boolean; data: UserDetail }> {
  return request(`${BASE}/${id}`, { method: 'PUT', data });
}

export async function updateParentStatus(
  id: number,
  status: UserStatus,
): Promise<{ success: boolean }> {
  return request(`${BASE}/${id}/status`, {
    method: 'PATCH',
    data: { status },
  });
}

export async function resetParentPassword(
  id: number,
  newPassword: string,
): Promise<{ success: boolean }> {
  return request(`${BASE}/${id}/reset-password`, {
    method: 'POST',
    data: { newPassword },
  });
}

export async function deleteParent(id: number): Promise<{ success: boolean }> {
  return request(`${BASE}/${id}`, { method: 'DELETE' });
}

// ---- Liên kết con (học viên) của phụ huynh ----

// DS con: GET /admin/parents/{id}/children → RelativeItem[] (đủ email/phone/status).
export async function listChildren(
  parentId: number,
): Promise<{ success: boolean; data: RelativeItem[] }> {
  return request(`${ADMIN}/parents/${parentId}/children`);
}

// Thêm con: POST /admin/students/{childId}/parents {parentId, relationship}.
export async function linkChild(
  childId: number,
  parentId: number,
  relationship?: GuardianRelationship | null,
): Promise<{ success: boolean }> {
  return request(`${ADMIN}/students/${childId}/parents`, {
    method: 'POST',
    data: { parentId, relationship: relationship ?? undefined },
  });
}

// Gỡ con: DELETE /admin/students/{childId}/parents/{parentId}.
export async function unlinkChild(
  childId: number,
  parentId: number,
): Promise<{ success: boolean }> {
  return request(`${ADMIN}/students/${childId}/parents/${parentId}`, {
    method: 'DELETE',
  });
}
