import { CheckCircleFilled } from '@ant-design/icons';
import type { DescriptionsProps } from 'antd';
import {
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Image,
  message,
  Tag,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import type { ChoiceOption, ExerciseDetailView, TrueFalseItem } from '../data';
import { getExerciseDetail } from '../service';

type ViewExerciseDrawerProps = {
  id: number | null;
  open: boolean;
  onClose: () => void;
};

const TYPE_LABEL: Record<string, string> = {
  MULTIPLE_CHOICE: 'Trắc nghiệm',
  ESSAY: 'Tự luận',
  TRUE_FALSE: 'Đúng / Sai',
};

const MultipleChoiceView: React.FC<{ options: ChoiceOption[] }> = ({
  options,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {options.map((opt, i) => {
      const label = String.fromCharCode(65 + i);
      return (
        <div
          key={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            border: opt.isCorrect
              ? '1px solid var(--ant-color-success-border)'
              : '0.5px solid var(--ant-color-border)',
            borderRadius: 8,
            background: opt.isCorrect
              ? 'var(--ant-color-success-bg)'
              : 'transparent',
          }}
        >
          {opt.isCorrect ? (
            <CheckCircleFilled
              style={{ color: 'var(--ant-color-success)', fontSize: 16 }}
            />
          ) : (
            <span style={{ width: 16 }} />
          )}
          <span
            style={{
              fontWeight: 500,
              fontSize: 13,
              color: opt.isCorrect
                ? 'var(--ant-color-success)'
                : 'var(--ant-color-text-secondary)',
              width: 18,
            }}
          >
            {label}
          </span>
          <span
            style={{
              flex: 1,
              fontSize: 14,
              color: opt.isCorrect
                ? 'var(--ant-color-success-text)'
                : undefined,
              whiteSpace: 'pre-wrap',
            }}
          >
            {opt.text || (
              <span style={{ color: 'var(--ant-color-text-quaternary)' }}>
                Trống
              </span>
            )}
          </span>
          {opt.isCorrect && (
            <Tag color="success" style={{ margin: 0 }}>
              Đáp án đúng
            </Tag>
          )}
          {opt.image && (
            <Image
              src={opt.image}
              width={48}
              height={48}
              style={{ objectFit: 'cover', borderRadius: 6 }}
            />
          )}
        </div>
      );
    })}
  </div>
);

const EssayView: React.FC<{ answer?: string; answerImage?: string }> = ({
  answer,
  answerImage,
}) => {
  if (!answer && !answerImage) {
    return (
      <Empty
        description="Chưa có đáp án mẫu"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {answer && (
        <Typography.Text
          style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.7 }}
        >
          {answer}
        </Typography.Text>
      )}
      {answerImage && (
        <Image src={answerImage} style={{ maxWidth: 360, borderRadius: 8 }} />
      )}
    </div>
  );
};

const TrueFalseView: React.FC<{ items: TrueFalseItem[] }> = ({ items }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {items.map((item) => {
      const idx = items.indexOf(item);
      return (
        <div
          key={String(idx + 1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            border: '0.5px solid var(--ant-color-border)',
            borderRadius: 8,
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: 'var(--ant-color-text-secondary)',
              width: 20,
            }}
          >
            {idx + 1}.
          </span>
          <span style={{ flex: 1, fontSize: 14, whiteSpace: 'pre-wrap' }}>
            {item.text || (
              <span style={{ color: 'var(--ant-color-text-quaternary)' }}>
                Trống
              </span>
            )}
          </span>
          {item.image && (
            <Image
              src={item.image}
              width={48}
              height={48}
              style={{ objectFit: 'cover', borderRadius: 6 }}
            />
          )}
          <Tag color={item.answer ? 'success' : 'error'} style={{ margin: 0 }}>
            {item.answer ? 'Đúng' : 'Sai'}
          </Tag>
        </div>
      );
    })}
  </div>
);

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
            <Typography.Text
              style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.7 }}
            >
              {detail.questionText}
            </Typography.Text>
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
