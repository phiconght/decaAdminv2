import { Card, Empty, Statistic } from 'antd';
import type { TopicMasteryItem } from '../data';
import { scoreColor } from './colors';

// Danh sách chương (cuộn ngang), click 1 thẻ dẫn sang báo cáo chương —
// mirror RecentExamCards. Chỉ liệt kê chương co topicId (bỏ "Chưa phân chương").
const ChapterCards = ({
  topics,
  onSelect,
}: {
  topics: TopicMasteryItem[];
  onSelect: (topicId: number) => void;
}) => {
  const items = topics.filter((t) => t.topicId != null);
  if (!items.length) {
    return (
      <Empty
        description="Chưa có chương nào"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div
      style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}
    >
      {items.map((t) => (
        <Card
          key={t.topicId}
          hoverable
          onClick={() => onSelect(t.topicId as number)}
          size="small"
          style={{
            flex: '0 0 auto',
            width: 200,
            borderTop: `3px solid ${scoreColor(t.masteryPct)}`,
          }}
        >
          <Statistic
            title={
              <span style={{ display: 'block', whiteSpace: 'normal' }}>
                {t.topicName}
              </span>
            }
            value={t.masteryPct != null ? Math.round(t.masteryPct * 100) : 0}
            suffix="%"
            valueStyle={{ color: scoreColor(t.masteryPct) }}
          />
          <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 4 }}>
            {t.gradedCount} câu đã chấm
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ChapterCards;
