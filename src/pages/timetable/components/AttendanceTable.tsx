import { useAccess } from '@umijs/max';
import { Button, message, Select, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import type { AttendanceItem, AttendanceStatus } from '../data';
import { confirmAttendance, queryAttendance, setAttendance } from '../service';

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
  const access = useAccess();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<AttendanceItem[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

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

  const handleConfirm = async (userId: number) => {
    setConfirmingId(userId);
    try {
      await confirmAttendance(sessionId, userId);
      setRows((prev) =>
        prev.map((r) =>
          r.userId === userId
            ? { ...r, confirmed: true, confirmedAt: new Date().toISOString() }
            : r,
        ),
      );
      message.success('Đã xác nhận điểm danh');
    } catch {
      message.error('Xác nhận điểm danh thất bại');
    } finally {
      setConfirmingId(null);
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
    {
      // Bắt buộc trước khi tính vào báo cáo (yêu cầu người dùng 13/08/2026).
      title: 'Xác nhận',
      dataIndex: 'confirmed',
      width: 170,
      render: (_, record) =>
        record.confirmedAt ? (
          <Tooltip
            title={
              record.confirmedByName
                ? `${record.confirmedByName} lúc ${dayjs(record.confirmedAt).format('HH:mm DD/MM')}`
                : undefined
            }
          >
            <Tag color="success">Đã xác nhận</Tag>
          </Tooltip>
        ) : access.canConfirmAttendance ? (
          <Button
            size="small"
            loading={confirmingId === record.userId}
            onClick={() => handleConfirm(record.userId)}
          >
            Xác nhận
          </Button>
        ) : (
          <Tag>Chưa xác nhận</Tag>
        ),
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
