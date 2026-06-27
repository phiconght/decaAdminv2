import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProFormSelect,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { message, Popconfirm, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import LeaveDetailDrawer from './components/LeaveDetailDrawer';
import LeaveForm from './components/LeaveForm';
import type { LeaveItem, LeaveQuery, LeaveStatus } from './data';
import {
  approveLeave,
  queryLeaves,
  queryStudentOptionsForLeave,
  rejectLeave,
} from './service';

const STATUS_META: Record<LeaveStatus, { label: string; color: string }> = {
  PENDING: { label: 'Chờ duyệt', color: 'processing' },
  APPROVED: { label: 'Đã duyệt', color: 'success' },
  REJECTED: { label: 'Từ chối', color: 'error' },
};

const STATUS_OPTIONS = [
  { label: 'Chờ duyệt', value: 'PENDING' },
  { label: 'Đã duyệt', value: 'APPROVED' },
  { label: 'Từ chối', value: 'REJECTED' },
];

const fmtDate = (v?: string) => (v ? dayjs(v).format('DD/MM/YYYY') : '—');

const LeavePage: React.FC = () => {
  const access = useAccess();
  const canApprove = access.canApproveLeave;
  const canWrite = access.canWriteLeave;

  const actionRef = useRef<ActionType | null>(null);
  const [searchParams, setSearchParams] = useState<LeaveQuery>({
    status: 'PENDING',
  });
  const [detail, setDetail] = useState<LeaveItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = (record: LeaveItem) => {
    setDetail(record);
    setDetailOpen(true);
  };

  const handleApprove = async (record: LeaveItem) => {
    try {
      await approveLeave(record.id);
      message.success('Đã duyệt đơn nghỉ');
      setDetailOpen(false);
      actionRef.current?.reload();
    } catch {
      message.error('Duyệt đơn nghỉ thất bại');
      actionRef.current?.reload();
    }
  };

  const handleReject = async (record: LeaveItem) => {
    try {
      await rejectLeave(record.id);
      message.success('Đã từ chối đơn nghỉ');
      setDetailOpen(false);
      actionRef.current?.reload();
    } catch {
      message.error('Từ chối đơn nghỉ thất bại');
      actionRef.current?.reload();
    }
  };

  const columns: ProColumns<LeaveItem>[] = [
    {
      title: 'Học viên',
      dataIndex: 'studentName',
      width: 160,
      render: (_, record) => (
        <a onClick={() => openDetail(record)}>{record.studentName}</a>
      ),
    },
    {
      title: 'Phạm vi',
      dataIndex: 'scope',
      width: 110,
      render: (_, record) =>
        record.scope === 'SESSION' ? (
          <Tag>Buổi</Tag>
        ) : (
          <Tag color="geekblue">Khoảng</Tag>
        ),
    },
    {
      title: 'Buổi / Khoảng ngày',
      key: 'period',
      width: 220,
      render: (_, record) => {
        if (record.scope === 'SESSION') {
          return (
            <span>
              {fmtDate(record.sessionDate)}
              {record.className ? ` — ${record.className}` : ''}
            </span>
          );
        }
        return (
          <span>
            {fmtDate(record.dateFrom)} → {fmtDate(record.dateTo)}
            {` — ${record.className || 'Tất cả lớp'}`}
          </span>
        );
      },
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      width: 220,
      ellipsis: true,
      render: (_, record) =>
        record.reason ? (
          <Tooltip title={record.reason}>{record.reason}</Tooltip>
        ) : (
          '—'
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (_, record) => {
        const meta = STATUS_META[record.status];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Người duyệt',
      dataIndex: 'reviewedBy',
      width: 170,
      render: (_, record) =>
        record.reviewedBy ? (
          <div>
            <div>{record.reviewedBy}</div>
            {record.reviewedAt ? (
              <div style={{ fontSize: 12, color: '#999' }}>
                {dayjs(record.reviewedAt).format('DD/MM HH:mm')}
              </div>
            ) : null}
          </div>
        ) : (
          '—'
        ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 150,
      sorter: true,
      render: (_, record) =>
        record.createdAt
          ? dayjs(record.createdAt).format('DD/MM/YYYY HH:mm')
          : '—',
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 160,
      render: (_, record) => {
        if (canApprove && record.status === 'PENDING') {
          return [
            <Popconfirm
              key="approve"
              title={`Duyệt đơn nghỉ của ${record.studentName}?`}
              okText="Duyệt"
              cancelText="Hủy"
              onConfirm={() => handleApprove(record)}
            >
              <a>Duyệt</a>
            </Popconfirm>,
            <Popconfirm
              key="reject"
              title={`Từ chối đơn nghỉ của ${record.studentName}?`}
              okText="Từ chối"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleReject(record)}
            >
              <a style={{ color: '#ff4d4f' }}>Từ chối</a>
            </Popconfirm>,
          ];
        }
        return [
          <a key="view" onClick={() => openDetail(record)}>
            Xem
          </a>,
        ];
      },
    },
  ];

  return (
    <PageContainer>
      <LeaveDetailDrawer
        record={detail}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        canApprove={canApprove}
        onApprove={handleApprove}
        onReject={handleReject}
      />
      <ProCard title="Tìm kiếm đơn nghỉ" style={{ marginBottom: 16 }}>
        <QueryFilter<LeaveQuery>
          initialValues={{ status: 'PENDING' }}
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
            setSearchParams({ status: 'PENDING' });
            actionRef.current?.reload();
          }}
        >
          <ProFormSelect
            name="studentId"
            label="Học viên"
            placeholder="Tất cả"
            allowClear
            showSearch
            debounceTime={300}
            request={async ({ keyWords }) => {
              const res = await queryStudentOptionsForLeave(keyWords);
              return (res.data ?? []).map((u) => ({
                label: `${u.fullName || u.username} (${u.username})`,
                value: u.id,
              }));
            }}
            fieldProps={{ filterOption: false }}
          />
          <ProFormSelect
            name="status"
            label="Trạng thái"
            options={STATUS_OPTIONS}
            allowClear
          />
        </QueryFilter>
      </ProCard>

      <ProTable<LeaveItem, LeaveQuery>
        headerTitle="Danh sách đơn nghỉ"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        scroll={{ x: 1100 }}
        toolBarRender={() =>
          canWrite
            ? [
                <LeaveForm
                  key="create"
                  onSuccess={() => actionRef.current?.reload()}
                />,
              ]
            : []
        }
        request={async ({ current, pageSize }, sort) => {
          const sortField = Object.keys(sort ?? {})[0];
          const sortOrder = sortField
            ? (sort[sortField] as 'ascend' | 'descend')
            : undefined;
          return queryLeaves({
            ...searchParams,
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

export default LeavePage;
