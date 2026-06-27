import { Drawer } from 'antd';
import React from 'react';
import ExamEditor from '../Editor';

type Props = {
  examId: number | null; // null = tạo mới
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

// Mở form tạo/sửa đề thi trong popup (Drawer) thay vì chuyển trang.
const ExamEditorDrawer: React.FC<Props> = ({
  examId,
  open,
  onClose,
  onSaved,
}) => (
  <Drawer
    title={examId ? 'Sửa đề thi' : 'Tạo đề thi'}
    open={open}
    onClose={onClose}
    destroyOnClose
  >
    {open && (
      <ExamEditor
        embedded
        id={examId ?? undefined}
        onClose={onClose}
        onSaved={onSaved}
      />
    )}
  </Drawer>
);

export default ExamEditorDrawer;
