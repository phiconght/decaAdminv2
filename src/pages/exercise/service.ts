import { request } from '@umijs/max';
import type {
  ExerciseDetail,
  ExerciseDetailView,
  ExerciseItem,
  ExerciseQuery,
  ExerciseStatus,
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
