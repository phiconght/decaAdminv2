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

// GET /api/v1/exams/{id}/pdf?variant= → tải file PDF về máy.
// BE trả application/pdf khi thành công; khi lỗi trả JSON ApiResponse.fail —
// với responseType 'blob' lỗi cũng thành Blob nên PHẢI kiểm blob.type.
export async function exportExamPdf(
  id: number,
  variant: 'DE' | 'DAP_AN',
): Promise<void> {
  const res = await request<Blob>(`/api/v1/exams/${id}/pdf`, {
    params: { variant },
    responseType: 'blob',
    getResponse: true,
  });
  const blob = res.data;

  if (blob.type.includes('json')) {
    const body = JSON.parse(await blob.text()) as {
      error?: { message?: string };
    };
    throw new Error(body.error?.message ?? 'Xuất PDF thất bại');
  }

  // Ưu tiên filename* (UTF-8) trong Content-Disposition; fallback tên mặc định.
  const disposition: string = res.headers?.['content-disposition'] ?? '';
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  const asciiMatch = disposition.match(/filename="([^"]+)"/i);
  const filename = utf8Match
    ? decodeURIComponent(utf8Match[1])
    : (asciiMatch?.[1] ??
      `${variant === 'DAP_AN' ? 'Dap-an' : 'De-thi'}_${id}.pdf`);

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
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
