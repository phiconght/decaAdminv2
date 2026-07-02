import { Column } from '@ant-design/plots';
import { Empty, Typography } from 'antd';
import type { ExamScoreDistribution } from '../data';

const { Text } = Typography;

// Phổ điểm lớp (histogram); cột chứa HV tô nổi xanh, còn lại xám.
const ScoreDistributionChart = ({
  data,
  studentName,
  height = 260,
}: {
  data: ExamScoreDistribution | null;
  studentName?: string;
  height?: number;
}) => {
  if (!data || !data.bands?.length) {
    return (
      <Empty
        description="Chưa đủ dữ liệu phổ điểm"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  const rows = data.bands.map((b) => ({
    label: `${b.fromScore}–${b.toScore}`,
    count: b.count,
    kind: b.containsStudent ? 'Của bạn' : 'Lớp',
  }));

  const hasStudent = data.studentScore != null;

  return (
    <div>
      <Column
        height={height}
        data={rows}
        xField="label"
        yField="count"
        colorField="kind"
        scale={{
          color: {
            domain: ['Của bạn', 'Lớp'],
            range: ['#1677ff', '#bfbfbf'],
          },
        }}
        axis={{ x: { title: 'Khoảng điểm' }, y: { title: 'Số HV' } }}
        legend={hasStudent ? { color: { position: 'top' } } : false}
      />
      <div style={{ marginTop: 8, textAlign: 'center' }}>
        {hasStudent ? (
          <Text>
            {studentName ? `${studentName} ` : ''}cao hơn{' '}
            <Text strong>{data.percentile ?? 0}%</Text> các bạn
            {data.rank != null
              ? ` · hạng ${data.rank}/${data.submittedCount ?? '—'}`
              : ''}
            {' · '}TB lớp {data.classAverage ?? '—'} · trung vị{' '}
            {data.median ?? '—'}
          </Text>
        ) : (
          <Text type="secondary">
            TB lớp {data.classAverage ?? '—'} · trung vị {data.median ?? '—'} ·
            cao nhất {data.highest ?? '—'} · thấp nhất {data.lowest ?? '—'} ·{' '}
            {data.submittedCount ?? 0} HV
          </Text>
        )}
      </div>
    </div>
  );
};

export default ScoreDistributionChart;
