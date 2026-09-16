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
import { Badge, message, Popconfirm, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import BulkImportDrawer from './components/bulk-import/BulkImportDrawer';
import CreateExerciseForm from './components/CreateExerciseForm';
import type { ExerciseItem, ExerciseQuery, ExerciseStatus } from './data';
import {
  confirmExercise,
  getImportBatchInProgressCount,
  queryExercises,
  updateExerciseStatus,
} from './service';
import { EXERCISE_STATUS_META } from './statusMeta';

const STATUS_OPTIONS = (
  Object.keys(EXERCISE_STATUS_META) as ExerciseStatus[]
).map((s) => ({
  label: EXERCISE_STATUS_META[s].label,
  value: s,
}));

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
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [inProgressCount, setInProgressCount] = useState(0);

  const reloadBadge = () => {
    getImportBatchInProgressCount()
      .then((res) => setInProgressCount(res.data ?? 0))
      .catch(() => {});
  };

  useEffect(() => {
    reloadBadge();
  }, []);

  const reload = () => {
    actionRef.current?.reload();
    reloadBadge();
  };

  const handleConfirm = async (id: number) => {
    try {
      await confirmExercise(id);
      message.success('Đã xác nhận bài tập');
      reload();
    } catch {
      message.error('Xác nhận thất bại');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await updateExerciseStatus(id, 'DELETED');
      message.success('Đã xóa bài tập');
      reload();
    } catch {
      message.error('Xóa thất bại');
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
      render: (_, record) => {
        const meta = EXERCISE_STATUS_META[record.status];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      key: 'option',
      render: (_, record) => {
        const id = Number(record.id);
        if (record.status === 'DELETED') return [];
        const actions: React.ReactNode[] = [
          <a key="view" onClick={() => setEditId(id)}>
            Xem / Sửa
          </a>,
        ];
        if (record.status === 'PENDING') {
          actions.push(
            <Popconfirm
              key="confirm"
              title="Xác nhận bài tập này để đưa vào sử dụng?"
              okText="Xác nhận"
              cancelText="Đóng"
              onConfirm={() => handleConfirm(id)}
            >
              <a>Xác nhận</a>
            </Popconfirm>,
          );
        }
        actions.push(
          <Popconfirm
            key="delete"
            title="Xóa bài tập này?"
            okText="Xóa"
            cancelText="Đóng"
            onConfirm={() => handleDelete(id)}
          >
            <a style={{ color: '#ff4d4f' }}>Xóa</a>
          </Popconfirm>,
        );
        return actions;
      },
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
          reload();
        }}
      />
      <BulkImportDrawer
        open={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        onChanged={reload}
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
        scroll={{ x: 'max-content' }}
        toolBarRender={() => [
          <CreateExerciseForm key="create" onSuccess={() => reload()} />,
          <Badge
            key="import"
            count={inProgressCount}
            size="small"
            offset={[-6, 4]}
          >
            <a
              onClick={() => setBulkImportOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 15px',
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                color: 'rgba(0,0,0,0.88)',
              }}
            >
              Nhập theo lô
            </a>
          </Badge>,
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
