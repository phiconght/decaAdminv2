import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProFormSelect,
  ProFormText,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { message, Popconfirm, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import ExamClassesDrawer from './components/ExamClassesDrawer';
import ExamEditorDrawer from './components/ExamEditorDrawer';
import type { ExamItem, ExamQuery } from './data';
import { deleteExam, queryExams } from './service';

// Trạng thái phát hành cấp đề, suy từ status + thời gian (khớp bộ trạng thái đề thi).
const examStatus = (r: ExamItem): { label: string; color: string } => {
  if (r.status === 'INACTIVE') {
    return { label: 'Chưa phát hành', color: 'default' };
  }
  const now = dayjs();
  if (!r.publishAt || now.isBefore(dayjs(r.publishAt))) {
    return { label: 'Chưa phát hành', color: 'default' };
  }
  if (r.endAt && now.isAfter(dayjs(r.endAt))) {
    return { label: 'Quá hạn', color: 'error' };
  }
  return { label: 'Đã phát hành', color: 'processing' };
};

const TYPE_OPTIONS = [
  { label: 'Theo khóa', value: 'BY_CLASS' },
  { label: 'Bổ sung', value: 'SUPPLEMENTARY' },
];
const STATUS_OPTIONS = [
  { label: 'Đã phát hành', value: 'ACTIVE' },
  { label: 'Chưa phát hành', value: 'INACTIVE' },
];

const ExamPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [searchParams, setSearchParams] = useState<ExamQuery>({
    status: 'ACTIVE',
  });
  const [classesFor, setClassesFor] = useState<{
    examId: number;
    examName: string;
  } | null>(null);
  // editor: undefined = đóng; null = tạo mới; number = sửa id
  const [editorId, setEditorId] = useState<number | null | undefined>(
    undefined,
  );

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
        <a onClick={() => setEditorId(record.id)}>{dom}</a>
      ),
    },
    { title: 'Tên đề', dataIndex: 'name', ellipsis: true },
    {
      title: 'Môn — Khối',
      render: (_, r) => `${r.subjectName} — ${r.gradeLevel}`,
    },
    {
      title: 'Chuyên đề',
      dataIndex: 'topicName',
      render: (val) => val || '—',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      render: (_, r) => (
        <Tag color={r.type === 'BY_CLASS' ? 'blue' : 'purple'}>
          {r.type === 'BY_CLASS' ? 'Theo khóa' : 'Bổ sung'}
        </Tag>
      ),
    },
    {
      title: 'TG làm (phút)',
      dataIndex: 'durationMinutes',
      width: 110,
    },
    {
      title: 'Bắt đầu',
      dataIndex: 'publishAt',
      width: 140,
      render: (_, r) =>
        r.publishAt ? dayjs(r.publishAt).format('DD/MM/YYYY HH:mm') : '—',
    },
    {
      title: 'Kết thúc',
      dataIndex: 'endAt',
      width: 140,
      render: (_, r) =>
        r.endAt ? dayjs(r.endAt).format('DD/MM/YYYY HH:mm') : '—',
    },
    {
      title: 'Số câu',
      dataIndex: 'exerciseCount',
      width: 80,
    },
    {
      title: 'Số khóa',
      dataIndex: 'classCount',
      width: 90,
      render: (count, record) => (
        <a
          onClick={() =>
            setClassesFor({ examId: record.id, examName: record.name })
          }
        >
          {count ?? 0} khóa
        </a>
      ),
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
      width: 140,
      render: (_, record) => {
        const s = examStatus(record);
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      render: (_, record) => [
        <a key="edit" onClick={() => setEditorId(record.id)}>
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
      <ExamClassesDrawer
        examId={classesFor?.examId ?? null}
        examName={classesFor?.examName}
        open={classesFor !== null}
        onClose={() => setClassesFor(null)}
      />
      <ExamEditorDrawer
        examId={editorId ?? null}
        open={editorId !== undefined}
        onClose={() => setEditorId(undefined)}
        onSaved={() => {
          setEditorId(undefined);
          actionRef.current?.reload();
        }}
      />
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
          <a key="create" onClick={() => setEditorId(null)}>
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
