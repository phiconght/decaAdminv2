import { request } from '@umijs/max';
import type {
  ClassOption,
  CoinBalance,
  CoinTransactionItem,
  InvoiceDetail,
  InvoiceItem,
  InvoicePreviewItem,
  InvoiceQuery,
  PaymentSettings,
  SessionPriceItem,
  StudentDiscountItem,
  StudentSessionReport,
  UserOption,
} from './data';

const BASE = '/api/v1';

// ================= Tùy chọn chung =================
export async function queryClassOptions(keyword?: string): Promise<{
  data: ClassOption[];
  total: number;
  success: boolean;
}> {
  return request(`${BASE}/classes`, {
    params: { name: keyword, pageSize: 100 },
  });
}

export async function queryUserOptions(
  role: 'STUDENT' | 'TEACHER',
  keyword?: string,
): Promise<{ data: UserOption[]; total: number; success: boolean }> {
  return request(`${BASE}/admin/users`, {
    params: { role, fullName: keyword, pageSize: 50 },
  });
}

// ================= Giá & giảm giá (PricingController) =================
export async function updateClassPrice(
  classId: number,
  pricePerSession: number,
): Promise<{ success: boolean; data: { updatedSessions: number } }> {
  return request(`${BASE}/classes/${classId}/price`, {
    method: 'PUT',
    data: { pricePerSession },
  });
}

export async function getSessionPrices(
  classId: number,
  params: { from?: string; to?: string },
): Promise<{ success: boolean; data: SessionPriceItem[] }> {
  return request(`${BASE}/classes/${classId}/sessions/prices`, { params });
}

export async function updateSessionPrice(
  sessionId: number,
  price: number,
): Promise<{ success: boolean }> {
  return request(`${BASE}/sessions/${sessionId}/price`, {
    method: 'PUT',
    data: { price },
  });
}

export async function getStudentDiscounts(
  classId: number,
): Promise<{ success: boolean; data: StudentDiscountItem[] }> {
  return request(`${BASE}/classes/${classId}/students`);
}

export async function updateStudentDiscount(
  classId: number,
  studentId: number,
  discountPercent: number,
): Promise<{ success: boolean }> {
  return request(`${BASE}/classes/${classId}/students/${studentId}/discount`, {
    method: 'PUT',
    data: { discountPercent },
  });
}

// ================= Đợt thu (InvoiceController) =================
export async function previewInvoices(params: {
  classId: number;
  from: string;
  to: string;
}): Promise<{ success: boolean; data: InvoicePreviewItem[] }> {
  return request(`${BASE}/invoices/preview`, { params });
}

export async function createInvoiceBatch(data: {
  classId: number;
  from: string;
  to: string;
  studentIds: number[];
}): Promise<{ success: boolean; data: InvoiceItem[] }> {
  return request(`${BASE}/invoices/batch`, { method: 'POST', data });
}

export async function queryInvoices(params: InvoiceQuery): Promise<{
  data: InvoiceItem[];
  total: number;
  success: boolean;
}> {
  return request(`${BASE}/invoices`, { params });
}

export async function getInvoiceDetail(
  id: number,
): Promise<{ success: boolean; data: InvoiceDetail }> {
  return request(`${BASE}/invoices/${id}`);
}

export async function updateInvoice(
  id: number,
  data: { amount: number; note?: string },
): Promise<{ success: boolean; data: InvoiceItem }> {
  return request(`${BASE}/invoices/${id}`, { method: 'PUT', data });
}

export async function confirmInvoice(
  id: number,
): Promise<{ success: boolean }> {
  return request(`${BASE}/invoices/${id}/confirm`, { method: 'POST' });
}

export async function confirmInvoiceBatch(
  ids: number[],
): Promise<{ success: boolean }> {
  return request(`${BASE}/invoices/confirm-batch`, {
    method: 'POST',
    data: { ids },
  });
}

export async function markInvoicePaid(
  id: number,
  note?: string,
): Promise<{ success: boolean }> {
  return request(`${BASE}/invoices/${id}/paid`, {
    method: 'POST',
    data: { note },
  });
}

export async function cancelInvoice(id: number): Promise<{ success: boolean }> {
  return request(`${BASE}/invoices/${id}/cancel`, { method: 'POST' });
}

// ================= Cấu hình (PaymentSettingsController) =================
export async function getPaymentSettings(): Promise<{
  success: boolean;
  data: PaymentSettings | null;
}> {
  return request(`${BASE}/payment-settings`);
}

export async function updatePaymentSettings(
  data: PaymentSettings,
): Promise<{ success: boolean; data: PaymentSettings }> {
  return request(`${BASE}/payment-settings`, { method: 'PUT', data });
}

// ================= Báo cáo buổi (PaymentReportController) =================
export async function getStudentSessionReport(params: {
  studentId: number;
  from: string;
  to: string;
}): Promise<{ success: boolean; data: StudentSessionReport }> {
  return request(`${BASE}/admin/reports/student-sessions`, { params });
}

// Tải Excel — dùng fetch + Bearer từ localStorage (interceptor request không
// gắn cho tải file; endpoint trả .xlsx khi OK, JSON ApiResponse khi lỗi).
export async function exportSessionReport(
  kind: 'student' | 'teacher',
  params: { userId: number; from: string; to: string },
): Promise<void> {
  const path =
    kind === 'student'
      ? `/admin/reports/student-sessions/export?studentId=${params.userId}`
      : `/admin/reports/teacher-sessions/export?teacherId=${params.userId}`;
  const url = `${BASE}${path}&from=${params.from}&to=${params.to}`;
  const token = localStorage.getItem('access_token');
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const blob = await res.blob();
  if (!res.ok || blob.type.includes('json')) {
    const body = JSON.parse(await blob.text()) as {
      error?: { message?: string };
    };
    throw new Error(body.error?.message ?? 'Xuất Excel thất bại');
  }

  const disposition = res.headers.get('content-disposition') ?? '';
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  const asciiMatch = disposition.match(/filename="([^"]+)"/i);
  const filename = utf8Match
    ? decodeURIComponent(utf8Match[1])
    : (asciiMatch?.[1] ?? `bao-cao-buoi_${params.userId}.xlsx`);

  const objectUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(objectUrl);
}

// ================= Xu học viên (CoinController) =================
export async function getCoinBalance(
  studentId: number,
): Promise<{ success: boolean; data: CoinBalance }> {
  return request(`${BASE}/coins/${studentId}`);
}

export async function getCoinTransactions(
  studentId: number,
  params: { current?: number; pageSize?: number },
): Promise<{ data: CoinTransactionItem[]; total: number; success: boolean }> {
  return request(`${BASE}/coins/${studentId}/transactions`, { params });
}

export async function adjustCoin(
  studentId: number,
  data: { amount: number; reason: string },
): Promise<{ success: boolean; data: CoinBalance }> {
  return request(`${BASE}/coins/${studentId}/adjust`, {
    method: 'POST',
    data,
  });
}
