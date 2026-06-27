import type { DescriptionsProps } from 'antd';
import { Descriptions, Drawer, Empty, message, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import type { ClassItem } from '../data';
import { getClassDetail } from '../service';

type ViewClassDrawerProps = {
  id: number | null;
  open: boolean;
  onClose: () => void;
};

const ViewClassDrawer: React.FC<ViewClassDrawerProps> = ({
  id,
  open,
  onClose,
}) => {
  const [detail, setDetail] = useState<ClassItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!open || id === null) {
      setDetail(null);
      return;
    }
    setLoading(true);
    getClassDetail(id)
      .then((res) => {
        if (res.success) setDetail(res.data);
        else messageApi.error('Không tải được khóa học');
      })
      .catch(() => messageApi.error('Không tải được khóa học'))
      .finally(() => setLoading(false));
  }, [open, id]);

  const descItems: DescriptionsProps['items'] = detail
    ? [
        { key: 'code', label: 'Mã khóa', children: detail.code },
        { key: 'name', label: 'Tên khóa', children: detail.name },
        {
          key: 'subject',
          label: 'Môn học',
          children: `${detail.subjectName} — ${detail.gradeLevel}`,
        },
        {
          key: 'teachers',
          label: 'Giáo viên',
          span: 2,
          children: detail.teachers?.length
            ? detail.teachers
                .map((t) => `${t.fullName} (${t.username})`)
                .join(', ')
            : '—',
        },
        {
          key: 'startDate',
          label: 'Ngày bắt đầu',
          children: detail.startDate
            ? new Date(detail.startDate).toLocaleDateString('vi-VN')
            : '—',
        },
        {
          key: 'endDate',
          label: 'Ngày kết thúc',
          children: detail.endDate
            ? new Date(detail.endDate).toLocaleDateString('vi-VN')
            : '—',
        },
        {
          key: 'status',
          label: 'Trạng thái',
          children: (
            <Tag color={detail.status === 'ACTIVE' ? 'success' : 'default'}>
              {detail.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
            </Tag>
          ),
        },
        { key: 'createdBy', label: 'Người tạo', children: detail.createdBy },
        {
          key: 'createdAt',
          label: 'Ngày tạo',
          children: detail.createdAt
            ? new Date(detail.createdAt).toLocaleDateString('vi-VN')
            : '—',
        },
      ]
    : [];

  return (
    <>
      {contextHolder}
      <Drawer
        title="Xem khóa học"
        width="520px"
        open={open}
        onClose={onClose}
        destroyOnClose
        loading={loading}
      >
        {!loading && !detail && <Empty description="Không có dữ liệu" />}
        {detail && (
          <Descriptions
            items={descItems}
            column={2}
            size="small"
            bordered={false}
            labelStyle={{
              color: 'var(--ant-color-text-secondary)',
              fontWeight: 400,
            }}
          />
        )}
      </Drawer>
    </>
  );
};

export default ViewClassDrawer;
