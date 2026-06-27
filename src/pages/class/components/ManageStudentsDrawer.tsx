import { UserAddOutlined } from '@ant-design/icons';
import { Button, Drawer, message, Popconfirm, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import type { StudentOption } from '../data';
import { queryClassStudents, removeClassStudent } from '../service';
import AddStudentsModal from './AddStudentsModal';

type Props = {
  classId: number | null;
  className?: string;
  open: boolean;
  onClose: () => void;
};

const ManageStudentsDrawer: React.FC<Props> = ({
  classId,
  className,
  open,
  onClose,
}) => {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const fetchStudents = async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const res = await queryClassStudents(classId);
      setStudents(res.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && classId) fetchStudents();
  }, [open, classId]);

  const handleRemove = async (userId: number) => {
    if (!classId) return;
    setRemovingId(userId);
    try {
      await removeClassStudent(classId, userId);
      message.success('Đã xóa học sinh khỏi khóa');
      fetchStudents();
    } catch {
      message.error('Xóa thất bại');
    } finally {
      setRemovingId(null);
    }
  };

  const enrolledIds = new Set(students.map((s) => s.id));

  return (
    <>
      <Drawer
        title={`Học sinh — ${className ?? ''}`}
        open={open}
        onClose={onClose}
        width={520}
        extra={
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setAddOpen(true)}
          >
            Thêm học sinh
          </Button>
        }
      >
        <Table<StudentOption>
          rowKey="id"
          dataSource={students}
          loading={loading}
          size="small"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          columns={[
            { title: 'Họ và tên', dataIndex: 'fullName' },
            { title: 'Tên đăng nhập', dataIndex: 'username' },
            {
              title: 'Thao tác',
              width: 100,
              render: (_, record) => (
                <Popconfirm
                  title="Xóa học sinh khỏi khóa?"
                  okText="Xóa"
                  cancelText="Hủy"
                  onConfirm={() => handleRemove(record.id)}
                >
                  <a style={{ color: '#ff4d4f' }}>
                    {removingId === record.id ? '...' : 'Xóa'}
                  </a>
                </Popconfirm>
              ),
            },
          ]}
        />
      </Drawer>

      {classId && (
        <AddStudentsModal
          classId={classId}
          open={addOpen}
          enrolledIds={enrolledIds}
          onClose={() => setAddOpen(false)}
          onSuccess={() => {
            setAddOpen(false);
            fetchStudents();
          }}
        />
      )}
    </>
  );
};

export default ManageStudentsDrawer;
