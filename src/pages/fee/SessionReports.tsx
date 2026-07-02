import {
  PageContainer,
  ProCard,
  ProFormDateRangePicker,
  ProFormSelect,
  QueryFilter,
  StatisticCard,
} from '@ant-design/pro-components';
import { Button, message, Table, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import type { StudentSessionRow } from './data';
import {
  exportSessionReport,
  getStudentSessionReport,
  queryUserOptions,
} from './service';
import { formatVnd } from './utils';

type Filter = { userId: number; period: [string, string] };

const StudentReportTab: React.FC = () => {
  const [rows, setRows] = useState<StudentSessionRow[]>([]);
  const [summary, setSummary] = useState<{
    totalSessions: number;
    coMat: number;
    tre: number;
    vang: number;
    coPhep: number;
    chuaCheckin: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [ctx, setCtx] = useState<Filter | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleSearch = async (values: Filter) => {
    const from = values.period?.[0];
    const to = values.period?.[1];
    if (!values.userId || !from || !to) return;
    setLoading(true);
    try {
      const res = await getStudentSessionReport({
        studentId: values.userId,
        from,
        to,
      });
      setRows(res.data?.items ?? []);
      setSummary(res.data?.summary ?? null);
      setCtx(values);
    } catch {
      message.error('Không tải được báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!ctx) return;
    setExporting(true);
    try {
      await exportSessionReport('student', {
        userId: ctx.userId,
        from: ctx.period[0],
        to: ctx.period[1],
      });
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const columns: ColumnsType<StudentSessionRow> = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      width: 120,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    { title: 'Lớp', dataIndex: 'className' },
    {
      title: 'Giờ',
      width: 150,
      render: (_, r) => `${r.startTime} – ${r.endTime}`,
    },
    { title: 'Trạng thái', dataIndex: 'status', width: 130 },
    {
      title: 'Đơn giá buổi',
      dataIndex: 'price',
      width: 140,
      align: 'right',
      render: (v: number) => formatVnd(v),
    },
  ];

  return (
    <>
      <QueryFilter<Filter>
        layout="vertical"
        defaultCollapsed={false}
        collapseRender={false}
        submitter={{
          searchConfig: { submitText: 'Xem', resetText: 'Đặt lại' },
        }}
        onFinish={handleSearch}
      >
        <ProFormSelect
          name="userId"
          label="Học viên"
          rules={[{ required: true, message: 'Chọn học viên' }]}
          request={async ({ keyWords }) => {
            const res = await queryUserOptions('STUDENT', keyWords);
            return (res.data ?? []).map((u) => ({
              label: `${u.fullName} (${u.username})`,
              value: u.id,
            }));
          }}
          fieldProps={{ showSearch: true, filterOption: false }}
        />
        <ProFormDateRangePicker
          name="period"
          label="Khoảng ngày"
          fieldProps={{ format: 'YYYY-MM-DD' }}
          rules={[{ required: true, message: 'Chọn khoảng ngày' }]}
        />
      </QueryFilter>

      {summary ? (
        <StatisticCard.Group style={{ margin: '16px 0' }}>
          <StatisticCard
            statistic={{ title: 'Tổng buổi', value: summary.totalSessions }}
          />
          <StatisticCard
            statistic={{ title: 'Có mặt', value: summary.coMat }}
          />
          <StatisticCard statistic={{ title: 'Trễ', value: summary.tre }} />
          <StatisticCard statistic={{ title: 'Vắng', value: summary.vang }} />
          <StatisticCard
            statistic={{ title: 'Có phép', value: summary.coPhep }}
          />
          <StatisticCard
            statistic={{ title: 'Chưa checkin', value: summary.chuaCheckin }}
          />
        </StatisticCard.Group>
      ) : null}

      <div style={{ marginBottom: 12, textAlign: 'right' }}>
        <Button
          type="primary"
          disabled={!ctx}
          loading={exporting}
          onClick={handleExport}
        >
          Xuất Excel
        </Button>
      </div>

      <Table<StudentSessionRow>
        rowKey={(r) => `${r.date}-${r.className}-${r.startTime}`}
        size="small"
        loading={loading}
        dataSource={rows}
        columns={columns}
        pagination={{ pageSize: 20 }}
        locale={{ emptyText: 'Chọn học viên + khoảng ngày' }}
      />
    </>
  );
};

const TeacherReportTab: React.FC = () => {
  const [ctx, setCtx] = useState<Filter | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!ctx) return;
    setExporting(true);
    try {
      await exportSessionReport('teacher', {
        userId: ctx.userId,
        from: ctx.period[0],
        to: ctx.period[1],
      });
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <QueryFilter<Filter>
        layout="vertical"
        defaultCollapsed={false}
        collapseRender={false}
        submitter={{
          searchConfig: { submitText: 'Chọn', resetText: 'Đặt lại' },
        }}
        onFinish={async (values) => {
          if (values.userId && values.period?.[0]) setCtx(values);
        }}
      >
        <ProFormSelect
          name="userId"
          label="Giáo viên"
          rules={[{ required: true, message: 'Chọn giáo viên' }]}
          request={async ({ keyWords }) => {
            const res = await queryUserOptions('TEACHER', keyWords);
            return (res.data ?? []).map((u) => ({
              label: `${u.fullName} (${u.username})`,
              value: u.id,
            }));
          }}
          fieldProps={{ showSearch: true, filterOption: false }}
        />
        <ProFormDateRangePicker
          name="period"
          label="Khoảng ngày"
          fieldProps={{ format: 'YYYY-MM-DD' }}
          rules={[{ required: true, message: 'Chọn khoảng ngày' }]}
        />
      </QueryFilter>

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Button
          type="primary"
          disabled={!ctx}
          loading={exporting}
          onClick={handleExport}
        >
          Xuất Excel
        </Button>
      </div>
    </>
  );
};

// Trang báo cáo buổi học: 2 tab HV / GV, có nút xuất Excel.
const SessionReports: React.FC = () => (
  <PageContainer header={{ title: 'Báo cáo buổi học' }}>
    <ProCard>
      <Tabs
        items={[
          { key: 'student', label: 'Học viên', children: <StudentReportTab /> },
          {
            key: 'teacher',
            label: 'Giáo viên',
            children: <TeacherReportTab />,
          },
        ]}
      />
    </ProCard>
  </PageContainer>
);

export default SessionReports;
