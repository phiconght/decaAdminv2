import type {
  ActionType,
  ProColumns,
  ProFormInstance,
} from '@ant-design/pro-components';
import {
  PageContainer,
  ProForm,
  ProFormDependency,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { XMarkdown } from '@ant-design/x-markdown';
import { request, useAccess } from '@umijs/max';
import { Alert, Button, Empty, Modal, message, Space, Tabs, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import type { AnnouncementItem, AudienceType } from './data';
import { previewCount, queryAnnouncements, sendAnnouncement } from './service';

const AUDIENCE_LABEL: Record<AudienceType, string> = {
  ALL: 'Tất cả',
  ROLE: 'Theo vai trò',
  CLASS: 'Theo lớp',
  USERS: 'Chọn người',
};

const ROLE_OPTIONS = [
  { label: 'Học viên', value: 'STUDENT' },
  { label: 'Phụ huynh', value: 'PARENT' },
  { label: 'Giáo viên', value: 'TEACHER' },
  { label: 'Trợ giảng', value: 'ASSISTANT' },
  { label: 'Nhân viên', value: 'EMPLOYEE' },
  { label: 'Quản trị', value: 'ADMIN' },
];

type ComposeValues = {
  title: string;
  contentMd: string;
  audience: AudienceType;
  roles?: string[];
  classId?: number;
  userIds?: number[];
};

function buildAudience(v: ComposeValues): {
  audience: AudienceType;
  audienceRef?: string;
} {
  switch (v.audience) {
    case 'ROLE':
      return { audience: 'ROLE', audienceRef: (v.roles ?? []).join(',') };
    case 'CLASS':
      return {
        audience: 'CLASS',
        audienceRef: v.classId != null ? String(v.classId) : '',
      };
    case 'USERS':
      return { audience: 'USERS', audienceRef: (v.userIds ?? []).join(',') };
    case 'ALL':
      return { audience: 'ALL' };
  }
}

const Composer: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const formRef = useRef<ProFormInstance | undefined>(undefined);
  const [count, setCount] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);

  const doPreview = async () => {
    const v = formRef.current?.getFieldsValue();
    if (!v?.audience) {
      messageApi.warning('Chọn đối tượng nhận trước');
      return;
    }
    const { audience, audienceRef } = buildAudience(v);
    setChecking(true);
    try {
      const res = await previewCount(audience, audienceRef);
      setCount(res.data.count);
    } catch {
      setCount(null);
    } finally {
      setChecking(false);
    }
  };

  const onFinish = async (v: ComposeValues) => {
    const { audience, audienceRef } = buildAudience(v);
    let n = 0;
    try {
      n = (await previewCount(audience, audienceRef)).data.count;
    } catch {
      // Nếu preview lỗi (vd audience chưa hợp lệ) để BE báo khi gửi.
    }
    const ok = await new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: 'Xác nhận gửi thông báo',
        content: `Thông báo sẽ được gửi tới khoảng ${n} người. Tiếp tục?`,
        okText: 'Gửi',
        cancelText: 'Hủy',
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
    if (!ok) return false;

    const res = await sendAnnouncement({
      title: v.title,
      contentMd: v.contentMd,
      audience,
      audienceRef,
    });
    messageApi.success(`Đã gửi tới ${res.data.sentCount} người`);
    formRef.current?.resetFields();
    setCount(null);
    return true;
  };

  return (
    <>
      {contextHolder}
      <ProForm<ComposeValues>
        formRef={formRef}
        onFinish={onFinish}
        onValuesChange={() => setCount(null)}
        submitter={{
          searchConfig: { submitText: 'Gửi thông báo' },
          resetButtonProps: false,
        }}
      >
        <ProFormText
          name="title"
          label="Tiêu đề"
          placeholder="Tiêu đề thông báo"
          fieldProps={{ maxLength: 200 }}
          rules={[{ required: true, message: 'Nhập tiêu đề' }]}
        />
        <ProFormTextArea
          name="contentMd"
          label="Nội dung (Markdown)"
          placeholder={'Nội dung **markdown**...'}
          fieldProps={{ rows: 8, style: { fontFamily: 'monospace' } }}
          rules={[{ required: true, message: 'Nhập nội dung' }]}
        />
        <ProFormDependency name={['contentMd']}>
          {({ contentMd }) => (
            <ProForm.Item label="Xem trước">
              <div
                style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  padding: 16,
                  minHeight: 60,
                  background: '#fafafa',
                }}
              >
                {contentMd ? (
                  <XMarkdown content={contentMd} />
                ) : (
                  <span style={{ color: '#999' }}>Chưa có nội dung</span>
                )}
              </div>
            </ProForm.Item>
          )}
        </ProFormDependency>

        <ProFormRadio.Group
          name="audience"
          label="Đối tượng nhận"
          options={Object.entries(AUDIENCE_LABEL).map(([value, label]) => ({
            value,
            label,
          }))}
          rules={[{ required: true, message: 'Chọn đối tượng nhận' }]}
        />

        <ProFormDependency name={['audience']}>
          {({ audience }) => {
            if (audience === 'ROLE') {
              return (
                <ProFormSelect
                  name="roles"
                  label="Vai trò nhận"
                  mode="multiple"
                  options={ROLE_OPTIONS}
                  rules={[
                    { required: true, message: 'Chọn ít nhất 1 vai trò' },
                  ]}
                />
              );
            }
            if (audience === 'CLASS') {
              return (
                <ProFormSelect
                  name="classId"
                  label="Lớp (gồm học viên + phụ huynh)"
                  showSearch
                  request={async () => {
                    const res = await request('/api/v1/classes', {
                      params: { pageSize: 200 },
                    });
                    return (res.data ?? []).map(
                      (c: { id: number; name: string; code: string }) => ({
                        label: `${c.name} (${c.code})`,
                        value: c.id,
                      }),
                    );
                  }}
                  rules={[{ required: true, message: 'Chọn lớp' }]}
                />
              );
            }
            if (audience === 'USERS') {
              return (
                <ProFormSelect
                  name="userIds"
                  label="Chọn người"
                  mode="multiple"
                  debounceTime={300}
                  fieldProps={{ filterOption: false }}
                  request={async ({ keyWords }) => {
                    const res = await request('/api/v1/admin/users', {
                      params: { fullName: keyWords, pageSize: 20 },
                    });
                    return (res.data ?? []).map(
                      (u: {
                        id: number;
                        fullName: string;
                        username: string;
                      }) => ({
                        label: `${u.fullName} (${u.username})`,
                        value: u.id,
                      }),
                    );
                  }}
                  rules={[{ required: true, message: 'Chọn ít nhất 1 người' }]}
                />
              );
            }
            return null;
          }}
        </ProFormDependency>

        <Space>
          <Button loading={checking} onClick={doPreview}>
            Kiểm tra số người nhận
          </Button>
          {count != null && (
            <Alert
              type="info"
              showIcon
              message={`Sẽ gửi tới khoảng ${count} người`}
            />
          )}
        </Space>
      </ProForm>
    </>
  );
};

