// Góc nhìn lịch: học viên / giáo viên / phòng / phụ huynh.
export type TimetableView = 'STUDENT' | 'TEACHER' | 'ROOM' | 'PARENT';
// Chế độ hiển thị (Tháng để phase 2).
export type CalendarMode = 'DAY' | 'WEEK';
export type SessionStatus = 'PLANNED' | 'CANCELLED' | 'DONE';
export type AttendanceStatus =
  | 'CHUA_CHECKIN'
  | 'CO_MAT'
  | 'TRE'
  | 'VANG'
  | 'CO_PHEP';

// 1 buổi học trả về từ GET /api/v1/timetable (TimetableItem record của BE).
export type TimetableItem = {
  sessionId: number;
  classId: number;
  className: string;
  subjectName?: string;
  gradeLevel?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss (cắt còn HH:mm khi render)
  endTime: string; // HH:mm:ss
  roomId?: number;
  roomName?: string;
  branchName?: string;
  teacherId?: number;
  teacherName?: string;
  status: SessionStatus;
  // chỉ có nghĩa ở view STUDENT/PARENT:
  studentId?: number;
  studentName?: string;
  attendanceStatus?: AttendanceStatus | null;
  onLeave?: boolean;
};

export type TimetableQuery = {
  view: TimetableView;
  refId?: number;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  branchId?: number;
};

// 1 dòng trong bảng điểm danh GET /api/v1/sessions/{id}/attendance.
export type AttendanceItem = {
  userId: number;
  fullName: string;
  username: string;
  phone?: string;
  status: AttendanceStatus;
  checkInAt?: string | null; // ISO instant
  checkOutAt?: string | null;
};

export type QrToken = { token: string; ttlSeconds: number };

// Option cho Select chọn đối tượng (HV/GV/PH/Phòng).
export type RefOption = { label: string; value: number };
export type BranchOption = { label: string; value: number };

// Con của phụ huynh (RelativeItem) + màu FE gán theo index.
export type ChildRef = {
  id: number;
  fullName: string;
  username: string;
  relationship?: string;
};
