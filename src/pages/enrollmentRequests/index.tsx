import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProFormSelect,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import { message, Popconfirm, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import { formatVnd } from '../fee/utils';
import type { EnrollmentRequestItem, EnrollmentRequestStatus } from './data';
import {
  cancelEnrollmentRequest,
  confirmEnrollmentRequest,
  queryEnrollmentRequests,
} from './service';

const STATUS_META: Record<
  EnrollmentRequestStatus,
  { label: string; color: string }
> = {
  PENDING: { label: 'Chờ xử lý', color: 'gold' },
  CONFIRMED: { label: 'Đã ghi danh', color: 'green' },
  CANCELLED: { label: 'Đã hủy', color: 'default' },
};

/**
 * "Yêu cầu đăng ký khóa học" — học viên bấm Đăng ký + quét QR (chuyển khoản
 * thủ công) ở Card/trang chi tiết khóa học, Admin đối chiếu sao kê ngân hàng
 * theo Mã đăng ký rồi bấm "Xác nhận & Ghi danh" (1 thao tác vừa xác nhận vừa
 * thêm học viên vào lớp — xem ClassRegistrationService#confirm ở BE).
 */
const EnrollmentRequestsPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [status, setStatus] = useState<EnrollmentRequestStatus | undefined>(
    'PENDING',
  );

  const reload = () => actionRef.current?.reload();

  const handleConfirm = async (id: number) => {
    try {
      await confirmEnrollmentRequest(id);
      message.success('Đã xác nhận & ghi danh học viên');
      reload();
    } catch (e) {
      message.error((e as Error).message || 'Xác nhận thất bại');
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await cancelEnrollmentRequest(id);
      message.success('Đã hủy yêu cầu');
      reload();
    } catch (e) {
      message.error((e as Error).message || 'Hủy thất bại');
    }
  };

  const columns: ProColumns<EnrollmentRequestItem>[] = [
    {
      title: 'Học viên',
      dataIndex: 'studentFullName',
      render: (dom, r) => (
        <span>
          {dom} <span style={{ color: '#999' }}>· {r.studentUsername}</span>
        </span>
      ),
    },
    { title: 'Khóa học', dataIndex: 'className', ellipsis: true },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      width: 130,
      render: (_, r) => formatVnd(r.amount),
    },
    {
      title: 'Mã đăng ký',
      dataIndex: 'registrationCode',
      width: 170,
      render: (_, r) => (
        <Typography.Text copyable style={{ fontSize: 12 }}>
          {r.registrationCode}
        </Typography.Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (_, r) => (
        <Tag color={STATUS_META[r.status].color}>
          {STATUS_META[r.status].label}
        </Tag>
      ),
    },
    {
      title: 'Thời điểm',
      width: 160,
      render: (_, r) =>
        r.status === 'CONFIRMED' && r.confirmedAt
          ? `Xác nhận ${dayjs(r.confirmedAt).format('HH:mm DD/MM')}`
          : dayjs(r.createdAt).format('HH:mm DD/MM'),
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 200,
      render: (_, r) => {
        if (r.status !== 'PENDING') return [];
        return [
          <Popconfirm
            key="confirm"
            title="Xác nhận đã nhận chuyển khoản?"
            okText="Xác nhận & Ghi danh"
            cancelText="Chưa"
            onConfirm={() => handleConfirm(r.id)}
          >
            <a>Xác nhận &amp; Ghi danh</a>
          </Popconfirm>,
          <Popconfirm
            key="cancel"
            title="Hủy yêu cầu này?"
            okText="Hủy"
            cancelText="Đóng"
            onConfirm={() => handleCancel(r.id)}
          >
            <a style={{ color: '#ff4d4f' }}>Hủy</a>
          </Popconfirm>,
        ];
      },
    },
  ];

  return (
    <PageContainer>
      <ProCard title="Bộ lọc" style={{ marginBottom: 16 }}>
        <QueryFilter
          layout="vertical"
          defaultCollapsed={false}
          collapseRender={false}
          submitter={{
            searchConfig: { resetText: 'Đặt lại', submitText: 'Lọc' },
          }}
          initialValues={{ status: 'PENDING' }}
          onFinish={async (values) => {
            setStatus(values.status);
            actionRef.current?.reload();
          }}
          onReset={() => {
            setStatus(undefined);
            actionRef.current?.reload();
          }}
        >
          <ProFormSelect
            name="status"
            label="Trạng thái"
            allowClear
            options={[
              { label: 'Chờ xử lý', value: 'PENDING' },
              { label: 'Đã ghi danh', value: 'CONFIRMED' },
              { label: 'Đã hủy', value: 'CANCELLED' },
            ]}
          />
        </QueryFilter>
      </ProCard>

      <ProTable<EnrollmentRequestItem>
        headerTitle="Yêu cầu đăng ký khóa học"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        pagination={false}
        scroll={{ x: 'max-content' }}
        request={async () => {
          const res = await queryEnrollmentRequests(status);
          return { data: res.data, success: res.success };
        }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default EnrollmentRequestsPage;
