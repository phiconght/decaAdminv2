import { PageContainer, ProCard } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import { Col, Descriptions, Drawer, Row, Segmented, Spin, Tag } from 'antd';
import { useEffect, useState } from 'react';
import AttendanceDonut from './components/AttendanceDonut';
import AttendanceMonthChart from './components/AttendanceMonthChart';
import BreakdownChart from './components/BreakdownChart';
import ChapterAnalysisCard from './components/ChapterAnalysisCard';
import { DIFFICULTY_LABEL, TYPE_LABEL } from './components/colors';
import ExamDetailBody from './components/ExamDetailBody';
import RecentExamCards from './components/RecentExamCards';
import ScoreTrendChart from './components/ScoreTrendChart';
import SessionCards from './components/SessionCards';
import type {
  BreakdownResponse,
  ChapterAnalysisResponse,
  ClassAttendanceReport,
  ClassExamAverageItem,
  ClassOutline,
  ExamReportDetail,
  OutlineTopicGroup,
  RecentExamItem,
  ScoreTrendPoint,
  StudentAttendanceReport,
  TopicMasteryItem,
} from './data';
import {
  getBreakdowns,
  getChapterAnalysis,
  getClassAttendance,
  getClassBreakdowns,
  getClassExamAverages,
  getClassOutline,
  getExamDetail,
  getScoreTrend,
  getStudentAttendance,
  getTopicMastery,
} from './service';

const pct = (v: number | null) => (v == null ? '—' : `${Math.round(v * 100)}%`);

// Bao cao CAP 2 — theo 1 chuong: bam vao 1 chuong tu StudentReport/ClassReport
// se sang day. studentId co mat = pham vi 1 HV, khong co = pham vi ca lop
// (GV xem). Danh sach buoi/de cua chuong lay tu outline co san — KHONG dung
// lai cay phan cap, chi lam lop phan tich (diem TB, breakdown, chuyen can).
// AnalysisCard CHI hien voi studentId (§Phan C quyet dinh #1) — GV xem ca
// lop khong co bang phan tich ca nhan.
const ChapterReport = () => {
  const params = useParams<{
    studentId?: string;
    classId: string;
    topicId: string;
  }>();
  const studentId = params.studentId ? Number(params.studentId) : undefined;
  const classId = Number(params.classId);
  const topicId = Number(params.topicId);

  const [loading, setLoading] = useState(false);
  const [byType, setByType] = useState(false);
  const [outline, setOutline] = useState<ClassOutline | null>(null);
  const [breakdown, setBreakdown] = useState<BreakdownResponse | null>(null);
  const [trend, setTrend] = useState<ScoreTrendPoint[]>([]);
  const [examAverages, setExamAverages] = useState<ClassExamAverageItem[]>([]);
  const [analysis, setAnalysis] = useState<ChapterAnalysisResponse | null>(
    null,
  );
  const [attendance, setAttendance] = useState<
    StudentAttendanceReport | ClassAttendanceReport | null
  >(null);
  const [topics, setTopics] = useState<TopicMasteryItem[]>([]);
  const [detail, setDetail] = useState<ExamReportDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (!classId || !topicId) return;
    setLoading(true);
    const outlinePromise = getClassOutline(classId, studentId);
    const breakdownPromise = studentId
      ? getBreakdowns(studentId, classId, topicId)
      : getClassBreakdowns(classId, topicId);
    const attendancePromise = studentId
      ? getStudentAttendance(studentId, classId, topicId)
      : getClassAttendance(classId, topicId);
    const trendPromise = studentId
      ? getScoreTrend(studentId, classId, topicId)
      : null;
    const examAvgPromise = !studentId
      ? getClassExamAverages(classId, topicId)
      : null;
    const analysisPromise = studentId
      ? getChapterAnalysis(studentId, classId, topicId)
      : null;
    const topicsPromise = studentId
      ? getTopicMastery(studentId, classId)
      : null;

    Promise.all([
      outlinePromise,
      breakdownPromise,
      attendancePromise,
      trendPromise,
      examAvgPromise,
      analysisPromise,
      topicsPromise,
    ])
      .then(([o, b, att, t, ea, an, tm]) => {
        setOutline(o.data ?? null);
        setBreakdown(b.data ?? null);
        setAttendance(att.data ?? null);
        setTrend(t?.data ?? []);
        setExamAverages(ea?.data ?? []);
        setAnalysis(an?.data ?? null);
        setTopics(tm?.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [studentId, classId, topicId]);

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

  const group: OutlineTopicGroup | undefined = outline.groups.find(
    (g) => g.topicId === topicId,
  );
  const att = attendance?.summary ?? null;

  const goSession = (sessionId: number) => {
    history.push(
      studentId
        ? `/report/student/${studentId}/class/${classId}/session/${sessionId}`
        : `/report/class/${classId}/session/${sessionId}`,
    );
  };

  return (
    <PageContainer
      header={{
        title: `Chương: ${group?.topicName ?? '—'}`,
        onBack: () => history.back(),
      }}
    >
      <ProCard direction="column" gutter={[0, 16]} ghost>
        {studentId && <ChapterAnalysisCard analysis={analysis} />}

        <ProCard>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Khóa học">
              {outline.name} · {outline.subjectName}
            </Descriptions.Item>
            <Descriptions.Item label="Số buổi">
              {group?.sessions.length ?? 0}
            </Descriptions.Item>
            <Descriptions.Item label="Số đề thi">
              {group?.exams.length ?? 0}
            </Descriptions.Item>
          </Descriptions>
        </ProCard>

        {studentId ? (
          <ProCard title="Xu hướng điểm trong chương">
            <ScoreTrendChart points={trend} />
          </ProCard>
        ) : (
          <ProCard title="Điểm TB lớp qua các đề trong chương">
            {examAverages.length ? (
              <RecentExamCards
                exams={examAverages.map((e) => ({
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
            ) : null}
          </ProCard>
        )}

        <ProCard
          title="Tỉ lệ đúng/sai trong chương"
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

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <ProCard title="Chuyên cần trong chương" style={{ height: '100%' }}>
              {att ? (
                <>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color="blue">Đi học đủ: {pct(att.attendanceRate)}</Tag>
                    <Tag color="green">Đúng giờ: {pct(att.onTimeRate)}</Tag>
                    <Tag>Số buổi: {att.totalSessions}</Tag>
                  </div>
                  <AttendanceDonut summary={att} />
                  <div style={{ marginTop: 12 }}>
                    <AttendanceMonthChart points={attendance?.byMonth ?? []} />
                  </div>
                </>
              ) : null}
            </ProCard>
          </Col>
          <Col xs={24} lg={12}>
            <ProCard title="Báo cáo theo buổi học" style={{ height: '100%' }}>
              <SessionCards
                sessions={group?.sessions ?? []}
                onSelect={goSession}
              />
            </ProCard>
          </Col>
        </Row>

        {studentId && (
          <ProCard title="Báo cáo theo bài thi trong chương">
            <RecentExamCards
              exams={(group?.exams ?? []).map((e) => ({
                examStudentId: e.examId,
                examId: e.examId,
                examCode: e.code,
                examName: e.name,
                subjectName: '',
                classId,
                className: null,
                submittedAt: e.publishAt,
                score: e.score,
                maxScore: e.maxScore,
              }))}
              onSelect={openDetail}
            />
          </ProCard>
        )}
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

export default ChapterReport;
