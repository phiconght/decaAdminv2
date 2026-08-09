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

export type ScoreBand = {
  index: number;
  fromScore: number;
  toScore: number;
  count: number;
  containsStudent: boolean;
};

export type ExamScoreDistribution = {
  examId: number | null;
  examName: string | null;
  maxScore: number | null;
  bandCount: number;
  bands: ScoreBand[];
  studentScore: number | null;
  studentBandIndex: number | null;
  percentile: number | null;
  classAverage: number | null;
  median: number | null;
  highest: number | null;
  lowest: number | null;
  rank: number | null;
  submittedCount: number | null;
  classSize: number | null;
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
  topicId: number | null;
  topicName: string | null;
  sessionId: number | null;
  sessionTitle: string | null;
  sessionDate: string | null;
  breakdown: BreakdownResponse;
  distribution: ExamScoreDistribution | null;
};

export type PracticeAssignmentResponse = {
  assignmentId: number;
  examId: number;
  examCode: string;
  examName: string;
  topicId: number | null;
  topicName: string | null;
  numQuestions: number;
  byDifficulty: { easy: number; medium: number; hard: number };
  byType: { multipleChoice: number; trueFalse: number };
  deadline: string | null;
  status: string;
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

// Cay noi dung khoa hoc (chuyen de -> buoi hoc + de thi) — mirror
// ClassOutlineResponse ben BE, dung lai lam "danh muc" cho drill-down cap
// chuong/buoi thay vi report module tu dung cay rieng.
export type OutlineProgress = {
  totalSessions: number;
  doneSessions: number;
  attendanceRate: number | null;
  attendanceScope: 'STUDENT' | 'CLASS' | null;
};

export type OutlineSession = {
  sessionId: number;
  ordinal: number;
  title: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  roomName: string | null;
  teacherName: string | null;
  status: string | null;
  cancelReason: string | null;
  attendanceStatus: string | null;
  onLeave: boolean;
  materialCount: number;
};

export type OutlineExam = {
  examId: number;
  code: string;
  name: string;
  type: string | null;
  status: string | null;
  publishAt: string | null;
  endAt: string | null;
  durationMinutes: number | null;
  studentStatus: string | null;
  score: number | null;
  maxScore: number | null;
};

export type OutlineTopicGroup = {
  topicId: number | null;
  topicName: string | null;
  sortOrder: number | null;
  sessions: OutlineSession[];
  exams: OutlineExam[];
};

export type ClassOutline = {
  classId: number;
  code: string;
  name: string;
  subjectName: string | null;
  gradeLevel: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string | null;
  progress: OutlineProgress;
  groups: OutlineTopicGroup[];
};

export type ChapterAnalysisItem = {
  topicId: number | null;
  chapterLabel: string;
  avgScore: number | null;
  rank: number | null;
  classSize: number | null;
};

// Bang "Phan tich tu dong" o dau bao cao ca nhan — cau chu da ghep san o BE
// (ReportNarrativeBuilder), ADMIN chi render, khong tu tinh toan.
export type ReportAnalysisResponse = {
  studentName: string;
  className: string;
  scoreSpectrumLabel: string | null;
  courseAverage: number | null;
  courseRank: number | null;
  classSize: number | null;
  chapters: ChapterAnalysisItem[];
  abilityInsights: string[];
  attendanceInsight: string | null;
  teacherCommentAuthor: string | null;
  teacherCommentContent: string | null;
};

// Bang "Phan tich tu dong" o 3 cap con lai (Chuong/Buoi/Bai thi) — §Phan C.
// Doc lap voi ReportAnalysisResponse (cap toan khoa) o tren, vi noi dung
// khac nhau nhieu (khong dung chung 1 shape).
export type ChapterAnalysisResponse = {
  chapterLabel: string | null;
  avgScore: number | null;
  rank: number | null;
  classSize: number | null;
  abilityInsights: string[];
  attendanceInsight: string | null;
};

export type SessionAnalysisResponse = {
  avgScore: number | null;
  classAverage: number | null;
  comparisonInsight: string | null;
  abilityInsights: string[];
  examCount: number;
  submittedCount: number;
};

export type ExamAnalysisResponse = {
  score: number | null;
  classAverage: number | null;
  rank: number | null;
  classSize: number | null;
  comparisonInsight: string | null;
  abilityInsights: string[];
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
  analysis: ReportAnalysisResponse | null;
};
