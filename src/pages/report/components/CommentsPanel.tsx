import { useAccess, useModel } from '@umijs/max';
import {
  Button,
  Checkbox,
  Empty,
  Input,
  List,
  message,
  Popconfirm,
  Space,
  Tag,
} from 'antd';
import { useEffect, useState } from 'react';
import type { CommentItem } from '../data';
import {
  addComment,
  deleteComment,
  getComments,
  updateComment,
} from '../service';

const ROLE_TAG: Record<string, { color: string; label: string }> = {
  TEACHER: { color: 'blue', label: 'Giáo viên' },
  ASSISTANT: { color: 'purple', label: 'Trợ giảng' },
  PARENT: { color: 'green', label: 'Phụ huynh' },
  ADMIN: { color: 'red', label: 'Quản trị' },
  EMPLOYEE: { color: 'default', label: 'Nhân viên' },
};

// Khối nhận xét: danh sách + form thêm (checkbox "cho học sinh xem"), sửa/xóa của mình.
const CommentsPanel = ({
  studentId,
  classId,
}: {
  studentId: number;
  classId: number;
}) => {
  const access = useAccess();
  const { initialState } = useModel('@@initialState');
  const myId = Number(initialState?.currentUser?.userid);
  const isAdmin = access.canAdmin;

  const [items, setItems] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getComments(studentId, classId);
      setItems(res.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId && classId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, classId]);

  const submit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await addComment({
        studentId,
        classId,
        content: content.trim(),
        visibleToStudent: visible,
      });
      setContent('');
      setVisible(false);
      message.success('Đã thêm nhận xét');
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVisible = async (c: CommentItem) => {
    await updateComment(c.id, {
      content: c.content,
      visibleToStudent: !c.visibleToStudent,
    });
    await load();
  };

  const remove = async (id: number) => {
    await deleteComment(id);
    message.success('Đã xóa');
    await load();
  };

  return (
    <div>
      <List
        loading={loading}
        locale={{
          emptyText: (
            <Empty
              description="Chưa có nhận xét"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
        dataSource={items}
        renderItem={(c) => {
          const tag = ROLE_TAG[c.authorRole] ?? {
            color: 'default',
            label: c.authorRole,
          };
          const mine = c.authorId === myId;
          return (
            <List.Item
              actions={
                mine || isAdmin
                  ? [
                      mine && (
                        <Button
                          key="v"
                          type="link"
                          size="small"
                          onClick={() => toggleVisible(c)}
                        >
                          {c.visibleToStudent ? 'Ẩn với HS' : 'Cho HS xem'}
                        </Button>
                      ),
                      <Popconfirm
                        key="d"
                        title="Xóa nhận xét này?"
                        onConfirm={() => remove(c.id)}
                      >
                        <Button type="link" size="small" danger>
                          Xóa
                        </Button>
                      </Popconfirm>,
                    ].filter(Boolean)
                  : undefined
              }
            >
              <List.Item.Meta
                title={
                  <Space>
                    <span>{c.authorName}</span>
                    <Tag color={tag.color}>{tag.label}</Tag>
                    {!c.visibleToStudent && <Tag>Ẩn với HS</Tag>}
                    <span
                      style={{
                        color: '#8c8c8c',
                        fontWeight: 400,
                        fontSize: 12,
                      }}
                    >
                      {new Date(c.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </Space>
                }
                description={
                  <span style={{ whiteSpace: 'pre-wrap' }}>{c.content}</span>
                }
              />
            </List.Item>
          );
        }}
      />

      {access.canCommentReport && (
        <div style={{ marginTop: 12 }}>
          <Input.TextArea
            rows={3}
            value={content}
            maxLength={2000}
            placeholder="Nhập nhận xét cho học viên..."
            onChange={(e) => setContent(e.target.value)}
          />
          <Space style={{ marginTop: 8 }}>
            <Button type="primary" loading={submitting} onClick={submit}>
              Gửi nhận xét
            </Button>
            <Checkbox
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
            >
              Cho học sinh xem
            </Checkbox>
          </Space>
        </div>
      )}
    </div>
  );
};

export default CommentsPanel;
