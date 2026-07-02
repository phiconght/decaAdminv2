import {
  Descriptions,
  Drawer,
  message,
  Spin,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import type { InvoiceDetail, InvoiceLineItem } from '../data';
import { getInvoiceDetail } from '../service';
import { formatVnd, INVOICE_STATUS_META } from '../utils';

type Props = {
  invoiceId: number | null;
  open: boolean;
  onClose: () => void;
};

const fmt = (v?: string | null) =>
  v ? dayjs(v).format('DD/MM/YYYY HH:mm') : null;

const InvoiceDetailDrawer: React.FC<Props> = ({ invoiceId, open, onClose }) => {
  const [detail, setDetail] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !invoiceId) return;
    setLoading(true);
    setDetail(null);
    getInvoiceDetail(invoiceId)
      .then((res) => setDetail(res.data))
      .catch(() => message.error('Không tải được chi tiết đợt thu'))
      .finally(() => setLoading(false));
  }, [open, invoiceId]);

  const itemColumns: ColumnsType<InvoiceLineItem> = [
    {
      title: 'Ngày buổi',
      dataIndex: 'sessionDate',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Giá buổi',
      dataIndex: 'price',
      align: 'right',
      render: (v: number) => formatVnd(v),
    },
  ];

  const timeline = (d: InvoiceDetail) => {
    const items = [
      {
        color: 'gray',
        children: `Tạo nháp · ${fmt(d.createdAt) ?? '—'}`,
      },
    ];
    if (d.confirmedAt) {
      items.push({
        color: 'blue',
        children: `Xác nhận học phí · ${fmt(d.confirmedAt)}`,
      });
    }
    if (d.paidAt) {
      items.push({
        color: 'green',
        children: `Đã thu tiền · ${fmt(d.paidAt)}`,
      });
    }
    if (d.status === 'CANCELLED') {
      items.push({ color: 'red', children: 'Đã hủy' });
    }
    return items;
  };

  return (
    <Drawer
      title="Chi tiết đợt thu"
      width="66vw"
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      {loading || !detail ? (
        <Spin style={{ display: 'block', margin: '80px auto' }} />
      ) : (
        <>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Học viên">
              {detail.studentName} ({detail.username})
            </Descriptions.Item>
            <Descriptions.Item label="Khóa học">
              {detail.className}
            </Descriptions.Item>
            <Descriptions.Item label="Kỳ">
              {dayjs(detail.periodFrom).format('DD/MM/YYYY')} –{' '}
              {dayjs(detail.periodTo).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Số buổi">
              {detail.sessionCount}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng trước giảm">
              {formatVnd(detail.grossAmount)}
            </Descriptions.Item>
            <Descriptions.Item label="% giảm">
              {detail.discountPercent}%
            </Descriptions.Item>
            <Descriptions.Item label="Thành tiền">
              <strong>{formatVnd(detail.amount)}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={INVOICE_STATUS_META[detail.status].color}>
                {INVOICE_STATUS_META[detail.status].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Nội dung CK" span={2}>
              <Typography.Text copyable strong>
                {detail.paymentCode}
              </Typography.Text>
            </Descriptions.Item>
            {detail.note ? (
              <Descriptions.Item label="Ghi chú" span={2}>
                {detail.note}
              </Descriptions.Item>
            ) : null}
          </Descriptions>

          <Typography.Title level={5} style={{ marginTop: 24 }}>
            Trạng thái
          </Typography.Title>
          <Timeline items={timeline(detail)} />

          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Các buổi tính phí
          </Typography.Title>
          <Table<InvoiceLineItem>
            rowKey="id"
            size="small"
            dataSource={detail.items}
            columns={itemColumns}
            pagination={false}
            locale={{ emptyText: 'Không có buổi' }}
          />
        </>
      )}
    </Drawer>
  );
};

export default InvoiceDetailDrawer;
