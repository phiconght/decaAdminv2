import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProFormText,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccess } from '@umijs/max';
import React, { useRef, useState } from 'react';
import CoinAdjustModal from './components/CoinAdjustModal';
import CoinHistoryDrawer from './components/CoinHistoryDrawer';
import type { UserOption } from './data';
import { getCoinBalance, queryUserOptions } from './service';

const fmtCoin = (v: number) => new Intl.NumberFormat('vi-VN').format(v);

// Cột số dư Xu — gọi API riêng, cache react-query (§10.5).
const CoinBalanceCell: React.FC<{ studentId: number }> = ({ studentId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['coin-balance', studentId],
    queryFn: () => getCoinBalance(studentId).then((r) => r.data.balance),
  });
  if (isLoading) return <span>…</span>;
  return <strong>{fmtCoin(data ?? 0)} Xu</strong>;
};

type Query = { keyword?: string };

const Coins: React.FC = () => {
  const access = useAccess();
  const actionRef = useRef<ActionType | null>(null);
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState<Query>({});
  const [adjustFor, setAdjustFor] = useState<UserOption | null>(null);
  const [historyFor, setHistoryFor] = useState<UserOption | null>(null);

  const invalidateBalance = (studentId: number) =>
    queryClient.invalidateQueries({ queryKey: ['coin-balance', studentId] });

  const columns: ProColumns<UserOption>[] = [
    { title: 'Học viên', dataIndex: 'fullName' },
    { title: 'Tài khoản', dataIndex: 'username', width: 180 },
    {
      title: 'Số dư Xu',
      width: 160,
      render: (_, r) => <CoinBalanceCell studentId={r.id} />,
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 200,
      render: (_, r) => {
        const actions: React.ReactNode[] = [
          <a key="history" onClick={() => setHistoryFor(r)}>
            Lịch sử
          </a>,
        ];
        if (access.canWriteCoin) {
          actions.unshift(
            <a key="adjust" onClick={() => setAdjustFor(r)}>
              Cộng/Trừ Xu
            </a>,
          );
        }
        return actions;
      },
    },
  ];

  return (
    <PageContainer header={{ title: 'Xu học viên' }}>
      <CoinAdjustModal
        open={adjustFor !== null}
        student={adjustFor}
        onClose={() => setAdjustFor(null)}
        onDone={() => {
          if (adjustFor) invalidateBalance(adjustFor.id);
          setAdjustFor(null);
        }}
      />
      <CoinHistoryDrawer
        student={historyFor}
        open={historyFor !== null}
        onClose={() => setHistoryFor(null)}
      />

      <ProCard style={{ marginBottom: 16 }}>
        <QueryFilter<Query>
          layout="inline"
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
          <ProFormText
            name="keyword"
            label="Tìm học viên"
            placeholder="Tên hoặc tài khoản"
          />
        </QueryFilter>
      </ProCard>

      <ProTable<UserOption, Query>
        headerTitle="Danh sách học viên"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        request={async ({ current, pageSize }) => {
          const res = await queryUserOptions('STUDENT', searchParams.keyword);
          const all = res.data ?? [];
          const start = ((current ?? 1) - 1) * (pageSize ?? 10);
          return {
            data: all.slice(start, start + (pageSize ?? 10)),
            total: all.length,
            success: true,
          };
        }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default Coins;
