import { useAccess } from '@umijs/max';
import { InputNumber, message, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import type { SessionPriceItem } from '../data';
import { updateSessionPrice } from '../service';
import { formatVnd } from '../utils';

type Props = {
  data: SessionPriceItem[];
  loading: boolean;
  onChanged: () => void;
};

// Buổi PLANNED chưa bắt đầu → sửa giá inline; buổi đã diễn ra → read-only, mờ.
const isEditable = (r: SessionPriceItem) => r.status === 'PLANNED';

const SessionPriceTable: React.FC<Props> = ({ data, loading, onChanged }) => {
  const access = useAccess();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async (r: SessionPriceItem) => {
    if (draft == null || draft < 0) {
      setEditingId(null);
      return;
    }
    setSaving(true);
    try {
      await updateSessionPrice(r.sessionId, draft);
      message.success('Đã cập nhật giá buổi');
      setEditingId(null);
      onChanged();
    } catch {
      message.error('Cập nhật giá buổi thất bại');
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<SessionPriceItem> = [
    { title: 'Ngày', dataIndex: 'date', width: 120 },
    { title: 'Giờ', dataIndex: 'time', width: 130 },
    { title: 'Trạng thái', dataIndex: 'status', width: 120 },
    {
      title: 'Giá / buổi',
      dataIndex: 'price',
      width: 220,
      render: (_, r) => {
        const editable = isEditable(r) && access.canWriteFee;
        if (editingId === r.sessionId) {
          return (
            <InputNumber
              autoFocus
              min={0}
              step={1000}
              value={draft ?? undefined}
              disabled={saving}
              style={{ width: 150 }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={(v) => Number((v ?? '').replace(/\./g, ''))}
              onChange={(v) => setDraft(v as number)}
              onBlur={() => save(r)}
              onPressEnter={() => save(r)}
            />
          );
        }
        return (
          <span
            style={{
              opacity: editable ? 1 : 0.5,
              cursor: editable ? 'pointer' : 'default',
            }}
            onClick={() => {
              if (!editable) return;
              setEditingId(r.sessionId);
              setDraft(r.price);
            }}
          >
            {formatVnd(r.price)}
          </span>
        );
      },
    },
    {
      title: '',
      dataIndex: 'priceOverridden',
      width: 130,
      render: (v: boolean) =>
        v ? <Tag color="orange">Đã chỉnh tay</Tag> : null,
    },
  ];

  return (
    <Table<SessionPriceItem>
      rowKey="sessionId"
      size="small"
      loading={loading}
      dataSource={data}
      columns={columns}
      pagination={{ pageSize: 15, showSizeChanger: false }}
      locale={{ emptyText: 'Chưa có buổi học trong khoảng' }}
    />
  );
};

export default SessionPriceTable;
