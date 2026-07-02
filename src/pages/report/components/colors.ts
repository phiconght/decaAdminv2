// Bảng màu thống nhất cho biểu đồ báo cáo (khớp catalog SPEC §7).
export const REPORT_COLORS = {
  correct: '#52c41a',
  incorrect: '#ff4d4f',
  ungraded: '#d9d9d9',
  coMat: '#52c41a',
  tre: '#faad14',
  vang: '#ff4d4f',
  coPhep: '#1677ff',
  self: '#1677ff',
  classAvg: '#faad14',
};

export const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: 'Dễ',
  MEDIUM: 'Trung bình',
  HARD: 'Khó',
};

export const TYPE_LABEL: Record<string, string> = {
  MULTIPLE_CHOICE: 'Trắc nghiệm',
  TRUE_FALSE: 'Đúng/Sai',
  ESSAY: 'Tự luận',
};

export const RESULT_LABEL = {
  correct: 'Đúng',
  incorrect: 'Sai',
  ungraded: 'Chờ chấm',
};

/** Màu điểm theo tỉ lệ (khớp scoreColor bên Mobile). */
export function scoreColor(ratio: number | null | undefined): string {
  if (ratio == null) return '#8c8c8c';
  if (ratio >= 0.8) return '#52c41a';
  if (ratio >= 0.5) return '#faad14';
  return '#ff4d4f';
}
