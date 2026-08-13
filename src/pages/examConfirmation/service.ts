import { request } from '@umijs/max';
import type { ExamConfirmationItem, ExamConfirmationQuery } from './data';

const BASE = '/api/v1/exam-confirmations';

// Danh sách bài thi đã nộp chưa xác nhận — ExamConfirmationPageResponse
// phẳng { success, data, total }.
export async function queryPendingExams(
  params: ExamConfirmationQuery,
): Promise<{ success: boolean; data: ExamConfirmationItem[]; total: number }> {
  return request(BASE, { params });
}

// Xác nhận 1 bài — ApiResponse<ExamConfirmationItem>.
export async function confirmExam(
  examStudentId: number,
): Promise<{ success: boolean; data: ExamConfirmationItem }> {
  return request(`${BASE}/${examStudentId}/confirm`, { method: 'PATCH' });
}

// Xác nhận hàng loạt — ApiResponse<number> (số bài vừa xác nhận).
export async function confirmExamsBulk(
  examStudentIds: number[],
): Promise<{ success: boolean; data: number }> {
  return request(`${BASE}/confirm-bulk`, {
    method: 'PATCH',
    data: { examStudentIds },
  });
}
