import { SearchOutlined } from '@ant-design/icons';
import { Empty, Input, Select, Spin, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import type { ImportBatchListItem } from '../../data';
import { queryMyImportBatches } from '../../service';

const BATCH_STATUS_META: Record<
  ImportBatchListItem['status'],
  { label: string; color: string }
> = {
  IN_PROGRESS: { label: 'Đang xử lý', color: 'gold' },
  COMPLETED: { label: 'Đã hoàn tất', color: 'success' },
  ABANDONED: { label: 'Đã hủy', color: 'default' },
};

type Props = {
  /** Chon 1 lo de xem/duyet tiep. */
  onSelect: (id: number) => void;
  /** Tang len de ep panel nay tai lai danh sach (vd sau khi tao lo moi). */
  refreshKey?: number;
};

/**
 * Danh sach + tim kiem cac lo da nhap truoc do (con dang do dang hoac da
 * xong) — cho phep mo lai 1 lo cu de tiep tuc duyet/them anh/xac nhan/xoa,
 * khong chi thay dung lo vua nhap trong phien hien tai.
 */
const ImportBatchListPanel: React.FC<Props> = ({ onSelect, refreshKey }) => {
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<ImportBatchListItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'IN_PROGRESS' | 'ALL'>(
    'IN_PROGRESS',
  );

  const load = () => {
    setLoading(true);
    queryMyImportBatches()
      .then((res) => setBatches(res.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, [refreshKey]);

  const filtered = batches.filter((b) => {
    if (statusFilter === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS')
      return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      b.sourceFileName?.toLowerCase().includes(q) ||
      b.subjectName?.toLowerCase().includes(q) ||
      b.examName?.toLowerCase().includes(q)
    );
  });

  const columns: ColumnsType<ImportBatchListItem> = [
    {
      title: 'Tên file',
      dataIndex: 'sourceFileName',
      render: (v) => v || '—',
    },
    {
      title: 'Môn học',
      dataIndex: 'subjectName',
      render: (_, r) => `${r.subjectName} — ${r.gradeLevel}`,
    },
    {
      title: 'Đề thi',
      dataIndex: 'examName',
      render: (v) => v || '—',
    },
    {
      title: 'Số câu',
      dataIndex: 'totalCount',
      width: 90,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (v: ImportBatchListItem['status']) => (
        <Tag color={BATCH_STATUS_META[v].color}>
          {BATCH_STATUS_META[v].label}
        </Tag>
      ),
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'createdAt',
      width: 110,
      render: (v) => (v ? new Date(v).toLocaleDateString('vi-VN') : '—'),
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_, r) => <a onClick={() => onSelect(r.id)}>Xem</a>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Input
          placeholder="Tìm theo tên file, môn học, tên đề thi..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
        <Select<'IN_PROGRESS' | 'ALL'>
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 180 }}
          options={[
            { label: 'Đang xử lý (chưa xong)', value: 'IN_PROGRESS' },
            { label: 'Tất cả', value: 'ALL' },
          ]}
        />
      </div>
      <Spin spinning={loading}>
        {filtered.length === 0 ? (
          <Empty
            description={
              statusFilter === 'IN_PROGRESS'
                ? 'Không có lô nào đang xử lý dở dang'
                : 'Chưa có lô nào'
            }
          />
        ) : (
          <Table<ImportBatchListItem>
            rowKey="id"
            size="small"
            columns={columns}
            dataSource={filtered}
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 10 }}
            onRow={(r) => ({
              onClick: () => onSelect(r.id),
              style: { cursor: 'pointer' },
            })}
          />
        )}
      </Spin>
    </div>
  );
};

export default ImportBatchListPanel;
