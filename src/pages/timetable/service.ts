import { request } from '@umijs/max';
import type {
  AttendanceItem,
  AttendanceStatus,
  BranchOption,
  ChildRef,
  QrToken,
  RefOption,
  TimetableItem,
  TimetableQuery,
} from './data';

// Vỏ ApiResponse<T> của BE: { success, data, error }.
type ApiResponse<T> = { success: boolean; data: T };

// GET /api/v1/timetable → ApiResponse<List<TimetableItem>> → mở 1 lớp data.
export async function queryTimetable(
  params: TimetableQuery,
): Promise<TimetableItem[]> {
  const res = await request<ApiResponse<TimetableItem[]>>('/api/v1/timetable', {
    params,
  });
  return res.data ?? [];
}

// GET /api/v1/admin/users (UserPageResponse phẳng) → RefOption theo role.
export async function queryUserOptions(
  role: 'STUDENT' | 'TEACHER' | 'PARENT',
  keyword?: string,
): Promise<RefOption[]> {
  const res = await request<{
    data: { id: number; username: string; fullName?: string }[];
  }>('/api/v1/admin/users', {
    params: { role, fullName: keyword, pageSize: 20, current: 1 },
  });
  return (res.data ?? []).map((u) => ({
    label: `${u.fullName || u.username} (${u.username})`,
    value: u.id,
  }));
}

// GET /api/v1/branches → ApiResponse<List<BranchItem>>.
export async function queryBranches(): Promise<BranchOption[]> {
  const res =
    await request<ApiResponse<{ id: number; code: string; name: string }[]>>(
      '/api/v1/branches',
    );
  return (res.data ?? []).map((b) => ({
    label: `${b.code} — ${b.name}`,
    value: b.id,
  }));
}

// GET /api/v1/rooms/by-branch/{branchId} → ApiResponse<List<RoomItem>>.
export async function queryRoomsByBranch(
  branchId: number,
): Promise<RefOption[]> {
  const res = await request<
    ApiResponse<{ id: number; code: string; name: string }[]>
  >(`/api/v1/rooms/by-branch/${branchId}`);
  return (res.data ?? []).map((r) => ({
    label: `${r.code} — ${r.name}`,
    value: r.id,
  }));
}

// GET /api/v1/admin/parents/{parentId}/children → ApiResponse<List<RelativeItem>>.
export async function queryChildren(parentId: number): Promise<ChildRef[]> {
  const res = await request<ApiResponse<ChildRef[]>>(
    `/api/v1/admin/parents/${parentId}/children`,
  );
  return res.data ?? [];
}

// GET /api/v1/sessions/{id}/attendance → ApiResponse<List<AttendanceItem>>.
export async function queryAttendance(
  sessionId: number,
): Promise<AttendanceItem[]> {
  const res = await request<ApiResponse<AttendanceItem[]>>(
    `/api/v1/sessions/${sessionId}/attendance`,
  );
  return res.data ?? [];
}

// PATCH /api/v1/sessions/{id}/attendance/{userId} body {status}.
export async function setAttendance(
  sessionId: number,
  userId: number,
  status: AttendanceStatus,
): Promise<void> {
  await request(`/api/v1/sessions/${sessionId}/attendance/${userId}`, {
    method: 'PATCH',
    data: { status },
  });
}

// GET /api/v1/sessions/{id}/qr-token → ApiResponse<{token, ttlSeconds}>.
export async function getQrToken(sessionId: number): Promise<QrToken> {
  const res = await request<ApiResponse<QrToken>>(
    `/api/v1/sessions/${sessionId}/qr-token`,
  );
  return res.data;
}

// Lý do hủy buổi: TimetableItem không có cancelReason → lấy từ
// GET /api/v1/classes/{classId}/sessions (lọc theo ngày) match id===sessionId.
export async function getCancelReason(
  classId: number,
  sessionId: number,
  date: string,
): Promise<string | null> {
  const res = await request<
    ApiResponse<{ id: number; cancelReason?: string | null }[]>
  >(`/api/v1/classes/${classId}/sessions`, {
    params: { from: date, to: date },
  });
  const hit = (res.data ?? []).find((s) => s.id === sessionId);
  return hit?.cancelReason ?? null;
}
