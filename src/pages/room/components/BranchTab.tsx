import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Tag } from 'antd';
import React, { useRef, useState } from 'react';
import type { BranchItem } from '../data';
import { queryBranches } from '../service';
import BranchForm from './BranchForm';

// Tab "Cơ sở": ProTable + DrawerForm tạo/sửa.
const BranchTab: React.FC = () => {
  const access = useAccess();
  const actionRef = useRef<ActionType | null>(null);
  const [editData, setEditData] = useState<BranchItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const columns: ProColumns<BranchItem>[] = [
    { title: 'Mã', dataIndex: 'code', width: 110 },
    { title: 'Tên', dataIndex: 'name' },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      ellipsis: true,
      render: (_, record) => record.address ?? '—',
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
        <BranchForm
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
      <ProTable<BranchItem>
        headerTitle="Danh sách cơ sở"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        pagination={false}
        scroll={{ x: 'max-content' }}
        toolBarRender={() =>
          access.canWriteRoom
            ? [
                <BranchForm
                  key="create"
                  mode="create"
                  onSuccess={() => actionRef.current?.reload()}
                />,
              ]
            : []
        }
        request={async () => {
          const res = await queryBranches(true);
          return { data: res.data ?? [], success: res.success };
        }}
        columns={columns}
      />
    </>
  );
};

export default BranchTab;
