import { PlusOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import {
  Alert,
  Button,
  Checkbox,
  DatePicker,
  Drawer,
  Input,
  message,
  Popconfirm,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import type {
  RoomOption,
  ScheduleItem,
  SessionDetail,
  TeacherOption,
  TopicOption,
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
  bulkAssignTopic,
  cancelSession,
  deleteSchedule,
  listSchedules,
  listSessions,
  queryRooms,
  queryTeachers,
  queryTopics,
  updateSession,
} from '../schedule.service';
import ScheduleRuleModal from './ScheduleRuleModal';
import SessionEditModal from './SessionEditModal';

type Props = {
  open: boolean;
  classId: number | null;
  className?: string;
  /** Môn của khóa — cần để nạp dropdown chuyên đề (SPEC §4.2). */
  subjectId?: number | null;
  onClose: () => void;
};

/**
 * Phạm vi bảng buổi học:
 * - 'range'  : theo khoảng ngày (mặc định 30 ngày tới) — như trước.
 * - 'all'    : TOÀN BỘ buổi của khóa, gồm cả buổi đã qua.
 * Gán chuyên đề hàng loạt chỉ an toàn ở 'all' — ở 'range' người dùng dễ tưởng
 * đã gán cả khóa trong khi bảng chỉ hiện một cửa sổ (SPEC §4.2 mục 0).
 */
type SessionScope = 'range' | 'all';

const ClassScheduleDrawer: React.FC<Props> = ({
  open,
  classId,
  className,
  subjectId,
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
  const [scope, setScope] = useState<SessionScope>('range');

  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [topics, setTopics] = useState<TopicOption[]>([]);

  // Gán chuyên đề hàng loạt
  const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);
  const [bulkTopicId, setBulkTopicId] = useState<number | undefined>();
  const [bulkSaving, setBulkSaving] = useState(false);
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);

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
      // scope 'all' -> KHÔNG truyền from/to = lấy toàn bộ buổi của khóa.
      const res =
        scope === 'all'
          ? await listSessions(classId)
          : await listSessions(
              classId,
              from.format('YYYY-MM-DD'),
              to.format('YYYY-MM-DD'),
            );
      setSessions(res.data ?? []);
      setSelectedIds([]);
    } catch {
      messageApi.error('Không tải được danh sách buổi.');
    } finally {
      setSessionsLoading(false);
    }
  }, [classId, from, to, scope, messageApi]);

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

  // Đổi phạm vi -> tải lại bảng buổi.
  useEffect(() => {
    if (!open || classId == null) return;
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  // Chuyên đề theo môn của khóa (dropdown gán).
  useEffect(() => {
    if (!open || subjectId == null) {
      setTopics([]);
      return;
    }
    queryTopics(subjectId).then(setTopics);
  }, [open, subjectId]);

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

  // --- Gán / gỡ chuyên đề hàng loạt ---
  const handleBulkTopic = async (topicId: number | null) => {
    if (classId == null || selectedIds.length === 0) return;
    setBulkSaving(true);
    try {
      const ids = selectedIds.map(Number);
      await bulkAssignTopic(classId, ids, topicId);
      messageApi.success(
        topicId == null
          ? `Đã gỡ chuyên đề khỏi ${ids.length} buổi.`
          : `Đã gán chuyên đề cho ${ids.length} buổi.`,
      );
      setSelectedIds([]);
      setBulkTopicId(undefined);
      fetchSessions();
    } catch {
      messageApi.error('Không gán được chuyên đề.');
    } finally {
      setBulkSaving(false);
    }
  };

  // Sửa tên buổi inline (không đụng chuyên đề — SPEC §3.4a).
  const handleRenameSession = async (r: SessionDetail, value: string) => {
    const next = value.trim();
    if (next === (r.title ?? '')) return;
    try {
      await updateSession(r.id, { title: next });
      setSessions((prev) =>
        prev.map((s) => (s.id === r.id ? { ...s, title: next || null } : s)),
      );
    } catch {
      messageApi.error('Không lưu được tên buổi.');
    }
  };

  // Bảng đang hiển thị (áp bộ lọc "chưa gán chuyên đề").
  const visibleSessions = onlyUnassigned
    ? sessions.filter((s) => s.topicId == null)
    : sessions;
  const assignedCount = sessions.filter((s) => s.topicId != null).length;

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
      title: 'Chuyên đề',
      dataIndex: 'topicName',
      width: 190,
      render: (v?: string | null) =>
        v ? (
          <span>{v}</span>
        ) : (
          <Tag color="default" style={{ opacity: 0.65 }}>
            Chưa gán
          </Tag>
        ),
    },
    {
      title: 'Tên buổi',
      dataIndex: 'title',
      width: 220,
      render: (v: string | null | undefined, r) =>
        canWrite ? (
          <Typography.Text
            editable={{
              onChange: (val) => handleRenameSession(r, val),
              tooltip: 'Sửa tên buổi',
              triggerType: ['text', 'icon'],
            }}
            type={v ? undefined : 'secondary'}
            style={{ marginBottom: 0 }}
          >
            {v ?? ''}
          </Typography.Text>
        ) : (
          (v ?? '—')
        ),
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

        {/* Khối B: Buổi học */}
        <ProCard
          title={scope === 'all' ? 'Buổi học (toàn khóa)' : 'Buổi sắp tới'}
          extra={
            <Space wrap>
              <Segmented<SessionScope>
                value={scope}
                onChange={setScope}
                options={[
                  { label: '30 ngày tới', value: 'range' },
                  { label: 'Toàn khóa', value: 'all' },
                ]}
              />
              {scope === 'range' && (
                <>
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
                </>
              )}
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
          {canWrite && (
            <Space
              wrap
              style={{ marginBottom: 12, width: '100%' }}
              size="middle"
            >
              <span>
                Đã gán chuyên đề: <b>{assignedCount}</b>/{sessions.length} buổi
              </span>
              <Checkbox
                checked={onlyUnassigned}
                onChange={(e) => {
                  // Bỏ chọn khi đổi bộ lọc: nếu giữ, các dòng đã chọn nhưng
                  // bị ẩn vẫn bị gán -> người dùng không thấy mà vẫn bị đổi.
                  setSelectedIds([]);
                  setOnlyUnassigned(e.target.checked);
                }}
              >
                Chỉ hiện buổi chưa gán
              </Checkbox>
            </Space>
          )}

          {/* Cảnh báo phạm vi: ở chế độ lọc ngày, bảng CHỈ là một cửa sổ —
              không được để người dùng tưởng đang thao tác trên cả khóa. */}
          {canWrite && scope === 'range' && selectedIds.length > 0 && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
              message={`Đang lọc theo ngày — chỉ gán cho ${selectedIds.length} buổi đang hiển thị.`}
              description="Chuyển sang “Toàn khóa” nếu muốn gán cho cả khóa học (gồm các buổi đã qua)."
            />
          )}

          {canWrite && selectedIds.length > 0 && (
            <Alert
              type="info"
              style={{ marginBottom: 12 }}
              message={
                <Space wrap>
                  <span>
                    Đã chọn <b>{selectedIds.length}</b> buổi
                  </span>
                  <Select<number>
                    placeholder="Chọn chuyên đề"
                    style={{ minWidth: 220 }}
                    value={bulkTopicId}
                    onChange={setBulkTopicId}
                    options={topics.map((t) => ({
                      label: t.name,
                      value: t.id,
                    }))}
                    showSearch
                    optionFilterProp="label"
                    notFoundContent="Môn học chưa có chuyên đề"
                  />
                  <Button
                    type="primary"
                    loading={bulkSaving}
                    disabled={bulkTopicId == null}
                    onClick={() => handleBulkTopic(bulkTopicId ?? null)}
                  >
                    Gán
                  </Button>
                  <Popconfirm
                    title="Gỡ chuyên đề"
                    description={`Gỡ chuyên đề khỏi ${selectedIds.length} buổi đã chọn?`}
                    okText="Gỡ"
                    cancelText="Đóng"
                    onConfirm={() => handleBulkTopic(null)}
                  >
                    <Button danger loading={bulkSaving}>
                      Gỡ chuyên đề
                    </Button>
                  </Popconfirm>
                  <Button type="link" onClick={() => setSelectedIds([])}>
                    Bỏ chọn
                  </Button>
                </Space>
              }
            />
          )}

          <Table<SessionDetail>
            rowKey="id"
            size="small"
            loading={sessionsLoading}
            dataSource={visibleSessions}
            columns={sessionColumns}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: 'max-content' }}
            rowSelection={
              canWrite
                ? {
                    selectedRowKeys: selectedIds,
                    onChange: setSelectedIds,
                    // Buổi đã hủy: gán chuyên đề không có ý nghĩa.
                    getCheckboxProps: (r) => ({
                      disabled: r.status === 'CANCELLED',
                    }),
                  }
                : undefined
            }
            locale={{
              emptyText:
                scope === 'all'
                  ? 'Khóa học chưa có buổi nào.'
                  : 'Không có buổi trong khoảng đã chọn.',
            }}
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
