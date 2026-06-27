import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProFormSelect,
  ProFormText,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import { Button, message, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import TimetableDrawer from '@/pages/timetable/components/TimetableDrawer';
import ParentForm from './components/ParentForm';
import ParentInfoDrawer from './components/ParentInfoDrawer';
import type { UserItem, UserQuery } from './data';
import { queryParents } from './service';

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

// Module Phụ Huynh: người dùng có vai trò PARENT.
const ParentPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const searchParamsRef = useRef<UserQuery>({});
  const [messageApi, contextHolder] = message.useMessage();

  const [infoFor, setInfoFor] = useState<{ id: number; name: string } | null>(
    null,
  );
  const [scheduleFor, setScheduleFor] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Tính năng chưa có backend → báo đang phát triển.
  const comingSoon = (label: string) =>
    messageApi.info(`${label}: tính năng đang phát triển`);

  const openInfo = (record: UserItem) =>
    setInfoFor({ id: record.id, name: record.fullName || record.username });

  const columns: ProColumns<UserItem>[] = [
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      render: (dom, record) => <a onClick={() => openInfo(record)}>{dom}</a>,
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
      title: 'Thanh toán',
      key: 'payment',
      width: 100,
      render: () => (
        <Button
          type="link"
          size="small"
          onClick={() => comingSoon('Thanh toán')}
        >
          Xem
        </Button>
      ),
    },
    {
      title: 'Thông tin',
      key: 'info',
      width: 90,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => openInfo(record)}>
          Xem
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      {contextHolder}

      <ParentInfoDrawer
        open={infoFor !== null}
        parentId={infoFor?.id}
        parentName={infoFor?.name}
        onClose={() => setInfoFor(null)}
        onChanged={() => actionRef.current?.reload()}
      />

      <TimetableDrawer
        open={scheduleFor !== null}
        view="PARENT"
        refId={scheduleFor?.id}
        title={
          scheduleFor ? `Lịch học các con — ${scheduleFor.name}` : 'Lịch học'
        }
        onClose={() => setScheduleFor(null)}
      />

      <ProCard title="Tìm kiếm phụ huynh" style={{ marginBottom: 16 }}>
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
            name="status"
            label="Trạng thái"
            options={STATUS_OPTIONS}
            placeholder="Tất cả"
            allowClear
          />
        </QueryFilter>
      </ProCard>

      <ProTable<UserItem, UserQuery>
        headerTitle="Danh sách phụ huynh"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        toolBarRender={() => [
          <ParentForm
            key="create"
            mode="create"
            onSuccess={() => actionRef.current?.reload()}
          />,
        ]}
        request={async ({ current, pageSize }, sort) => {
          const sortField = Object.keys(sort ?? {}).find(
            (k) => sort[k] != null,
          );
          const sortOrder = sortField ? (sort[sortField] as string) : undefined;
          return queryParents({
            ...searchParamsRef.current,
            role: 'PARENT',
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

export default ParentPage;
