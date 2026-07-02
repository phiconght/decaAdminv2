import { request } from '@umijs/max';
import type {
  BreakdownResponse,
  ClassAttendanceReport,
  ClassExamAverageItem,
  ClassStudentAverageItem,
  CommentItem,
  ExamReportDetail,
  RecentExamItem,
  ScoreTrendPoint,
  StudentAttendanceReport,
  StudentClassOption,
  StudentClassSummaryResponse,
  TopicMasteryItem,
} from './data';

const BASE = '/api/v1/reports';

// ---- Báo cáo học viên ----
export async function getRecentExams(studentId: number, limit = 3) {
  return request<{ success: boolean; data: RecentExamItem[] }>(
    `${BASE}/students/${studentId}/recent-exams`,
    { params: { limit } },
  );
}

export async function getExamDetail(
  studentId: number,
  examId: number,
  classId: number,
) {
  return request<{ success: boolean; data: ExamReportDetail }>(
    `${BASE}/students/${studentId}/exams/${examId}`,
    { params: { classId } },
  );
}

export async function getScoreTrend(studentId: number, classId: number) {
  return request<{ success: boolean; data: ScoreTrendPoint[] }>(
    `${BASE}/students/${studentId}/classes/${classId}/score-trend`,
  );
}

export async function getBreakdowns(
  studentId: number,
  classId: number,
  examId?: number,
) {
  return request<{ success: boolean; data: BreakdownResponse }>(
    `${BASE}/students/${studentId}/classes/${classId}/breakdowns`,
    { params: examId ? { examId } : {} },
  );
}

export async function getTopicMastery(studentId: number, classId: number) {
  return request<{ success: boolean; data: TopicMasteryItem[] }>(
    `${BASE}/students/${studentId}/classes/${classId}/topic-mastery`,
  );
}

export async function getStudentAttendance(studentId: number, classId: number) {
  return request<{ success: boolean; data: StudentAttendanceReport }>(
    `${BASE}/students/${studentId}/classes/${classId}/attendance`,
  );
}

export async function getStudentSummary(studentId: number, classId: number) {
  return request<{ success: boolean; data: StudentClassSummaryResponse }>(
    `${BASE}/students/${studentId}/classes/${classId}/summary`,
  );
}

export async function getStudentClasses(studentId: number) {
  return request<{ success: boolean; data: StudentClassOption[] }>(
    `${BASE}/students/${studentId}/classes`,
  );
}

export async function getMyReportClasses() {
  return request<{ success: boolean; data: StudentClassOption[] }>(
    `${BASE}/my-classes`,
  );
}

// ---- Báo cáo lớp ----
export async function getClassExamAverages(classId: number) {
  return request<{ success: boolean; data: ClassExamAverageItem[] }>(
    `${BASE}/classes/${classId}/exam-averages`,
  );
}

export async function getClassBreakdowns(classId: number) {
  return request<{ success: boolean; data: BreakdownResponse }>(
    `${BASE}/classes/${classId}/breakdowns`,
  );
}

export async function getClassTopicMastery(classId: number) {
  return request<{ success: boolean; data: TopicMasteryItem[] }>(
    `${BASE}/classes/${classId}/topic-mastery`,
  );
}

export async function getClassAttendance(classId: number) {
  return request<{ success: boolean; data: ClassAttendanceReport }>(
    `${BASE}/classes/${classId}/attendance`,
  );
}

export async function getClassStudents(classId: number) {
  return request<{ success: boolean; data: ClassStudentAverageItem[] }>(
    `${BASE}/classes/${classId}/students`,
  );
}

// ---- Nhận xét ----
export async function getComments(
  studentId: number,
  classId: number,
  examStudentId?: number,
) {
  return request<{ success: boolean; data: CommentItem[] }>(
    `${BASE}/comments`,
    {
      params: {
        studentId,
        classId,
        ...(examStudentId ? { examStudentId } : {}),
      },
    },
  );
}

export async function addComment(data: {
  studentId: number;
  classId: number;
  examStudentId?: number | null;
  content: string;
  visibleToStudent: boolean;
}) {
  return request<{ success: boolean; data: CommentItem }>(`${BASE}/comments`, {
    method: 'POST',
    data,
  });
}

export async function updateComment(
  id: number,
  data: { content: string; visibleToStudent?: boolean },
) {
  return request<{ success: boolean; data: CommentItem }>(
    `${BASE}/comments/${id}`,
    { method: 'PUT', data },
  );
}

export async function deleteComment(id: number) {
  return request<{ success: boolean }>(`${BASE}/comments/${id}`, {
    method: 'DELETE',
  });
}
