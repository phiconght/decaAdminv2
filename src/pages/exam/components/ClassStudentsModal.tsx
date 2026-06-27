import { SearchOutlined } from '@ant-design/icons';
import { Input, Modal, message, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useMemo, useState } from 'react';
import type { ClassStudentInfo } from '../data';
import { queryClassStudents } from '../service';

type Props = {
  classId: number | null;
  className?: string;
  open: boolean;
  onClose: () => void;
};

const ClassStudentsModal: React.FC<Props> = ({
  classId,
  className,
  open,
  onClose,
}) => {
  const [students, setStudents] = useState<ClassStudentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    if (!open || !classId) return;
    setKeyword('');
    setLoading(true);
    queryClassStudents(classId)
      .then((res) => setStudents(res.data ?? []))
      .catch(() => message.error('Không tải được danh sách học sinh'))
      .finally(() => setLoading(false));
  }, [open, classId]);

  // Lọc theo mã (username) / họ tên / SĐT / email ngay tại client
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return students;
    return students.filter(
      (s) =>
        s.username.toLowerCase().includes(kw) ||
        s.fullName.toLowerCase().includes(kw) ||
        (s.phone ?? '').toLowerCase().includes(kw) ||
        (s.email ?? '').toLowerCase().includes(kw),
    );
  }, [students, keyword]);

  const columns: ColumnsType<ClassStudentInfo> = [
    { title: 'Mã học viên', dataIndex: 'username', width: 150 },
    { title: 'Họ tên', dataIndex: 'fullName' },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      width: 140,
      render: (v) => v || '—',
    },
    { title: 'Email', dataIndex: 'email', render: (v) => v || '—' },
  ];

  return (
    <Modal
      title={`Học sinh — ${className ?? ''}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={760}
      destroyOnClose
    >
      <Input
        placeholder="Tìm theo mã, họ tên, số điện thoại, email"
        prefix={<SearchOutlined />}
        allowClear
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      <Table<ClassStudentInfo>
        rowKey="id"
        size="small"
        loading={loading}
        dataSource={filtered}
        columns={columns}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        locale={{ emptyText: 'Khóa chưa có học sinh' }}
      />
    </Modal>
  );
};

export default ClassStudentsModal;
