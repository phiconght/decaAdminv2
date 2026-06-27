import { Alert, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import type {
  ConflictLine,
  GeneratePreview,
  SessionPreviewLine,
} from '../schedule.data';
import { toHHmm } from '../schedule.helper';

type Props = {
  preview: GeneratePreview;
  /** true nếu có trùng ROOM/TEACHER (chặn lưu). */
  hasHardBlock: boolean;
};

const CONFLICT_LABELS: Record<string, string> = {
  ROOM: 'Phòng',
  TEACHER: 'Giáo viên',
  STUDENT: 'Học viên',
};

// Panel kết quả preview: tóm tắt + cảnh báo + bảng trùng + (tùy chọn) danh sách buổi.
const SchedulePreviewPanel: React.FC<Props> = ({ preview, hasHardBlock }) => {
  const [showSessions, setShowSessions] = useState(false);
  const { total, sessions, conflicts } = preview;

  const roomTeacherCount = conflicts.filter(
    (c) => c.type === 'ROOM' || c.type === 'TEACHER',
  ).length;
  const studentCount = conflicts.filter((c) => c.type === 'STUDENT').length;

  const conflictColumns: ColumnsType<ConflictLine> = [
    { title: 'Ngày', dataIndex: 'date', width: 110 },
    {
      title: 'Giờ',
      dataIndex: 'startTime',
      width: 80,
      render: (v: string) => toHHmm(v),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 120,
      render: (type: string) => (
        <Tag color={type === 'STUDENT' ? 'gold' : 'red'}>
          {CONFLICT_LABELS[type] ?? type}
        </Tag>
      ),
    },
    {
      title: 'Tài nguyên',
      dataIndex: 'resourceName',
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'Lớp trùng',
      dataIndex: 'conflictClassName',
      render: (v?: string) => v ?? '—',
    },
  ];

  const sessionColumns: ColumnsType<SessionPreviewLine> = [
    { title: 'Ngày', dataIndex: 'date', width: 110 },
    {
      title: 'Giờ',
      width: 130,
      render: (_, r) => `${toHHmm(r.startTime)}–${toHHmm(r.endTime)}`,
    },
    {
      title: 'Phòng',
      dataIndex: 'roomName',
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'GV',
      dataIndex: 'teacherName',
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'blocked',
      width: 100,
      render: (blocked: boolean) =>
        blocked ? <Tag color="red">Bị chặn</Tag> : <Tag color="green">OK</Tag>,
    },
  ];

  return (
    <div style={{ marginTop: 16 }}>
      <Space size="middle" wrap style={{ marginBottom: 12 }}>
        <Tag color="blue">
          Sẽ tạo <b>{total}</b> buổi
        </Tag>
        {roomTeacherCount > 0 && (
          <Tag color="red">⛔ {roomTeacherCount} trùng phòng/GV</Tag>
        )}
        {studentCount > 0 && (
          <Tag color="gold">⚠ {studentCount} cảnh báo học viên</Tag>
        )}
      </Space>

      {hasHardBlock && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 12 }}
          message="Có buổi TRÙNG PHÒNG/GV"
          description="Không thể lưu cho đến khi đổi phòng, giáo viên hoặc giờ học."
        />
      )}
      {!hasHardBlock && studentCount > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message="Có cảnh báo trùng lịch học viên"
          description="Bạn vẫn có thể lưu, nhưng nên kiểm tra lại các học viên bị trùng."
        />
      )}
      {total === 0 && conflicts.length === 0 && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          message="Không có buổi nào được tạo (toàn bộ rơi vào ngày lễ hoặc bị chặn)."
        />
      )}

      {conflicts.length > 0 && (
        <Table<ConflictLine>
          rowKey={(r) => `${r.date}-${r.startTime}-${r.type}-${r.resourceName}`}
          size="small"
          dataSource={conflicts}
          columns={conflictColumns}
          pagination={false}
          scroll={{ x: 'max-content', y: 200 }}
          style={{ marginBottom: 12 }}
        />
      )}

      {sessions.length > 0 && (
        <>
          <a onClick={() => setShowSessions((s) => !s)}>
            {showSessions ? '▾ Ẩn' : '▸ Xem'} {sessions.length} buổi sẽ tạo
          </a>
          {showSessions && (
            <Table<SessionPreviewLine>
              rowKey={(r) => `${r.date}-${r.startTime}`}
              size="small"
              dataSource={sessions}
              columns={sessionColumns}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              scroll={{ x: 'max-content' }}
              style={{ marginTop: 8 }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SchedulePreviewPanel;
