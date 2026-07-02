import { Pie } from '@ant-design/plots';
import { Empty } from 'antd';
import type { AttendanceSummary } from '../data';
import { REPORT_COLORS } from './colors';

// Donut phân bố chuyên cần (Có mặt/Trễ/Vắng/Có phép).
const AttendanceDonut = ({
  summary,
  height = 260,
}: {
  summary: AttendanceSummary;
  height?: number;
}) => {
  const data = [
    { type: 'Có mặt', value: summary.coMat, color: REPORT_COLORS.coMat },
    { type: 'Trễ', value: summary.tre, color: REPORT_COLORS.tre },
    {
      type: 'Vắng',
      value: summary.vang + summary.chuaCheckin,
      color: REPORT_COLORS.vang,
    },
    { type: 'Có phép', value: summary.coPhep, color: REPORT_COLORS.coPhep },
  ].filter((d) => d.value > 0);

  if (!data.length) {
    return (
      <Empty
        description="Chưa có dữ liệu"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <Pie
      height={height}
      data={data}
      angleField="value"
      colorField="type"
      innerRadius={0.6}
      scale={{
        color: {
          domain: data.map((d) => d.type),
          range: data.map((d) => d.color),
        },
      }}
      legend={{ color: { position: 'bottom' } }}
      label={{ text: 'value', position: 'outside' }}
      annotations={[
        {
          type: 'text',
          style: {
            text:
              summary.attendanceRate != null
                ? `${Math.round(summary.attendanceRate * 100)}%`
                : '—',
            x: '50%',
            y: '50%',
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 'bold',
          },
        },
      ]}
    />
  );
};

export default AttendanceDonut;
