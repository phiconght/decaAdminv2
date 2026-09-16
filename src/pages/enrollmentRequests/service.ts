import { request } from '@umijs/max';
import type { EnrollmentRequestItem, EnrollmentRequestStatus } from './data';

export async function queryEnrollmentRequests(
  status?: EnrollmentRequestStatus,
): Promise<{ success: boolean; data: EnrollmentRequestItem[] }> {
  return request('/api/v1/admin/enrollment-requests', { params: { status } });
}

export async function confirmEnrollmentRequest(
  id: number,
): Promise<{ success: boolean }> {
  return request(`/api/v1/admin/enrollment-requests/${id}/confirm`, {
    method: 'POST',
  });
}

export async function cancelEnrollmentRequest(
  id: number,
): Promise<{ success: boolean }> {
  return request(`/api/v1/admin/enrollment-requests/${id}/cancel`, {
    method: 'POST',
  });
}
