import { Card, Descriptions, Space, Tag, Typography } from 'antd';
import type { ReportAnalysisResponse } from '../data';

const { Text, Paragraph } = Typography;

// Bang "Phan tich tu dong" o dau bao cao ca nhan — cau chu da ghep san o BE
// (ReportNarrativeBuilder). Component nay CHI render, khong tu tinh toan
// nguong/xep hang, tranh lech logic voi Mobile.
const AnalysisCard = ({
  analysis,
}: {
  analysis: ReportAnalysisResponse | null | undefined;
}) => {
  if (!analysis) return null;

  return (
    <Card
      title="Phân tích tự động"
      style={{ borderRadius: 12, marginBottom: 16 }}
      styles={{ header: { fontWeight: 600 } }}
    >
      <Descriptions column={2} size="small" style={{ marginBottom: 12 }}>
        <Descriptions.Item label="Học viên">
          {analysis.studentName}
        </Descriptions.Item>
        <Descriptions.Item label="Khóa học">
          {analysis.className}
        </Descriptions.Item>
        <Descriptions.Item label="Điểm TB toàn khóa">
          {analysis.courseAverage != null
            ? Number(analysis.courseAverage).toFixed(2)
            : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Xếp hạng toàn khóa">
          {analysis.courseRank != null
            ? `${analysis.courseRank}/${analysis.classSize ?? '—'}`
            : '—'}
        </Descriptions.Item>
      </Descriptions>

      {analysis.chapters.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <Text strong>Điểm TB &amp; xếp hạng theo chương:</Text>
          <div style={{ marginTop: 4 }}>
            {analysis.chapters.map((c) => (
              <Tag
                key={c.topicId ?? c.chapterLabel}
                style={{ marginBottom: 4 }}
              >
                {c.chapterLabel}:{' '}
                {c.avgScore != null ? Number(c.avgScore).toFixed(2) : '—'}
                {c.rank != null
                  ? ` (hạng ${c.rank}/${c.classSize ?? '—'})`
                  : ''}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {analysis.abilityInsights.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <Text strong>Nhận định năng lực:</Text>
          <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
            {analysis.abilityInsights.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.attendanceInsight && (
        <div style={{ marginBottom: 12 }}>
          <Text strong>Chuyên cần: </Text>
          <Text>{analysis.attendanceInsight}</Text>
        </div>
      )}

      {analysis.teacherCommentAuthor && (
        <Space direction="vertical" size={0}>
          <Text strong>Nhận xét của {analysis.teacherCommentAuthor} (GV):</Text>
          <Paragraph style={{ marginBottom: 0 }}>
            {analysis.teacherCommentContent}
          </Paragraph>
        </Space>
      )}
    </Card>
  );
};

export default AnalysisCard;
