import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { message, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import CreateExerciseForm from './components/CreateExerciseForm';
import type { ExerciseItem, ExerciseQuery } from './data';
import { queryExercises, updateExerciseStatus } from './service';

const STATUS_OPTIONS = [
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'INACTIVE', value: 'INACTIVE' },
];

const DIFFICULTY_OPTIONS = [
  { label: 'Dễ', value: 'EASY' },
  { label: 'Trung bình', value: 'MEDIUM' },
  { label: 'Khó', value: 'HARD' },
];

const DIFFICULTY_META: Record<string, { label: string; color: string }> = {
  EASY: { label: 'Dễ', color: 'success' },
  MEDIUM: { label: 'Trung bình', color: 'warning' },
  HARD: { label: 'Khó', color: 'error' },
};

const ExercisePage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [searchParams, setSearchParams] = useState<ExerciseQuery>({
    status: 'ACTIVE',
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  const handleToggleStatus = async (record: ExerciseItem) => {
    if (togglingIds.has(record.id)) return;
    setTogglingIds((prev) => new Set(prev).add(record.id));
    try {
      const newStatus = record.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await updateExerciseStatus(Number(record.id), newStatus);
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

  const columns: ProColumns<ExerciseItem>[] = [
    {
      title: 'Mã bài',
      dataIndex: 'code',
      render: (dom, record) => (
        <a onClick={() => setEditId(Number(record.id))}>{dom}</a>
      ),
    },
    {
      title: 'Tên bài tập',
      dataIndex: 'title',
    },
    {
      title: 'Khối lớp',
      dataIndex: 'gradeLevel',
    },
    {
      title: 'Môn học',
      dataIndex: 'subjectName',
    },
    {
      title: 'Chuyên đề',
      dataIndex: 'topicName',
      render: (val) => val || '—',
    },
    {
      title: 'Độ khó',
      dataIndex: 'difficulty',
      render: (_, record) => {
        const meta = DIFFICULTY_META[record.difficulty];
        return meta ? <Tag color={meta.color}>{meta.label}</Tag> : '—';
      },
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
    },
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
      key: 'option',
      render: (_, record) => [
        <a key="view" onClick={() => setEditId(Number(record.id))}>
          Xem / Sửa
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <CreateExerciseForm
        editId={editId}
        open={editId !== null}
        onOpenChange={(o) => {
          if (!o) setEditId(null);
        }}
        onSuccess={() => {
          setEditId(null);
          actionRef.current?.reload();
        }}
      />
      <ProCard title="Tìm kiếm bài tập" style={{ marginBottom: 16 }}>
        <QueryFilter<ExerciseQuery>
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
          <ProFormText name="code" label="Mã bài" placeholder="Nhập mã bài" />
          <ProFormSelect
            name="subjectId"
            label="Môn học"
            placeholder="Tất cả"
            allowClear
            request={async () => {
              const res = await request('/api/v1/subjects', {
                params: { status: 'ACTIVE', pageSize: 100 },
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
            name="difficulty"
            label="Độ khó"
            placeholder="Tất cả"
            allowClear
            options={DIFFICULTY_OPTIONS}
          />
          <ProFormText
            name="createdBy"
            label="Người tạo"
            placeholder="Nhập người tạo"
          />
          <ProFormDatePicker
            name="createdFrom"
            label="Ngày tạo từ"
            placeholder="dd/mm/yyyy"
            fieldProps={{ format: 'DD/MM/YYYY' }}
          />
          <ProFormDatePicker
            name="createdTo"
            label="Ngày tạo đến"
            placeholder="dd/mm/yyyy"
            fieldProps={{ format: 'DD/MM/YYYY' }}
          />
          <ProFormSelect
            name="status"
            label="Trạng thái"
            options={STATUS_OPTIONS}
            allowClear={false}
          />
        </QueryFilter>
      </ProCard>

      <ProTable<ExerciseItem, ExerciseQuery>
        headerTitle="Danh sách bài tập"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        toolBarRender={() => [
          <CreateExerciseForm
            key="create"
            onSuccess={() => actionRef.current?.reload()}
          />,
        ]}
        request={async ({ current, pageSize }) =>
          queryExercises({ ...searchParams, current, pageSize })
        }
        columns={columns}
      />
    </PageContainer>
  );
};

export default ExercisePage;
