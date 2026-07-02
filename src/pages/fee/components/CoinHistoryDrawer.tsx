import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Drawer } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { CoinTransactionItem } from '../data';
import { getCoinTransactions } from '../service';

type Props = {
  student: { id: number; fullName: string } | null;
  open: boolean;
  onClose: () => void;
};

const fmtCoin = (v: number) => new Intl.NumberFormat('vi-VN').format(v);

// Drawer "Lịch sử Xu" (2/3 màn): thời gian · +/− Xu · số dư sau · lý do · người thao tác.
const CoinHistoryDrawer: React.FC<Props> = ({ student, open, onClose }) => {
  const columns: ProColumns<CoinTransactionItem>[] = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      width: 150,
      render: (_, r) => dayjs(r.createdAt).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Xu',
      dataIndex: 'amount',
      width: 110,
      align: 'right',
      render: (_, r) => (
        <span style={{ color: r.amount >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {r.amount >= 0 ? `+${fmtCoin(r.amount)}` : fmtCoin(r.amount)}
        </span>
      ),
    },
    {
      title: 'Số dư sau',
      dataIndex: 'balanceAfter',
      width: 110,
      align: 'right',
      render: (_, r) => fmtCoin(r.balanceAfter),
    },
    { title: 'Lý do', dataIndex: 'reason' },
    { title: 'Người thao tác', dataIndex: 'createdBy', width: 150 },
  ];

  return (
    <Drawer
      title={student ? `Lịch sử Xu — ${student.fullName}` : 'Lịch sử Xu'}
      width="66vw"
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      {student ? (
        <ProTable<CoinTransactionItem>
          rowKey="id"
          search={false}
          options={false}
          columns={columns}
          request={async ({ current, pageSize }) =>
            getCoinTransactions(student.id, { current, pageSize })
          }
          pagination={{ pageSize: 20 }}
        />
      ) : null}
    </Drawer>
  );
};

export default CoinHistoryDrawer;
