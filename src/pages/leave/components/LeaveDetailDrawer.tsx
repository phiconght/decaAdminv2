import { Button, Descriptions, Drawer, Popconfirm, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { LeaveItem } from '../data';

const STATUS_META: Record<
  LeaveItem['status'],
  { label: string; color: string }
> = {
  PENDING: { label: 'Chờ duyệt', color: 'processing' },
  APPROVED: { label: 'Đã duyệt', color: 'success' },
  REJECTED: { label: 'Từ chối', color: 'error' },
};

const fmtDate = (v?: string) => (v ? dayjs(v).format('DD/MM/YYYY') : '—');
const fmtDateTime = (v?: string) =>
  v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—';

type Props = {
  record: LeaveItem | null;
  open: boolean;
  onClose: () => void;
  canApprove: boolean;
  isAdmin: boolean;
  onApprove: (record: LeaveItem) => void;
  onReject: (record: LeaveItem) => void;
  onAdminSetStatus: (record: LeaveItem, status: LeaveItem['status']) => void;
};

// Drawer chi tiết đơn nghỉ (read-only). Footer có Duyệt/Từ chối khi PENDING + có quyền.
// Duyệt (GV/nhân viên) BAT BUOC PH da xac nhan truoc; ADMIN bo qua dieu kien
// nay va co them nut "Dat trang thai" (yeu cau nguoi dung 13/08/2026).
const LeaveDetailDrawer: React.FC<Props> = ({
  record,
  open,
  onClose,
  canApprove,
  isAdmin,
  onApprove,
  onReject,
  onAdminSetStatus,
}) => {
  if (!record) {
    return <Drawer title="Chi tiết đơn nghỉ" open={open} onClose={onClose} />;
  }

  const meta = STATUS_META[record.status];
  const isPending = record.status === 'PENDING';
  const needsParentConfirm = !record.parentConfirmedBy;

  const items = [
    { key: 'student', label: 'Học viên', children: record.studentName },
    {
      key: 'scope',
      label: 'Phạm vi',
      children: record.scope === 'SESSION' ? 'Một buổi' : 'Khoảng ngày',
    },
    {
      key: 'class',
      label: 'Lớp',
      children: record.className || 'Tất cả lớp',
    },
    {
      key: 'period',
      label: record.scope === 'SESSION' ? 'Buổi' : 'Khoảng',
      children:
        record.scope === 'SESSION'
          ? fmtDate(record.sessionDate)
          : `${fmtDate(record.dateFrom)} → ${fmtDate(record.dateTo)}`,
    },
    { key: 'reason', label: 'Lý do', children: record.reason || '—' },
    {
      key: 'status',
      label: 'Trạng thái',
      children: <Tag color={meta.color}>{meta.label}</Tag>,
    },
    {
      key: 'parentConfirm',
      label: 'Phụ huynh xác nhận',
      children: record.parentConfirmedBy ? (
        <Tag color="success">
          {record.parentConfirmedBy} — {fmtDateTime(record.parentConfirmedAt)}
        </Tag>
      ) : (
        <Tag>Chưa xác nhận</Tag>
      ),
    },
    {
      key: 'reviewer',
      label: 'Người duyệt',
      children: record.reviewedBy
        ? `${record.reviewedBy} — ${fmtDateTime(record.reviewedAt)}`
        : '—',
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      children: fmtDateTime(record.createdAt),
    },
  ];

  return (
    <Drawer
      title={`Chi tiết đơn nghỉ #${record.id}`}
      open={open}
      onClose={onClose}
      footer={
        (canApprove && isPending) || isAdmin ? (
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {canApprove && isPending ? (
              <>
                <Popconfirm
                  title={`Từ chối đơn nghỉ của ${record.studentName}?`}
                  okText="Từ chối"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => onReject(record)}
                >
                  <Button danger>Từ chối</Button>
                </Popconfirm>
                {!isAdmin && needsParentConfirm ? (
                  <Button
                    type="primary"
                    disabled
                    title="Cần phụ huynh xác nhận trước"
                  >
                    Duyệt
                  </Button>
                ) : (
                  <Popconfirm
                    title={`Duyệt đơn nghỉ của ${record.studentName}?`}
                    okText="Duyệt"
                    cancelText="Hủy"
                    onConfirm={() => onApprove(record)}
                  >
                    <Button type="primary">Duyệt</Button>
                  </Popconfirm>
                )}
              </>
            ) : null}
            {isAdmin ? (
              <Popconfirm
                title={`Đổi trạng thái đơn nghỉ của ${record.studentName}?`}
                okText="Duyệt"
                cancelText="Từ chối"
                onConfirm={() => onAdminSetStatus(record, 'APPROVED')}
                onCancel={() => onAdminSetStatus(record, 'REJECTED')}
              >
                <Button>Đặt trạng thái (Admin)</Button>
              </Popconfirm>
            ) : null}
          </Space>
        ) : null
      }
    >
      <Descriptions column={1} bordered size="small" items={items} />
    </Drawer>
  );
};

export default LeaveDetailDrawer;
