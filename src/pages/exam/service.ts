import { request } from '@umijs/max';
import type {
  ClassStudentInfo,
  ExamClassItem,
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

// Danh sách khóa học của 1 đề (popup cột "Số khóa").
export async function queryExamClasses(
  examId: number,
): Promise<{ success: boolean; data: ExamClassItem[] }> {
  return request(`/api/v1/exams/${examId}/classes`);
}

// Lấy thông tin gọn của khóa theo list id (để map nhãn trong dropdown "Khóa áp dụng").
export async function queryClassesByIds(ids: number[]): Promise<{
  success: boolean;
  data: {
    id: number;
    code: string;
    name: string;
    subjectId: number;
    subjectName: string;
    gradeLevel: string;
  }[];
}> {
  return request('/api/v1/classes/by-ids', {
    params: { ids: ids.join(',') },
  });
}

// Danh sách học sinh của 1 khóa (dùng lại endpoint quản trị user, lọc role STUDENT).
export async function queryClassStudents(
  classId: number,
): Promise<{ success: boolean; data: ClassStudentInfo[]; total: number }> {
  return request('/api/v1/admin/users', {
    params: { classId, role: 'STUDENT', pageSize: 100 },
  });
}
