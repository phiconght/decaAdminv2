import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProFormSelect,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { message, Popconfirm, Tag, Typography } from 'antd';
import React, { useRef, useState } from 'react';
import AdjustCoinTopupModal from './components/AdjustCoinTopupModal';
import type { CoinTopupItem, CoinTopupQuery, CoinTopupStatus } from './data';
import { cancelCoinTopup, confirmCoinTopup, queryCoinTopups } from './service';

const STATUS_META: Record<CoinTopupStatus, { label: string; color: string }> = {
  PENDING: { label: 'Chờ đối soát', color: 'gold' },
  CONFIRMED: { label: 'Đã cộng Xu', color: 'green' },
  CANCELLED: { label: 'Đã hủy', color: 'red' },
};

const STATUS_OPTIONS = (Object.keys(STATUS_META) as CoinTopupStatus[]).map(
  (s) => ({ label: STATUS_META[s].label, value: s }),
);

const fmt = (v: number) => new Intl.NumberFormat('vi-VN').format(v);

/**
 * Yêu cầu nạp Xu bằng chuyển khoản (CoinTopupController) — học sinh tự tạo
 * qua Mobile/Web, Admin đối soát ngân hàng rồi xác nhận (confirm = cộng Xu
 * ngay, không có bước "đã thanh toán" riêng như học phí VND).
 */
const CoinTopups: React.FC = () => {
  const access = useAccess();
  const actionRef = useRef<ActionType | null>(null);
  const [searchParams, setSearchParams] = useState<CoinTopupQuery>({});
  const [adjustTarget, setAdjustTarget] = useState<CoinTopupItem | null>(null);

  const reload = () => actionRef.current?.reload();

  const handleConfirm = async (id: number) => {
    try {
      await confirmCoinTopup(id);
      message.success('Đã xác nhận — Xu đã được cộng vào ví học viên');
      reload();
    } catch {
      message.error('Xác nhận thất bại');
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await cancelCoinTopup(id);
      message.success('Đã hủy yêu cầu nạp Xu');
      reload();
    } catch {
      message.error('Hủy thất bại');
    }
  };

  const columns: ProColumns<CoinTopupItem>[] = [
    { title: 'Học viên', dataIndex: 'studentName' },
    { title: 'Tài khoản', dataIndex: 'username', width: 150 },
    {
      title: 'Số tiền',
      dataIndex: 'amountVnd',
      width: 130,
      render: (_, r) => `${fmt(r.amountVnd)} ₫`,
    },
    {
      title: 'Số Xu nhận',
      dataIndex: 'coinAmount',
      width: 150,
      render: (_, r) => (
        <>
          {fmt(r.coinAmount)} Xu
          {r.adjustmentCoinAmount ? (
            <div
              style={{
                fontSize: 12,
                color: r.adjustmentCoinAmount < 0 ? '#ff4d4f' : '#389e0d',
              }}
            >
              ({r.adjustmentCoinAmount > 0 ? '+' : ''}
              {fmt(r.adjustmentCoinAmount)} điều chỉnh)
            </div>
          ) : null}
        </>
      ),
    },
    {
      title: 'Nội dung CK',
      dataIndex: 'paymentCode',
      width: 170,
      render: (_, r) => (
        <Typography.Text copyable style={{ fontSize: 12 }}>
          {r.paymentCode}
        </Typography.Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (_, r) => (
        <Tag color={STATUS_META[r.status].color}>
          {STATUS_META[r.status].label}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 150,
      render: (_, r) => new Date(r.createdAt).toLocaleString('vi-VN'),
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 220,
      render: (_, r) => {
        if (!access.canWriteCoin) return [];
        const actions: React.ReactNode[] = [];
        if (r.status === 'PENDING') {
          actions.push(
            <a key="confirm" onClick={() => handleConfirm(r.id)}>
              Xác nhận
            </a>,
          );
        }
        if (r.status !== 'CANCELLED') {
          actions.push(
            <a key="adjust" onClick={() => setAdjustTarget(r)}>
              Cộng/Trừ
            </a>,
          );
        }
        if (r.status === 'PENDING') {
          actions.push(
            <Popconfirm
              key="cancel"
              title="Hủy yêu cầu nạp Xu này?"
              okText="Hủy"
              cancelText="Đóng"
              onConfirm={() => handleCancel(r.id)}
            >
              <a style={{ color: '#ff4d4f' }}>Hủy</a>
            </Popconfirm>,
          );
        }
        return actions;
      },
    },
  ];

  return (
    <PageContainer header={{ title: 'Yêu cầu nạp Xu' }}>
      <ProCard title="Bộ lọc" style={{ marginBottom: 16 }}>
        <QueryFilter<CoinTopupQuery>
          layout="vertical"
          defaultCollapsed={false}
          collapseRender={false}
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
            name="status"
            label="Trạng thái"
            options={STATUS_OPTIONS}
            allowClear
          />
        </QueryFilter>
      </ProCard>

      <ProTable<CoinTopupItem, CoinTopupQuery>
        headerTitle="Yêu cầu nạp Xu"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        request={async ({ current, pageSize }) =>
          queryCoinTopups({ ...searchParams, current, pageSize })
        }
        columns={columns}
      />

      <AdjustCoinTopupModal
        open={adjustTarget !== null}
        topup={adjustTarget}
        onClose={() => setAdjustTarget(null)}
        onDone={() => {
          setAdjustTarget(null);
          reload();
        }}
      />
    </PageContainer>
  );
};

export default CoinTopups;
