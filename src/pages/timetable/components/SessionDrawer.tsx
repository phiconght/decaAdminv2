import { QrcodeOutlined, SolutionOutlined } from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import { Alert, Button, Descriptions, Drawer, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import type { SessionStatus, TimetableItem } from '../data';
import { getCancelReason } from '../service';
import AttendanceTable from './AttendanceTable';
import QrModal from './QrModal';

type Props = {
  item: TimetableItem | null;
  open: boolean;
  onClose: () => void;
};

const STATUS_TAG: Record<SessionStatus, { label: string; color: string }> = {
  PLANNED: { label: 'Đã lên lịch', color: 'processing' },
  DONE: { label: 'Đã dạy', color: 'default' },
  CANCELLED: { label: 'Đã hủy', color: 'error' },
};

const VI_DOW_FULL = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
];

const hhmm = (t: string): string => t.slice(0, 5);

const SessionDrawer: React.FC<Props> = ({ item, open, onClose }) => {
  const access = useAccess();
  const canRead = access.canReadClass;
  const canWrite = access.canWriteClass;
  const [showAttendance, setShowAttendance] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<string | null>(null);

  // Reset trạng thái nội bộ mỗi khi đổi buổi.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setShowAttendance(false);
    setCancelReason(null);
    if (item && item.status === 'CANCELLED') {
      getCancelReason(item.classId, item.sessionId, item.date)
        .then(setCancelReason)
        .catch(() => setCancelReason(null));
    }
  }, [item?.sessionId]);

  if (!item) {
    return <Drawer title="Chi tiết buổi học" open={open} onClose={onClose} />;
  }

  const cancelled = item.status === 'CANCELLED';
  const title = `${item.subjectName ?? item.className}${item.gradeLevel ? ` ${item.gradeLevel}` : ''}`;
  const d = dayjs(item.date);
  const durationMin = dayjs(`2000-01-01T${item.endTime}`).diff(
    dayjs(`2000-01-01T${item.startTime}`),
    'minute',
  );

  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      destroyOnHidden
      extra={
        <Tag color={STATUS_TAG[item.status].color}>
          {STATUS_TAG[item.status].label}
        </Tag>
      }
    >
      {cancelled && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          title="Buổi học đã bị hủy"
          description={cancelReason ? `Lý do: ${cancelReason}` : undefined}
        />
      )}
      <Descriptions
        column={1}
        bordered
        size="small"
        items={[
          {
            key: 'class',
            label: 'Khóa học',
            children: item.className,
          },
          {
            key: 'date',
            label: 'Ngày',
            children: `${VI_DOW_FULL[d.day()]}, ${d.format('DD/MM/YYYY')}`,
          },
          {
            key: 'time',
            label: 'Giờ',
            children: `${hhmm(item.startTime)} – ${hhmm(item.endTime)} (${durationMin} phút)`,
          },
          {
            key: 'room',
            label: 'Phòng',
            children: item.roomName
              ? `${item.roomName}${item.branchName ? ` — ${item.branchName}` : ''}`
              : 'Chưa xếp phòng',
          },
          {
            key: 'teacher',
            label: 'Giáo viên',
            children: item.teacherName ?? '—',
          },
        ]}
      />

      {!cancelled && canRead && (
        <Space style={{ marginTop: 16 }}>
          <Button
            icon={<SolutionOutlined />}
            type={showAttendance ? 'primary' : 'default'}
            onClick={() => setShowAttendance((v) => !v)}
          >
            Điểm danh
          </Button>
          <Button icon={<QrcodeOutlined />} onClick={() => setQrOpen(true)}>
            Hiện QR
          </Button>
        </Space>
      )}

      {showAttendance && canRead && (
        <div style={{ marginTop: 16 }}>
          <AttendanceTable sessionId={item.sessionId} canEdit={canWrite} />
        </div>
      )}

      <QrModal
        sessionId={qrOpen ? item.sessionId : null}
        open={qrOpen}
        onClose={() => setQrOpen(false)}
      />
    </Drawer>
  );
};

export default SessionDrawer;
