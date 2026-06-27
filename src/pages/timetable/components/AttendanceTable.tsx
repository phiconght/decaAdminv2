import { message, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import type { AttendanceItem, AttendanceStatus } from '../data';
import { queryAttendance, setAttendance } from '../service';

type Props = {
  sessionId: number;
  canEdit: boolean;
};

const STATUS_OPTIONS: { label: string; value: AttendanceStatus }[] = [
  { label: 'Chưa điểm danh', value: 'CHUA_CHECKIN' },
  { label: 'Có mặt', value: 'CO_MAT' },
  { label: 'Đi trễ', value: 'TRE' },
  { label: 'Vắng', value: 'VANG' },
  { label: 'Có phép', value: 'CO_PHEP' },
];

const STATUS_TAG: Record<AttendanceStatus, { label: string; color: string }> = {
  CHUA_CHECKIN: { label: 'Chưa điểm danh', color: 'default' },
  CO_MAT: { label: 'Có mặt', color: 'success' },
  TRE: { label: 'Đi trễ', color: 'warning' },
  VANG: { label: 'Vắng', color: 'error' },
  CO_PHEP: { label: 'Có phép', color: 'purple' },
};

const AttendanceTable: React.FC<Props> = ({ sessionId, canEdit }) => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<AttendanceItem[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);

  const fetchRows = async () => {
    setLoading(true);
    try {
      setRows(await queryAttendance(sessionId));
    } catch {
      message.error('Không tải được bảng điểm danh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleChange = async (userId: number, status: AttendanceStatus) => {
    setSavingId(userId);
    try {
      await setAttendance(sessionId, userId, status);
      setRows((prev) =>
        prev.map((r) => (r.userId === userId ? { ...r, status } : r)),
      );
      message.success('Đã cập nhật điểm danh');
    } catch {
      message.error('Cập nhật điểm danh thất bại');
    } finally {
      setSavingId(null);
    }
  };

  const columns: ColumnsType<AttendanceItem> = [
    { title: 'Họ tên', dataIndex: 'fullName' },
    { title: 'Tên đăng nhập', dataIndex: 'username', width: 140 },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      width: 130,
      render: (v) => v || '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 180,
      render: (status: AttendanceStatus, record) =>
        canEdit ? (
          <Select<AttendanceStatus>
            size="small"
            style={{ width: 160 }}
            value={status}
            options={STATUS_OPTIONS}
            loading={savingId === record.userId}
            onChange={(v) => handleChange(record.userId, v)}
          />
        ) : (
          <Tag color={STATUS_TAG[status].color}>{STATUS_TAG[status].label}</Tag>
        ),
    },
    {
      title: 'Giờ check-in',
      dataIndex: 'checkInAt',
      width: 140,
      render: (v) => (v ? dayjs(v).format('HH:mm DD/MM') : '—'),
    },
  ];

  return (
    <Table<AttendanceItem>
      rowKey="userId"
      size="small"
      loading={loading}
      dataSource={rows}
      columns={columns}
      pagination={false}
      locale={{ emptyText: 'Chưa có học viên trong buổi này' }}
    />
  );
};

export default AttendanceTable;
