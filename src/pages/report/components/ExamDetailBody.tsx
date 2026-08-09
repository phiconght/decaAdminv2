import { ProCard } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import {
  Button,
  Col,
  Descriptions,
  Modal,
  message,
  Row,
  Segmented,
  Select,
  Statistic,
  Tag,
  Tooltip,
} from 'antd';
import { useEffect, useState } from 'react';
import type {
  ExamAnalysisResponse,
  ExamReportDetail,
  PracticeAssignmentResponse,
  TopicMasteryItem,
} from '../data';
import { assignPractice, getExamAnalysis } from '../service';
import BreakdownChart from './BreakdownChart';
import { DIFFICULTY_LABEL, TYPE_LABEL } from './colors';
import ExamAnalysisCard from './ExamAnalysisCard';
import ScoreDistributionChart from './ScoreDistributionChart';

// Noi dung chi tiet 1 bai thi: Analysis Card + DIEM (theo bai) + pho diem +
// NANG LUC (CHI cua bai thi nay, khong gop cac de khac cung chuong — §Phan
// C quyet dinh #3). Dropdown "Chuong giao bai" TACH RIENG khoi breakdown,
// chi dung lam tham so cho "Giao bai luyen tap", khong con dieu khien
// breakdown hien thi nua (tranh nham lan 2 muc dich khac nhau tren 1 dropdown).
const ExamDetailBody = ({
  studentId,
  classId,
  detail,
  topics,
  studentName,
}: {
  studentId: number;
  classId: number;
  detail: ExamReportDetail;
  topics: TopicMasteryItem[];
  studentName?: string;
}) => {
  const access = useAccess();
  const canAssign = access.hasPerm('REPORT:ASSIGN');

  // Chuong dung rieng cho "Giao bai luyen tap" — mac dinh = chuong cua de.
  const [assignTopicId, setAssignTopicId] = useState<number | null>(
    detail.topicId,
  );
  const [byType, setByType] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [analysis, setAnalysis] = useState<ExamAnalysisResponse | null>(null);

  useEffect(() => {
    getExamAnalysis(studentId, detail.examId, classId).then((res) =>
      setAnalysis(res.data),
    );
  }, [studentId, detail.examId, classId]);

  const assignTopicName =
    assignTopicId == null
      ? null
      : (topics.find((t) => t.topicId === assignTopicId)?.topicName ??
        detail.topicName ??
        'Chương');

  const doAssign = () => {
    if (assignTopicId == null) return;
    Modal.confirm({
      title: 'Giao bài luyện tập cho con',
      content: `Hệ thống chọn 10 bài chương "${assignTopicName}" — độ khó/dạng bài nghiêng về phần con đang yếu (số liệu đang hiển thị).`,
      okText: 'Giao bài',
      cancelText: 'Hủy',
      onOk: async () => {
        setAssigning(true);
        try {
          const res = await assignPractice(studentId, classId, {
            examId: detail.examId,
            topicId: assignTopicId,
          });
          showResult(res.data);
        } catch {
          // lỗi hiện ở global handler (PRACTICE_LIMIT_REACHED / PRACTICE_BANK_INSUFFICIENT)
        } finally {
          setAssigning(false);
        }
      },
    });
  };

  const showResult = (r: PracticeAssignmentResponse) => {
    Modal.success({
      title: 'Đã giao bài luyện tập',
      content: (
        <div>
          <p>
            <b>{r.examName}</b>
          </p>
          <p>Chuyên đề: {r.topicName ?? '—'}</p>
          <p>
            Số câu: {r.numQuestions} — Dễ {r.byDifficulty.easy} / TB{' '}
            {r.byDifficulty.medium} / Khó {r.byDifficulty.hard}
          </p>
          <p>
            Dạng: Trắc nghiệm {r.byType.multipleChoice} / Đúng-sai{' '}
            {r.byType.trueFalse}
          </p>
          {r.deadline && (
            <p>Hạn nộp: {new Date(r.deadline).toLocaleDateString('vi-VN')}</p>
          )}
        </div>
      ),
    });
    message.success('Đã giao bài');
  };

  const topicOptions = [
    { label: 'Toàn khóa', value: -1 },
    ...topics
      .filter((t) => t.topicId != null)
      .map((t) => ({ label: t.topicName, value: t.topicId as number })),
  ];

  return (
    <>
      {(detail.topicName || detail.sessionTitle) && (
        <div style={{ marginBottom: 12 }}>
          {detail.topicName && (
            <Tag color="blue">Chương: {detail.topicName}</Tag>
          )}
          {detail.sessionTitle && (
            <Tag color="purple">
              Buổi: {detail.sessionTitle}
              {detail.sessionDate
                ? ` (${new Date(detail.sessionDate).toLocaleDateString('vi-VN')})`
                : ''}
            </Tag>
          )}
        </div>
      )}

      <ExamAnalysisCard analysis={analysis} />

      {/* Tầng ĐIỂM — theo bài thi */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic
            title="Điểm"
            value={detail.score ?? 0}
            precision={2}
            suffix={detail.maxScore != null ? `/ ${detail.maxScore}` : ''}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="TB lớp"
            value={detail.classAverage ?? 0}
            precision={2}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Xếp hạng"
            value={
              detail.rank != null
                ? `${detail.rank}/${detail.submittedCount ?? '—'}`
                : '—'
            }
          />
        </Col>
      </Row>

      <ProCard title="Phổ điểm của lớp" size="small">
        <ScoreDistributionChart
          data={detail.distribution}
          studentName={studentName}
        />
      </ProCard>

      {canAssign && (
        <Descriptions style={{ marginTop: 16 }} column={1}>
          <Descriptions.Item label="Chương giao bài">
            <Select
              style={{ width: 240 }}
              value={assignTopicId ?? -1}
              options={topicOptions}
              onChange={(v) => setAssignTopicId(v === -1 ? null : v)}
            />
            {assignTopicId == null ? (
              <Tooltip title="Chọn 1 chương để giao bài">
                <Button style={{ marginLeft: 12 }} disabled>
                  Giao bài cho con
                </Button>
              </Tooltip>
            ) : (
              <Button
                type="primary"
                style={{ marginLeft: 12 }}
                loading={assigning}
                onClick={doAssign}
              >
                Giao bài cho con
              </Button>
            )}
          </Descriptions.Item>
        </Descriptions>
      )}

      <ProCard
        title="Năng lực bài thi (chỉ đề này)"
        size="small"
        style={{ marginTop: 16 }}
        extra={
          <Segmented
            size="small"
            value={byType ? 'type' : 'diff'}
            onChange={(v) => setByType(v === 'type')}
            options={[
              { label: 'Độ khó', value: 'diff' },
              { label: 'Loại câu', value: 'type' },
            ]}
          />
        }
      >
        <BreakdownChart
          buckets={
            byType ? detail.breakdown.byType : detail.breakdown.byDifficulty
          }
          labelMap={byType ? TYPE_LABEL : DIFFICULTY_LABEL}
        />
      </ProCard>
    </>
  );
};

export default ExamDetailBody;
