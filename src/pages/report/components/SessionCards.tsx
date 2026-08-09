import { Card, Empty } from 'antd';
import type { OutlineSession } from '../data';

// Danh sách buổi học (cuộn ngang), click 1 thẻ dẫn sang báo cáo buổi —
// mirror RecentExamCards.
const SessionCards = ({
  sessions,
  onSelect,
}: {
  sessions: OutlineSession[];
  onSelect: (sessionId: number) => void;
}) => {
  if (!sessions.length) {
    return (
      <Empty
        description="Chưa có buổi học nào"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div
      style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}
    >
      {sessions.map((s) => (
        <Card
          key={s.sessionId}
          hoverable
          onClick={() => onSelect(s.sessionId)}
          size="small"
          style={{ flex: '0 0 auto', width: 200 }}
        >
          <div style={{ fontWeight: 600 }}>
            Buổi {s.ordinal} — {s.title ?? 'Chưa đặt tên'}
          </div>
          <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 4 }}>
            {s.date} {s.startTime ?? ''}
          </div>
          <div style={{ color: '#8c8c8c', fontSize: 12 }}>
            {s.status}
            {s.attendanceStatus ? ` · ${s.attendanceStatus}` : ''}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SessionCards;
