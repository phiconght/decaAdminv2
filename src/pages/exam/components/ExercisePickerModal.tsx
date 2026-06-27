import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Modal, message, Tag } from 'antd';
import React, { useState } from 'react';
import CreateExerciseForm from '@/pages/exercise/components/CreateExerciseForm';
import type { ExamExerciseLine } from '../data';

type ExerciseRow = {
  id: number;
  code: string;
  title?: string;
  type: string;
  subjectName: string;
  gradeLevel: string;
  trueFalseItems?: { id: number; text: string }[];
};

type Props = {
  open: boolean;
  subjectId?: number;
  topicId?: number;
  alreadyIds: Set<number>;
  onClose: () => void;
  onAdd: (lines: ExamExerciseLine[]) => void;
};

const TYPE_LABEL: Record<string, string> = {
  MULTIPLE_CHOICE: 'Trắc nghiệm',
  ESSAY: 'Tự luận',
  TRUE_FALSE: 'Đúng/Sai',
};

const TYPE_COLOR: Record<string, string> = {
  MULTIPLE_CHOICE: 'blue',
  ESSAY: 'orange',
  TRUE_FALSE: 'purple',
};

const ExercisePickerModal: React.FC<Props> = ({
  open,
  subjectId,
  topicId,
  alreadyIds,
  onClose,
  onAdd,
}) => {
  const [selectedRows, setSelectedRows] = useState<ExerciseRow[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);

  const columns: ProColumns<ExerciseRow>[] = [
    { title: 'Mã', dataIndex: 'code', width: 140 },
    { title: 'Tiêu đề', dataIndex: 'title', ellipsis: true },
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 110,
      render: (_, r) => (
        <Tag color={TYPE_COLOR[r.type] ?? 'default'}>
          {TYPE_LABEL[r.type] ?? r.type}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      width: 70,
      render: (_, record) => <a onClick={() => setViewId(record.id)}>Xem</a>,
    },
  ];

  const handleOk = async () => {
    setConfirming(true);
    try {
      const tfRows = selectedRows.filter(
        (r) => r.type === 'TRUE_FALSE' && !r.trueFalseItems,
      );

      const detailMap = new Map<number, { id: number; text: string }[]>();
      if (tfRows.length > 0) {
        await Promise.all(
          tfRows.map(async (r) => {
            try {
              const res = await request(`/api/v1/exercises/${r.id}`);
              detailMap.set(r.id, res.data?.trueFalseItems ?? []);
            } catch {
              detailMap.set(r.id, []);
            }
          }),
        );
      }

      const lines: ExamExerciseLine[] = selectedRows.map((r, i) => {
        const tfItems = r.trueFalseItems ?? detailMap.get(r.id) ?? [];
        return {
          exerciseId: r.id,
          code: r.code,
          title: r.title,
          type: r.type,
          sortOrder: i,
          points: r.type !== 'TRUE_FALSE' ? undefined : undefined,
          itemScores:
            r.type === 'TRUE_FALSE'
              ? tfItems.map((item) => ({
                  tfItemId: item.id,
                  text: item.text,
                  points: 0,
                }))
              : undefined,
        };
      });

      onAdd(lines);
      setSelectedRows([]);
      onClose();
    } catch {
      message.error('Có lỗi khi tải thông tin bài tập');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
      <Modal
        title="Chọn bài tập thêm vào đề"
        open={open}
        onCancel={() => {
          setSelectedRows([]);
          onClose();
        }}
        onOk={handleOk}
        okButtonProps={{
          loading: confirming,
          disabled: selectedRows.length === 0,
        }}
        okText={`Thêm${selectedRows.length > 0 ? ` (${selectedRows.length})` : ''}`}
        width={800}
      >
        <ProTable<ExerciseRow>
          rowKey="id"
          search={false}
          options={{ reload: true, density: false, setting: false }}
          size="small"
          pagination={{ pageSize: 8, showSizeChanger: false }}
          params={{ subjectId, topicId }}
          toolbar={{
            search: {
              placeholder: 'Tìm mã / tên bài tập',
              onSearch: () => {},
            },
          }}
          request={async (params) => {
            const keyword = String(
              (params as Record<string, unknown>).keyword ?? '',
            );
            const res = await request('/api/v1/exercises', {
              params: {
                subjectId,
                topicId,
                status: 'ACTIVE',
                current: params.current,
                pageSize: params.pageSize,
                ...(keyword ? { code: keyword, title: keyword } : {}),
              },
            });
            const filtered = (res.data ?? []).filter(
              (r: ExerciseRow) => !alreadyIds.has(Number(r.id)),
            );
            return { data: filtered, total: filtered.length, success: true };
          }}
          rowSelection={{
            selectedRowKeys: selectedRows.map((r) => r.id),
            onChange: (_, rows) => setSelectedRows(rows as ExerciseRow[]),
          }}
          columns={columns}
        />
      </Modal>

      {/* Dùng lại CreateExerciseForm của màn Bài Tập ở chế độ chỉ đọc */}
      <CreateExerciseForm
        editId={viewId}
        open={viewId !== null}
        onOpenChange={(o) => {
          if (!o) setViewId(null);
        }}
        readOnly
      />
    </>
  );
};

export default ExercisePickerModal;
