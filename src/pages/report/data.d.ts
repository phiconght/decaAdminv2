// Kiểu dữ liệu báo cáo — mirror DTO ở BE (com.trungtam.report.dto.response).

export type RecentExamItem = {
  examStudentId: number;
  examId: number;
  examCode: string;
  examName: string;
  subjectName: string;
  classId: number | null;
  className: string | null;
  submittedAt: string | null;
  score: number | null;
  maxScore: number | null;
};

export type ScoreTrendPoint = {
  examId: number;
  examName: string;
  publishAt: string | null;
  submittedAt: string | null;
  score: number | null;
  maxScore: number | null;
  classAverage: number | null;
};

export type BucketStat = {
  key: string;
  correctCount: number;
  incorrectCount: number;
  ungradedCount: number;
  correctPct: number | null;
};

export type BreakdownResponse = {
  byDifficulty: BucketStat[];
  byType: BucketStat[];
};

export type TopicMasteryItem = {
  topicId: number | null;
  topicName: string;
  gradedCount: number;
  correctCount: number;
  ungradedCount: number;
  earned: number;
  max: number;
  masteryPct: number | null;
};

export type ExamReportDetail = {
  examId: number;
  examName: string;
  examCode: string;
  submittedAt: string | null;
  score: number | null;
  maxScore: number | null;
  classAverage: number | null;
  rank: number | null;
  submittedCount: number | null;
  classSize: number | null;
  breakdown: BreakdownResponse;
};

export type AttendanceSummary = {
  totalSessions: number;
  coMat: number;
  tre: number;
  vang: number;
  coPhep: number;
  chuaCheckin: number;
  attendanceRate: number | null;
  onTimeRate: number | null;
};

export type AttendanceMonthPoint = {
  month: string;
  coMat: number;
  tre: number;
  vang: number;
  coPhep: number;
};

export type StudentAttendanceReport = {
  summary: AttendanceSummary;
  byMonth: AttendanceMonthPoint[];
};

export type ClassAttendanceReport = StudentAttendanceReport;

export type ClassExamAverageItem = {
  examId: number;
  examName: string;
  publishAt: string | null;
  avgScore: number | null;
  maxScore: number | null;
  submittedCount: number;
  assignedCount: number;
};

export type ClassStudentAverageItem = {
  studentId: number;
  fullName: string;
  username: string;
  submittedCount: number;
  avgScore: number | null;
  avgPct: number | null;
  attendanceRate: number | null;
};

export type StudentClassOption = {
  classId: number;
  code: string;
  name: string;
  subjectName: string;
  teacherNames: string;
};

export type CommentItem = {
  id: number;
  studentId: number;
  classId: number;
  examStudentId: number | null;
  authorId: number;
  authorName: string;
  authorRole: string;
  content: string;
  visibleToStudent: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type StudentClassSummaryResponse = {
  student: {
    id: number;
    fullName: string;
    username: string;
    email: string | null;
    phone: string | null;
  };
  clazz: {
    id: number;
    code: string;
    name: string;
    subjectName: string;
    teacherNames: string;
  };
  exams: RecentExamItem[];
  trend: ScoreTrendPoint[];
  breakdown: BreakdownResponse;
  topicMastery: TopicMasteryItem[];
  attendance: StudentAttendanceReport;
  comments: CommentItem[];
};
