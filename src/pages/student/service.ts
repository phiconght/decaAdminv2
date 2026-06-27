import { request } from '@umijs/max';
import type { ClassItem } from '@/pages/class/data';
import type {
  CreateUserPayload,
  StudentExamItem,
  StudentExamStatus,
  UserDetail,
  UserItem,
  UserQuery,
  UserStatus,
} from './data';

const BASE = '/api/v1/admin/users';

export async function queryStudents(params: UserQuery): Promise<{
  data: UserItem[];
  total: number;
  success: boolean;
}> {
  return request(BASE, { params });
}

export async function getStudentDetail(
  id: number,
): Promise<{ success: boolean; data: UserDetail }> {
  return request(`${BASE}/${id}`);
}

export async function createStudent(
  data: CreateUserPayload,
): Promise<{ success: boolean; data: UserDetail }> {
  return request(BASE, { method: 'POST', data });
}

export async function updateStudentStatus(
  id: number,
  status: UserStatus,
): Promise<{ success: boolean }> {
  return request(`${BASE}/${id}/status`, {
    method: 'PATCH',
    data: { status },
  });
}

export async function deleteStudent(id: number): Promise<{ success: boolean }> {
  return request(`${BASE}/${id}`, { method: 'DELETE' });
}

// Danh sách khóa học mà 1 học viên đang tham gia.
export async function queryStudentClasses(
  userId: number,
): Promise<{ success: boolean; data: ClassItem[] }> {
  return request(`/api/v1/classes/by-student/${userId}`);
}

// Danh sách đề thi của 1 học viên trong 1 khóa.
export async function queryStudentClassExams(
  userId: number,
  classId: number,
): Promise<{ success: boolean; data: StudentExamItem[] }> {
  return request(`/api/v1/exams/student/${userId}/class/${classId}`);
}

// Admin đổi trạng thái đề cho 1 học viên.
export async function updateStudentExamStatus(
  examId: number,
  userId: number,
  status: StudentExamStatus,
): Promise<{ success: boolean }> {
  return request(`/api/v1/exams/${examId}/students/${userId}/status`, {
    method: 'PATCH',
    data: { status },
  });
}
