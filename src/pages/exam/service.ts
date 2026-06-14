import { request } from '@umijs/max';
import type {
  ExamDetailView,
  ExamItem,
  ExamPayload,
  ExamQuery,
  ExamStatus,
  StudentOption,
} from './data';

export async function queryExams(params: ExamQuery): Promise<{
  data: ExamItem[];
  total: number;
  success: boolean;
}> {
  return request('/api/v1/exams', { params });
}

export async function getExamDetail(
  id: number,
): Promise<{ success: boolean; data: ExamDetailView }> {
  return request(`/api/v1/exams/${id}`);
}

export async function createExam(
  data: ExamPayload,
): Promise<{ success: boolean; data: ExamDetailView }> {
  return request('/api/v1/exams', { method: 'POST', data });
}

export async function updateExam(
  id: number,
  data: ExamPayload,
): Promise<{ success: boolean; data: ExamDetailView }> {
  return request(`/api/v1/exams/${id}`, { method: 'PUT', data });
}

export async function updateExamStatus(
  id: number,
  status: ExamStatus,
): Promise<{ success: boolean; data: ExamDetailView }> {
  return request(`/api/v1/exams/${id}/status`, {
    method: 'PATCH',
    data: { status },
  });
}

export async function deleteExam(id: number): Promise<{ success: boolean }> {
  return request(`/api/v1/exams/${id}`, { method: 'DELETE' });
}

export async function queryStudentOptions(
  classIds: number[],
): Promise<{ success: boolean; data: StudentOption[] }> {
  return request('/api/v1/exams/student-options', {
    params: { classIds: classIds.join(',') },
  });
}
