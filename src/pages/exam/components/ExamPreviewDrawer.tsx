import type { DescriptionsProps } from 'antd';
import {
  Descriptions,
  Divider,
  Drawer,
  Empty,
  message,
  Skeleton,
  Tag,
} from 'antd';
import React, { useEffect, useState } from 'react';
import {
  ExerciseEssayView as EssayView,
  MathPreview,
  ExerciseMultipleChoiceView as MultipleChoiceView,
  ExerciseTrueFalseView as TrueFalseView,
  EXERCISE_TYPE_LABEL as TYPE_LABEL,
} from '@/components';
import type { ExerciseDetailView } from '../../exercise/data';
import { getExerciseDetail } from '../../exercise/service';
import type { ExamDetailView } from '../data';
import { getExamDetail } from '../service';

type ExamPreviewDrawerProps = {
  examId: number | null;
  open: boolean;
  onClose: () => void;
};

const TYPE_TAG_COLOR: Record<string, string> = {
  BY_CLASS: 'blue',
  SUPPLEMENTARY: 'purple',
};

/** Xem toan bo noi dung 1 de thi (cau hoi + dap an) ma khong can xuat PDF. */
const ExamPreviewDrawer: React.FC<ExamPreviewDrawerProps> = ({
  examId,
  open,
  onClose,
}) => {
  const [exam, setExam] = useState<ExamDetailView | null>(null);
  const [exercises, setExercises] = useState<
    Record<number, ExerciseDetailView>
  >({});
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!open || examId === null) {
      setExam(null);
      setExercises({});
      return;
    }
    setLoading(true);
    getExamDetail(examId)
      .then(async (res) => {
        if (!res.success) {
          messageApi.error('Không tải được đề thi');
          return;
        }
        setExam(res.data);
        const details = await Promise.all(
          res.data.exercises.map((e) => getExerciseDetail(e.exerciseId)),
        );
        const map: Record<number, ExerciseDetailView> = {};
        details.forEach((d) => {
          if (d.success) map[d.data.id] = d.data;
        });
        setExercises(map);
      })
      .catch(() => messageApi.error('Không tải được đề thi'))
      .finally(() => setLoading(false));
  }, [open, examId]);

  const descItems: DescriptionsProps['items'] = exam
    ? [
        { key: 'code', label: 'Mã đề', children: exam.code },
        { key: 'name', label: 'Tên đề', children: exam.name },
        { key: 'subject', label: 'Môn học', children: exam.subjectName },
        { key: 'grade', label: 'Khối lớp', children: exam.gradeLevel },
        {
          key: 'type',
          label: 'Loại đề',
          children: (
            <Tag color={TYPE_TAG_COLOR[exam.type] ?? 'default'}>
              {exam.type === 'BY_CLASS' ? 'Theo khóa' : 'Bổ sung'}
            </Tag>
          ),
        },
        {
          key: 'duration',
          label: 'Thời gian làm bài',
          children: exam.durationMinutes ? `${exam.durationMinutes} phút` : '—',
        },
        {
          key: 'exerciseCount',
          label: 'Số câu',
          children: exam.exercises.length,
        },
      ]
    : [];

  const sortedExercises = exam
    ? [...exam.exercises].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  return (
    <>
      {contextHolder}
      <Drawer
        title="Xem đề thi"
        width="66vw"
        open={open}
        onClose={onClose}
        destroyOnClose
        loading={loading}
      >
        {!loading && !exam && <Empty description="Không có dữ liệu" />}
        {exam && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <Descriptions
              items={descItems}
              column={2}
              size="small"
              bordered={false}
              labelStyle={{
                color: 'var(--ant-color-text-secondary)',
                fontWeight: 400,
              }}
            />

            {sortedExercises.map((line, idx) => {
              const detail = exercises[line.exerciseId];
              return (
                <div key={line.exerciseId} style={{ marginTop: 8 }}>
                  <Divider titlePlacement="start" style={{ marginBottom: 12 }}>
                    Câu {idx + 1}
                    {line.points != null ? ` — ${line.points} điểm` : ''}
                    {detail && (
                      <Tag
                        color="blue"
                        style={{ marginLeft: 8, fontWeight: 400 }}
                      >
                        {TYPE_LABEL[detail.type] ?? detail.type}
                      </Tag>
                    )}
                  </Divider>
                  {!detail && <Skeleton active paragraph={{ rows: 2 }} />}
                  {detail && (
                    <>
                      <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                        <MathPreview content={detail.questionText} />
                      </div>
                      {detail.questionImage && (
                        <img
                          src={detail.questionImage}
                          alt=""
                          style={{
                            maxWidth: 360,
                            borderRadius: 8,
                            marginTop: 12,
                            display: 'block',
                          }}
                        />
                      )}
                      <div style={{ marginTop: 12 }}>
                        {detail.type === 'MULTIPLE_CHOICE' &&
                          detail.options && (
                            <MultipleChoiceView options={detail.options} />
                          )}
                        {detail.type === 'ESSAY' && (
                          <EssayView
                            answer={detail.essayAnswer}
                            answerImage={detail.essayAnswerImage}
                          />
                        )}
                        {detail.type === 'TRUE_FALSE' &&
                          detail.trueFalseItems && (
                            <TrueFalseView items={detail.trueFalseItems} />
                          )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Drawer>
    </>
  );
};

export default ExamPreviewDrawer;
