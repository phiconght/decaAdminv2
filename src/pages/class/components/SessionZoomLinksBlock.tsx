import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, message, Popconfirm, Space, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import type { ZoomLinkItem } from '../schedule.data';
import {
  addZoomLink,
  deleteZoomLink,
  listZoomLinks,
  updateZoomLink,
} from '../schedule.service';

type Props = {
  sessionId: number;
};

type Row = ZoomLinkItem & { saving?: boolean };

// Khối "Link Zoom" trong SessionEditModal — nhiều dòng (label + url), mỗi
// dòng lưu/xóa ngay lập tức (không có nút Lưu chung, tránh mất dữ liệu nếu
// đóng modal giữa chừng). Xem SPEC_VideoBaiGiang_Zoom.md §4.2.
const SessionZoomLinksBlock: React.FC<Props> = ({ sessionId }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [adding, setAdding] = useState(false);

  const reload = () => {
    setLoading(true);
    listZoomLinks(sessionId)
      .then((res) => setRows(res.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(reload, [sessionId]);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addZoomLink(sessionId, { label: 'Link chính', zoomUrl: '' });
      reload();
    } catch {
      messageApi.error('Không thêm được link, thử lại.');
    } finally {
      setAdding(false);
    }
  };

  const handleFieldBlur = async (
    row: Row,
    field: 'label' | 'zoomUrl',
    value: string,
  ) => {
    if ((row as unknown as Record<string, string>)[field] === value) return;
    const next = { ...row, [field]: value };
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...next, saving: true } : r)),
    );
    try {
      await updateZoomLink(sessionId, row.id, {
        label: next.label,
        zoomUrl: next.zoomUrl,
        meetingId: next.meetingId ?? undefined,
        passcode: next.passcode ?? undefined,
      });
    } catch {
      const bizMessage =
        field === 'zoomUrl' ? 'Link Zoom không hợp lệ.' : 'Lưu thất bại.';
      messageApi.error(bizMessage);
      reload();
      return;
    } finally {
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, saving: false } : r)),
      );
    }
  };

  const handleDelete = async (row: Row) => {
    try {
      await deleteZoomLink(sessionId, row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      messageApi.success('Đã xóa link Zoom.');
    } catch {
      messageApi.error('Xóa thất bại, thử lại.');
    }
  };

  if (loading) return <Spin size="small" />;

  return (
    <div>
      {contextHolder}
      <Space direction="vertical" style={{ width: '100%' }} size={8}>
        {rows.map((row) => (
          <Space key={row.id} style={{ width: '100%' }} align="start">
            <Input
              defaultValue={row.label}
              style={{ width: 130 }}
              placeholder="Nhãn"
              onBlur={(e) => handleFieldBlur(row, 'label', e.target.value)}
            />
            <Input
              defaultValue={row.zoomUrl}
              style={{ width: 280 }}
              placeholder="https://zoom.us/j/..."
              status={row.saving ? undefined : undefined}
              onBlur={(e) => handleFieldBlur(row, 'zoomUrl', e.target.value)}
            />
            <Popconfirm
              title="Xóa link này?"
              onConfirm={() => handleDelete(row)}
            >
              <Button size="small" icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Space>
        ))}
      </Space>
      <Button
        size="small"
        type="dashed"
        icon={<PlusOutlined />}
        style={{ marginTop: 8 }}
        loading={adding}
        onClick={handleAdd}
      >
        Thêm link Zoom
      </Button>
    </div>
  );
};

export default SessionZoomLinksBlock;
