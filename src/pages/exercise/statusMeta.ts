import type { ExerciseStatus } from './data';

/** Trạng thái + màu/nhãn hiển thị — dùng chung cho Tag trong bảng và bộ lọc. */
export const EXERCISE_STATUS_META: Record<
  ExerciseStatus,
  { label: string; color: string }
> = {
  PENDING: { label: 'Chờ xác nhận', color: 'gold' },
  ACTIVE: { label: 'Hoạt động', color: 'success' },
  INACTIVE: { label: 'Tạm dừng', color: 'default' },
  DELETED: { label: 'Đã xóa', color: 'default' },
};
