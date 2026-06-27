import { useAccess } from '@umijs/max';
import {
  Button,
  Descriptions,
  Divider,
  Drawer,
  message,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import type { GuardianRelationship, RelativeItem } from '@/pages/student/data';
import TimetableDrawer from '@/pages/timetable/components/TimetableDrawer';
import { queryUserOptions } from '@/pages/timetable/service';
import type { UserDetail, UserStatus } from '../data';
import {
  deleteParent,
  getParentDetail,
  linkChild,
  listChildren,
  unlinkChild,
  updateParentStatus,
} from '../service';
import ParentForm from './ParentForm';
import ResetPasswordModal from './ResetPasswordModal';

type Props = {
  open: boolean;
  onClose: () => void;
  parentId?: number;
  parentName?: string;
  /** gọi khi có thay đổi (đổi trạng thái / xóa / sửa) để bảng cha reload. */
  onChanged?: () => void;
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'success',
  DISABLED: 'default',
  LOCKED: 'error',
};

const REL_OPTIONS: { label: string; value: GuardianRelationship }[] = [
  { label: 'Bố', value: 'FATHER' },
  { label: 'Mẹ', value: 'MOTHER' },
  { label: 'Người giám hộ', value: 'GUARDIAN' },
  { label: 'Khác', value: 'OTHER' },
];
const REL_LABEL: Record<GuardianRelationship, string> = {
  FATHER: 'Bố',
  MOTHER: 'Mẹ',
  GUARDIAN: 'Người giám hộ',
  OTHER: 'Khác',
};
const REL_COLOR: Record<GuardianRelationship, string> = {
  FATHER: 'blue',
  MOTHER: 'magenta',
  GUARDIAN: 'gold',
  OTHER: 'default',
};

type StudentOption = { label: string; value: number };

const ParentInfoDrawer: React.FC<Props> = ({
  open,
  onClose,
  parentId,
  parentName,
  onChanged,
}) => {
  const access = useAccess();
  const canWrite = access.canWriteUser;
  const [messageApi, contextHolder] = message.useMessage();

  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [children, setChildren] = useState<RelativeItem[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(false);

  // thêm con
  const [options, setOptions] = useState<StudentOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(
    null,
  );
  const [relationship, setRelationship] = useState<GuardianRelationship | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const searchSeq = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // tác vụ quản trị
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  // xem thông tin / lịch học của con
  const [childInfo, setChildInfo] = useState<RelativeItem | null>(null);
  const [childDetail, setChildDetail] = useState<UserDetail | null>(null);
  const [childDetailLoading, setChildDetailLoading] = useState(false);
  const [childScheduleFor, setChildScheduleFor] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const fetchDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await getParentDetail(id);
      setDetail(res.data);
    } catch {
      messageApi.error('Không tải được thông tin phụ huynh');
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchChildren = async (id: number) => {
    setChildrenLoading(true);
    try {
      const res = await listChildren(id);
      setChildren(res.data ?? []);
    } catch {
      messageApi.error('Không tải được danh sách con');
    } finally {
      setChildrenLoading(false);
    }
  };

  useEffect(() => {
    if (open && parentId != null) {
      setSelectedStudent(null);
      setRelationship(null);
      setOptions([]);
      fetchDetail(parentId);
      fetchChildren(parentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, parentId]);

  // nạp chi tiết con khi mở drawer con
  useEffect(() => {
    if (childInfo == null) {
      setChildDetail(null);
      return;
    }
    setChildDetailLoading(true);
    getParentDetail(childInfo.id)
      .then((res) => setChildDetail(res.data))
      .catch(() => setChildDetail(null))
      .finally(() => setChildDetailLoading(false));
  }, [childInfo]);

  const handleSearchStudent = (kw: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      const seq = ++searchSeq.current;
      setOptionsLoading(true);
      try {
        const res = await queryUserOptions('STUDENT', kw.trim() || undefined);
        if (seq !== searchSeq.current) return;
        setOptions(res);
      } catch {
        if (seq === searchSeq.current) setOptions([]);
      } finally {
        if (seq === searchSeq.current) setOptionsLoading(false);
      }
    }, 300);
  };

  const handleAddChild = async () => {
    if (!selectedStudent || parentId == null) return;
    setSubmitting(true);
    try {
      await linkChild(selectedStudent.value, parentId, relationship);
      messageApi.success('Đã thêm con');
      setSelectedStudent(null);
      setRelationship(null);
      setOptions([]);
      fetchChildren(parentId);
      onChanged?.();
    } catch (err) {
      const code = (
        err as { response?: { data?: { error?: { code?: string } } } }
      )?.response?.data?.error?.code;
      if (code === 'NOT_A_STUDENT') {
        messageApi.error('Đối tượng không phải học viên');
      } else if (code === 'NOT_A_PARENT') {
        messageApi.error('Tài khoản này không phải phụ huynh');
      }
      // còn lại để global handler
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveChild = async (childId: number) => {
    if (parentId == null) return;
    try {
      await unlinkChild(childId, parentId);
      messageApi.success('Đã gỡ con');
      fetchChildren(parentId);
      onChanged?.();
    } catch {
      // global handler
    }
  };

  const handleStatus = async (status: UserStatus) => {
    if (parentId == null) return;
    try {
      await updateParentStatus(parentId, status);
      fetchDetail(parentId);
      onChanged?.();
    } catch {
      // global handler
    }
  };

  const handleDelete = async () => {
    if (parentId == null) return;
    try {
      await deleteParent(parentId);
      messageApi.success('Đã vô hiệu hóa phụ huynh');
      onChanged?.();
      onClose();
    } catch {
      // global handler
    }
  };

  const childColumns: ColumnsType<RelativeItem> = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      render: (val: string, record) => (
        <a onClick={() => setChildInfo(record)}>{val || record.username}</a>
      ),
    },
    { title: 'Tên đăng nhập', dataIndex: 'username', width: 140 },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      width: 130,
      render: (val: string) => val || '—',
    },
    {
      title: 'Quan hệ',
      dataIndex: 'relationship',
      width: 130,
      render: (val: GuardianRelationship | null) =>
        val ? (
          <Tag color={REL_COLOR[val] ?? 'default'}>
            {REL_LABEL[val] ?? 'Khác'}
          </Tag>
        ) : (
          <Tag>Chưa rõ</Tag>
        ),
    },
  ];
  if (canWrite) {
    childColumns.push({
      title: 'Tác vụ',
      key: 'option',
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="Gỡ con này khỏi phụ huynh?"
          okText="Gỡ"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={() => handleRemoveChild(record.id)}
        >
          <a style={{ color: '#ff4d4f' }}>Gỡ</a>
        </Popconfirm>
      ),
    });
  }

  const status = detail?.status;

  return (
    <>
      {contextHolder}
      <Drawer
        title={`Thông tin — ${parentName ?? ''}`}
        open={open}
        onClose={onClose}
        destroyOnHidden
      >
        {/* ---- Khối A: thông tin phụ huynh ---- */}
        <Spin spinning={detailLoading}>
          <Descriptions
            column={1}
            size="small"
            bordered
            items={[
              {
                key: 'u',
                label: 'Tên đăng nhập',
                children: detail?.username ?? '—',
              },
              { key: 'n', label: 'Họ tên', children: detail?.fullName ?? '—' },
              { key: 'e', label: 'Email', children: detail?.email || '—' },
              {
                key: 'p',
                label: 'Số điện thoại',
                children: detail?.phone || '—',
              },
              {
                key: 's',
                label: 'Trạng thái',
                children: status ? (
                  <Tag color={STATUS_COLOR[status] ?? 'default'}>{status}</Tag>
                ) : (
                  '—'
                ),
              },
              {
                key: 'r',
                label: 'Vai trò',
                children: detail?.roles?.join(', ') ?? '—',
              },
              {
                key: 'c',
                label: 'Ngày tạo',
                children: detail?.createdAt
                  ? dayjs(detail.createdAt).format('DD/MM/YYYY')
                  : '—',
              },
            ]}
          />
        </Spin>

        {canWrite && (
          <Space wrap style={{ marginTop: 12 }}>
            <Button size="small" onClick={() => setEditOpen(true)}>
              Sửa
            </Button>
            <Button size="small" onClick={() => setResetOpen(true)}>
              Đặt lại MK
            </Button>
            {status !== 'ACTIVE' && (
              <Popconfirm
                title="Kích hoạt tài khoản này?"
                okText="Kích hoạt"
                cancelText="Hủy"
                onConfirm={() => handleStatus('ACTIVE')}
              >
                <Button size="small">Kích hoạt</Button>
              </Popconfirm>
            )}
            {status !== 'DISABLED' && (
              <Popconfirm
                title="Vô hiệu hóa tài khoản này?"
                okText="Vô hiệu hóa"
                cancelText="Hủy"
                onConfirm={() => handleStatus('DISABLED')}
              >
                <Button size="small">Vô hiệu hóa</Button>
              </Popconfirm>
            )}
            {status !== 'LOCKED' && (
              <Popconfirm
                title="Khóa tài khoản này?"
                okText="Khóa"
                cancelText="Hủy"
                onConfirm={() => handleStatus('LOCKED')}
              >
                <Button size="small">Khóa</Button>
              </Popconfirm>
            )}
            <Popconfirm
              title="Vô hiệu hóa và xóa phụ huynh này?"
              description="Tài khoản sẽ bị vô hiệu hóa, dữ liệu được giữ lại."
              okText="Xác nhận"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={handleDelete}
            >
              <Button size="small" danger>
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        )}

        <Divider titlePlacement="start">Danh sách con</Divider>

        {/* ---- Khối B: con ---- */}
        {canWrite && (
          <Space wrap align="end" style={{ marginBottom: 16 }}>
            <Select<StudentOption>
              labelInValue
              showSearch={{
                filterOption: false,
                onSearch: handleSearchStudent,
              }}
              placeholder="Tìm học viên theo tên"
              style={{ minWidth: 280 }}
              loading={optionsLoading}
              options={options}
              value={selectedStudent ?? undefined}
              onChange={(val) => setSelectedStudent(val ?? null)}
              notFoundContent={
                optionsLoading ? 'Đang tìm…' : 'Gõ để tìm học viên'
              }
            />
            <Select<GuardianRelationship>
              allowClear
              placeholder="Quan hệ"
              style={{ minWidth: 160 }}
              options={REL_OPTIONS}
              value={relationship ?? undefined}
              onChange={(val) => setRelationship(val ?? null)}
            />
            <Button
              type="primary"
              loading={submitting}
              disabled={!selectedStudent}
              onClick={handleAddChild}
            >
              Thêm
            </Button>
          </Space>
        )}

        <Table<RelativeItem>
          rowKey="id"
          size="small"
          loading={childrenLoading}
          dataSource={children}
          columns={childColumns}
          pagination={false}
          locale={{ emptyText: 'Phụ huynh chưa liên kết học viên nào' }}
        />
      </Drawer>

      {/* Sửa phụ huynh (tái dùng UserDetail đã tải làm editData) */}
      <ParentForm
        mode="edit"
        editData={detail}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={() => {
          setEditOpen(false);
          if (parentId != null) fetchDetail(parentId);
          onChanged?.();
        }}
      />

      <ResetPasswordModal
        userId={parentId ?? null}
        username={detail?.username ?? parentName}
        open={resetOpen}
        onClose={() => setResetOpen(false)}
      />

      {/* Thông tin user của con */}
      <Drawer
        title={`Thông tin học viên — ${childInfo?.fullName || childInfo?.username || ''}`}
        open={childInfo !== null}
        onClose={() => setChildInfo(null)}
        destroyOnHidden
      >
        <Spin spinning={childDetailLoading}>
          <Descriptions
            column={1}
            size="small"
            bordered
            items={[
              {
                key: 'u',
                label: 'Tên đăng nhập',
                children: childDetail?.username ?? '—',
              },
              {
                key: 'n',
                label: 'Họ tên',
                children: childDetail?.fullName ?? '—',
              },
              { key: 'e', label: 'Email', children: childDetail?.email || '—' },
              {
                key: 'p',
                label: 'Số điện thoại',
                children: childDetail?.phone || '—',
              },
              {
                key: 's',
                label: 'Trạng thái',
                children: childDetail?.status ? (
                  <Tag color={STATUS_COLOR[childDetail.status] ?? 'default'}>
                    {childDetail.status}
                  </Tag>
                ) : (
                  '—'
                ),
              },
              {
                key: 'rel',
                label: 'Quan hệ với PH',
                children: childInfo?.relationship
                  ? REL_LABEL[childInfo.relationship as GuardianRelationship]
                  : 'Chưa rõ',
              },
            ]}
          />
        </Spin>
        {childInfo && (
          <Button
            type="link"
            style={{ paddingInline: 0, marginTop: 12 }}
            onClick={() =>
              setChildScheduleFor({
                id: childInfo.id,
                name: childInfo.fullName || childInfo.username,
              })
            }
          >
            Xem lịch học
          </Button>
        )}
      </Drawer>

      <TimetableDrawer
        open={childScheduleFor !== null}
        view="STUDENT"
        refId={childScheduleFor?.id}
        title={
          childScheduleFor ? `Lịch học — ${childScheduleFor.name}` : 'Lịch học'
        }
        onClose={() => setChildScheduleFor(null)}
      />
    </>
  );
};

export default ParentInfoDrawer;
