import { request } from '@umijs/max';
import type {
  LectureVideoForm,
  LectureVideoItem,
  LectureVideoQuery,
} from './data';

// GET /api/v1/lecture-videos trả LectureVideoPageResponse phẳng {success,data,total} -> thẳng cho ProTable.
export async function queryLectureVideos(params: LectureVideoQuery): Promise<{
  success: boolean;
  data: LectureVideoItem[];
  total: number;
}> {
  return request('/api/v1/lecture-videos', { params });
}

// Danh sách ngắn gọn không phân trang — search-and-add khi gán video vào buổi.
export async function quickSearchLectureVideos(
  q?: string,
  topicId?: number,
): Promise<LectureVideoItem[]> {
  const res = await request('/api/v1/lecture-videos/quick-search', {
    params: { q, topicId },
    skipErrorHandler: true,
  });
  return (res.data ?? []) as LectureVideoItem[];
}

export async function createLectureVideo(
  data: LectureVideoForm,
): Promise<{ success: boolean; data: LectureVideoItem }> {
  return request('/api/v1/lecture-videos', {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
}

export async function updateLectureVideo(
  id: number,
  data: LectureVideoForm,
): Promise<{ success: boolean; data: LectureVideoItem }> {
  return request(`/api/v1/lecture-videos/${id}`, {
    method: 'PUT',
    data,
    skipErrorHandler: true,
  });
}

// 409 VIDEO_IN_USE nếu còn buổi đang dùng -> giữ modal mở, caller tự toast.
export async function deleteLectureVideo(
  id: number,
): Promise<{ success: boolean }> {
  return request(`/api/v1/lecture-videos/${id}`, {
    method: 'DELETE',
    skipErrorHandler: true,
  });
}

// ---------------------- Dropdown môn / chuyên đề ----------------------

export async function querySubjects(): Promise<
  { id: number; name: string; gradeLevel: string }[]
> {
  const res = await request('/api/v1/subjects', {
    params: { status: 'ACTIVE', pageSize: 100 },
    skipErrorHandler: true,
  });
  return res.data ?? [];
}

export async function queryTopicsBySubject(
  subjectId: number,
): Promise<{ id: number; subjectId: number; name: string }[]> {
  const res = await request('/api/v1/topics', {
    params: { subjectId },
    skipErrorHandler: true,
  });
  return res.data ?? [];
}

export async function getTopic(
  topicId: number,
): Promise<{ id: number; subjectId: number; name: string } | null> {
  try {
    const res = await request(`/api/v1/topics/${topicId}`, {
      skipErrorHandler: true,
    });
    return res.data ?? null;
  } catch {
    return null;
  }
}
