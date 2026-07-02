import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Input } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { StudentClassOption } from './data';
import { getMyReportClasses } from './service';

// HUB báo cáo: chọn khóa học → vào báo cáo lớp.
const ReportHub = () => {
  const [classes, setClasses] = useState<StudentClassOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    setLoading(true);
    getMyReportClasses()
      .then((res) => setClasses(res.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return classes;
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(kw) ||
        c.code.toLowerCase().includes(kw) ||
        c.subjectName.toLowerCase().includes(kw),
    );
  }, [classes, keyword]);

  const columns: ProColumns<StudentClassOption>[] = [
    {
      title: 'Mã khóa',
      dataIndex: 'code',
      width: 140,
      render: (dom, r) => (
        <a onClick={() => history.push(`/report/class/${r.classId}`)}>{dom}</a>
      ),
    },
    { title: 'Tên khóa học', dataIndex: 'name' },
    { title: 'Môn — Khối', dataIndex: 'subjectName', width: 200 },
    { title: 'Giáo viên', dataIndex: 'teacherNames', width: 220 },
    {
      title: 'Báo cáo',
      key: 'action',
      width: 130,
      render: (_, r) => (
        <Button
          type="primary"
          size="small"
          onClick={() => history.push(`/report/class/${r.classId}`)}
        >
          Xem báo cáo
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      header={{ title: 'Báo cáo học tập' }}
      extra={[
        <Input.Search
          key="s"
          placeholder="Tìm khóa học"
          allowClear
          style={{ width: 240 }}
          onChange={(e) => setKeyword(e.target.value)}
        />,
      ]}
    >
      <ProTable<StudentClassOption>
        rowKey="classId"
        search={false}
        options={false}
        loading={loading}
        dataSource={filtered}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />
    </PageContainer>
  );
};

export default ReportHub;
