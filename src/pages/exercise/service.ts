import { request } from '@umijs/max';
import type {
  ExerciseDetail,
  ExerciseDetailView,
  ExerciseItem,
  ExerciseQuery,
  ExerciseStatus,
  ImportBatchDetail,
  ImportBatchListItem,
} from './data';

export async function queryExercises(params: ExerciseQuery): Promise<{
  data: ExerciseItem[];
  total: number;
  success: boolean;
}> {
  return request('/api/v1/exercises', { params });
}

export async function getExerciseDetail(
  id: number,
): Promise<{ success: boolean; data: ExerciseDetailView }> {
  return request(`/api/v1/exercises/${id}`);
}

export async function createExercise(
  data: ExerciseDetail,
): Promise<{ success: boolean; data: ExerciseItem }> {
  return request('/api/v1/exercises', { method: 'POST', data });
}

export async function updateExercise(
  id: number,
  data: ExerciseDetail,
): Promise<{ success: boolean; data: ExerciseItem }> {
  return request(`/api/v1/exercises/${id}`, { method: 'PUT', data });
}

export async function updateExerciseStatus(
  id: number,
  status: ExerciseStatus,
): Promise<{ success: boolean }> {
  return request(`/api/v1/exercises/${id}/status`, {
    method: 'PATCH',
    data: { status },
  });
}

// ---- Nhập theo lô (import batch) ----

export async function confirmExercise(
  id: number,
): Promise<{ success: boolean; data: ExerciseDetailView }> {
  return request(`/api/v1/exercises/${id}/confirm`, { method: 'POST' });
}

export async function confirmExercisesBatch(
  ids: number[],
): Promise<{ success: boolean }> {
  return request('/api/v1/exercises/confirm-batch', {
    method: 'POST',
    data: { ids },
  });
}

export async function restoreExercise(
  id: number,
): Promise<{ success: boolean; data: ExerciseDetailView }> {
  return request(`/api/v1/exercises/${id}/restore`, { method: 'POST' });
}

export async function importBatch(
  file: File,
  subjectId: number,
  topicId: number | undefined,
  examName: string | undefined,
): Promise<{ success: boolean; data: ImportBatchDetail }> {
  const form = new FormData();
  form.append('data', file);
  form.append('subjectId', String(subjectId));
  if (topicId) form.append('topicId', String(topicId));
  if (examName) form.append('examName', examName);
  // Khong set Content-Type thu cong — de trinh duyet tu gan boundary multipart
  return request('/api/v1/admin/exercises/import-batch', {
    method: 'POST',
    data: form,
  });
}

export async function queryMyImportBatches(): Promise<{
  success: boolean;
  data: ImportBatchListItem[];
}> {
  return request('/api/v1/admin/import-batches');
}

export async function getImportBatchInProgressCount(): Promise<{
  success: boolean;
  data: number;
}> {
  return request('/api/v1/admin/import-batches/in-progress-count');
}

export async function getImportBatchDetail(
  id: number,
): Promise<{ success: boolean; data: ImportBatchDetail }> {
  return request(`/api/v1/admin/import-batches/${id}`);
}
