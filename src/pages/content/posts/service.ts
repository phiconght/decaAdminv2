import { request } from '@umijs/max';
import type {
  PostDetail,
  PostForm,
  PostItem,
  PostQuery,
  PostStatus,
} from './data';

// GET /api/v1/admin/posts → { success, data[], total } (ProTable)
export async function queryPosts(params: PostQuery): Promise<{
  success: boolean;
  data: PostItem[];
  total: number;
}> {
  return request('/api/v1/admin/posts', { params });
}

// GET /api/v1/admin/posts/:id → { success, data }
export async function getPost(
  id: number,
): Promise<{ success: boolean; data: PostDetail }> {
  return request(`/api/v1/admin/posts/${id}`);
}

// POST /api/v1/admin/posts
export async function createPost(
  data: PostForm,
): Promise<{ success: boolean; data: PostDetail }> {
  return request('/api/v1/admin/posts', { method: 'POST', data });
}

// PUT /api/v1/admin/posts/:id
export async function updatePost(
  id: number,
  data: PostForm,
): Promise<{ success: boolean; data: PostDetail }> {
  return request(`/api/v1/admin/posts/${id}`, { method: 'PUT', data });
}

// PATCH /api/v1/admin/posts/:id/status
export async function changePostStatus(
  id: number,
  status: PostStatus,
): Promise<{ success: boolean; data: PostDetail }> {
  return request(`/api/v1/admin/posts/${id}/status`, {
    method: 'PATCH',
    data: { status },
  });
}

// PATCH /api/v1/admin/posts/:id/pin
export async function pinPost(
  id: number,
  pinned: boolean,
): Promise<{ success: boolean; data: PostDetail }> {
  return request(`/api/v1/admin/posts/${id}/pin`, {
    method: 'PATCH',
    data: { pinned },
  });
}

// DELETE /api/v1/admin/posts/:id (soft delete → ARCHIVED)
export async function archivePost(id: number): Promise<{ success: boolean }> {
  return request(`/api/v1/admin/posts/${id}`, { method: 'DELETE' });
}
