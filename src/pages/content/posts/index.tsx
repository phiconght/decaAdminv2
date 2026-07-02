import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProFormSelect,
  ProFormText,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Image, message, Popconfirm, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import PostForm from './components/PostForm';
import type { PostItem, PostQuery, PostStatus } from './data';
import { archivePost, changePostStatus, pinPost, queryPosts } from './service';

const STATUS_META: Record<PostStatus, { text: string; color: string }> = {
  DRAFT: { text: 'Nháp', color: 'default' },
  PUBLISHED: { text: 'Đang đăng', color: 'success' },
  ARCHIVED: { text: 'Đã lưu trữ', color: 'warning' },
};

const PostsPage: React.FC = () => {
  const access = useAccess();
  const actionRef = useRef<ActionType | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [searchParams, setSearchParams] = useState<PostQuery>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const reload = () => actionRef.current?.reload();

  const runAction = async (fn: () => Promise<unknown>, okMsg: string) => {
    try {
      await fn();
      messageApi.success(okMsg);
      reload();
    } catch {
      // requestErrorConfig đã hiện thông báo lỗi.
    }
  };

  const columns: ProColumns<PostItem>[] = [
    {
      title: 'Ảnh bìa',
      dataIndex: 'coverImageUrl',
      width: 90,
      render: (_, r) =>
        r.coverImageUrl ? (
          <Image
            src={r.coverImageUrl}
            width={64}
            height={40}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <span style={{ color: '#bbb' }}>—</span>
        ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      ellipsis: true,
      render: (_, r) => (
        <Space>
          {r.pinned && <Tag color="blue">Ghim</Tag>}
          <span>{r.title}</span>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (_, r) => (
        <Tag color={STATUS_META[r.status].color}>
          {STATUS_META[r.status].text}
        </Tag>
      ),
    },
    {
      title: 'Ngày đăng',
      dataIndex: 'publishedAt',
      width: 160,
      valueType: 'dateTime',
    },
    { title: 'Tác giả', dataIndex: 'author', width: 120 },
    {
      title: 'Thao tác',
      valueType: 'option',
      key: 'option',
      width: 220,
      render: (_, r) => {
        if (!access.canWritePost) return [];
        return [
          <a
            key="edit"
            onClick={() => {
              setEditId(r.id);
              setEditOpen(true);
            }}
          >
            Sửa
          </a>,
          r.status === 'PUBLISHED' ? (
            <a
              key="unpub"
              onClick={() =>
                runAction(() => changePostStatus(r.id, 'DRAFT'), 'Đã gỡ bài')
              }
            >
              Gỡ
            </a>
          ) : (
            <a
              key="pub"
              onClick={() =>
                runAction(
                  () => changePostStatus(r.id, 'PUBLISHED'),
                  'Đã đăng bài',
                )
              }
            >
              Đăng
            </a>
          ),
          <a
            key="pin"
            onClick={() =>
              runAction(
                () => pinPost(r.id, !r.pinned),
                r.pinned ? 'Đã bỏ ghim' : 'Đã ghim',
              )
            }
          >
            {r.pinned ? 'Bỏ ghim' : 'Ghim'}
          </a>,
          r.status !== 'ARCHIVED' ? (
            <Popconfirm
              key="archive"
              title="Lưu trữ bài viết này?"
              onConfirm={() => runAction(() => archivePost(r.id), 'Đã lưu trữ')}
            >
              <a style={{ color: '#cf1322' }}>Lưu trữ</a>
            </Popconfirm>
          ) : null,
        ];
      },
    },
  ];

  return (
    <PageContainer>
      {contextHolder}
      {access.canWritePost && (
        <PostForm
          mode="edit"
          editId={editId}
          open={editOpen}
          onOpenChange={(o) => {
            setEditOpen(o);
            if (!o) setEditId(null);
          }}
          onSuccess={() => {
            setEditOpen(false);
            setEditId(null);
            reload();
          }}
        />
      )}

      <ProCard style={{ marginBottom: 16 }}>
        <QueryFilter<PostQuery>
          layout="horizontal"
          submitter={{
            searchConfig: { resetText: 'Đặt lại', submitText: 'Tìm kiếm' },
          }}
          onFinish={async (values) => {
            setSearchParams(values);
            reload();
          }}
          onReset={() => {
            setSearchParams({});
            reload();
          }}
        >
          <ProFormText
            name="title"
            label="Tiêu đề"
            placeholder="Tìm theo tiêu đề"
          />
          <ProFormSelect
            name="status"
            label="Trạng thái"
            allowClear
            placeholder="Tất cả"
            valueEnum={{
              DRAFT: 'Nháp',
              PUBLISHED: 'Đang đăng',
              ARCHIVED: 'Đã lưu trữ',
            }}
          />
        </QueryFilter>
      </ProCard>

      <ProTable<PostItem, PostQuery>
        headerTitle="Bài viết"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        scroll={{ x: 'max-content' }}
        toolBarRender={() =>
          access.canWritePost
            ? [<PostForm key="create" mode="create" onSuccess={reload} />]
            : []
        }
        request={async ({ current, pageSize }) =>
          queryPosts({ ...searchParams, current, pageSize })
        }
        columns={columns}
      />
    </PageContainer>
  );
};

export default PostsPage;
