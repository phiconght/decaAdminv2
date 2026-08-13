// 1 dòng bài thi đã nộp, chờ xác nhận trước khi tính vào báo cáo
// (GET /api/v1/exam-confirmations — yêu cầu người dùng 13/08/2026).
export type ExamConfirmationItem = {
  examStudentId: number;
  examId: number;
  examCode: string;
  examName: string;
  studentId: number;
  studentName: string;
  score?: number;
  submittedAt?: string; // ISO instant
};

export type ExamConfirmationQuery = {
  examId?: number;
  classId?: number;
  current?: number;
  pageSize?: number;
};
