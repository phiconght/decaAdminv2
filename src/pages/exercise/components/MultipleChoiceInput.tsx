import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Space, theme } from 'antd';
import React from 'react';
import type { ChoiceOption } from '../data';
import ImageUpload from './ImageUpload';

type MultipleChoiceInputProps = {
  value?: ChoiceOption[];
  onChange?: (value: ChoiceOption[]) => void;
};

const emptyOption = (): ChoiceOption => ({ text: '', isCorrect: false });

const DEFAULT_OPTIONS: ChoiceOption[] = [
  emptyOption(),
  emptyOption(),
  emptyOption(),
  emptyOption(),
];

/**
 * Đáp án trắc nghiệm: mặc định 4 đáp án, thêm/bớt được.
 * Click nhãn chữ cái (A/B/C/D…) để đánh dấu đáp án đúng — chỉ 1 đáp án đúng.
 */
const MultipleChoiceInput: React.FC<MultipleChoiceInputProps> = ({
  value,
  onChange,
}) => {
  const { token } = theme.useToken();
  const options = value?.length ? value : DEFAULT_OPTIONS;

  const update = (next: ChoiceOption[]) => onChange?.(next);

  const setCorrect = (index: number) => {
    update(options.map((o, i) => ({ ...o, isCorrect: i === index })));
  };

  const setField = (
    index: number,
    field: 'text' | 'image',
    fieldValue?: string,
  ) => {
    update(
      options.map((o, i) => (i === index ? { ...o, [field]: fieldValue } : o)),
    );
  };

  const addOption = () => update([...options, emptyOption()]);

  const removeOption = (index: number) => {
    update(options.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map((opt, index) => {
          const letter = String.fromCharCode(65 + index);
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: thứ tự A/B/C/D gắn theo vị trí
              key={index}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
            >
              <button
                type="button"
                onClick={() => setCorrect(index)}
                title="Click để đánh dấu đáp án đúng"
                style={{
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  borderRadius: token.borderRadius,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: opt.isCorrect
                    ? token.colorSuccessBg
                    : token.colorFillTertiary,
                  color: opt.isCorrect ? token.colorSuccess : token.colorText,
                  border: opt.isCorrect
                    ? `1.5px solid ${token.colorSuccess}`
                    : `1px solid ${token.colorBorder}`,
                }}
              >
                {letter}
              </button>
              <Input
                placeholder={`Nội dung đáp án ${letter}`}
                value={opt.text}
                onChange={(e) => setField(index, 'text', e.target.value)}
              />
              <ImageUpload
                value={opt.image}
                onChange={(img) => setField(index, 'image', img)}
                compact
              />
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={options.length <= 1}
                onClick={() => removeOption(index)}
              />
            </div>
          );
        })}
      </div>
      <Space style={{ marginTop: 10 }}>
        <Button type="dashed" icon={<PlusOutlined />} onClick={addOption}>
          Thêm đáp án
        </Button>
      </Space>
    </div>
  );
};

export default MultipleChoiceInput;
