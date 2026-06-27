import dayjs from 'dayjs';
import type { RecurrenceType, SessionStatus } from './schedule.data';

// Nhãn thứ ISO: 1=T2 ... 7=CN.
export const DOW_LABELS = ['', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export const DOW_OPTIONS = [1, 2, 3, 4, 5, 6, 7].map((v) => ({
  label: DOW_LABELS[v],
  value: v,
}));

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  ONCE: 'Một ngày',
  DAILY: 'Hàng ngày',
  WEEKLY: 'Hàng tuần',
};

export const STATUS_LABELS: Record<SessionStatus, string> = {
  PLANNED: 'Dự kiến',
  DONE: 'Đã dạy',
  CANCELLED: 'Đã hủy',
};

export const STATUS_COLORS: Record<SessionStatus, string> = {
  PLANNED: 'blue',
  DONE: 'green',
  CANCELLED: 'red',
};

// BE trả LocalTime "HH:mm:ss" hoặc "HH:mm" -> cắt 5 ký tự đầu.
export function toHHmm(t?: string | null): string {
  if (!t) return '';
  return typeof t === 'string' ? t.slice(0, 5) : '';
}

// ISO weekday từ date (không cần plugin): ((day()+6)%7)+1.
export function isoDow(date: string): number {
  return ((dayjs(date).day() + 6) % 7) + 1;
}

// Nhãn "T3 30/06" cho 1 buổi.
export function sessionDayLabel(date: string): string {
  return `${DOW_LABELS[isoDow(date)]} ${dayjs(date).format('DD/MM')}`;
}
