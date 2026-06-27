// Types cho module Lịch học (drawer trong Khóa học). Tách khỏi data.d.ts của class.

export type RecurrenceType = 'ONCE' | 'DAILY' | 'WEEKLY';
export type SessionStatus = 'PLANNED' | 'CANCELLED' | 'DONE';
export type ConflictType = 'ROOM' | 'TEACHER' | 'STUDENT';

// --- Quy tắc lịch ---
export type ScheduleItem = {
  id: number;
  recurrenceType: RecurrenceType;
  dayOfWeek?: number | null;
  startDate: string;
  endDate?: string | null;
  startTime: string;
  durationMinutes: number;
  roomId?: number | null;
  roomName?: string | null;
  teacherId?: number | null;
  teacherName?: string | null;
  active: boolean;
};

export type CreateSchedulePayload = {
  recurrenceType: RecurrenceType;
  dayOfWeek?: number | null;
  startDate: string;
  endDate?: string | null;
  startTime: string;
  durationMinutes: number;
  roomId?: number | null;
  teacherId?: number | null;
  active?: boolean | null;
};

// --- Preview sinh buổi ---
export type SessionPreviewLine = {
  date: string;
  startTime: string;
  endTime: string;
  roomId?: number | null;
  roomName?: string | null;
  teacherId?: number | null;
  teacherName?: string | null;
  blocked: boolean;
};

export type ConflictLine = {
  date: string;
  startTime: string;
  type: ConflictType;
  resourceName?: string | null;
  conflictClassName?: string | null;
};

export type GeneratePreview = {
  total: number;
  sessions: SessionPreviewLine[];
  conflicts: ConflictLine[];
};

// --- Buổi học ---
export type SessionDetail = {
  id: number;
  classId: number;
  className: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  roomId?: number | null;
  roomName?: string | null;
  teacherId?: number | null;
  teacherName?: string | null;
  status: SessionStatus;
  cancelReason?: string | null;
  isManual: boolean;
};

export type UpdateSessionPayload = {
  startTime?: string;
  durationMinutes?: number;
  roomId?: number | null;
  teacherId?: number | null;
};

export type CreateManualSessionPayload = {
  sessionDate: string;
  startTime: string;
  durationMinutes: number;
  roomId?: number | null;
  teacherId?: number | null;
};

// --- Dropdown options ---
export type RoomOption = {
  id: number;
  code: string;
  name: string;
  branchName?: string | null;
};

export type TeacherOption = {
  id: number;
  username: string;
  fullName: string;
};