const History: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const columns: ProColumns<AnnouncementItem>[] = [
    { title: 'Tiêu đề', dataIndex: 'title', ellipsis: true },
    {
      title: 'Đối tượng',
      dataIndex: 'audience',
      width: 130,
      render: (_, r) => <Tag>{AUDIENCE_LABEL[r.audience]}</Tag>,
    },
    { title: 'Chi tiết', dataIndex: 'audienceRef', width: 160, ellipsis: true },
    { title: 'Đã gửi', dataIndex: 'sentCount', width: 90 },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      width: 160,
      valueType: 'dateTime',
    },
    { title: 'Người soạn', dataIndex: 'author', width: 120 },
  ];
  return (
    <ProTable<AnnouncementItem>
      headerTitle="Lịch sử thông báo"
      actionRef={actionRef}
      rowKey="id"
      search={false}
      options={false}
      scroll={{ x: 'max-content' }}
      request={async ({ current, pageSize }) =>
        queryAnnouncements({ current, pageSize })
      }
      columns={columns}
    />
  );
};

const AnnouncementsPage: React.FC = () => {
  const access = useAccess();
  return (
    <PageContainer>
      <Tabs
        items={[
          {
            key: 'compose',
            label: 'Soạn mới',
            children: access.canWriteAnnounce ? (
              <Composer />
            ) : (
              <Empty description="Bạn không có quyền soạn thông báo" />
            ),
          },
          {
            key: 'history',
            label: 'Lịch sử',
            children: <History />,
          },
        ]}
      />
    </PageContainer>
  );
};

export default AnnouncementsPage;
