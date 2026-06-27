import { request } from '@umijs/max';
import type {
  ClassDetail,
  ClassExamItem,
  ClassItem,
  ClassQuery,
  ClassStatus,
  StudentOption,
} from './data';

export async function queryClasses(params: ClassQuery): Promise<{
  data: ClassItem[];
  total: number;
  success: boolean;
}> {
  return request('/api/v1/classes', { params });
}

export async function getClassDetail(
  id: number,
): Promise<{ success: boolean; data: ClassItem }> {
  return request(`/api/v1/classes/${id}`);
}

export async function createClass(
  data: ClassDetail,
): Promise<{ success: boolean; data: ClassItem }> {
  return request('/api/v1/classes', { method: 'POST', data });
}

export async function updateClass(
  id: number,
  data: ClassDetail,
): Promise<{ success: boolean; data: ClassItem }> {
  return request(`/api/v1/classes/${id}`, { method: 'PUT', data });
}

export async function updateClassStatus(
  id: number,
  status: ClassStatus,
): Promise<{ success: boolean }> {
  return request(`/api/v1/classes/${id}/status`, {
    method: 'PATCH',
    data: { status },
  });
}

export async function queryClassStudents(
  classId: number,
): Promise<{ success: boolean; data: StudentOption[] }> {
  return request(`/api/v1/classes/${classId}/students`);
}

export async function queryEligibleStudents(
  classId: number,
  keyword?: string,
): Promise<{ success: boolean; data: StudentOption[] }> {
  return request(`/api/v1/classes/${classId}/eligible-students`, {
    params: { keyword },
  });
}

export async function addClassStudents(
  classId: number,
  studentIds: number[],
): Promise<{ success: boolean }> {
  return request(`/api/v1/classes/${classId}/students`, {
    method: 'POST',
    data: { studentIds },
  });
}

export async function removeClassStudent(
  classId: number,
  userId: number,
): Promise<{ success: boolean }> {
  return request(`/api/v1/classes/${classId}/students/${userId}`, {
    method: 'DELETE',
  });
}

export async function queryClassExams(
  classId: number,
): Promise<{ success: boolean; data: ClassExamItem[]; total: number }> {
  return request('/api/v1/exams', {
    params: { classId, pageSize: 100 },
  });
}
