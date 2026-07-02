import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import {
  DrawerForm,
  ProForm,
  ProFormDependency,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { XMarkdown } from '@ant-design/x-markdown';
import { Button, Image, message, Space, Upload } from 'antd';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import React, { useState } from 'react';
import { uploadFile } from '@/services/file';
import type { PostDetail, PostForm as PostFormValues } from '../data';
import { createPost, getPost, updatePost } from '../service';

/** Upload ảnh bìa → trả URL từ /api/v1/files, gắn vào field coverImageUrl. */
const CoverUpload: React.FC<{
  value?: string;
  onChange?: (url?: string) => void;
}> = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);

  const customRequest = async (options: UploadRequestOption) => {
    setLoading(true);
    try {
      const res = await uploadFile(options.file as File, 'post');
      if (res.success) {
        onChange?.(res.data.url);
        options.onSuccess?.(res.data);
      } else {
        options.onError?.(new Error('upload failed'));
      }
    } catch (err) {
      options.onError?.(err as Error);
      message.error('Tải ảnh thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical">
      <Space>
        <Upload
          accept="image/*"
          showUploadList={false}
          customRequest={customRequest}
        >
          <Button icon={<UploadOutlined />} loading={loading}>
            Tải ảnh bìa
          </Button>
        </Upload>
        {value && (
          <Button type="link" danger onClick={() => onChange?.(undefined)}>
            Xóa
          </Button>
        )}
      </Space>
      {value && <Image src={value} width={200} alt="cover" />}
    </Space>
  );
};

type Props = {
  mode: 'create' | 'edit';
  editId?: number | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
};

const PostForm: React.FC<Props> = ({
  mode,
  editId,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const isEdit = mode === 'edit';

  const loadInitial = async (): Promise<PostFormValues> => {
    if (isEdit && editId) {
      const res = await getPost(editId);
      const d: PostDetail = res.data;
      return {
        title: d.title,
        summary: d.summary,
        coverImageUrl: d.coverImageUrl,
        contentMd: d.contentMd,
        pinned: d.pinned,
      };
    }
    return { pinned: false } as PostFormValues;
  };

  const handleFinish = async (values: PostFormValues) => {
    if (isEdit && editId) {
      await updatePost(editId, values);
      messageApi.success('Cập nhật bài viết thành công');
    } else {
      await createPost(values);
      messageApi.success('Tạo bài viết (nháp) thành công');
    }
    onSuccess?.();
    return true;
  };

  return (
    <>
      {contextHolder}
      <DrawerForm<PostFormValues>
        title={isEdit ? 'Sửa bài viết' : 'Viết bài mới'}
        width={760}
        trigger={
          isEdit ? undefined : (
            <Button type="primary" icon={<PlusOutlined />}>
              Viết bài
            </Button>
          )
        }
        open={open}
        onOpenChange={onOpenChange}
        key={editId ?? 'create'}
        request={loadInitial}
        drawerProps={{ destroyOnHidden: true }}
        onFinish={handleFinish}
      >
        <ProFormText
          name="title"
          label="Tiêu đề"
          placeholder="Tiêu đề bài viết"
          fieldProps={{ maxLength: 200 }}
          rules={[{ required: true, message: 'Nhập tiêu đề' }]}
        />
        <ProFormTextArea
          name="summary"
          label="Mô tả ngắn"
          placeholder="Hiển thị trên thẻ bài viết ở Trang chủ"
          fieldProps={{ maxLength: 500, rows: 2 }}
        />
        <ProForm.Item name="coverImageUrl" label="Ảnh bìa">
          <CoverUpload />
        </ProForm.Item>
        <ProFormTextArea
          name="contentMd"
          label="Nội dung (Markdown)"
          placeholder={'# Tiêu đề\n\nNội dung **markdown**...'}
          fieldProps={{ rows: 12, style: { fontFamily: 'monospace' } }}
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
                  minHeight: 80,
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
        <ProFormSwitch
          name="pinned"
          label="Ghim nổi bật"
          checkedChildren="Ghim"
          unCheckedChildren="Thường"
        />
      </DrawerForm>
    </>
  );
};

export default PostForm;
