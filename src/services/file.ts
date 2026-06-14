import { request } from '@umijs/max';

export async function uploadFile(
  file: File,
  folder = 'exercise',
): Promise<{ success: boolean; data: { id: number; url: string; fileName: string; size: number; contentType: string } }> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);
  // Khong set Content-Type thu cong — de trinh duyet tu gan boundary multipart
  return request('/api/v1/files', { method: 'POST', data: form });
}
