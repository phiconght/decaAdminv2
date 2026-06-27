import { Input, Modal, message, Table } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { StudentOption } from '../data';
import { addClassStudents, queryEligibleStudents } from '../service';

type Props = {
  classId: number;
  open: boolean;
  enrolledIds: Set<number>;
  onClose: () => void;
  onSuccess: () => void;
};

const AddStudentsModal: React.FC<Props> = ({
  classId,
  open,
  enrolledIds,
  onClose,
  onSuccess,
}) => {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [keyword, setKeyword] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchStudents = async (kw: string) => {
    setLoading(true);
    try {
      const res = await queryEligibleStudents(classId, kw || undefined);
      setStudents(res.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setSelectedIds([]);
      setKeyword('');
      fetchStudents('');
    }
  }, [open, classId]);

  const handleSearch = (value: string) => {
    setKeyword(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchStudents(value), 300);
  };

  const handleOk = async () => {
    const toAdd = selectedIds.filter((id) => !enrolledIds.has(id));
    if (toAdd.length === 0) {
      message.warning('Chưa chọn học sinh nào');
      return;
    }
    setSubmitting(true);
    try {
      await addClassStudents(classId, toAdd);
      message.success(`Đã thêm ${toAdd.length} học sinh`);
      onSuccess();
      onClose();
    } catch {
      message.error('Thêm học sinh thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Thêm học sinh vào khóa"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Thêm"
      cancelText="Hủy"
      confirmLoading={submitting}
      width={560}
    >
      <Input.Search
        placeholder="Tìm theo họ tên, tên đăng nhập"
        value={keyword}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ marginBottom: 12 }}
        allowClear
      />
      <Table<StudentOption>
        rowKey="id"
        dataSource={students}
        loading={loading}
        size="small"
        pagination={{ pageSize: 8, showSizeChanger: false }}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: (keys) => setSelectedIds(keys as number[]),
          getCheckboxProps: (record) => ({
            disabled: enrolledIds.has(record.id),
          }),
        }}
        columns={[
          { title: 'Họ và tên', dataIndex: 'fullName' },
          { title: 'Tên đăng nhập', dataIndex: 'username' },
        ]}
      />
    </Modal>
  );
};

export default AddStudentsModal;
