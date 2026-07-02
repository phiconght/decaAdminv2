import { request } from '@umijs/max';
import type {
  AnnouncementItem,
  AudienceType,
  SendAnnouncementBody,
} from './data';

// POST /api/v1/admin/announcements → { success, data: { id, sentCount } }
export async function sendAnnouncement(
  data: SendAnnouncementBody,
): Promise<{ success: boolean; data: { id: number; sentCount: number } }> {
  return request('/api/v1/admin/announcements', { method: 'POST', data });
}

// POST /api/v1/admin/announcements/preview-count → { success, data: { count } }
export async function previewCount(
  audience: AudienceType,
  audienceRef?: string,
): Promise<{ success: boolean; data: { count: number } }> {
  return request('/api/v1/admin/announcements/preview-count', {
    method: 'POST',
    data: { audience, audienceRef },
  });
}

// GET /api/v1/admin/announcements → { success, data[], total } (ProTable)
export async function queryAnnouncements(params: {
  current?: number;
  pageSize?: number;
}): Promise<{ success: boolean; data: AnnouncementItem[]; total: number }> {
  return request('/api/v1/admin/announcements', { params });
}
