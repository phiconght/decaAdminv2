import { request } from '@umijs/max';
import type {
  CreateManualSessionPayload,
  CreateSchedulePayload,
  GeneratePreview,
  RoomOption,
  ScheduleItem,
  SessionDetail,
  TeacherOption,
  UpdateSessionPayload,
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

export async function listSessions(
  classId: number,
  from: string,
  to: string,
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
