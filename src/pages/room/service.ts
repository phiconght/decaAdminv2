import { request } from '@umijs/max';
import type {
  BranchForm,
  BranchItem,
  HolidayForm,
  HolidayItem,
  HolidayQuery,
  RoomForm,
  RoomItem,
  RoomQuery,
} from './data';

// ===== Branch =====
export async function queryBranches(
  all?: boolean,
): Promise<{ success: boolean; data: BranchItem[] }> {
  return request('/api/v1/branches', { params: { all } });
}

export async function getBranch(
  id: number,
): Promise<{ success: boolean; data: BranchItem }> {
  return request(`/api/v1/branches/${id}`);
}

export async function createBranch(
  data: BranchForm,
): Promise<{ success: boolean; data: BranchItem }> {
  return request('/api/v1/branches', { method: 'POST', data });
}

export async function updateBranch(
  id: number,
  data: BranchForm,
): Promise<{ success: boolean; data: BranchItem }> {
  return request(`/api/v1/branches/${id}`, { method: 'PUT', data });
}

// ===== Room =====
// GET /api/v1/rooms trả RoomPageResponse phẳng {success,data,total} -> trả thẳng cho ProTable.
export async function queryRooms(params: RoomQuery): Promise<{
  success: boolean;
  data: RoomItem[];
  total: number;
}> {
  return request('/api/v1/rooms', { params });
}

export async function getRoom(
  id: number,
): Promise<{ success: boolean; data: RoomItem }> {
  return request(`/api/v1/rooms/${id}`);
}

export async function queryRoomsByBranch(
  branchId: number,
): Promise<{ success: boolean; data: RoomItem[] }> {
  return request(`/api/v1/rooms/by-branch/${branchId}`);
}

export async function createRoom(
  data: RoomForm,
): Promise<{ success: boolean; data: RoomItem }> {
  return request('/api/v1/rooms', { method: 'POST', data });
}

export async function updateRoom(
  id: number,
  data: RoomForm,
): Promise<{ success: boolean; data: RoomItem }> {
  return request(`/api/v1/rooms/${id}`, { method: 'PUT', data });
}

// ===== Holiday =====
export async function queryHolidays(
  params: HolidayQuery,
): Promise<{ success: boolean; data: HolidayItem[] }> {
  return request('/api/v1/holidays', { params });
}

export async function createHoliday(
  data: HolidayForm,
): Promise<{ success: boolean; data: HolidayItem }> {
  return request('/api/v1/holidays', { method: 'POST', data });
}

export async function deleteHoliday(id: number): Promise<{ success: boolean }> {
  return request(`/api/v1/holidays/${id}`, { method: 'DELETE' });
}
