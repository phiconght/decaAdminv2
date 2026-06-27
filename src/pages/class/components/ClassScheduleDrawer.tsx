import { PlusOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import {
  Button,
  DatePicker,
  Drawer,
  Input,
  message,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import type {
  RoomOption,
  ScheduleItem,
  SessionDetail,
  TeacherOption,
} from '../schedule.data';
import {
  DOW_LABELS,
  RECURRENCE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  sessionDayLabel,
  toHHmm,
} from '../schedule.helper';
import {
  cancelSession,
  deleteSchedule,
  listSchedules,
  listSessions,
  queryRooms,
  queryTeachers,
} from '../schedule.service';
import ScheduleRuleModal from './ScheduleRuleModal';
import SessionEditModal from './SessionEditModal';

type Props = {
  open: boolean;
  classId: number | null;
  className?: string;
  onClose: () => void;
};

const ClassScheduleDrawer: React.FC<Props> = ({
  open,
  classId,
  className,
  onClose,
}) => {
  const access = useAccess();
  const canWrite = access.canWriteClass;
  const [messageApi, contextHolder] = message.useMessage();

  const [rules, setRules] = useState<ScheduleItem[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionDetail[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const [from, setFrom] = useState<dayjs.Dayjs>(dayjs());
  const [to, setTo] = useState<dayjs.Dayjs>(dayjs().add(30, 'day'));

  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);

  // Modal quy tắc
  const [ruleOpen, setRuleOpen] = useState(false);
  const [editRule, setEditRule] = useState<ScheduleItem | null>(null);
  // Modal buổi
  const [sessionModal, setSessionModal] = useState<{
    mode: 'edit' | 'create';
    session: SessionDetail | null;
  } | null>(null);

  // Lý do hủy buổi (Popconfirm có TextArea)
  const [cancelReason, setCancelReason] = useState('');

  const fetchRules = useCallback(async () => {
    if (classId == null) return;
    setRulesLoading(true);
    try {
      const res = await listSchedules(classId);
      setRules(res.data ?? []);
    } catch {
      messageApi.error('Không tải được quy tắc lịch.');
    } finally {
      setRulesLoading(false);
    }
  }, [classId, messageApi]);

  const fetchSessions = useCallback(async () => {
    if (classId == null) return;
    setSessionsLoading(true);
    try {
      const res = await listSessions(
        classId,
        from.format('YYYY-MM-DD'),
        to.format('YYYY-MM-DD'),
      );
      setSessions(res.data ?? []);
    } catch {
      messageApi.error('Không tải được danh sách buổi.');
    } finally {
      setSessionsLoading(false);
    }
  }, [classId, from, to, messageApi]);

  // Mở drawer: nạp options + 2 bảng.
  useEffect(() => {
    if (!open || classId == null) return;
    fetchRules();
    fetchSessions();
    queryRooms().then(setRooms);
    queryTeachers().then(setTeachers);
    // chỉ chạy khi open/classId đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, classId]);

  const handleDeleteRule = async (id: number) => {
    try {
      await deleteSchedule(id);
      messageApi.success('Đã xóa quy tắc.');
      fetchRules();
      fetchSessions();
    } catch {
      messageApi.error('Không xóa được quy tắc.');
    }
  };

  const handleCancelSession = async (id: number) => {
    const reason = cancelReason.trim();
    if (!reason) {
      messageApi.error('Vui lòng nhập lý do hủy.');
      return Promise.reject();
    }
    try {
      await cancelSession(id, reason);
      messageApi.success('Đã hủy buổi.');
      setCancelReason('');
      fetchSessions();
    } catch {
      messageApi.error('Không hủy được buổi.');
    }
  };

  // --- Cột bảng quy tắc (A) ---
  const ruleColumns: ColumnsType<ScheduleItem> = [
    {
      title: 'Loại',
      dataIndex: 'recurrenceType',
      width: 110,
      render: (v: ScheduleItem['recurrenceType']) => (
        <Tag>{RECURRENCE_LABELS[v]}</Tag>
      ),
    },
    {
      title: 'Thứ/Ngày',
      width: 130,
      render: (_, r) => {
        if (r.recurrenceType === 'WEEKLY')
          return r.dayOfWeek ? DOW_LABELS[r.dayOfWeek] : '—';
        if (r.recurrenceType === 'ONCE')
          return dayjs(r.startDate).format('DD/MM/YYYY');
        return 'Mỗi ngày';
      },
    },
    {
      title: 'Giờ BĐ',
      dataIndex: 'startTime',
      width: 80,
      render: (v: string) => toHHmm(v),
    },
    {
      title: 'T.lượng',
      dataIndex: 'durationMinutes',
      width: 90,
      render: (v: number) => `${v}'`,
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
      title: 'Hiệu lực',
      width: 160,
      render: (_, r) => (
        <Space size={4}>
          <span>
            {dayjs(r.startDate).format('DD/MM')}
            {r.endDate ? `–${dayjs(r.endDate).format('DD/MM')}` : ''}
          </span>
          {!r.active && <Tag color="default">Tắt</Tag>}
        </Space>
      ),
    },
    ...(canWrite
      ? [
          {
            title: 'Thao tác',
            key: 'option',
            width: 110,
            render: (_: unknown, r: ScheduleItem) => (
              <Space size="small">
                <a
                  onClick={() => {
                    setEditRule(r);
                    setRuleOpen(true);
                  }}
                >
                  Sửa
                </a>
                <Popconfirm
                  title="Xóa quy tắc này?"
                  description="Các buổi tương lai (dự kiến, không phải buổi bù) gắn quy tắc có thể bị xóa."
                  okText="Xóa"
                  cancelText="Hủy"
                  onConfirm={() => handleDeleteRule(r.id)}
                >
                  <a style={{ color: '#ff4d4f' }}>Xóa</a>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  // --- Cột bảng buổi (B) ---
  const sessionColumns: ColumnsType<SessionDetail> = [
    {
      title: 'Ngày',
      width: 130,
      render: (_, r) => (
        <Space size={4}>
          <span>{sessionDayLabel(r.sessionDate)}</span>
          {r.isManual && <Tag color="gold">Bù</Tag>}
        </Space>
      ),
    },
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
      dataIndex: 'status',
      width: 120,
      render: (status: SessionDetail['status'], r) => {
        const tag = (
          <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>
        );
        return status === 'CANCELLED' && r.cancelReason ? (
          <Tooltip title={r.cancelReason}>{tag}</Tooltip>
        ) : (
          tag
        );
      },
    },
    ...(canWrite
      ? [
          {
            title: 'Thao tác',
            key: 'option',
            width: 140,
            render: (_: unknown, r: SessionDetail) => {
              const disableEdit = r.status !== 'PLANNED';
              const disableCancel = r.status !== 'PLANNED';
              return (
                <Space size="small">
                  {disableEdit ? (
                    <span style={{ color: '#bfbfbf' }}>Sửa</span>
                  ) : (
                    <a
                      onClick={() =>
                        setSessionModal({ mode: 'edit', session: r })
                      }
                    >
                      Sửa
                    </a>
                  )}
                  {disableCancel ? (
                    <span style={{ color: '#bfbfbf' }}>Hủy</span>
                  ) : (
                    <Popconfirm
                      title="Hủy buổi học"
                      okText="Xác nhận hủy"
                      cancelText="Đóng"
                      icon={null}
                      description={
                        <Input.TextArea
                          rows={2}
                          placeholder="Nhập lý do hủy (bắt buộc)"
                          style={{ width: 240 }}
                          onChange={(e) => setCancelReason(e.target.value)}
                        />
                      }
                      onOpenChange={(o) => {
                        if (o) setCancelReason('');
                      }}
                      onConfirm={() => handleCancelSession(r.id)}
                    >
                      <a style={{ color: '#ff4d4f' }}>Hủy</a>
                    </Popconfirm>
                  )}
                </Space>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <>
      {contextHolder}
      <Drawer
        title={`Lịch học — ${className ?? ''}`}
        open={open}
        onClose={onClose}
        destroyOnHidden
      >
        {/* Khối A: Quy tắc lịch */}
        <ProCard
          title="Quy tắc lịch"
          style={{ marginBottom: 16 }}
          extra={
            canWrite ? (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditRule(null);
                  setRuleOpen(true);
                }}
              >
                Thêm lịch
              </Button>
            ) : undefined
          }
        >
          <Table<ScheduleItem>
            rowKey="id"
            size="small"
            loading={rulesLoading}
            dataSource={rules}
            columns={ruleColumns}
            pagination={false}
            scroll={{ x: 'max-content' }}
            locale={{
              emptyText: 'Chưa có quy tắc lịch. Bấm + Thêm lịch để bắt đầu.',
            }}
          />
        </ProCard>

        {/* Khối B: Buổi sắp tới */}
        <ProCard
          title="Buổi sắp tới"
          extra={
            <Space wrap>
              <DatePicker
                value={from}
                format="DD/MM/YYYY"
                allowClear={false}
                onChange={(d) => d && setFrom(d)}
              />
              <DatePicker
                value={to}
                format="DD/MM/YYYY"
                allowClear={false}
                onChange={(d) => d && setTo(d)}
              />
              <Button onClick={fetchSessions}>Làm mới</Button>
              {canWrite && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    setSessionModal({ mode: 'create', session: null })
                  }
                >
                  Thêm buổi bù
                </Button>
              )}
            </Space>
          }
        >
          <Table<SessionDetail>
            rowKey="id"
            size="small"
            loading={sessionsLoading}
            dataSource={sessions}
            columns={sessionColumns}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'Không có buổi trong khoảng đã chọn.' }}
          />
        </ProCard>
      </Drawer>

      {classId != null && (
        <ScheduleRuleModal
          open={ruleOpen}
          classId={classId}
          editItem={editRule}
          rooms={rooms}
          teachers={teachers}
          onClose={() => {
            setRuleOpen(false);
            setEditRule(null);
          }}
          onSaved={() => {
            setRuleOpen(false);
            setEditRule(null);
            fetchRules();
            fetchSessions();
          }}
        />
      )}

      {classId != null && sessionModal && (
        <SessionEditModal
          open={!!sessionModal}
          classId={classId}
          mode={sessionModal.mode}
          session={sessionModal.session}
          rooms={rooms}
          teachers={teachers}
          onClose={() => setSessionModal(null)}
          onSaved={() => {
            setSessionModal(null);
            fetchSessions();
          }}
        />
      )}
    </>
  );
};

export default ClassScheduleDrawer;
