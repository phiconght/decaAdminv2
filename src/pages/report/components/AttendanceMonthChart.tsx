import { Column } from '@ant-design/plots';
import { Empty } from 'antd';
import type { AttendanceMonthPoint } from '../data';
import { REPORT_COLORS } from './colors';

// Cột chồng chuyên cần theo tháng.
const AttendanceMonthChart = ({
  points,
  height = 260,
}: {
  points: AttendanceMonthPoint[];
  height?: number;
}) => {
  if (!points.length) {
    return (
      <Empty
        description="Chưa có dữ liệu"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  const rows = points.flatMap((p) => [
    { month: p.month, status: 'Có mặt', value: p.coMat },
    { month: p.month, status: 'Trễ', value: p.tre },
    { month: p.month, status: 'Vắng', value: p.vang },
    { month: p.month, status: 'Có phép', value: p.coPhep },
  ]);

  return (
    <Column
      height={height}
      data={rows}
      xField="month"
      yField="value"
      colorField="status"
      stack
      scale={{
        color: {
          domain: ['Có mặt', 'Trễ', 'Vắng', 'Có phép'],
          range: [
            REPORT_COLORS.coMat,
            REPORT_COLORS.tre,
            REPORT_COLORS.vang,
            REPORT_COLORS.coPhep,
          ],
        },
      }}
      axis={{ x: { title: false }, y: { title: false } }}
      legend={{ color: { position: 'top' } }}
    />
  );
};

export default AttendanceMonthChart;
