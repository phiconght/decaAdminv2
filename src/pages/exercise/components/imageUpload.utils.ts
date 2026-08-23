import { uploadFile } from '@/services/file';

/** Chuyen 1 data URL (base64, do ImageUpload sinh ra khi chon file) thanh File that. */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, b64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png';
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new File([bytes], filename, { type: mime });
}

/** Neu value la data URL (anh moi chon, chua upload) thi upload len server, tra ve URL that. */
export async function uploadIfDataUrl(
  value: string | undefined,
  name: string,
): Promise<string | undefined> {
  if (!value?.startsWith('data:')) return value;
  try {
    const res = await uploadFile(dataUrlToFile(value, name), 'exercise');
    return res.success ? res.data.url : value;
  } catch {
    return value;
  }
}
