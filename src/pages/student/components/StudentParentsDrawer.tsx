import { TeamOutlined } from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import {
  Button,
  Drawer,
  message,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useRef, useState } from 'react';
import type { GuardianRelationship, RelativeItem } from '../data';
import {
  linkStudentParent,
  queryParentOptions,
  queryStudentParents,
  unlinkStudentParent,
} from '../service';

type Props = {
  studentId: number;
  studentName: string;
};

const RELATIONSHIP_OPTIONS: { label: string; value: GuardianRelationship }[] = [
  { label: 'Bố', value: 'FATHER' },
  { label: 'Mẹ', value: 'MOTHER' },
  { label: 'Người giám hộ', value: 'GUARDIAN' },
  { label: 'Khác', value: 'OTHER' },
];

const RELATIONSHIP_LABEL: Record<GuardianRelationship, string> = {
  FATHER: 'Bố',
  MOTHER: 'Mẹ',
  GUARDIAN: 'Người giám hộ',
  OTHER: 'Khác',
};

const RELATIONSHIP_COLOR: Record<GuardianRelationship, string> = {
  FATHER: 'blue',
  MOTHER: 'magenta',
  GUARDIAN: 'gold',
  OTHER: 'default',
};

type ParentOption = { label: string; value: number };

// Nút "Phụ huynh" trên mỗi dòng học viên + Drawer quản lý liên kết HV ↔ PH.
const StudentParentsDrawer: React.FC<Props> = ({ studentId, studentName }) => {
  const access = useAccess();
  const [messageApi, contextHolder] = message.useMessage();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState<RelativeItem[]>([]);

  const [options, setOptions] = useState<ParentOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [selectedParent, setSelectedParent] = useState<ParentOption | null>(
    null,
  );
  const [relationship, setRelationship] = useState<GuardianRelationship | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  // Mỗi lần search gắn 1 id; chỉ nhận response của lần gõ mới nhất (tránh race).
  const searchSeq = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchParents = async () => {
    setLoading(true);
    try {
      const res = await queryStudentParents(studentId);
      setParents(res.data ?? []);
    } catch {
      messageApi.error('Không tải được danh sách phụ huynh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setSelectedParent(null);
      setRelationship(null);
      setOptions([]);
      fetchParents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, studentId]);

  const handleSearch = (kw: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      const seq = ++searchSeq.current;
      setOptionsLoading(true);
      try {
        const res = await queryParentOptions(kw.trim() || undefined);
        if (seq !== searchSeq.current) return;
        setOptions(
          (res.data ?? []).map((p) => ({
            label: `${p.fullName || p.username}${p.phone ? ` — ${p.phone}` : ''}`,
            value: p.id,
          })),
        );
      } catch {
        if (seq === searchSeq.current) setOptions([]);
      } finally {
        if (seq === searchSeq.current) setOptionsLoading(false);
      }
    }, 300);
  };

  const handleLink = async () => {
    if (!selectedParent) return;
    setSubmitting(true);
    try {
      await linkStudentParent(studentId, selectedParent.value, relationship);
      messageApi.success('Đã lưu phụ huynh');
      setSelectedParent(null);
      setRelationship(null);
      setOptions([]);
      fetchParents();
    } catch (err) {
      const code = (
        err as { response?: { data?: { error?: { code?: string } } } }
      )?.response?.data?.error?.code;
      if (code === 'NOT_A_PARENT') {
        messageApi.error('Người dùng này không phải phụ huynh');
      } else if (code === 'NOT_A_STUDENT') {
        messageApi.error('Đối tượng không phải học viên');
      } else if (code === 'USER_NOT_FOUND') {
        messageApi.error('Không tìm thấy người dùng');
      }
      // Trường hợp khác để global error handler hiển thị.
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlink = async (parentId: number) => {
    try {
      await unlinkStudentParent(studentId, parentId);
      messageApi.success('Đã gỡ liên kết');
      fetchParents();
    } catch {
      // Lỗi đã hiện ở global error handler
    }
  };

  const columns: ColumnsType<RelativeItem> = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      render: (val: string, record) => val || record.username,
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      width: 140,
      render: (val: string) => val || '—',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (val: string) => val || '—',
    },
    {
      title: 'Quan hệ',
      dataIndex: 'relationship',
      width: 120,
      render: (val: GuardianRelationship | null) =>
        val ? (
          <Tag color={RELATIONSHIP_COLOR[val] ?? 'default'}>
            {RELATIONSHIP_LABEL[val] ?? 'Khác'}
          </Tag>
        ) : (
          <Tag>Chưa rõ</Tag>
        ),
    },
  ];

  if (access.canWriteUser) {
    columns.push({
      title: 'Tác vụ',
      key: 'option',
      width: 90,
      render: (_, record) => (
        <Popconfirm
          title="Gỡ liên kết phụ huynh này?"
          okText="Gỡ"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={() => handleUnlink(record.id)}
        >
          <a style={{ color: '#ff4d4f' }}>Gỡ</a>
        </Popconfirm>
      ),
    });
  }

  return (
    <>
      {contextHolder}
      <Button
        type="link"
        size="small"
        icon={<TeamOutlined />}
        style={{ padding: 0 }}
        onClick={() => setOpen(true)}
      >
        Phụ huynh
      </Button>

      <Drawer
        title={`Phụ huynh của ${studentName}`}
        open={open}
        onClose={() => setOpen(false)}
        destroyOnHidden
      >
        {access.canWriteUser && (
          <Space wrap align="end" style={{ marginBottom: 16 }}>
            <Select<ParentOption>
              labelInValue
              showSearch
              filterOption={false}
              placeholder="Tìm theo tên/SĐT"
              style={{ minWidth: 280 }}
              loading={optionsLoading}
              options={options}
              value={selectedParent ?? undefined}
              onSearch={handleSearch}
              onChange={(val) => setSelectedParent(val ?? null)}
              notFoundContent={
                optionsLoading
                  ? 'Đang tìm…'
                  : options.length === 0
                    ? 'Gõ để tìm phụ huynh'
                    : 'Không tìm thấy phụ huynh'
              }
            />
            <Select<GuardianRelationship>
              allowClear
              placeholder="Quan hệ"
              style={{ minWidth: 160 }}
              options={RELATIONSHIP_OPTIONS}
              value={relationship ?? undefined}
              onChange={(val) => setRelationship(val ?? null)}
            />
            <Button
              type="primary"
              loading={submitting}
              disabled={!selectedParent}
              onClick={handleLink}
            >
              Thêm
            </Button>
          </Space>
        )}

        <Table<RelativeItem>
          rowKey="id"
          size="small"
          loading={loading}
          dataSource={parents}
          columns={columns}
          pagination={false}
          locale={{ emptyText: 'Học viên chưa có phụ huynh nào được gán' }}
        />
      </Drawer>
    </>
  );
};

export default StudentParentsDrawer;
