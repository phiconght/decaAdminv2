import { XMarkdown } from '@ant-design/x-markdown';
import Latex from '@ant-design/x-markdown/plugins/Latex';
import React from 'react';

// katex.trust mac dinh false (chan \href, \includegraphics...) — dat tuong minh
// theo SPEC_CongThucToan_NhapHangLoat.md §15.1 (chong XSS qua cong thuc LaTeX).
const latexExtensions = Latex({
  katexOptions: { trust: false, strict: 'warn' },
});

type MathPreviewProps = {
  /** Noi dung markdown + LaTeX ($...$ / $$...$$) can render. */
  content?: string;
  /** Text hien khi content rong. */
  emptyText?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
};

/**
 * Render read-only 1 chuoi markdown + cong thuc toan (KaTeX qua plugin Latex
 * cua @ant-design/x-markdown). Dung o ca panel preview cua MathMarkdownEditor
 * lan cac man xem chi tiet (ViewExerciseDrawer, MC/TF option).
 */
const MathPreview: React.FC<MathPreviewProps> = ({
  content,
  emptyText = 'Chưa có nội dung',
  style,
  className,
}) => {
  if (!content) {
    return <span style={{ color: '#999' }}>{emptyText}</span>;
  }
  return (
    <div className={className} style={style}>
      <XMarkdown content={content} config={{ extensions: latexExtensions }} />
    </div>
  );
};

export default MathPreview;
