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
import ClassForm from './components/ClassForm';
import ClassScheduleDrawer from './components/ClassScheduleDrawer';
import ManageStudentsDrawer from './components/ManageStudentsDrawer';
import ViewClassDrawer from './components/ViewClassDrawer';
import ViewClassExamsDrawer from './components/ViewClassExamsDrawer';
import type { ClassItem, ClassQuery } from './data';
import { queryClasses, updateClassStatus } from './service';

const STATUS_OPTIONS = [
  { label: 'Hoạt động', value: 'ACTIVE' },
  { label: 'Tạm dừng', value: 'INACTIVE' },
];

const ClassPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [searchParams, setSearchParams] = useState<ClassQuery>({
    status: 'ACTIVE',
  });
  const [viewId, setViewId] = useState<number | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [manageStudents, setManageStudents] = useState<{
    classId: number;
    className: string;
  } | null>(null);
  const [viewExams, setViewExams] = useState<{
    classId: number;
    className: string;
  } | null>(null);
  const [scheduleFor, setScheduleFor] = useState<{
    classId: number;
    className: string;
  } | null>(null);
  const [editData, setEditData] = useState<ClassItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const handleToggleStatus = async (record: ClassItem) => {
    if (togglingIds.has(record.id)) return;
    setTogglingIds((prev) => new Set(prev).add(record.id));
    try {
      const newStatus = record.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await updateClassStatus(Number(record.id), newStatus);
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

  const columns: ProColumns<ClassItem>[] = [
    {
      title: 'Mã khóa',
      dataIndex: 'code',
      render: (dom, record) => (
        <a onClick={() => setViewId(Number(record.id))}>{dom}</a>
      ),
    },
    {
      title: 'Tên khóa',
      dataIndex: 'name',
    },
    {
      title: 'Môn học',
      dataIndex: 'subjectName',
    },
    {
      title: 'Khối',
      dataIndex: 'gradeLevel',
    },
    {
      title: 'Giáo viên',
      dataIndex: 'teachers',
      render: (_, record) =>
        record.teachers?.length
          ? record.teachers
              .map((t) => `${t.fullName} (${t.username})`)
              .join(', ')
          : '—',
    },
    {
      title: 'Lịch học',
      key: 'schedule',
      width: 90,
      render: (_, record) => (
        <a
          onClick={() =>
            setScheduleFor({
              classId: Number(record.id),
              className: record.name,
            })
          }
        >
          Xem
        </a>
      ),
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      valueType: 'date',
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      valueType: 'date',
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
          {togglingIds.has(record.id)
            ? '...'
            : record.status === 'ACTIVE'
              ? 'Hoạt động'
              : 'Tạm dừng'}
        </Tag>
      ),
    },
    {
      title: 'Học sinh',
      dataIndex: 'studentCount',
      width: 100,
      render: (count, record) => (
        <a
          onClick={() =>
            setManageStudents({
              classId: Number(record.id),
              className: record.name,
            })
          }
        >
          {count ?? 0} học sinh
        </a>
      ),
    },
    {
      title: 'Đề thi',
      dataIndex: 'examCount',
      width: 90,
      render: (count, record) => (
        <a
          onClick={() =>
            setViewExams({
              classId: Number(record.id),
              className: record.name,
            })
          }
        >
          {count ?? 0} đề
        </a>
      ),
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      key: 'option',
      render: (_, record) => [
        <a key="view" onClick={() => setViewId(Number(record.id))}>
          Xem
        </a>,
        <a
          key="edit"
          onClick={() => {
            setEditData(record);
            setEditOpen(true);
          }}
        >
          Sửa
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ViewClassDrawer
        id={viewId}
        open={viewId !== null}
        onClose={() => setViewId(null)}
      />
      <ManageStudentsDrawer
        classId={manageStudents?.classId ?? null}
        className={manageStudents?.className}
        open={manageStudents !== null}
        onClose={() => setManageStudents(null)}
      />
      <ViewClassExamsDrawer
        classId={viewExams?.classId ?? null}
        className={viewExams?.className}
        open={viewExams !== null}
        onClose={() => setViewExams(null)}
      />
      <ClassScheduleDrawer
        classId={scheduleFor?.classId ?? null}
        className={scheduleFor?.className}
        open={scheduleFor !== null}
        onClose={() => setScheduleFor(null)}
      />
      <ClassForm
        mode="edit"
        editData={editData}
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) setEditData(null);
        }}
        onSuccess={() => {
          setEditOpen(false);
          setEditData(null);
          actionRef.current?.reload();
        }}
      />
      <ProCard title="Tìm kiếm khóa học" style={{ marginBottom: 16 }}>
        <QueryFilter<ClassQuery>
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
          <ProFormText name="code" label="Mã khóa" placeholder="Nhập mã khóa" />
          <ProFormText
            name="name"
            label="Tên khóa"
            placeholder="Nhập tên khóa"
          />
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
          <ProFormDatePicker
            name="startFrom"
            label="Bắt đầu từ"
            placeholder="dd/mm/yyyy"
            fieldProps={{ format: 'DD/MM/YYYY' }}
          />
          <ProFormDatePicker
            name="endTo"
            label="Kết thúc đến"
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

      <ProTable<ClassItem, ClassQuery>
        headerTitle="Danh sách khóa học"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        toolBarRender={() => [
          <ClassForm
            key="create"
            mode="create"
            onSuccess={() => actionRef.current?.reload()}
          />,
        ]}
        request={async ({ current, pageSize }) =>
          queryClasses({ ...searchParams, current, pageSize })
        }
        columns={columns}
      />
    </PageContainer>
  );
};

export default ClassPage;
