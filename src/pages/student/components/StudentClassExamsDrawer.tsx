import { SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Drawer,
  Dropdown,
  Input,
  message,
  Popconfirm,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import type { StudentExamItem, StudentExamStatus } from '../data';
import { queryStudentClassExams, updateStudentExamStatus } from '../service';

type Props = {
  studentId: number | null;
  studentName?: string;
  classId: number | null;
  className?: string;
  open: boolean;
  onClose: () => void;
};

// Nhãn + màu cho trạng thái hiệu lực (đã overlay Quá hạn từ BE).
const STATUS_META: Record<string, { label: string; color: string }> = {
  CHUA_PHAT_HANH: { label: 'Chưa phát hành', color: 'default' },
  DA_PHAT_HANH: { label: 'Đã phát hành', color: 'processing' },
  DANG_KIEM_TRA: { label: 'Đang kiểm tra', color: 'gold' },
  DA_LAM: { label: 'Đã làm', color: 'success' },
  QUA_HAN: { label: 'Quá hạn', color: 'error' },
  DA_XOA: { label: 'Đã xóa', color: 'default' },
};

const fmt = (v?: string) => (v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—');

const StudentClassExamsDrawer: React.FC<Props> = ({
  studentId,
  studentName,
  classId,
  className,
  open,
  onClose,
}) => {
  const [exams, setExams] = useState<StudentExamItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  const fetchExams = async () => {
    if (!studentId || !classId) return;
    setLoading(true);
    try {
      const res = await queryStudentClassExams(studentId, classId);
      setExams(res.data ?? []);
    } catch {
      message.error('Không tải được danh sách đề thi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && studentId && classId) {
      setKeyword('');
      fetchExams();
    }
  }, [open, studentId, classId]);

  // Lọc theo mã đề / tên đề ngay tại client
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return exams;
    return exams.filter(
      (e) =>
        e.code.toLowerCase().includes(kw) || e.name.toLowerCase().includes(kw),
    );
  }, [exams, keyword]);

  const changeStatus = async (examId: number, status: StudentExamStatus) => {
    if (!studentId) return;
    try {
      await updateStudentExamStatus(examId, studentId, status);
      message.success('Đã cập nhật trạng thái');
      fetchExams();
    } catch {
      message.error('Cập nhật trạng thái thất bại');
    }
  };

  // Xem đề / Vào thi là hành động phía học viên (app/mobile) — tạm placeholder.
  const comingSoon = (label: string) =>
    message.info(`${label}: tính năng đang phát triển`);

  const columns: ColumnsType<StudentExamItem> = [
    { title: 'Mã đề', dataIndex: 'code', width: 130, fixed: 'left' },
    { title: 'Tên đề thi', dataIndex: 'name', width: 240, ellipsis: true },
    {
      title: 'Khóa học',
      dataIndex: 'courses',
      width: 180,
      render: (_, r) =>
        r.courses.length ? r.courses.map((c) => c.name).join(', ') : '—',
    },
    {
      title: 'Bắt đầu',
      width: 150,
      render: (_, r) => fmt(r.publishAt),
    },
    {
      title: 'Kết thúc',
      width: 150,
      render: (_, r) => fmt(r.endAt),
    },
    {
      title: 'Tổng TG (phút)',
      dataIndex: 'durationMinutes',
      width: 120,
      align: 'right',
      render: (v) => v ?? '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 140,
      render: (status: string) => {
        const meta = STATUS_META[status] ?? { label: status, color: 'default' };
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 250,
      fixed: 'right',
      render: (_, r) => (
        <>
          {r.canView && (
            <Button
              type="link"
              size="small"
              onClick={() => comingSoon('Xem đề')}
            >
              Xem đề
            </Button>
          )}
          {r.canTake && (
            <Button
              type="link"
              size="small"
              onClick={() => comingSoon('Vào thi')}
            >
              Vào thi
            </Button>
          )}
          <Dropdown
            menu={{
              items: [
                {
                  key: 'publish',
                  label: 'Đã phát hành',
                  onClick: () => changeStatus(r.examId, 'DA_PHAT_HANH'),
                },
                {
                  key: 'unpublish',
                  label: 'Chưa phát hành',
                  onClick: () => changeStatus(r.examId, 'CHUA_PHAT_HANH'),
                },
                { type: 'divider' },
                {
                  key: 'remove',
                  label: (
                    <Popconfirm
                      title="Gỡ đề này khỏi học viên?"
                      description="Học viên sẽ không thấy đề khi tìm kiếm."
                      okText="Gỡ"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => changeStatus(r.examId, 'DA_XOA')}
                    >
                      <span style={{ color: '#ff4d4f' }}>Gỡ khỏi đề</span>
                    </Popconfirm>
                  ),
                },
              ],
            }}
          >
            <a>Đổi trạng thái ⌄</a>
          </Dropdown>
        </>
      ),
    },
  ];

  return (
    <Drawer
      title={`Đề thi — ${studentName ?? ''}${className ? ` · ${className}` : ''}`}
      width="66vw"
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <Input
        placeholder="Tìm theo mã đề, tên đề"
        prefix={<SearchOutlined />}
        allowClear
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ marginBottom: 12, maxWidth: 360 }}
      />
      <Table<StudentExamItem>
        rowKey="examId"
        size="small"
        loading={loading}
        dataSource={filtered}
        columns={columns}
        scroll={{ x: 'max-content' }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        locale={{ emptyText: 'Học viên chưa có đề thi nào trong khóa này' }}
      />
    </Drawer>
  );
};

export default StudentClassExamsDrawer;
