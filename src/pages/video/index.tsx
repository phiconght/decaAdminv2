import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProFormText,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { message, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import VideoForm from './components/VideoForm';
import type { LectureVideoItem, LectureVideoQuery } from './data';
import { deleteLectureVideo, queryLectureVideos } from './service';

// Kho video bài giảng: ProTable + DrawerForm tạo/sửa.
// Xem SPEC_VideoBaiGiang_Zoom.md §4.1.
const VideoPage: React.FC = () => {
  const access = useAccess();
  const [messageApi, contextHolder] = message.useMessage();
  const actionRef = useRef<ActionType | null>(null);
  const [searchParams, setSearchParams] = useState<LectureVideoQuery>({});
  const [editData, setEditData] = useState<LectureVideoItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async (record: LectureVideoItem) => {
    try {
      await deleteLectureVideo(record.id);
      messageApi.success('Đã xóa video');
      actionRef.current?.reload();
    } catch (e) {
      const err = e as { data?: { error?: { code?: string } } };
      if (err?.data?.error?.code === 'VIDEO_IN_USE') {
        messageApi.error(
          'Video đang được dùng ở một hoặc nhiều buổi học, gỡ khỏi các buổi đó trước khi xóa.',
        );
      } else {
        messageApi.error('Xóa video thất bại');
      }
    }
  };

  const columns: ProColumns<LectureVideoItem>[] = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: 'Chuyên đề',
      dataIndex: 'topicName',
      width: 200,
      render: (_, record) => record.topicName ?? '—',
    },
    {
      title: 'Link YouTube',
      dataIndex: 'youtubeUrl',
      ellipsis: true,
      render: (_, record) => (
        <a href={record.youtubeUrl} target="_blank" rel="noreferrer">
          {record.youtubeUrl}
        </a>
      ),
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      key: 'option',
      width: 120,
      render: (_, record) =>
        access.canWriteSessionContent
          ? [
              <a
                key="edit"
                onClick={() => {
                  setEditData(record);
                  setEditOpen(true);
                }}
              >
                Sửa
              </a>,
              <Popconfirm
                key="delete"
                title="Xóa video này khỏi kho?"
                onConfirm={() => handleDelete(record)}
              >
                <a>Xóa</a>
              </Popconfirm>,
            ]
          : [],
    },
  ];

  return (
    <PageContainer>
      {contextHolder}
      {access.canWriteSessionContent && (
        <VideoForm
          mode="edit"
          editData={editData}
          open={editOpen}
          onOpenChange={(o) => {
            setEditOpen(o);
            if (!o) setEditData(null);
          }}
          onSuccess={() => {
            setEditOpen(false);
            setEditData(null);
            actionRef.current?.reload();
          }}
        />
      )}
      <ProCard title="Tìm kiếm video" style={{ marginBottom: 16 }}>
        <QueryFilter<LectureVideoQuery>
          defaultCollapsed={false}
          collapseRender={false}
          layout="vertical"
          submitter={{
            searchConfig: { resetText: 'Đặt lại', submitText: 'Tìm kiếm' },
          }}
          onFinish={async (values) => {
            setSearchParams(values);
            actionRef.current?.reload();
          }}
          onReset={() => {
            setSearchParams({});
            actionRef.current?.reload();
          }}
        >
          <ProFormText name="q" label="Tiêu đề" placeholder="Từ khóa" />
        </QueryFilter>
      </ProCard>

      <ProTable<LectureVideoItem, LectureVideoQuery>
        headerTitle="Kho video bài giảng"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        scroll={{ x: 'max-content' }}
        toolBarRender={() =>
          access.canWriteSessionContent
            ? [
                <VideoForm
                  key="create"
                  mode="create"
                  onSuccess={() => actionRef.current?.reload()}
                />,
              ]
            : []
        }
        request={async ({ current, pageSize }) =>
          queryLectureVideos({ ...searchParams, current, pageSize })
        }
        columns={columns}
      />
    </PageContainer>
  );
};

export default VideoPage;
