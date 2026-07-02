import {
  ProFormDateRangePicker,
  ProFormSelect,
  QueryFilter,
} from '@ant-design/pro-components';
import { Modal, message, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import type { InvoicePreviewItem } from '../data';
import {
  createInvoiceBatch,
  previewInvoices,
  queryClassOptions,
} from '../service';
import { formatVnd } from '../utils';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

// Modal "Tạo đợt thu": chọn khóa + kỳ → preview → tích chọn HV → tạo DRAFT.
const InvoicePreviewModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const [preview, setPreview] = useState<InvoicePreviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [ctx, setCtx] = useState<{
    classId: number;
    from: string;
    to: string;
  } | null>(null);

  const reset = () => {
    setPreview([]);
    setSelected([]);
    setCtx(null);
  };

  const handlePreview = async (values: {
    classId: number;
    period: [string, string];
  }) => {
    const from = values.period?.[0];
    const to = values.period?.[1];
    if (!values.classId || !from || !to) return;
    setLoading(true);
    try {
      const res = await previewInvoices({ classId: values.classId, from, to });
      const rows = res.data ?? [];
      setPreview(rows);
      setCtx({ classId: values.classId, from, to });
      setSelected(
        rows.filter((r) => r.existingInvoiceId == null).map((r) => r.studentId),
      );
    } catch {
      message.error('Không tải được bản xem trước');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!ctx || selected.length === 0) {
      message.warning('Chọn ít nhất một học viên');
      return;
    }
    setCreating(true);
    try {
      const res = await createInvoiceBatch({ ...ctx, studentIds: selected });
      message.success(`Đã tạo ${res.data?.length ?? 0} đợt thu (nháp)`);
      reset();
      onCreated();
    } catch {
      message.error('Tạo đợt thu thất bại');
    } finally {
      setCreating(false);
    }
  };

  const columns: ColumnsType<InvoicePreviewItem> = [
    { title: 'Học viên', dataIndex: 'fullName' },
    { title: 'Tài khoản', dataIndex: 'username', width: 140 },
    { title: 'Số buổi', dataIndex: 'sessionCount', width: 90 },
    {
      title: 'Tổng trước giảm',
      dataIndex: 'grossAmount',
      width: 150,
      render: (v: number) => formatVnd(v),
    },
    {
      title: '% giảm',
      dataIndex: 'discountPercent',
      width: 90,
      render: (v: number) => `${v}%`,
    },
    {
      title: 'Thành tiền',
      dataIndex: 'amount',
      width: 150,
      render: (v: number) => <strong>{formatVnd(v)}</strong>,
    },
    {
      title: '',
      dataIndex: 'existingInvoiceId',
      width: 130,
      render: (id: number | null) =>
        id != null ? (
          <Tooltip title="Học viên đã có đợt thu trùng kỳ">
            <span style={{ color: '#faad14' }}>Đã có đợt thu</span>
          </Tooltip>
        ) : null,
    },
  ];

  return (
    <Modal
      title="Tạo đợt thu học phí"
      open={open}
      width={860}
      onCancel={() => {
        reset();
        onClose();
      }}
      okText="Tạo"
      cancelText="Đóng"
      confirmLoading={creating}
      onOk={handleCreate}
      okButtonProps={{ disabled: selected.length === 0 }}
    >
      <QueryFilter<{ classId: number; period: [string, string] }>
        layout="vertical"
        defaultCollapsed={false}
        collapseRender={false}
        submitter={{
          searchConfig: { submitText: 'Xem trước', resetText: 'Đặt lại' },
        }}
        onFinish={handlePreview}
        onReset={reset}
      >
        <ProFormSelect
          name="classId"
          label="Khóa học"
          rules={[{ required: true, message: 'Chọn khóa học' }]}
          request={async ({ keyWords }) => {
            const res = await queryClassOptions(keyWords);
            return (res.data ?? []).map((c) => ({
              label: `${c.code} — ${c.name}`,
              value: Number(c.id),
            }));
          }}
          fieldProps={{ showSearch: true, filterOption: false }}
        />
        <ProFormDateRangePicker
          name="period"
          label="Kỳ thu"
          fieldProps={{ format: 'YYYY-MM-DD' }}
          rules={[{ required: true, message: 'Chọn kỳ thu' }]}
        />
      </QueryFilter>

      <Table<InvoicePreviewItem>
        rowKey="studentId"
        size="small"
        loading={loading}
        dataSource={preview}
        columns={columns}
        pagination={false}
        scroll={{ y: 360 }}
        locale={{ emptyText: 'Chọn khóa + kỳ rồi bấm Xem trước' }}
        rowSelection={{
          selectedRowKeys: selected,
          onChange: (keys) => setSelected(keys as number[]),
          getCheckboxProps: (r) => ({
            disabled: r.existingInvoiceId != null,
          }),
        }}
      />
    </Modal>
  );
};

export default InvoicePreviewModal;
