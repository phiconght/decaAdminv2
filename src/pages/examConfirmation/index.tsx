import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import type { ExamConfirmationItem, ExamConfirmationQuery } from './data';
import { confirmExam, confirmExamsBulk, queryPendingExams } from './service';

// Xac nhan bai thi da nop (DA_LAM) truoc khi tinh vao bao cao — yeu cau
// nguoi dung 13/08/2026. Xac nhan tung bai hoac hang loat (chon dong + nut
// "Xac nhan da chon").
const ExamConfirmationPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleConfirm = async (record: ExamConfirmationItem) => {
    try {
      await confirmExam(record.examStudentId);
      message.success('Đã xác nhận bài thi');
      actionRef.current?.reload();
    } catch {
      message.error('Xác nhận thất bại');
    }
  };

  const handleConfirmBulk = async () => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      const res = await confirmExamsBulk(selectedIds);
      message.success(`Đã xác nhận ${res.data} bài thi`);
      setSelectedIds([]);
      actionRef.current?.reload();
    } catch {
      message.error('Xác nhận hàng loạt thất bại');
    } finally {
      setBulkLoading(false);
    }
  };

  const columns: ProColumns<ExamConfirmationItem>[] = [
    { title: 'Học viên', dataIndex: 'studentName', width: 180 },
    { title: 'Mã đề', dataIndex: 'examCode', width: 120 },
    { title: 'Đề thi', dataIndex: 'examName', ellipsis: true },
    {
      title: 'Điểm',
      dataIndex: 'score',
      width: 90,
      render: (_, record) => record.score ?? '—',
    },
    {
      title: 'Nộp lúc',
      dataIndex: 'submittedAt',
      width: 160,
      render: (_, record) =>
        record.submittedAt
          ? dayjs(record.submittedAt).format('DD/MM/YYYY HH:mm')
          : '—',
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <Popconfirm
          key="confirm"
          title={`Xác nhận bài thi của ${record.studentName}?`}
          okText="Xác nhận"
          cancelText="Hủy"
          onConfirm={() => handleConfirm(record)}
        >
          <a>Xác nhận</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<ExamConfirmationItem, ExamConfirmationQuery>
        headerTitle="Bài thi chờ xác nhận"
        actionRef={actionRef}
        rowKey="examStudentId"
        search={false}
        options={false}
        scroll={{ x: 'max-content' }}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: (keys) => setSelectedIds(keys as number[]),
        }}
        tableAlertOptionRender={() => (
          <Button
            type="primary"
            size="small"
            loading={bulkLoading}
            onClick={handleConfirmBulk}
          >
            Xác nhận đã chọn
          </Button>
        )}
        request={async ({ current, pageSize }) =>
          queryPendingExams({ current, pageSize })
        }
        columns={columns}
      />
    </PageContainer>
  );
};

export default ExamConfirmationPage;
