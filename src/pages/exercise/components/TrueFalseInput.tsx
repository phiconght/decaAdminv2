import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Space, theme } from 'antd';
import React from 'react';
import type { TrueFalseItem } from '../data';
import ImageUpload from './ImageUpload';

type TrueFalseInputProps = {
  value?: TrueFalseItem[];
  onChange?: (value: TrueFalseItem[]) => void;
};

const emptyItem = (): TrueFalseItem => ({ text: '', answer: true });

const DEFAULT_ITEMS: TrueFalseItem[] = [
  emptyItem(),
  emptyItem(),
  emptyItem(),
  emptyItem(),
];

/**
 * Đáp án Đúng/Sai: mặc định 4 ý, thêm/bớt được.
 * Mỗi ý: input text nội dung + chọn Đúng/Sai + thêm ảnh.
 */
const TrueFalseInput: React.FC<TrueFalseInputProps> = ({ value, onChange }) => {
  const { token } = theme.useToken();
  const items = value?.length ? value : DEFAULT_ITEMS;

  const update = (next: TrueFalseItem[]) => onChange?.(next);

  const setField = <K extends keyof TrueFalseItem>(
    index: number,
    field: K,
    fieldValue: TrueFalseItem[K],
  ) => {
    update(
      items.map((it, i) => (i === index ? { ...it, [field]: fieldValue } : it)),
    );
  };

  const addItem = () => update([...items, emptyItem()]);

  const removeItem = (index: number) => {
    update(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: ý câu hỏi gắn theo vị trí
            key={index}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
          >
            <span
              style={{
                width: 24,
                lineHeight: '36px',
                flexShrink: 0,
                textAlign: 'center',
              }}
            >
              {index + 1}
            </span>
            <Input
              placeholder={`Nội dung ý ${index + 1}`}
              value={item.text}
              onChange={(e) => setField(index, 'text', e.target.value)}
            />
            <button
              type="button"
              title="Click để chuyển Đúng/Sai"
              onClick={() => setField(index, 'answer', !item.answer)}
              style={{
                flexShrink: 0,
                height: 32,
                padding: '0 14px',
                borderRadius: token.borderRadius,
                fontWeight: 500,
                cursor: 'pointer',
                background: item.answer
                  ? token.colorSuccessBg
                  : token.colorErrorBg,
                color: item.answer ? token.colorSuccess : token.colorError,
                border: item.answer
                  ? `1.5px solid ${token.colorSuccess}`
                  : `1.5px solid ${token.colorError}`,
              }}
            >
              {item.answer ? 'Đúng' : 'Sai'}
            </button>
            <ImageUpload
              value={item.image}
              onChange={(img) => setField(index, 'image', img)}
              compact
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={items.length <= 1}
              onClick={() => removeItem(index)}
            />
          </div>
        ))}
      </div>
      <Space style={{ marginTop: 10 }}>
        <Button type="dashed" icon={<PlusOutlined />} onClick={addItem}>
          Thêm ý
        </Button>
      </Space>
    </div>
  );
};

export default TrueFalseInput;
