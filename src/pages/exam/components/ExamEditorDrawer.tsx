import { Drawer } from 'antd';
import React from 'react';
import { useDrawerWidth } from '@/hooks/useResponsiveWidth';
import ExamEditor from '../Editor';
import ExportPdfDropdown from './ExportPdfDropdown';

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
}) => {
  const drawerWidth = useDrawerWidth('90vw');

  return (
    <Drawer
      title={examId ? 'Sửa đề thi' : 'Tạo đề thi'}
      width={drawerWidth}
      open={open}
      onClose={onClose}
      destroyOnClose
      extra={
        examId ? <ExportPdfDropdown examId={examId} mode="button" /> : undefined
      }
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
};

export default ExamEditorDrawer;
