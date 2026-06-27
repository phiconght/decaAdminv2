import { Button, Drawer, message, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import type { ExamClassItem } from '../data';
import { queryExamClasses } from '../service';
import ClassStudentsModal from './ClassStudentsModal';

type Props = {
  examId: number | null;
  examName?: string;
  open: boolean;
  onClose: () => void;
};

const ExamClassesDrawer: React.FC<Props> = ({
  examId,
  examName,
  open,
  onClose,
}) => {
  const [classes, setClasses] = useState<ExamClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [studentsFor, setStudentsFor] = useState<{
    classId: number;
    className: string;
  } | null>(null);

  useEffect(() => {
    if (!open || !examId) return;
    setLoading(true);
    queryExamClasses(examId)
      .then((res) => setClasses(res.data ?? []))
      .catch(() => message.error('Không tải được danh sách khóa'))
      .finally(() => setLoading(false));
  }, [open, examId]);

  const columns: ColumnsType<ExamClassItem> = [
    { title: 'Mã khóa', dataIndex: 'code', width: 140, fixed: 'left' },
    { title: 'Tên khóa', dataIndex: 'name', width: 180, ellipsis: true },
    {
      title: 'Môn — Khối',
      width: 200,
      render: (_, r) => `${r.subjectName} — ${r.gradeLevel}`,
    },
    {
      title: 'Giáo viên',
      dataIndex: 'teachers',
      render: (_, r) =>
        r.teachers.length
          ? r.teachers.map((t) => `${t.fullName} (${t.username})`).join(', ')
          : '—',
    },
    {
      title: 'Danh sách học sinh',
      dataIndex: 'studentCount',
      width: 160,
      render: (count, r) => (
        <Button
          type="link"
          size="small"
          style={{ padding: 0 }}
          onClick={() =>
            setStudentsFor({ classId: r.classId, className: r.name })
          }
        >
          {count ?? 0} học sinh
        </Button>
      ),
    },
  ];

  return (
    <Drawer
      title={`Khóa học của đề${examName ? ` — ${examName}` : ''}`}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <Table<ExamClassItem>
        rowKey="classId"
        size="small"
        loading={loading}
        dataSource={classes}
        columns={columns}
        scroll={{ x: 'max-content' }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        locale={{ emptyText: 'Đề chưa gán khóa nào' }}
      />

      <ClassStudentsModal
        classId={studentsFor?.classId ?? null}
        className={studentsFor?.className}
        open={studentsFor !== null}
        onClose={() => setStudentsFor(null)}
      />
    </Drawer>
  );
};

export default ExamClassesDrawer;
