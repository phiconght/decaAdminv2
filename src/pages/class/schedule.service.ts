import { request } from '@umijs/max';
import type {
  CreateManualSessionPayload,
  CreateSchedulePayload,
  GeneratePreview,
  RoomOption,
  ScheduleItem,
  SessionDetail,
  SessionVideoItem,
  TeacherOption,
  TopicOption,
  UpdateSessionPayload,
  UpsertZoomLinkPayload,
  ZoomLinkItem,
} from './schedule.data';

// ---------------------- Quy tắc lịch ----------------------

export async function listSchedules(
  classId: number,
): Promise<{ success: boolean; data: ScheduleItem[] }> {
  return request(`/api/v1/classes/${classId}/schedules`);
}

export async function previewSchedule(
  classId: number,
  data: CreateSchedulePayload,
): Promise<{ success: boolean; data: GeneratePreview }> {
  return request(`/api/v1/classes/${classId}/schedules/preview`, {
    method: 'POST',
    data,
  });
}

export async function createSchedule(
  classId: number,
  data: CreateSchedulePayload,
): Promise<{ success: boolean; data: GeneratePreview }> {
  return request(`/api/v1/classes/${classId}/schedules`, {
    method: 'POST',
    data,
  });
}

export async function updateSchedule(
  scheduleId: number,
  data: CreateSchedulePayload,
): Promise<{ success: boolean; data: GeneratePreview }> {
  return request(`/api/v1/schedules/${scheduleId}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteSchedule(
  scheduleId: number,
): Promise<{ success: boolean }> {
  return request(`/api/v1/schedules/${scheduleId}`, { method: 'DELETE' });
}

// ---------------------- Buổi học ----------------------

// from/to là TÙY CHỌN: bỏ trống cả hai = lấy toàn bộ buổi của khóa
// (chế độ "Toàn khóa" khi gán chuyên đề). Xem SPEC_KhoaHoc_NoiDung_Mobile §3.4e.
export async function listSessions(
  classId: number,
  from?: string,
  to?: string,
): Promise<{ success: boolean; data: SessionDetail[] }> {
  return request(`/api/v1/classes/${classId}/sessions`, {
    params: { from, to },
  });
}

// 409 trùng phòng/GV: giữ modal mở -> tự xử lý lỗi (skipErrorHandler), caller toast.
export async function createManualSession(
  classId: number,
  data: CreateManualSessionPayload,
): Promise<{ success: boolean; data: SessionDetail }> {
  return request(`/api/v1/classes/${classId}/sessions`, {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
}

export async function updateSession(
  sessionId: number,
  data: UpdateSessionPayload,
): Promise<{ success: boolean; data: SessionDetail }> {
  return request(`/api/v1/sessions/${sessionId}`, {
    method: 'PATCH',
    data,
    skipErrorHandler: true,
  });
}

export async function cancelSession(
  sessionId: number,
  reason: string,
): Promise<{ success: boolean; data: SessionDetail }> {
  return request(`/api/v1/sessions/${sessionId}/cancel`, {
    method: 'POST',
    data: { reason },
  });
}

// Gán/gỡ chuyên đề cho nhiều buổi (topicId = null -> gỡ). Trả số buổi đã cập nhật.
// Đây cũng là đường dùng khi chỉ đổi 1 buổi (truyền 1 phần tử) — SPEC §3.4a.
export async function bulkAssignTopic(
  classId: number,
  sessionIds: number[],
  topicId: number | null,
): Promise<{ success: boolean; data: number }> {
  return request(`/api/v1/classes/${classId}/sessions/bulk-topic`, {
    method: 'PATCH',
    data: { sessionIds, topicId },
    skipErrorHandler: true,
  });
}

// ---------------------- Video bài giảng của buổi ----------------------

export async function listSessionVideos(
  sessionId: number,
): Promise<{ success: boolean; data: SessionVideoItem[] }> {
  return request(`/api/v1/sessions/${sessionId}/videos`, {
    skipErrorHandler: true,
  });
}

// Ghi đè toàn bộ danh sách video của buổi, thứ tự = thứ tự videoIds.
export async function assignSessionVideos(
  sessionId: number,
  videoIds: number[],
): Promise<{ success: boolean; data: SessionVideoItem[] }> {
  return request(`/api/v1/sessions/${sessionId}/videos`, {
    method: 'PUT',
    data: { videoIds },
    skipErrorHandler: true,
  });
}

// ---------------------- Link Zoom của buổi ----------------------

export async function listZoomLinks(
  sessionId: number,
): Promise<{ success: boolean; data: ZoomLinkItem[] }> {
  return request(`/api/v1/sessions/${sessionId}/zoom-links`, {
    skipErrorHandler: true,
  });
}

export async function addZoomLink(
  sessionId: number,
  data: UpsertZoomLinkPayload,
): Promise<{ success: boolean; data: ZoomLinkItem }> {
  return request(`/api/v1/sessions/${sessionId}/zoom-links`, {
    method: 'POST',
    data,
    skipErrorHandler: true,
  });
}

export async function updateZoomLink(
  sessionId: number,
  linkId: number,
  data: UpsertZoomLinkPayload,
): Promise<{ success: boolean; data: ZoomLinkItem }> {
  return request(`/api/v1/sessions/${sessionId}/zoom-links/${linkId}`, {
    method: 'PUT',
    data,
    skipErrorHandler: true,
  });
}

export async function deleteZoomLink(
  sessionId: number,
  linkId: number,
): Promise<{ success: boolean }> {
  return request(`/api/v1/sessions/${sessionId}/zoom-links/${linkId}`, {
    method: 'DELETE',
    skipErrorHandler: true,
  });
}

// ---------------------- Dropdown (dùng chung 2 form) ----------------------

// Phòng: /rooms phẳng {success, data, total}. Catch 403 êm -> trả [].
export async function queryRooms(keyword?: string): Promise<RoomOption[]> {
  try {
    const res = await request('/api/v1/rooms', {
      params: { keyword, active: true, pageSize: 100 },
      skipErrorHandler: true,
    });
    return (res.data ?? []) as RoomOption[];
  } catch {
    return [];
  }
}

// Chuyên đề theo môn: /topics gate TOPIC:READ (V14 cấp cho MỌI role). Catch lỗi êm.
export async function queryTopics(subjectId: number): Promise<TopicOption[]> {
  try {
    const res = await request('/api/v1/topics', {
      params: { subjectId },
      skipErrorHandler: true,
    });
    return (res.data ?? []) as TopicOption[];
  } catch {
    return [];
  }
}

// GV: /classes/teacher-options gate CLASS:READ (ApiResponse<List>). Catch 403 êm.
export async function queryTeachers(
  keyword?: string,
): Promise<TeacherOption[]> {
  try {
    const res = await request('/api/v1/classes/teacher-options', {
      params: { keyword },
      skipErrorHandler: true,
    });
    return (res.data ?? []) as TeacherOption[];
  } catch {
    return [];
  }
}
