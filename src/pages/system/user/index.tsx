import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProFormSelect,
  ProFormText,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import { Dropdown, message, Popconfirm, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import ResetPasswordModal from './components/ResetPasswordModal';
import UserForm from './components/UserForm';
import ViewUserDrawer from './components/ViewUserDrawer';
import type { UserDetail, UserItem, UserQuery, UserStatus } from './data';
import { deleteUser, queryUsers, updateUserStatus } from './service';

const ROLE_OPTIONS = [
  { label: 'ADMIN', value: 'ADMIN' },
  { label: 'EMPLOYEE', value: 'EMPLOYEE' },
  { label: 'TEACHER', value: 'TEACHER' },
  { label: 'ASSISTANT', value: 'ASSISTANT' },
  { label: 'STUDENT', value: 'STUDENT' },
  { label: 'PARENT', value: 'PARENT' },
];

const STATUS_OPTIONS = [
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'DISABLED', value: 'DISABLED' },
  { label: 'LOCKED', value: 'LOCKED' },
];

const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'red',
  EMPLOYEE: 'blue',
  TEACHER: 'green',
  ASSISTANT: 'cyan',
  STUDENT: 'purple',
  PARENT: 'orange',
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'success',
  DISABLED: 'default',
  LOCKED: 'error',
};

const UserPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  // Ref thay vì state để tránh stale closure trong ProTable request callback
  const searchParamsRef = useRef<UserQuery>({});

  const [viewId, setViewId] = useState<number | null>(null);
  const [editData, setEditData] = useState<UserDetail | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [resetUser, setResetUser] = useState<{
    id: number;
    username: string;
  } | null>(null);

  const [messageApi, contextHolder] = message.useMessage();

  const handleStatusChange = async (record: UserItem, status: UserStatus) => {
    try {
      await updateUserStatus(record.id, status);
      actionRef.current?.reload();
    } catch {
      // Lỗi (vd: admin cuối cùng, tự sửa chính mình) đã hiện ở global error handler
    }
  };

  const handleSoftDelete = async (record: UserItem) => {
    try {
      await deleteUser(record.id);
      messageApi.success('Đã vô hiệu hóa người dùng');
      actionRef.current?.reload();
    } catch {
      // Lỗi đã hiện ở global error handler
    }
  };

  const columns: ProColumns<UserItem>[] = [
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      render: (dom, record) => (
        <a onClick={() => setViewId(record.id)}>{dom}</a>
      ),
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (val) => val || '—',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      render: (val) => val || '—',
    },
    {
      title: 'Vai trò',
      dataIndex: 'roles',
      render: (_, record) =>
        record.roles.length > 0
          ? record.roles.map((r) => (
              <Tag key={r} color={ROLE_COLOR[r] ?? 'blue'}>
                {r}
              </Tag>
            ))
          : '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (_, record) => (
        <Tag color={STATUS_COLOR[record.status] ?? 'default'}>
          {record.status}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      valueType: 'date',
      sorter: true,
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      key: 'option',
      width: 160,
      render: (_, record) => [
        <a
          key="edit"
          onClick={async () => {
            const { getUserDetail } = await import('./service');
            const res = await getUserDetail(record.id);
            if (res.success) {
              setEditData(res.data);
              setEditOpen(true);
            }
          }}
        >
          Sửa
        </a>,
        <a
          key="reset"
          onClick={() =>
            setResetUser({ id: record.id, username: record.username })
          }
        >
          Đặt lại MK
        </a>,
        <Dropdown
          key="more"
          menu={{
            items: [
              record.status !== 'ACTIVE' && {
                key: 'activate',
                label: (
                  <Popconfirm
                    title="Kích hoạt tài khoản này?"
                    okText="Kích hoạt"
                    cancelText="Hủy"
                    onConfirm={() => handleStatusChange(record, 'ACTIVE')}
                  >
                    <span>Kích hoạt</span>
                  </Popconfirm>
                ),
              },
              record.status !== 'DISABLED' && {
                key: 'disable',
                label: (
                  <Popconfirm
                    title="Vô hiệu hóa tài khoản này?"
                    okText="Vô hiệu hóa"
                    cancelText="Hủy"
                    onConfirm={() => handleStatusChange(record, 'DISABLED')}
                  >
                    <span style={{ color: '#fa8c16' }}>Vô hiệu hóa</span>
                  </Popconfirm>
                ),
              },
              record.status !== 'LOCKED' && {
                key: 'lock',
                label: (
                  <Popconfirm
                    title="Khóa tài khoản này?"
                    okText="Khóa"
                    cancelText="Hủy"
                    onConfirm={() => handleStatusChange(record, 'LOCKED')}
                  >
                    <span style={{ color: '#ff4d4f' }}>Khóa</span>
                  </Popconfirm>
                ),
              },
              { type: 'divider' },
              {
                key: 'delete',
                label: (
                  <Popconfirm
                    title="Vô hiệu hóa và xóa người dùng này?"
                    description="Tài khoản sẽ bị vô hiệu hóa, dữ liệu được giữ lại."
                    okText="Xác nhận"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => handleSoftDelete(record)}
                  >
                    <span style={{ color: '#ff4d4f' }}>Xóa (vô hiệu hóa)</span>
                  </Popconfirm>
                ),
              },
            ].filter(Boolean) as any,
          }}
        >
          <a>⋯</a>
        </Dropdown>,
      ],
    },
  ];

  return (
    <PageContainer>
      {contextHolder}

      <ViewUserDrawer
        id={viewId}
        open={viewId !== null}
        onClose={() => setViewId(null)}
      />

      <UserForm
        mode="edit"
        editData={editData}
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) setEditData(null);
        }}
        onSuccess={() => {
          setEditOpen(false);
          setEditData(null);
          actionRef.current?.reload();
        }}
      />

      <ResetPasswordModal
        userId={resetUser?.id ?? null}
        username={resetUser?.username}
        open={resetUser !== null}
        onClose={() => setResetUser(null)}
      />

      <ProCard title="Tìm kiếm người dùng" style={{ marginBottom: 16 }}>
        <QueryFilter<UserQuery>
          defaultCollapsed={false}
          collapseRender={false}
          layout="vertical"
          submitter={{
            searchConfig: { resetText: 'Đặt lại', submitText: 'Tìm kiếm' },
          }}
          onFinish={async (values) => {
            searchParamsRef.current = values;
            // reloadAndRest: về trang 1 khi đổi bộ lọc, tránh rơi vào trang trống
            actionRef.current?.reloadAndRest?.();
          }}
          onReset={() => {
            searchParamsRef.current = {};
            actionRef.current?.reloadAndRest?.();
          }}
        >
          <ProFormText
            name="fullName"
            label="Họ tên"
            placeholder="Nhập họ tên"
          />
          <ProFormText
            name="phone"
            label="Số điện thoại"
            placeholder="Nhập số điện thoại"
          />
          <ProFormText
            name="username"
            label="Tên đăng nhập"
            placeholder="Nhập tên đăng nhập"
          />
          <ProFormSelect
            name="role"
            label="Vai trò"
            options={ROLE_OPTIONS}
            placeholder="Tất cả"
            allowClear
          />
          <ProFormSelect
            name="status"
            label="Trạng thái"
            options={STATUS_OPTIONS}
            placeholder="Tất cả"
            allowClear
          />
        </QueryFilter>
      </ProCard>

      <ProTable<UserItem, UserQuery>
        headerTitle="Danh sách người dùng"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        toolBarRender={() => [
          <UserForm
            key="create"
            mode="create"
            onSuccess={() => actionRef.current?.reload()}
          />,
        ]}
        request={async ({ current, pageSize }, sort) => {
          // ProTable truyền sort qua arg thứ 2: { createdAt: 'ascend' | 'descend' | null }
          const sortField = Object.keys(sort ?? {}).find(
            (k) => sort[k] != null,
          );
          const sortOrder = sortField ? (sort[sortField] as string) : undefined;
          return queryUsers({
            ...searchParamsRef.current,
            current,
            pageSize,
            sortField,
            sortOrder,
          });
        }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default UserPage;
