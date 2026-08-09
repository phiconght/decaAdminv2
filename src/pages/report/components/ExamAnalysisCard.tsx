import { Card, Descriptions, Typography } from 'antd';
import type { ExamAnalysisResponse } from '../data';

const { Text } = Typography;

// Bang "Phan tich tu dong" cho 1 BAI THI — cau chu da ghep san o BE.
const ExamAnalysisCard = ({
  analysis,
}: {
  analysis: ExamAnalysisResponse | null | undefined;
}) => {
  if (!analysis) return null;

  return (
    <Card
      title="Phân tích tự động — Bài thi"
      style={{ borderRadius: 12, marginBottom: 16 }}
      styles={{ header: { fontWeight: 600 } }}
    >
      <Descriptions column={2} size="small" style={{ marginBottom: 12 }}>
        <Descriptions.Item label="Điểm">
          {analysis.score != null ? Number(analysis.score).toFixed(2) : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="TB lớp">
          {analysis.classAverage != null
            ? Number(analysis.classAverage).toFixed(2)
            : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Xếp hạng" span={2}>
          {analysis.rank != null
            ? `${analysis.rank}/${analysis.classSize ?? '—'}`
            : '—'}
        </Descriptions.Item>
      </Descriptions>

      {analysis.comparisonInsight && (
        <div style={{ marginBottom: 12 }}>
          <Text>{analysis.comparisonInsight}</Text>
        </div>
      )}

      {analysis.abilityInsights.length > 0 && (
        <div>
          <Text strong>Nhận định năng lực:</Text>
          <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
            {analysis.abilityInsights.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default ExamAnalysisCard;
