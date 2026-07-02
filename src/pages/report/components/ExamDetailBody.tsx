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
  Tooltip,
} from 'antd';
import { useState } from 'react';
import type {
  BreakdownResponse,
  ExamReportDetail,
  PracticeAssignmentResponse,
  TopicMasteryItem,
} from '../data';
import { assignPractice, getBreakdowns } from '../service';
import BreakdownChart from './BreakdownChart';
import { DIFFICULTY_LABEL, TYPE_LABEL } from './colors';
import ScoreDistributionChart from './ScoreDistributionChart';

// Nội dung chi tiết 1 bài thi: ĐIỂM (theo bài) + phổ điểm + NĂNG LỰC (theo chương).
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

  // Chương đang chọn: mặc định = chương của bài thi.
  const [topicId, setTopicId] = useState<number | null>(detail.topicId);
  const [breakdown, setBreakdown] = useState<BreakdownResponse>(
    detail.breakdown,
  );
  const [byType, setByType] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const topicName =
    topicId == null
      ? 'Toàn khóa'
      : (topics.find((t) => t.topicId === topicId)?.topicName ??
        detail.topicName ??
        'Chương');

  const onTopicChange = async (value: number | null) => {
    setTopicId(value);
    if (value === detail.topicId) {
      setBreakdown(detail.breakdown);
      return;
    }
    const res = await getBreakdowns(studentId, classId, value ?? undefined);
    setBreakdown(res.data);
  };

  const doAssign = () => {
    if (topicId == null) return;
    Modal.confirm({
      title: 'Giao bài luyện tập cho con',
      content: `Hệ thống chọn 10 bài chương "${topicName}" — độ khó/dạng bài nghiêng về phần con đang yếu (số liệu đang hiển thị).`,
      okText: 'Giao bài',
      cancelText: 'Hủy',
      onOk: async () => {
        setAssigning(true);
        try {
          const res = await assignPractice(studentId, classId, {
            examId: detail.examId,
            topicId,
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

      {/* Chọn chương (mặc định chương của bài thi) + nút giao bài */}
      <Descriptions style={{ marginTop: 16 }} column={1}>
        <Descriptions.Item label="Năng lực chương">
          <Select
            style={{ width: 240 }}
            value={topicId ?? -1}
            options={topicOptions}
            onChange={(v) => onTopicChange(v === -1 ? null : v)}
          />
          {canAssign &&
            (topicId == null ? (
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
            ))}
        </Descriptions.Item>
      </Descriptions>

      <ProCard
        title={
          topicId == null
            ? 'Năng lực toàn khóa (tổng hợp mọi bài)'
            : `Năng lực chương "${topicName}" (tổng hợp mọi bài)`
        }
        size="small"
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
          buckets={byType ? breakdown.byType : breakdown.byDifficulty}
          labelMap={byType ? TYPE_LABEL : DIFFICULTY_LABEL}
        />
      </ProCard>
    </>
  );
};

export default ExamDetailBody;
