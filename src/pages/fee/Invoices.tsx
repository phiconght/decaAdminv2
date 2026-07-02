import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProFormSelect,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Button, message, Popconfirm, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import InvoiceDetailDrawer from './components/InvoiceDetailDrawer';
import InvoicePreviewModal from './components/InvoicePreviewModal';
import type { InvoiceItem, InvoiceQuery, InvoiceStatus } from './data';
import {
  cancelInvoice,
  confirmInvoice,
  confirmInvoiceBatch,
  markInvoicePaid,
  queryClassOptions,
  queryInvoices,
} from './service';
import { formatVnd, INVOICE_STATUS_META } from './utils';

const STATUS_OPTIONS = (
  Object.keys(INVOICE_STATUS_META) as InvoiceStatus[]
).map((s) => ({ label: INVOICE_STATUS_META[s].label, value: s }));

const Invoices: React.FC = () => {
  const access = useAccess();
  const actionRef = useRef<ActionType | null>(null);
  const [searchParams, setSearchParams] = useState<InvoiceQuery>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const reload = () => {
    setSelectedRows([]);
    actionRef.current?.reload();
  };

  const handleConfirm = async (id: number) => {
    try {
      await confirmInvoice(id);
      message.success('Đã xác nhận học phí');
      reload();
    } catch {
      message.error('Xác nhận thất bại');
    }
  };

  const handleConfirmBatch = async () => {
    if (selectedRows.length === 0) return;
    try {
      await confirmInvoiceBatch(selectedRows);
      message.success(`Đã xác nhận ${selectedRows.length} đợt thu`);
      reload();
    } catch {
      message.error('Xác nhận hàng loạt thất bại');
    }
  };

  const handlePaid = async (id: number) => {
    try {
      await markInvoicePaid(id);
      message.success('Đã đánh dấu đã thanh toán');
      reload();
    } catch {
      message.error('Đánh dấu thất bại');
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await cancelInvoice(id);
      message.success('Đã hủy đợt thu');
      reload();
    } catch {
      message.error('Hủy thất bại');
    }
  };

  const columns: ProColumns<InvoiceItem>[] = [
    {
      title: 'Học viên',
      dataIndex: 'studentName',
      render: (dom, r) => <a onClick={() => setDetailId(r.id)}>{dom}</a>,
    },
    { title: 'Khóa', dataIndex: 'className', ellipsis: true },
    {
      title: 'Kỳ',
      width: 190,
      render: (_, r) =>
        `${dayjs(r.periodFrom).format('DD/MM/YYYY')} – ${dayjs(
          r.periodTo,
        ).format('DD/MM/YYYY')}`,
    },
    { title: 'Số buổi', dataIndex: 'sessionCount', width: 80 },
    {
      title: 'Thành tiền',
      dataIndex: 'amount',
      width: 140,
      render: (_, record) => formatVnd(record.amount),
    },
    {
      title: 'Nội dung CK',
      dataIndex: 'paymentCode',
      width: 170,
      render: (_, record) => (
        <Typography.Text copyable style={{ fontSize: 12 }}>
          {record.paymentCode}
        </Typography.Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (_, r) => (
        <Tag color={INVOICE_STATUS_META[r.status].color}>
          {INVOICE_STATUS_META[r.status].label}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 220,
      render: (_, r) => {
        if (!access.canWriteFee) {
          return [
            <a key="view" onClick={() => setDetailId(r.id)}>
              Xem
            </a>,
          ];
        }
        const actions: React.ReactNode[] = [];
        if (r.status === 'DRAFT') {
          actions.push(
            <a key="confirm" onClick={() => handleConfirm(r.id)}>
              Xác nhận
            </a>,
          );
        }
        if (r.status === 'CONFIRMED') {
          actions.push(
            <Popconfirm
              key="paid"
              title="Xác nhận đã nhận tiền?"
              okText="Đã thu"
              cancelText="Hủy"
              onConfirm={() => handlePaid(r.id)}
            >
              <a>Đã thanh toán</a>
            </Popconfirm>,
          );
        }
        if (r.status === 'DRAFT' || r.status === 'CONFIRMED') {
          actions.push(
            <Popconfirm
              key="cancel"
              title="Hủy đợt thu này?"
              okText="Hủy đợt"
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
    <PageContainer>
      <InvoicePreviewModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          reload();
        }}
      />
      <InvoiceDetailDrawer
        invoiceId={detailId}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
      />

      <ProCard title="Bộ lọc" style={{ marginBottom: 16 }}>
        <QueryFilter<InvoiceQuery>
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
            name="classId"
            label="Khóa học"
            allowClear
            request={async ({ keyWords }) => {
              const res = await queryClassOptions(keyWords);
              return (res.data ?? []).map((c) => ({
                label: `${c.code} — ${c.name}`,
                value: Number(c.id),
              }));
            }}
            fieldProps={{ showSearch: true, filterOption: false }}
          />
          <ProFormSelect
            name="status"
            label="Trạng thái"
            options={STATUS_OPTIONS}
            allowClear
          />
        </QueryFilter>
      </ProCard>

      <ProTable<InvoiceItem, InvoiceQuery>
        headerTitle="Đợt thu học phí"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        rowSelection={
          access.canWriteFee
            ? {
                selectedRowKeys: selectedRows,
                onChange: (keys) => setSelectedRows(keys as number[]),
                getCheckboxProps: (r) => ({ disabled: r.status !== 'DRAFT' }),
              }
            : undefined
        }
        tableAlertOptionRender={() => (
          <Popconfirm
            title={`Xác nhận ${selectedRows.length} đợt thu?`}
            okText="Xác nhận"
            cancelText="Hủy"
            onConfirm={handleConfirmBatch}
          >
            <a>Xác nhận học phí (hàng loạt)</a>
          </Popconfirm>
        )}
        toolBarRender={() =>
          access.canWriteFee
            ? [
                <Button
                  key="create"
                  type="primary"
                  onClick={() => setCreateOpen(true)}
                >
                  Tạo đợt thu
                </Button>,
              ]
            : []
        }
        request={async ({ current, pageSize }) =>
          queryInvoices({ ...searchParams, current, pageSize })
        }
        columns={columns}
      />
    </PageContainer>
  );
};

export default Invoices;
