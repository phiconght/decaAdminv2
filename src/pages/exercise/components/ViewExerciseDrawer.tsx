import type { DescriptionsProps } from 'antd';
import {
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Image,
  message,
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
import type { ExerciseDetailView } from '../data';
import { getExerciseDetail } from '../service';

type ViewExerciseDrawerProps = {
  id: number | null;
  open: boolean;
  onClose: () => void;
};

const ViewExerciseDrawer: React.FC<ViewExerciseDrawerProps> = ({
  id,
  open,
  onClose,
}) => {
  const [detail, setDetail] = useState<ExerciseDetailView | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!open || id === null) {
      setDetail(null);
      return;
    }
    setLoading(true);
    getExerciseDetail(id)
      .then((res) => {
        if (res.success) setDetail(res.data);
        else messageApi.error('Không tải được bài tập');
      })
      .catch(() => messageApi.error('Không tải được bài tập'))
      .finally(() => setLoading(false));
  }, [open, id]);

  const descItems: DescriptionsProps['items'] = detail
    ? [
        { key: 'code', label: 'Mã bài', children: detail.code },
        { key: 'title', label: 'Tên bài tập', children: detail.title },
        { key: 'subject', label: 'Môn học', children: detail.subjectName },
        { key: 'grade', label: 'Khối lớp', children: detail.gradeLevel },
        {
          key: 'type',
          label: 'Loại',
          children: (
            <Tag color="blue">{TYPE_LABEL[detail.type] ?? detail.type}</Tag>
          ),
        },
        {
          key: 'status',
          label: 'Trạng thái',
          children: (
            <Tag color={detail.status === 'ACTIVE' ? 'success' : 'default'}>
              {detail.status}
            </Tag>
          ),
        },
        { key: 'createdBy', label: 'Người tạo', children: detail.createdBy },
        {
          key: 'createdAt',
          label: 'Ngày tạo',
          children: detail.createdAt
            ? new Date(detail.createdAt).toLocaleDateString('vi-VN')
            : '—',
        },
      ]
    : [];

  return (
    <>
      {contextHolder}
      <Drawer
        title="Xem bài tập"
        width="66vw"
        open={open}
        onClose={onClose}
        destroyOnClose
        loading={loading}
      >
        {!loading && !detail && <Empty description="Không có dữ liệu" />}
        {detail && (
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

            <Divider titlePlacement="start" style={{ marginTop: 20 }}>
              Đề bài
            </Divider>
            <div style={{ fontSize: 14, lineHeight: 1.7 }}>
              <MathPreview content={detail.questionText} />
            </div>
            {detail.questionImage && (
              <Image
                src={detail.questionImage}
                style={{ maxWidth: 360, borderRadius: 8, marginTop: 12 }}
              />
            )}

            <Divider titlePlacement="start" style={{ marginTop: 20 }}>
              Đáp án
            </Divider>
            {detail.type === 'MULTIPLE_CHOICE' && detail.options && (
              <MultipleChoiceView options={detail.options} />
            )}
            {detail.type === 'ESSAY' && (
              <EssayView
                answer={detail.essayAnswer}
                answerImage={detail.essayAnswerImage}
              />
            )}
            {detail.type === 'TRUE_FALSE' && detail.trueFalseItems && (
              <TrueFalseView items={detail.trueFalseItems} />
            )}
          </div>
        )}
      </Drawer>
    </>
  );
};

export default ViewExerciseDrawer;
