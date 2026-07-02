import { PageContainer, ProCard } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import {
  Button,
  Col,
  Descriptions,
  Drawer,
  Row,
  Segmented,
  Spin,
  Statistic,
} from 'antd';
import { useEffect, useState } from 'react';
import AttendanceDonut from './components/AttendanceDonut';
import AttendanceMonthChart from './components/AttendanceMonthChart';
import BreakdownChart from './components/BreakdownChart';
import CommentsPanel from './components/CommentsPanel';
import { DIFFICULTY_LABEL, TYPE_LABEL } from './components/colors';
import RecentExamCards from './components/RecentExamCards';
import ScoreTrendChart from './components/ScoreTrendChart';
import TopicMasteryChart from './components/TopicMasteryChart';
import type {
  ExamReportDetail,
  RecentExamItem,
  StudentClassSummaryResponse,
} from './data';
import { getExamDetail, getStudentSummary } from './service';

const pct = (v: number | null) => (v == null ? '—' : `${Math.round(v * 100)}%`);

const StudentReport = () => {
  const params = useParams();
  const studentId = Number(params.studentId);
  const classId = Number(params.classId);

  const [data, setData] = useState<StudentClassSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [byType, setByType] = useState(false);
  const [detail, setDetail] = useState<ExamReportDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (!studentId || !classId) return;
    setLoading(true);
    getStudentSummary(studentId, classId)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [studentId, classId]);

  const openDetail = async (item: RecentExamItem) => {
    setDetailOpen(true);
    setDetail(null);
    const res = await getExamDetail(studentId, item.examId, classId);
    setDetail(res.data);
  };

  if (loading || !data) {
    return (
      <PageContainer>
        <Spin style={{ display: 'block', margin: '80px auto' }} />
      </PageContainer>
    );
  }

  const att = data.attendance.summary;

  return (
    <PageContainer
      header={{
        title: `Báo cáo: ${data.student.fullName}`,
        onBack: () => history.back(),
      }}
      extra={[
        <Button
          key="print"
          type="primary"
          onClick={() =>
            window.open(`/report/print/${studentId}/${classId}`, '_blank')
          }
        >
          In báo cáo
        </Button>,
      ]}
    >
      <ProCard direction="column" gutter={[0, 16]} ghost>
        <ProCard>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Học viên">
              {data.student.fullName} ({data.student.username})
            </Descriptions.Item>
            <Descriptions.Item label="Khóa học">
              {data.clazz.name} · {data.clazz.subjectName}
            </Descriptions.Item>
            <Descriptions.Item label="Giáo viên">
              {data.clazz.teacherNames || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Số bài đã nộp">
              {data.exams.length}
            </Descriptions.Item>
          </Descriptions>
        </ProCard>

        <ProCard title="3 bài thi gần nhất">
          <RecentExamCards exams={data.exams} onSelect={openDetail} />
        </ProCard>

        <Row gutter={16}>
          <Col xs={24} lg={14}>
            <ProCard
              title="Xu hướng điểm trong khóa"
              style={{ height: '100%' }}
            >
              <ScoreTrendChart points={data.trend} />
            </ProCard>
          </Col>
          <Col xs={24} lg={10}>
            <ProCard
              title="Tỉ lệ đúng/sai"
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
              style={{ height: '100%' }}
            >
              <BreakdownChart
                buckets={
                  byType ? data.breakdown.byType : data.breakdown.byDifficulty
                }
                labelMap={byType ? TYPE_LABEL : DIFFICULTY_LABEL}
              />
            </ProCard>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <ProCard
              title="Nắm chắc kiến thức theo chương"
              style={{ height: '100%' }}
            >
              <TopicMasteryChart items={data.topicMastery} />
            </ProCard>
          </Col>
          <Col xs={24} lg={12}>
            <ProCard title="Chuyên cần" style={{ height: '100%' }}>
              <Row gutter={8} style={{ marginBottom: 8 }}>
                <Col span={8}>
                  <Statistic
                    title="Đi học đủ"
                    value={pct(att.attendanceRate)}
                  />
                </Col>
                <Col span={8}>
                  <Statistic title="Đúng giờ" value={pct(att.onTimeRate)} />
                </Col>
                <Col span={8}>
                  <Statistic title="Số buổi" value={att.totalSessions} />
                </Col>
              </Row>
              <AttendanceDonut summary={att} />
              <div style={{ marginTop: 12 }}>
                <AttendanceMonthChart points={data.attendance.byMonth} />
              </div>
            </ProCard>
          </Col>
        </Row>

        <ProCard title="Nhận xét">
          <CommentsPanel studentId={studentId} classId={classId} />
        </ProCard>
      </ProCard>

      <Drawer
        title={detail ? `Chi tiết: ${detail.examName}` : 'Chi tiết bài thi'}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={640}
      >
        {!detail ? (
          <Spin />
        ) : (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Statistic
                  title="Điểm"
                  value={detail.score ?? 0}
                  precision={2}
                  suffix={detail.maxScore != null ? `/ ${detail.maxScore}` : ''}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="TB lớp"
                  value={detail.classAverage ?? 0}
                  precision={2}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Xếp hạng"
                  value={
                    detail.rank != null
                      ? `${detail.rank}/${detail.submittedCount ?? '—'}`
                      : '—'
                  }
                />
              </Col>
            </Row>
            <ProCard title="Đúng/sai theo độ khó" size="small">
              <BreakdownChart
                buckets={detail.breakdown.byDifficulty}
                labelMap={DIFFICULTY_LABEL}
              />
            </ProCard>
            <ProCard
              title="Đúng/sai theo loại câu"
              size="small"
              style={{ marginTop: 12 }}
            >
              <BreakdownChart
                buckets={detail.breakdown.byType}
                labelMap={TYPE_LABEL}
              />
            </ProCard>
          </>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default StudentReport;
