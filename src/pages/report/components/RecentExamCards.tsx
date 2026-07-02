import { Card, Col, Empty, Row, Statistic } from 'antd';
import type { RecentExamItem } from '../data';
import { scoreColor } from './colors';

// 3 card điểm gần nhất; click 1 card mở chi tiết bài.
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
    <Row gutter={16}>
      {exams.slice(0, 3).map((e) => {
        const ratio =
          e.score != null && e.maxScore != null && e.maxScore > 0
            ? e.score / e.maxScore
            : null;
        return (
          <Col xs={24} sm={8} key={e.examStudentId}>
            <Card
              hoverable={!!onSelect}
              onClick={() => onSelect?.(e)}
              size="small"
              style={{ borderTop: `3px solid ${scoreColor(ratio)}` }}
            >
              <Statistic
                title={e.examName}
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
          </Col>
        );
      })}
    </Row>
  );
};

export default RecentExamCards;
