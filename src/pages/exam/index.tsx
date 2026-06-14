import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProFormSelect,
  ProFormText,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import { history, request } from '@umijs/max';
import { message, Popconfirm, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import type { ExamItem, ExamQuery } from './data';
import { deleteExam, queryExams, updateExamStatus } from './service';

const TYPE_OPTIONS = [
  { label: 'Theo lớp', value: 'BY_CLASS' },
  { label: 'Bổ sung', value: 'SUPPLEMENTARY' },
];
const STATUS_OPTIONS = [
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'INACTIVE', value: 'INACTIVE' },
];

const ExamPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [searchParams, setSearchParams] = useState<ExamQuery>({
    status: 'ACTIVE',
  });
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

  const handleToggleStatus = async (record: ExamItem) => {
    if (togglingIds.has(record.id)) return;
    setTogglingIds((prev) => new Set(prev).add(record.id));
    try {
      const newStatus = record.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await updateExamStatus(record.id, newStatus);
      actionRef.current?.reload();
    } catch {
      message.error('Không thể thay đổi trạng thái');
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(record.id);
        return next;
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteExam(id);
      message.success('Đã xóa đề thi');
      actionRef.current?.reload();
    } catch {
      message.error('Xóa đề thi thất bại');
    }
  };

  const columns: ProColumns<ExamItem>[] = [
    {
      title: 'Mã đề',
      dataIndex: 'code',
      render: (dom, record) => (
        <a onClick={() => history.push(`/exam/${record.id}/edit`)}>{dom}</a>
      ),
    },
    { title: 'Tên đề', dataIndex: 'name', ellipsis: true },
    {
      title: 'Môn — Khối',
      render: (_, r) => `${r.subjectName} — ${r.gradeLevel}`,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      render: (_, r) => (
        <Tag color={r.type === 'BY_CLASS' ? 'blue' : 'purple'}>
          {r.type === 'BY_CLASS' ? 'Theo lớp' : 'Bổ sung'}
        </Tag>
      ),
    },
    {
      title: 'TG làm (phút)',
      dataIndex: 'durationMinutes',
      width: 110,
    },
    {
      title: 'Số câu',
      dataIndex: 'exerciseCount',
      width: 80,
    },
    {
      title: 'Số lớp',
      dataIndex: 'classCount',
      width: 80,
    },
    { title: 'Người tạo', dataIndex: 'createdBy' },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      valueType: 'date',
      sorter: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (_, record) => (
        <Tag
          color={record.status === 'ACTIVE' ? 'success' : 'default'}
          style={{ cursor: 'pointer' }}
          onClick={() => handleToggleStatus(record)}
        >
          {togglingIds.has(record.id) ? '...' : record.status}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      render: (_, record) => [
        <a key="edit" onClick={() => history.push(`/exam/${record.id}/edit`)}>
          Sửa
        </a>,
        <Popconfirm
          key="delete"
          title="Xóa đề thi này?"
          okText="Xóa"
          cancelText="Hủy"
          onConfirm={() => handleDelete(record.id)}
        >
          <a style={{ color: '#ff4d4f' }}>Xóa</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProCard title="Tìm kiếm đề thi" style={{ marginBottom: 16 }}>
        <QueryFilter<ExamQuery>
          initialValues={{ status: 'ACTIVE' }}
          defaultCollapsed={false}
          collapseRender={false}
          layout="vertical"
          submitter={{
            searchConfig: { resetText: 'Đặt lại', submitText: 'Tìm kiếm' },
          }}
          onFinish={async (values) => {
            setSearchParams(values);
            actionRef.current?.reload();
          }}
          onReset={() => {
            setSearchParams({ status: 'ACTIVE' });
            actionRef.current?.reload();
          }}
        >
          <ProFormText name="code" label="Mã đề" placeholder="Nhập mã đề" />
          <ProFormText name="name" label="Tên đề" placeholder="Nhập tên đề" />
          <ProFormSelect
            name="subjectId"
            label="Môn học"
            placeholder="Tất cả"
            allowClear
            request={async () => {
              const res = await request('/api/v1/subjects', {
                params: { pageSize: 100 },
              });
              return (res.data ?? []).map(
                (s: { id: number; name: string; gradeLevel: string }) => ({
                  label: `${s.name} — ${s.gradeLevel}`,
                  value: s.id,
                }),
              );
            }}
            fieldProps={{
              showSearch: true,
              filterOption: (input: string, option?: { label?: string }) =>
                String(option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase()),
            }}
          />
          <ProFormSelect
            name="type"
            label="Loại đề"
            options={TYPE_OPTIONS}
            allowClear
          />
          <ProFormSelect
            name="status"
            label="Trạng thái"
            options={STATUS_OPTIONS}
            allowClear={false}
          />
        </QueryFilter>
      </ProCard>

      <ProTable<ExamItem, ExamQuery>
        headerTitle="Danh sách đề thi"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        toolBarRender={() => [
          <a key="create" onClick={() => history.push('/exam/new')}>
            <Tag
              color="blue"
              style={{ cursor: 'pointer', padding: '4px 12px' }}
            >
              + Tạo đề thi
            </Tag>
          </a>,
        ]}
        request={async ({ current, pageSize }) =>
          queryExams({ ...searchParams, current, pageSize })
        }
        columns={columns}
      />
    </PageContainer>
  );
};

export default ExamPage;
