import { Card, Empty, Statistic } from 'antd';
import type { RecentExamItem } from '../data';
import { scoreColor } from './colors';

// Danh sách TẤT CẢ bài thi (cuộn ngang), click 1 thẻ mở chi tiết bài.
const RecentExamCards = ({
  exams,
  onSelect,
}: {
  exams: RecentExamItem[];
  onSelect?: (item: RecentExamItem) => void;
}) => {
  if (!exams.length) {
    return (
      <Empty
        description="Chưa có bài thi đã nộp"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div
      style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}
    >
      {exams.map((e) => {
        const ratio =
          e.score != null && e.maxScore != null && e.maxScore > 0
            ? e.score / e.maxScore
            : null;
        return (
          <Card
            key={e.examStudentId}
            hoverable={!!onSelect}
            onClick={() => onSelect?.(e)}
            size="small"
            style={{
              flex: '0 0 auto',
              width: 200,
              borderTop: `3px solid ${scoreColor(ratio)}`,
            }}
          >
            <Statistic
              title={
                <span style={{ display: 'block', whiteSpace: 'normal' }}>
                  {e.examName}
                </span>
              }
              value={e.score ?? 0}
              precision={2}
              suffix={e.maxScore != null ? `/ ${e.maxScore}` : undefined}
              valueStyle={{ color: scoreColor(ratio) }}
            />
            <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 4 }}>
              {e.subjectName}
              {e.submittedAt
                ? ` · ${new Date(e.submittedAt).toLocaleDateString('vi-VN')}`
                : ''}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default RecentExamCards;
