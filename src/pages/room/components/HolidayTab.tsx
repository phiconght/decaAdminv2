import {
  ProCard,
  ProFormDateRangePicker,
  ProFormSelect,
  QueryFilter,
} from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { message, Popconfirm, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import type { HolidayItem } from '../data';
import { deleteHoliday, queryBranches, queryHolidays } from '../service';
import HolidayForm from './HolidayForm';

type RangeValue = [string, string];

const defaultRange = (): RangeValue => [
  dayjs().startOf('year').format('YYYY-MM-DD'),
  dayjs().endOf('year').format('YYYY-MM-DD'),
];

// Tab "Ngày nghỉ": lọc khoảng ngày + Table + form thêm + Popconfirm xóa.
// Lọc theo cơ sở làm CLIENT-SIDE (BE GET /holidays chỉ nhận from/to).
const HolidayTab: React.FC = () => {
  const access = useAccess();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<HolidayItem[]>([]);
  const [range, setRange] = useState<RangeValue>(defaultRange());
  const [branchId, setBranchId] = useState<number | undefined>(undefined);

  const fetchHolidays = async (r: RangeValue) => {
    setLoading(true);
    try {
      const res = await queryHolidays({ from: r[0], to: r[1] });
      setData(res.data ?? []);
    } catch {
      messageApi.error('Không tải được danh sách ngày nghỉ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays(defaultRange());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lọc client theo cơ sở: hiện ngày của cơ sở đã chọn + ngày toàn hệ thống.
  const filtered = useMemo(() => {
    if (branchId == null) return data;
    return data.filter((h) => h.branchId == null || h.branchId === branchId);
  }, [data, branchId]);

  const handleDelete = async (id: number) => {
    try {
      await deleteHoliday(id);
      messageApi.success('Đã xóa ngày nghỉ');
      fetchHolidays(range);
    } catch {
      messageApi.error('Không thể xóa ngày nghỉ');
    }
  };

  const columns: ColumnsType<HolidayItem> = [
    {
      title: 'Ngày',
      dataIndex: 'holidayDate',
      width: 130,
      render: (value: string) => dayjs(value).format('DD/MM/YYYY'),
    },
    { title: 'Tên ngày nghỉ', dataIndex: 'name' },
    {
      title: 'Phạm vi',
      dataIndex: 'branchName',
      render: (_, record) =>
        record.branchId == null ? (
          <Tag color="blue">Toàn hệ thống</Tag>
        ) : (
          (record.branchName ?? '—')
        ),
    },
  ];

  if (access.canWriteRoom) {
    columns.push({
      title: 'Thao tác',
      key: 'option',
      width: 90,
      render: (_, record) => (
        <Popconfirm
          title="Xóa ngày nghỉ này?"
          description="Xóa ngày nghỉ có thể khiến các buổi học được sinh vào ngày này."
          okText="Xóa"
          cancelText="Hủy"
          onConfirm={() => handleDelete(record.id)}
        >
          <a>Xóa</a>
        </Popconfirm>
      ),
    });
  }

  return (
    <>
      {contextHolder}
      <ProCard title="Bộ lọc" style={{ marginBottom: 16 }}>
        <QueryFilter
          defaultCollapsed={false}
          collapseRender={false}
          layout="vertical"
          initialValues={{ dateRange: defaultRange() }}
          submitter={{
            searchConfig: { resetText: 'Đặt lại', submitText: 'Xem' },
          }}
          onFinish={async (values: {
            dateRange?: RangeValue;
            branchId?: number;
          }) => {
            const r = values.dateRange ?? defaultRange();
            setRange(r);
            setBranchId(values.branchId);
            await fetchHolidays(r);
          }}
          onReset={() => {
            const r = defaultRange();
            setRange(r);
            setBranchId(undefined);
            fetchHolidays(r);
          }}
        >
          <ProFormDateRangePicker
            name="dateRange"
            label="Khoảng ngày"
            fieldProps={{ format: 'DD/MM/YYYY' }}
            rules={[{ required: true, message: 'Chọn khoảng ngày' }]}
          />
          <ProFormSelect
            name="branchId"
            label="Cơ sở (lọc client)"
            placeholder="Tất cả"
            allowClear
            request={async () => {
              const res = await queryBranches(true);
              return (res.data ?? []).map((b) => ({
                label: `${b.name} (${b.code})`,
                value: b.id,
              }));
            }}
            fieldProps={{
              showSearch: true,
              filterOption: (input: string, option?: { label?: string }) =>
                String(option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase()),
            }}
          />
        </QueryFilter>
      </ProCard>

      <ProCard
        title="Ngày nghỉ"
        extra={
          access.canWriteRoom ? (
            <HolidayForm onSuccess={() => fetchHolidays(range)} />
          ) : undefined
        }
      >
        <Table<HolidayItem>
          rowKey="id"
          size="small"
          loading={loading}
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 20, showSizeChanger: false }}
          locale={{ emptyText: 'Không có ngày nghỉ trong khoảng' }}
        />
      </ProCard>
    </>
  );
};

export default HolidayTab;
