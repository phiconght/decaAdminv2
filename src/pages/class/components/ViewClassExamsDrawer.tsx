import { Drawer, Empty, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import type { ClassExamItem } from '../data';
import { queryClassExams } from '../service';

type Props = {
  classId: number | null;
  className?: string;
  open: boolean;
  onClose: () => void;
};

const ViewClassExamsDrawer: React.FC<Props> = ({
  classId,
  className,
  open,
  onClose,
}) => {
  const [exams, setExams] = useState<ClassExamItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !classId) return;
    setLoading(true);
    queryClassExams(classId)
      .then((res) => setExams(res.data ?? []))
      .finally(() => setLoading(false));
  }, [open, classId]);

  return (
    <Drawer
      title={`Đề thi của khóa — ${className ?? ''}`}
      open={open}
      onClose={onClose}
      width={560}
    >
      <Table<ClassExamItem>
        rowKey="id"
        dataSource={exams}
        loading={loading}
        size="small"
        pagination={{ pageSize: 10, showSizeChanger: false }}
        locale={{
          emptyText: <Empty description="Khóa chưa được gán đề thi nào" />,
        }}
        columns={[
          { title: 'Mã đề', dataIndex: 'code', width: 150 },
          { title: 'Tên đề', dataIndex: 'name', ellipsis: true },
          {
            title: 'Loại',
            dataIndex: 'type',
            width: 100,
            render: (_, r) => (
              <Tag color={r.type === 'BY_CLASS' ? 'blue' : 'purple'}>
                {r.type === 'BY_CLASS' ? 'Theo khóa' : 'Bổ sung'}
              </Tag>
            ),
          },
          {
            title: 'TG (phút)',
            dataIndex: 'durationMinutes',
            width: 90,
            render: (v: number | undefined) => v ?? '—',
          },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 100,
            render: (_, r) => (
              <Tag color={r.status === 'ACTIVE' ? 'success' : 'default'}>
                {r.status}
              </Tag>
            ),
          },
        ]}
      />
    </Drawer>
  );
};

export default ViewClassExamsDrawer;
