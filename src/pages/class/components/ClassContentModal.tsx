import { UploadOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProForm,
  ProFormDependency,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { XMarkdown } from '@ant-design/x-markdown';
import { Button, Image, message, Space, Upload } from 'antd';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import React, { useState } from 'react';
import { uploadFile } from '@/services/file';
import type { ClassContent } from '../data';
import { getClassContent, updateClassContent } from '../service';

/** Tải ảnh đại diện khóa học — cùng cơ chế CoverUpload của màn Bài viết. */
const CoverUpload: React.FC<{
  value?: string;
  onChange?: (url?: string) => void;
}> = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);

  const customRequest = async (options: UploadRequestOption) => {
    setLoading(true);
    try {
      const res = await uploadFile(options.file as File, 'class-content');
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
            Tải ảnh đại diện
          </Button>
        </Upload>
        {value && (
          <Button type="link" danger onClick={() => onChange?.(undefined)}>
            Xóa
          </Button>
        )}
      </Space>
      {value && <Image src={value} width={200} alt="ảnh đại diện khóa học" />}
    </Space>
  );
};

type Props = {
  classId: number;
  className: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * Popup "Nội dung" — mở từ nút trong drawer Sửa khóa. 3 ô đúng yêu cầu: tiêu
 * đề hiển thị, ảnh đại diện, bài giới thiệu (Markdown) — dùng cho Card +
 * trang chi tiết khóa học công khai ở Web/Mobile.
 */
const ClassContentModal: React.FC<Props> = ({
  classId,
  className,
  open,
  onOpenChange,
}) => {
  const [messageApi, contextHolder] = message.useMessage();

  const loadInitial = async (): Promise<Omit<ClassContent, 'classId'>> => {
    const res = await getClassContent(classId);
    return {
      title: res.data.title,
      coverImageUrl: res.data.coverImageUrl,
      contentMd: res.data.contentMd,
    };
  };

  const handleFinish = async (values: Omit<ClassContent, 'classId'>) => {
    await updateClassContent(classId, values);
    messageApi.success('Đã lưu nội dung khóa học');
    onOpenChange?.(false);
    return true;
  };

  return (
    <>
      {contextHolder}
      <ModalForm<Omit<ClassContent, 'classId'>>
        title={`Nội dung hiển thị — ${className}`}
        width={560}
        open={open}
        onOpenChange={onOpenChange}
        key={classId}
        request={loadInitial}
        modalProps={{ destroyOnHidden: true }}
        onFinish={handleFinish}
      >
        <ProFormText
          name="title"
          label="Tiêu đề hiển thị"
          placeholder="Để trống = dùng tên khóa"
          fieldProps={{ maxLength: 200 }}
        />
        <ProForm.Item name="coverImageUrl" label="Ảnh đại diện">
          <CoverUpload />
        </ProForm.Item>
        <ProFormTextArea
          name="contentMd"
          label="Nội dung giới thiệu (Markdown)"
          placeholder={'# Vì sao chọn khóa này\n\n- Nội dung **markdown**...'}
          fieldProps={{ rows: 10, style: { fontFamily: 'monospace' } }}
          rules={[{ required: true, message: 'Nhập nội dung giới thiệu' }]}
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
      </ModalForm>
    </>
  );
};

export default ClassContentModal;
