import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ProCard,
  ProFormSelect,
  ProFormText,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Tag } from 'antd';
import React, { useRef, useState } from 'react';
import type { RoomItem, RoomQuery } from '../data';
import { queryBranches, queryRooms } from '../service';
import RoomForm from './RoomForm';

// value boolean -> cast về unknown để khớp kiểu options của antd Select.
const ACTIVE_OPTIONS = [
  { label: 'Hoạt động', value: true },
  { label: 'Ngừng', value: false },
] as unknown as { label: string; value: string }[];

// Tab "Phòng": QueryFilter + ProTable + DrawerForm tạo/sửa.
const RoomTab: React.FC = () => {
  const access = useAccess();
  const actionRef = useRef<ActionType | null>(null);
  const [searchParams, setSearchParams] = useState<RoomQuery>({});
  const [editData, setEditData] = useState<RoomItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const columns: ProColumns<RoomItem>[] = [
    { title: 'Mã', dataIndex: 'code', width: 110 },
    { title: 'Tên', dataIndex: 'name' },
    { title: 'Cơ sở', dataIndex: 'branchName' },
    {
      title: 'Sức chứa',
      dataIndex: 'capacity',
      width: 90,
      align: 'right',
      render: (_, record) => record.capacity ?? '—',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      ellipsis: true,
      render: (_, record) => record.note ?? '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      width: 110,
      render: (_, record) => (
        <Tag color={record.active ? 'success' : 'default'}>
          {record.active ? 'Hoạt động' : 'Ngừng'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      key: 'option',
      width: 90,
      render: (_, record) =>
        access.canWriteRoom
          ? [
              <a
                key="edit"
                onClick={() => {
                  setEditData(record);
                  setEditOpen(true);
                }}
              >
                Sửa
              </a>,
            ]
          : [],
    },
  ];

  return (
    <>
      {access.canWriteRoom && (
        <RoomForm
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
      )}
      <ProCard title="Tìm kiếm phòng" style={{ marginBottom: 16 }}>
        <QueryFilter<RoomQuery>
          defaultCollapsed={false}
          collapseRender={false}
          layout="vertical"
          submitter={{
            searchConfig: { resetText: 'Đặt lại', submitText: 'Tìm kiếm' },
          }}
          onFinish={async (values) => {
            setSearchParams(values);
            actionRef.current?.reload();
          }}
          onReset={() => {
            setSearchParams({});
            actionRef.current?.reload();
          }}
        >
          <ProFormSelect
            name="branchId"
            label="Cơ sở"
            placeholder="Tất cả"
            allowClear
            request={async () => {
              const res = await queryBranches(false);
              return (res.data ?? []).map((b) => ({
                label: `${b.name} (${b.code})`,
                value: b.id,
              }));
            }}
            fieldProps={{
              showSearch: true,
              filterOption: (input: string, option?: { label?: string }) =>
                String(option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase()),
            }}
          />
          <ProFormText
            name="keyword"
            label="Từ khóa"
            placeholder="Mã hoặc tên phòng"
          />
          <ProFormSelect
            name="active"
            label="Trạng thái"
            placeholder="Tất cả"
            allowClear
            fieldProps={{ options: ACTIVE_OPTIONS }}
          />
        </QueryFilter>
      </ProCard>

      <ProTable<RoomItem, RoomQuery>
        headerTitle="Danh sách phòng"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        scroll={{ x: 'max-content' }}
        toolBarRender={() =>
          access.canWriteRoom
            ? [
                <RoomForm
                  key="create"
                  mode="create"
                  onSuccess={() => actionRef.current?.reload()}
                />,
              ]
            : []
        }
        request={async ({ current, pageSize }) =>
          queryRooms({ ...searchParams, current, pageSize })
        }
        columns={columns}
      />
    </>
  );
};

export default RoomTab;
