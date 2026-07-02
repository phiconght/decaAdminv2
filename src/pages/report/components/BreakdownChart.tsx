import { Column } from '@ant-design/plots';
import { Empty } from 'antd';
import type { BucketStat } from '../data';
import { REPORT_COLORS, RESULT_LABEL } from './colors';

// Cột chồng Đúng/Sai/Chờ chấm theo từng nhóm (độ khó hoặc loại câu).
const BreakdownChart = ({
  buckets,
  labelMap,
  height = 260,
}: {
  buckets: BucketStat[];
  labelMap: Record<string, string>;
  height?: number;
}) => {
  const rows = buckets.flatMap((b) => {
    const label = labelMap[b.key] ?? b.key;
    return [
      { bucket: label, result: RESULT_LABEL.correct, value: b.correctCount },
      {
        bucket: label,
        result: RESULT_LABEL.incorrect,
        value: b.incorrectCount,
      },
      { bucket: label, result: RESULT_LABEL.ungraded, value: b.ungradedCount },
    ];
  });

  const total = rows.reduce((s, r) => s + r.value, 0);
  if (total === 0) {
    return (
      <Empty
        description="Chưa có dữ liệu"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <Column
      height={height}
      data={rows}
      xField="bucket"
      yField="value"
      colorField="result"
      stack
      scale={{
        color: {
          domain: [
            RESULT_LABEL.correct,
            RESULT_LABEL.incorrect,
            RESULT_LABEL.ungraded,
          ],
          range: [
            REPORT_COLORS.correct,
            REPORT_COLORS.incorrect,
            REPORT_COLORS.ungraded,
          ],
        },
      }}
      axis={{ x: { title: false }, y: { title: false } }}
      legend={{ color: { position: 'top' } }}
    />
  );
};

export default BreakdownChart;
