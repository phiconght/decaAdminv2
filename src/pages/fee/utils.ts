import type { InvoiceStatus } from './data';

// Định dạng tiền VND: 200000 -> '200.000 ₫'
export const formatVnd = (v?: number | null): string =>
  v == null ? '—' : `${new Intl.NumberFormat('vi-VN').format(v)} ₫`;

// Màu tag trạng thái invoice (§3.2):
// DRAFT xám · CONFIRMED xanh dương · PAID xanh lá · CANCELLED đỏ.
export const INVOICE_STATUS_META: Record<
  InvoiceStatus,
  { label: string; color: string }
> = {
  DRAFT: { label: 'Nháp', color: 'default' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'blue' },
  PAID: { label: 'Đã thanh toán', color: 'green' },
  CANCELLED: { label: 'Đã hủy', color: 'red' },
};
