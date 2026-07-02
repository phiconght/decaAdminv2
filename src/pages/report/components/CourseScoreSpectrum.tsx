import { Empty } from 'antd';
import type { ExamScoreDistribution } from '../data';

// Phổ điểm tổng của khóa — histogram NGANG: trục điểm 0–10 dọc, cột đâm ngang,
// đường nét đứt "Điểm của bạn". Vẽ bằng SVG để khớp mẫu (kiểu phổ điểm THPT).
const BAR = '#B45309'; // nâu-cam
const AXIS = '#8c8c8c';

const CourseScoreSpectrum = ({
  data,
  height = 520,
}: {
  data: ExamScoreDistribution | null;
  height?: number;
}) => {
  if (!data?.bands?.length) {
    return (
      <Empty
        description="Chưa đủ dữ liệu phổ điểm"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  const W = 560;
  const H = height;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 16;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxScore = data.maxScore ?? 10;
  const maxCount = Math.max(1, ...data.bands.map((b) => b.count));
  const axisScores = Array.from(
    { length: Math.round(maxScore) + 1 },
    (_, i) => i,
  );

  // điểm s → toạ độ y (s=max ở trên, s=0 ở dưới)
  const yOf = (s: number) => padT + (1 - s / maxScore) * plotH;
  const xOf = (count: number) => padL + (count / maxCount) * plotW;

  const student = data.studentScore;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W }}
        role="img"
        aria-label="Phổ điểm tổng của khóa"
      >
        {/* Lưới + nhãn điểm nguyên 0..10 */}
        {axisScores.map((s) => (
          <g key={`ax-${s}`}>
            <line
              x1={padL}
              x2={W - padR}
              y1={yOf(s)}
              y2={yOf(s)}
              stroke="#f0f0f0"
              strokeWidth={1}
            />
            <text
              x={padL - 8}
              y={yOf(s) + 4}
              textAnchor="end"
              fontSize={12}
              fill={AXIS}
            >
              {s}
            </text>
          </g>
        ))}
        {/* Trục dọc */}
        <line
          x1={padL}
          x2={padL}
          y1={padT}
          y2={H - padB}
          stroke={AXIS}
          strokeWidth={1}
        />

        {/* Cột từng khoảng điểm */}
        {data.bands.map((b) => {
          const top = yOf(b.toScore);
          const bottom = yOf(b.fromScore);
          const h = Math.max(1, bottom - top - 1);
          const w = b.count === 0 ? 0 : Math.max(1, xOf(b.count) - padL);
          return (
            <rect
              key={b.index}
              x={padL}
              y={top}
              width={w}
              height={h}
              fill={b.containsStudent ? '#C8102E' : BAR}
              opacity={0.92}
            />
          );
        })}

        {/* Đường "Điểm của bạn" */}
        {student != null && (
          <g>
            <line
              x1={padL}
              x2={W - padR}
              y1={yOf(student)}
              y2={yOf(student)}
              stroke={AXIS}
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />
            <text
              x={W - padR}
              y={yOf(student) - 6}
              textAnchor="end"
              fontSize={13}
              fontWeight={600}
              fill={AXIS}
            >
              Điểm của bạn: {String(student).replace('.', ',')}
            </text>
          </g>
        )}
      </svg>
      <div
        style={{
          textAlign: 'center',
          marginTop: 4,
          color: '#8c8c8c',
          fontSize: 12,
        }}
      >
        {student != null
          ? `Cao hơn ${data.percentile ?? 0}% các bạn · TB khóa ${data.classAverage ?? '—'} · ${data.submittedCount ?? 0} HV`
          : `TB khóa ${data.classAverage ?? '—'} · trung vị ${data.median ?? '—'} · ${data.submittedCount ?? 0} HV`}
      </div>
    </div>
  );
};

export default CourseScoreSpectrum;
