import type { DescriptionsProps } from 'antd';
import { Descriptions, Drawer, Empty, message, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import type { UserDetail } from '../data';
import { getTeacherDetail } from '../service';

type Props = {
  id: number | null;
  open: boolean;
  onClose: () => void;
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'success',
  DISABLED: 'default',
  LOCKED: 'error',
};

const ViewTeacherDrawer: React.FC<Props> = ({ id, open, onClose }) => {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!open || id === null) {
      setDetail(null);
      return;
    }
    setLoading(true);
    getTeacherDetail(id)
      .then((res) => {
        if (res.success) setDetail(res.data);
        else messageApi.error('Không tải được thông tin giáo viên');
      })
      .catch(() => messageApi.error('Không tải được thông tin giáo viên'))
      .finally(() => setLoading(false));
  }, [open, id]);

  const descItems: DescriptionsProps['items'] = detail
    ? [
        { key: 'username', label: 'Tên đăng nhập', children: detail.username },
        { key: 'fullName', label: 'Họ tên', children: detail.fullName || '—' },
        { key: 'email', label: 'Email', children: detail.email || '—' },
        { key: 'phone', label: 'Số điện thoại', children: detail.phone || '—' },
        {
          key: 'status',
          label: 'Trạng thái',
          children: (
            <Tag color={STATUS_COLOR[detail.status] ?? 'default'}>
              {detail.status}
            </Tag>
          ),
        },
        {
          key: 'createdBy',
          label: 'Người tạo',
          children: detail.createdBy || '—',
        },
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
        title="Thông tin giáo viên"
        width={560}
        open={open}
        onClose={onClose}
        destroyOnHidden
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

export default ViewTeacherDrawer;
