export type LeaveScope = 'SESSION' | 'RANGE';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type LeaveItem = {
  id: number;
  studentId: number;
  studentName: string;
  scope: LeaveScope;
  sessionId?: number;
  sessionDate?: string; // YYYY-MM-DD
  classId?: number;
  className?: string;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  reason?: string;
  status: LeaveStatus;
  reviewedBy?: string; // tên người duyệt
  reviewedAt?: string; // ISO instant
  createdAt: string; // ISO instant
};

export type LeaveQuery = {
  studentId?: number;
  status?: LeaveStatus;
  current?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
};

export type CreateLeavePayload = {
  studentId: number;
  scope: LeaveScope;
  sessionId?: number;
  classId?: number;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  reason?: string;
};

// Kiểu thô từ BE GET /api/v1/timetable (ApiResponse<List<TimetableItem>>).
// Subset đủ dùng cho dropdown buổi của HV.
export type TimetableItem = {
  sessionId: number;
  classId: number;
  className: string;
  subjectName?: string;
  date: string; // YYYY-MM-DD (LocalDate)
  startTime: string; // HH:mm:ss (LocalTime)
  endTime: string; // HH:mm:ss
};

// Option dropdown học viên.
export type StudentOption = {
  id: number;
  username: string;
  fullName: string;
};

// Option lớp của học viên.
export type StudentClassOption = {
  id: number;
  name: string;
};
