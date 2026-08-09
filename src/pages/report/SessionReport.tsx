import { PageContainer, ProCard } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import { Descriptions, Drawer, Segmented, Spin } from 'antd';
import { useEffect, useState } from 'react';
import BreakdownChart from './components/BreakdownChart';
import { DIFFICULTY_LABEL, TYPE_LABEL } from './components/colors';
import ExamDetailBody from './components/ExamDetailBody';
import RecentExamCards from './components/RecentExamCards';
import SessionAnalysisCard from './components/SessionAnalysisCard';
import type {
  BreakdownResponse,
  ClassExamAverageItem,
  ClassOutline,
  ExamReportDetail,
  OutlineSession,
  RecentExamItem,
  SessionAnalysisResponse,
  TopicMasteryItem,
} from './data';
import {
  getClassOutline,
  getClassSessionBreakdowns,
  getClassSessionExams,
  getExamDetail,
  getSessionAnalysis,
  getSessionBreakdowns,
  getSessionExams,
  getTopicMastery,
} from './service';

// Bao cao CAP 3 — theo 1 buoi hoc: bam vao 1 buoi tu ChapterReport se sang
// day. Thong tin buoi (ngay/gio/phong/GV/diem danh) lay tu outline co san,
// report module chi them de thi + breakdown rieng cua buoi. SessionAnalysisCard
// CHI hien voi studentId (§Phan C quyet dinh #1).
const SessionReport = () => {
  const params = useParams<{
    studentId?: string;
    classId: string;
    sessionId: string;
  }>();
  const studentId = params.studentId ? Number(params.studentId) : undefined;
  const classId = Number(params.classId);
  const sessionId = Number(params.sessionId);

  const [loading, setLoading] = useState(false);
  const [byType, setByType] = useState(false);
  const [outline, setOutline] = useState<ClassOutline | null>(null);
  const [exams, setExams] = useState<RecentExamItem[]>([]);
  const [classExams, setClassExams] = useState<ClassExamAverageItem[]>([]);
  const [breakdown, setBreakdown] = useState<BreakdownResponse | null>(null);
  const [analysis, setAnalysis] = useState<SessionAnalysisResponse | null>(
    null,
  );
  const [topics, setTopics] = useState<TopicMasteryItem[]>([]);
  const [detail, setDetail] = useState<ExamReportDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (!classId || !sessionId) return;
    setLoading(true);
    const outlinePromise = getClassOutline(classId, studentId);
    const examsPromise = studentId
      ? getSessionExams(studentId, classId, sessionId)
      : getClassSessionExams(classId, sessionId);
    const breakdownPromise = studentId
      ? getSessionBreakdowns(studentId, classId, sessionId)
      : getClassSessionBreakdowns(classId, sessionId);
    const analysisPromise = studentId
      ? getSessionAnalysis(studentId, classId, sessionId)
      : null;
    const topicsPromise = studentId
      ? getTopicMastery(studentId, classId)
      : null;

    Promise.all([
      outlinePromise,
      examsPromise,
      breakdownPromise,
      analysisPromise,
      topicsPromise,
    ])
      .then(([o, ex, b, an, tm]) => {
        setOutline(o.data ?? null);
        setBreakdown(b.data ?? null);
        setAnalysis(an?.data ?? null);
        setTopics(tm?.data ?? []);
        if (studentId) {
          setExams((ex.data as RecentExamItem[]) ?? []);
        } else {
          setClassExams((ex.data as ClassExamAverageItem[]) ?? []);
        }
      })
      .finally(() => setLoading(false));
  }, [studentId, classId, sessionId]);

  const openDetail = async (item: RecentExamItem) => {
    if (!studentId) return;
    setDetailOpen(true);
    setDetail(null);
    const res = await getExamDetail(studentId, item.examId, classId);
    setDetail(res.data);
  };

  if (loading || !outline) {
    return (
      <PageContainer>
        <Spin style={{ display: 'block', margin: '80px auto' }} />
      </PageContainer>
    );
  }

  let session: OutlineSession | undefined;
  for (const g of outline.groups) {
    session = g.sessions.find((s) => s.sessionId === sessionId);
    if (session) break;
  }

  return (
    <PageContainer
      header={{
        title: session
          ? `Buổi ${session.ordinal}: ${session.title ?? 'Chưa đặt tên'}`
          : 'Chi tiết buổi học',
        onBack: () => history.back(),
      }}
    >
      <ProCard direction="column" gutter={[0, 16]} ghost>
        {studentId && <SessionAnalysisCard analysis={analysis} />}

        <ProCard>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Khóa học">
              {outline.name} · {outline.subjectName}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày">
              {session?.date} {session?.startTime ?? ''} -{' '}
              {session?.endTime ?? ''}
            </Descriptions.Item>
            <Descriptions.Item label="Phòng">
              {session?.roomName ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Giáo viên">
              {session?.teacherName ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {session?.status ?? '—'}
            </Descriptions.Item>
            {studentId ? (
              <Descriptions.Item label="Điểm danh">
                {session?.attendanceStatus ?? 'Chưa điểm danh'}
                {session?.onLeave ? ' (có phép)' : ''}
              </Descriptions.Item>
            ) : null}
          </Descriptions>
        </ProCard>

        <ProCard title="Báo cáo theo bài thi trong buổi">
          {studentId ? (
            <RecentExamCards exams={exams} onSelect={openDetail} />
          ) : (
            <RecentExamCards
              exams={classExams.map((e) => ({
                examStudentId: e.examId,
                examId: e.examId,
                examCode: '',
                examName: e.examName,
                subjectName: '',
                classId,
                className: null,
                submittedAt: e.publishAt,
                score: e.avgScore,
                maxScore: e.maxScore,
              }))}
            />
          )}
        </ProCard>

        <ProCard
          title="Tỉ lệ đúng/sai trong buổi"
          extra={
            <Segmented
              size="small"
              value={byType ? 'type' : 'diff'}
              onChange={(v) => setByType(v === 'type')}
              options={[
                { label: 'Theo độ khó', value: 'diff' },
                { label: 'Theo loại câu', value: 'type' },
              ]}
            />
          }
        >
          {breakdown ? (
            <BreakdownChart
              buckets={byType ? breakdown.byType : breakdown.byDifficulty}
              labelMap={byType ? TYPE_LABEL : DIFFICULTY_LABEL}
            />
          ) : null}
        </ProCard>
      </ProCard>

      {studentId && (
        <Drawer
          title={detail ? `Chi tiết: ${detail.examName}` : 'Chi tiết bài thi'}
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          width={640}
        >
          {!detail ? (
            <Spin />
          ) : (
            <ExamDetailBody
              studentId={studentId}
              classId={classId}
              detail={detail}
              topics={topics}
            />
          )}
        </Drawer>
      )}
    </PageContainer>
  );
};

export default SessionReport;
