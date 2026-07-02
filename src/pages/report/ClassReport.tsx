import { Line } from '@ant-design/plots';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProCard, ProTable } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import { Button, Col, Empty, Progress, Row, Spin } from 'antd';
import { useEffect, useState } from 'react';
import AttendanceDonut from './components/AttendanceDonut';
import AttendanceMonthChart from './components/AttendanceMonthChart';
import BreakdownChart from './components/BreakdownChart';
import { DIFFICULTY_LABEL } from './components/colors';
import TopicMasteryChart from './components/TopicMasteryChart';
import type {
  BreakdownResponse,
  ClassAttendanceReport,
  ClassExamAverageItem,
  ClassStudentAverageItem,
  TopicMasteryItem,
} from './data';
import {
  getClassAttendance,
  getClassBreakdowns,
  getClassExamAverages,
  getClassStudents,
  getClassTopicMastery,
} from './service';

// Đường TB lớp qua các đề (theo %).
const ClassAvgChart = ({ items }: { items: ClassExamAverageItem[] }) => {
  const rows = items
    .filter((i) => i.avgScore != null && i.maxScore && i.maxScore > 0)
    .map((i) => ({
      exam: i.examName,
      value:
        Math.round(((i.avgScore as number) / (i.maxScore as number)) * 1000) /
        10,
    }));
  if (!rows.length)
    return (
      <Empty
        description="Chưa có dữ liệu"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  return (
    <Line
      height={280}
      data={rows}
      xField="exam"
      yField="value"
      shapeField="smooth"
      scale={{ y: { domainMin: 0, domainMax: 100 } }}
      axis={{ x: { title: false }, y: { title: '%' } }}
      point={{ sizeField: 3 }}
      style={{ stroke: '#1677ff' }}
      tooltip={{ channel: 'y', valueFormatter: (v: number) => `${v}%` }}
    />
  );
};

const ClassReport = () => {
  const params = useParams();
  const classId = Number(params.classId);

  const [loading, setLoading] = useState(false);
  const [averages, setAverages] = useState<ClassExamAverageItem[]>([]);
  const [breakdown, setBreakdown] = useState<BreakdownResponse | null>(null);
  const [mastery, setMastery] = useState<TopicMasteryItem[]>([]);
  const [attendance, setAttendance] = useState<ClassAttendanceReport | null>(
    null,
  );
  const [students, setStudents] = useState<ClassStudentAverageItem[]>([]);

  useEffect(() => {
    if (!classId) return;
    setLoading(true);
    Promise.all([
      getClassExamAverages(classId),
      getClassBreakdowns(classId),
      getClassTopicMastery(classId),
      getClassAttendance(classId),
      getClassStudents(classId),
    ])
      .then(([a, b, m, att, st]) => {
        setAverages(a.data ?? []);
        setBreakdown(b.data ?? null);
        setMastery(m.data ?? []);
        setAttendance(att.data ?? null);
        setStudents(st.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [classId]);

  const columns: ProColumns<ClassStudentAverageItem>[] = [
    {
      title: 'Học viên',
      dataIndex: 'fullName',
      render: (dom, r) => (
        <a
          onClick={() =>
            history.push(`/report/student/${r.studentId}/class/${classId}`)
          }
        >
          {dom}
        </a>
      ),
    },
    { title: 'Tài khoản', dataIndex: 'username', width: 140 },
    {
      title: 'Điểm TB',
      dataIndex: 'avgScore',
      width: 100,
      render: (v) => (v == null ? '—' : Number(v).toFixed(2)),
    },
    {
      title: '% TB',
      dataIndex: 'avgPct',
      width: 90,
      render: (v) => (v == null ? '—' : `${Math.round(Number(v) * 100)}%`),
    },
    { title: 'Số bài nộp', dataIndex: 'submittedCount', width: 100 },
    {
      title: '% Chuyên cần',
      dataIndex: 'attendanceRate',
      width: 150,
      render: (v) =>
        v == null ? (
          '—'
        ) : (
          <Progress percent={Math.round(Number(v) * 100)} size="small" />
        ),
    },
    {
      title: 'Báo cáo',
      key: 'action',
      width: 100,
      render: (_, r) => (
        <Button
          type="link"
          size="small"
          onClick={() =>
            history.push(`/report/student/${r.studentId}/class/${classId}`)
          }
        >
          Xem
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <PageContainer>
        <Spin style={{ display: 'block', margin: '80px auto' }} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      header={{ title: 'Báo cáo lớp học', onBack: () => history.back() }}
    >
      <ProCard direction="column" gutter={[0, 16]} ghost>
        <Row gutter={16}>
          <Col xs={24} lg={14}>
            <ProCard title="Điểm TB lớp qua các đề" style={{ height: '100%' }}>
              <ClassAvgChart items={averages} />
            </ProCard>
          </Col>
          <Col xs={24} lg={10}>
            <ProCard
              title="Đúng/sai cả lớp theo độ khó"
              style={{ height: '100%' }}
            >
              {breakdown ? (
                <BreakdownChart
                  buckets={breakdown.byDifficulty}
                  labelMap={DIFFICULTY_LABEL}
                />
              ) : null}
            </ProCard>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <ProCard
              title="Nắm chắc kiến thức theo chương (cả lớp)"
              style={{ height: '100%' }}
            >
              <TopicMasteryChart items={mastery} />
            </ProCard>
          </Col>
          <Col xs={24} lg={12}>
            <ProCard title="Chuyên cần cả lớp" style={{ height: '100%' }}>
              {attendance ? (
                <>
                  <AttendanceDonut summary={attendance.summary} />
                  <div style={{ marginTop: 12 }}>
                    <AttendanceMonthChart points={attendance.byMonth} />
                  </div>
                </>
              ) : null}
            </ProCard>
          </Col>
        </Row>

        <ProCard title="Danh sách học viên">
          <ProTable<ClassStudentAverageItem>
            rowKey="studentId"
            search={false}
            options={false}
            dataSource={students}
            columns={columns}
            pagination={{ pageSize: 20 }}
          />
        </ProCard>
      </ProCard>
    </PageContainer>
  );
};

export default ClassReport;
