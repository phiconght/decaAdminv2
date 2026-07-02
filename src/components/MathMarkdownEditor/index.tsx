import { Input } from 'antd';
import React from 'react';
import MathPreview from './MathPreview';

const { TextArea } = Input;

type MathMarkdownEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
};

/**
 * Textarea nhap LaTeX/Markdown (trai) + panel preview song bang KaTeX (phai).
 * Dung cho de bai / dap an tu luan trong module Bai tap — xem
 * SPEC_CongThucToan_NhapHangLoat.md §8.2. Cu phap cong thuc: $...$ (inline)
 * hoac $$...$$ (khoi).
 */
const MathMarkdownEditor: React.FC<MathMarkdownEditorProps> = ({
  value,
  onChange,
  placeholder,
  rows = 6,
  disabled,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: '1 1 320px', minWidth: 280 }}>
        <TextArea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          autoSize={{ minRows: rows, maxRows: rows + 8 }}
          disabled={disabled}
          style={{ fontFamily: 'monospace' }}
        />
      </div>
      <div
        style={{
          flex: '1 1 320px',
          minWidth: 280,
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          padding: 12,
          background: '#fafafa',
          maxHeight: rows * 32 + 64,
          overflow: 'auto',
        }}
      >
        <MathPreview content={value} emptyText="Xem trước công thức tại đây" />
      </div>
    </div>
  );
};

export default MathMarkdownEditor;
export { MathPreview };
