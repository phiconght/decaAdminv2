import { SearchOutlined } from '@ant-design/icons';
import { Button, Drawer, Input, message, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useMemo, useState } from 'react';
import type { ClassItem } from '@/pages/class/data';
import { queryStudentClasses } from '../service';
import StudentClassExamsDrawer from './StudentClassExamsDrawer';

type Props = {
  studentId: number;
  studentName: string;
};

// Nút "Khóa học" trên mỗi dòng học viên + Drawer tra cứu các khóa học viên tham gia.
const StudentClassesDrawer: React.FC<Props> = ({ studentId, studentName }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [keyword, setKeyword] = useState('');
  const [examFor, setExamFor] = useState<{
    classId: number;
    className: string;
  } | null>(null);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await queryStudentClasses(studentId);
      setClasses(res.data ?? []);
    } catch {
      message.error('Không tải được danh sách khóa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setKeyword('');
      fetchClasses();
    }
  }, [open, studentId]);

  // Lọc theo mã / tên / môn ngay tại client
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return classes;
    return classes.filter(
      (c) =>
        c.code.toLowerCase().includes(kw) ||
        c.name.toLowerCase().includes(kw) ||
        c.subjectName.toLowerCase().includes(kw),
    );
  }, [classes, keyword]);

  const columns: ColumnsType<ClassItem> = [
    { title: 'Mã khóa', dataIndex: 'code', width: 130 },
    { title: 'Tên khóa', dataIndex: 'name' },
    { title: 'Môn học', dataIndex: 'subjectName' },
    { title: 'Khối', dataIndex: 'gradeLevel', width: 90 },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 110,
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'success' : 'default'}>{status}</Tag>
      ),
    },
    {
      title: 'Đề thi',
      key: 'exams',
      width: 90,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() =>
            setExamFor({ classId: Number(record.id), className: record.name })
          }
        >
          Đề thi
        </Button>
      ),
    },
  ];

  return (
    <>
      <Button
        type="link"
        size="small"
        icon={<SearchOutlined />}
        style={{ padding: 0 }}
        onClick={() => setOpen(true)}
      >
        Khóa học
      </Button>

      <Drawer
        title={`Khóa học của ${studentName}`}
        width={680}
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
      >
        <Input
          placeholder="Tìm theo mã khóa, tên khóa, môn học"
          prefix={<SearchOutlined />}
          allowClear
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <Table<ClassItem>
          rowKey="id"
          size="small"
          loading={loading}
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{ emptyText: 'Học viên chưa tham gia khóa nào' }}
        />
      </Drawer>

      <StudentClassExamsDrawer
        studentId={studentId}
        studentName={studentName}
        classId={examFor?.classId ?? null}
        className={examFor?.className}
        open={examFor !== null}
        onClose={() => setExamFor(null)}
      />
    </>
  );
};

export default StudentClassesDrawer;
