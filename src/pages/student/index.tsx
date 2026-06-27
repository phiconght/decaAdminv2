import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProFormSelect,
  ProFormText,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Button, Dropdown, message, Popconfirm, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import TimetableDrawer from '@/pages/timetable/components/TimetableDrawer';
import StudentClassesDrawer from './components/StudentClassesDrawer';
import StudentForm from './components/StudentForm';
import StudentParentsDrawer from './components/StudentParentsDrawer';
import ViewStudentDrawer from './components/ViewStudentDrawer';
import type { UserItem, UserQuery, UserStatus } from './data';
import { deleteStudent, queryStudents, updateStudentStatus } from './service';

const STATUS_OPTIONS = [
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'DISABLED', value: 'DISABLED' },
  { label: 'LOCKED', value: 'LOCKED' },
];

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'success',
  DISABLED: 'default',
  LOCKED: 'error',
};

// Module Học Viên: người dùng có vai trò STUDENT.
const StudentPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const searchParamsRef = useRef<UserQuery>({});

  const [viewId, setViewId] = useState<number | null>(null);
  const [scheduleFor, setScheduleFor] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const handleStatusChange = async (record: UserItem, status: UserStatus) => {
    try {
      await updateStudentStatus(record.id, status);
      actionRef.current?.reload();
    } catch {
      // Lỗi đã hiện ở global error handler
    }
  };

  const handleSoftDelete = async (record: UserItem) => {
    try {
      await deleteStudent(record.id);
      messageApi.success('Đã vô hiệu hóa học viên');
      actionRef.current?.reload();
    } catch {
      // Lỗi đã hiện ở global error handler
    }
  };

  // Các tính năng chưa có backend: hiển thị nút, tạm báo đang phát triển.
  const comingSoon = (label: string) =>
    messageApi.info(`${label}: tính năng đang phát triển`);

  const columns: ProColumns<UserItem>[] = [
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      render: (dom, record) => (
        <a onClick={() => setViewId(record.id)}>{dom}</a>
      ),
    },
    { title: 'Họ tên', dataIndex: 'fullName' },
    { title: 'Email', dataIndex: 'email', render: (val) => val || '—' },
    { title: 'Số điện thoại', dataIndex: 'phone', render: (val) => val || '—' },
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
      title: 'Báo cáo',
      key: 'report',
      width: 90,
      render: () => (
        <Button type="link" size="small" onClick={() => comingSoon('Báo cáo')}>
          Xem
        </Button>
      ),
    },
    {
      title: 'Lịch học',
      key: 'schedule',
      width: 90,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() =>
            setScheduleFor({
              id: record.id,
              name: record.fullName || record.username,
            })
          }
        >
          Xem
        </Button>
      ),
    },
    {
      title: 'Học phí',
      key: 'tuition',
      width: 90,
      render: () => (
        <Button type="link" size="small" onClick={() => comingSoon('Học phí')}>
          Xem
        </Button>
      ),
    },
    {
      title: 'Tác vụ khác',
      valueType: 'option',
      key: 'option',
      width: 240,
      render: (_, record) => [
        <StudentClassesDrawer
          key="classes"
          studentId={record.id}
          studentName={record.fullName || record.username}
        />,
        <StudentParentsDrawer
          key="parents"
          studentId={record.id}
          studentName={record.fullName || record.username}
        />,
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
                    title="Vô hiệu hóa và xóa học viên này?"
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

      <TimetableDrawer
        open={scheduleFor !== null}
        view="STUDENT"
        refId={scheduleFor?.id}
        title={scheduleFor ? `Lịch học — ${scheduleFor.name}` : 'Lịch học'}
        onClose={() => setScheduleFor(null)}
      />

      <ViewStudentDrawer
        id={viewId}
        open={viewId !== null}
        onClose={() => setViewId(null)}
      />

      <ProCard title="Tìm kiếm học viên" style={{ marginBottom: 16 }}>
        <QueryFilter<UserQuery>
          defaultCollapsed={false}
          collapseRender={false}
          layout="vertical"
          submitter={{
            searchConfig: { resetText: 'Đặt lại', submitText: 'Tìm kiếm' },
          }}
          onFinish={async (values) => {
            searchParamsRef.current = values;
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
            name="classId"
            label="Khóa học"
            placeholder="Tất cả khóa"
            allowClear
            request={async () => {
              const res = await request('/api/v1/classes', {
                params: { pageSize: 100 },
              });
              return (res.data ?? []).map(
                (c: { id: number; code: string; name: string }) => ({
                  label: `${c.name} (${c.code})`,
                  value: c.id,
                }),
              );
            }}
            fieldProps={{
              showSearch: true,
              filterOption: (input: string, option?: { label?: string }) =>
                String(option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase()),
            }}
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
        headerTitle="Danh sách học viên"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        toolBarRender={() => [
          <StudentForm
            key="create"
            onSuccess={() => actionRef.current?.reload()}
          />,
        ]}
        request={async ({ current, pageSize }, sort) => {
          const sortField = Object.keys(sort ?? {}).find(
            (k) => sort[k] != null,
          );
          const sortOrder = sortField ? (sort[sortField] as string) : undefined;
          return queryStudents({
            ...searchParamsRef.current,
            role: 'STUDENT',
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

export default StudentPage;
