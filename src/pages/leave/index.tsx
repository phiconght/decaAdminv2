import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProFormSelect,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { message, Popconfirm, Space, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import LeaveDetailDrawer from './components/LeaveDetailDrawer';
import LeaveForm from './components/LeaveForm';
import type { LeaveItem, LeaveQuery, LeaveStatus } from './data';
import {
  adminSetLeaveStatus,
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
  const isAdmin = !!access.canAdmin;

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

  // ADMIN đặt trực tiếp bất kỳ trạng thái nào, bỏ qua điều kiện PH xác nhận
  // và "đã xử lý" (yêu cầu người dùng 13/08/2026).
  const handleAdminSetStatus = async (
    record: LeaveItem,
    status: LeaveStatus,
  ) => {
    try {
      await adminSetLeaveStatus(record.id, status);
      message.success('Đã cập nhật trạng thái đơn nghỉ');
      setDetailOpen(false);
      actionRef.current?.reload();
    } catch {
      message.error('Cập nhật trạng thái thất bại');
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
      // Bắt buộc trước khi GV/nhân viên duyệt được (ADMIN bỏ qua — 13/08/2026).
      title: 'PH xác nhận',
      dataIndex: 'parentConfirmedBy',
      width: 160,
      render: (_, record) =>
        record.parentConfirmedBy ? (
          <Tooltip
            title={
              record.parentConfirmedAt
                ? dayjs(record.parentConfirmedAt).format('DD/MM HH:mm')
                : undefined
            }
          >
            <Tag color="success">{record.parentConfirmedBy}</Tag>
          </Tooltip>
        ) : (
          <Tag>Chưa xác nhận</Tag>
        ),
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
      width: 220,
      render: (_, record) => {
        const needsParentConfirm = !record.parentConfirmedBy;
        const actions: React.ReactNode[] = [];

        if (canApprove && record.status === 'PENDING') {
          if (!isAdmin && needsParentConfirm) {
            actions.push(
              <Tooltip
                key="approve-disabled"
                title="Cần phụ huynh xác nhận trước khi duyệt"
              >
                <a style={{ color: '#00000040', cursor: 'not-allowed' }}>
                  Duyệt
                </a>
              </Tooltip>,
            );
          } else {
            actions.push(
              <Popconfirm
                key="approve"
                title={`Duyệt đơn nghỉ của ${record.studentName}?`}
                okText="Duyệt"
                cancelText="Hủy"
                onConfirm={() => handleApprove(record)}
              >
                <a>Duyệt</a>
              </Popconfirm>,
            );
          }
          actions.push(
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
          );
        }

        if (actions.length === 0) {
          actions.push(
            <a key="view" onClick={() => openDetail(record)}>
              Xem
            </a>,
          );
        }

        // ADMIN: đặt trực tiếp bất kỳ trạng thái nào, kể cả đơn đã xử lý
        // hoặc chưa PH xác nhận (bỏ qua mọi điều kiện — 13/08/2026).
        if (isAdmin) {
          actions.push(
            <Popconfirm
              key="admin-status"
              title={`Đổi trạng thái đơn nghỉ của ${record.studentName}?`}
              okText="Duyệt"
              cancelText="Từ chối"
              onConfirm={() => handleAdminSetStatus(record, 'APPROVED')}
              onCancel={() => handleAdminSetStatus(record, 'REJECTED')}
            >
              <a>Đặt trạng thái</a>
            </Popconfirm>,
          );
        }

        return <Space size="small">{actions}</Space>;
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
        isAdmin={isAdmin}
        onApprove={handleApprove}
        onReject={handleReject}
        onAdminSetStatus={handleAdminSetStatus}
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
