import { request } from '@umijs/max';
import type {
  CreateLeavePayload,
  LeaveItem,
  LeaveQuery,
  StudentClassOption,
  StudentOption,
  TimetableItem,
} from './data';

const BASE = '/api/v1/leaves';

// Danh sách đơn nghỉ — LeavePageResponse phẳng { success, data, total }.
export async function queryLeaves(params: LeaveQuery): Promise<{
  success: boolean;
  data: LeaveItem[];
  total: number;
}> {
  return request(BASE, { params });
}

// Tạo đơn nghỉ (Admin tạo thay mặt) — ApiResponse<LeaveItem> (201).
export async function createLeave(
  data: CreateLeavePayload,
): Promise<{ success: boolean; data: LeaveItem }> {
  return request(BASE, { method: 'POST', data });
}

// Duyệt đơn — KHÔNG body (reviewer = current user, BE tự gán).
export async function approveLeave(
  id: number,
): Promise<{ success: boolean; data: LeaveItem }> {
  return request(`${BASE}/${id}/approve`, { method: 'PATCH' });
}

// Từ chối đơn — KHÔNG body.
export async function rejectLeave(
  id: number,
): Promise<{ success: boolean; data: LeaveItem }> {
  return request(`${BASE}/${id}/reject`, { method: 'PATCH' });
}

// Dropdown học viên — UserPageResponse phẳng. BE KHÔNG có param 'keyword' -> dùng 'fullName'.
export async function queryStudentOptionsForLeave(fullName?: string): Promise<{
  success: boolean;
  data: StudentOption[];
  total: number;
}> {
  return request('/api/v1/admin/users', {
    params: { role: 'STUDENT', pageSize: 100, fullName },
  });
}

// Buổi của HV cho scope=SESSION — ApiResponse<List<TimetableItem>> (đọc res.data).
// from/to bắt buộc (YYYY-MM-DD).
export async function queryStudentSessions(
  studentId: number,
  from: string,
  to: string,
): Promise<{ success: boolean; data: TimetableItem[] }> {
  return request('/api/v1/timetable', {
    params: { view: 'STUDENT', refId: studentId, from, to },
  });
}

// Lớp của HV cho scope=RANGE — ApiResponse<List<ClassListItem>> (đọc res.data).
export async function queryStudentClassesForLeave(
  studentId: number,
): Promise<{ success: boolean; data: StudentClassOption[] }> {
  return request(`/api/v1/classes/by-student/${studentId}`);
}
