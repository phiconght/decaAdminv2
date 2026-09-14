import { CheckCircleFilled } from '@ant-design/icons';
import { Empty, Image, Tag } from 'antd';
import React from 'react';
import { MathPreview } from '@/components';

export const EXERCISE_TYPE_LABEL: Record<string, string> = {
  MULTIPLE_CHOICE: 'Trắc nghiệm',
  ESSAY: 'Tự luận',
  TRUE_FALSE: 'Đúng / Sai',
};

export type ChoiceOptionView = {
  text: string;
  isCorrect: boolean;
  image?: string;
};

export type TrueFalseItemView = {
  text: string;
  answer: boolean;
  image?: string;
};

/** Danh sach 4 phuong an trac nghiem, dap an dung to sang mau xanh. */
export const MultipleChoiceView: React.FC<{ options: ChoiceOptionView[] }> = ({
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
            }}
          >
            <MathPreview content={opt.text} emptyText="Trống" />
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

export const EssayView: React.FC<{ answer?: string; answerImage?: string }> = ({
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
        <div style={{ fontSize: 14, lineHeight: 1.7 }}>
          <MathPreview content={answer} />
        </div>
      )}
      {answerImage && (
        <Image src={answerImage} style={{ maxWidth: 360, borderRadius: 8 }} />
      )}
    </div>
  );
};

export const TrueFalseView: React.FC<{ items: TrueFalseItemView[] }> = ({
  items,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {items.map((item, idx) => (
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
        <span style={{ flex: 1, fontSize: 14 }}>
          <MathPreview content={item.text} emptyText="Trống" />
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
    ))}
  </div>
);
