import { Card, Descriptions, Typography } from 'antd';
import type { ChapterAnalysisResponse } from '../data';

const { Text } = Typography;

// Bang "Phan tich tu dong" cho 1 CHUONG — cau chu da ghep san o BE
// (ReportNarrativeBuilder). Chi render, khong tu tinh toan.
const ChapterAnalysisCard = ({
  analysis,
}: {
  analysis: ChapterAnalysisResponse | null | undefined;
}) => {
  if (!analysis) return null;

  return (
    <Card
      title={`Phân tích tự động — ${analysis.chapterLabel ?? 'Chương'}`}
      style={{ borderRadius: 12, marginBottom: 16 }}
      styles={{ header: { fontWeight: 600 } }}
    >
      <Descriptions column={2} size="small" style={{ marginBottom: 12 }}>
        <Descriptions.Item label="Điểm TB chương">
          {analysis.avgScore != null
            ? Number(analysis.avgScore).toFixed(2)
            : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Xếp hạng chương">
          {analysis.rank != null
            ? `${analysis.rank}/${analysis.classSize ?? '—'}`
            : '—'}
        </Descriptions.Item>
      </Descriptions>

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
        <div>
          <Text strong>Chuyên cần: </Text>
          <Text>{analysis.attendanceInsight}</Text>
        </div>
      )}
    </Card>
  );
};

export default ChapterAnalysisCard;
