import { PictureOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { Button, Image, message, Space, Spin, Upload } from 'antd';
import React, { useState } from 'react';

type ImageUploadProps = {
  value?: string;
  onChange?: (value?: string) => void;
  text?: string;
  compact?: boolean;
};

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/** Chuyển file thành data URL để preview — upload thật sự xảy ra lúc submit form */
const toDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  text,
  compact,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleFile = async (file: File) => {
    if (file.size > MAX_SIZE) {
      messageApi.error('Ảnh quá lớn (tối đa 10 MB)');
      return false;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      messageApi.error('Định dạng không hỗ trợ (chỉ PNG, JPEG, GIF, WEBP)');
      return false;
    }
    setLoading(true);
    try {
      const dataUrl = await toDataUrl(file);
      onChange?.(dataUrl);
    } catch {
      messageApi.error('Không đọc được file ảnh');
    } finally {
      setLoading(false);
    }
    return false;
  };

  if (compact) {
    return (
      <>
        {contextHolder}
        <Space size={4}>
          {value && (
            <Image
              src={value}
              width={36}
              height={36}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (v) => setPreviewOpen(v),
              }}
            />
          )}
          <Upload
            accept="image/*"
            maxCount={1}
            showUploadList={false}
            beforeUpload={handleFile}
          >
            <Spin spinning={loading} size="small">
              <Button
                icon={<PictureOutlined />}
                title={value ? 'Đổi ảnh' : 'Thêm ảnh'}
              />
            </Spin>
          </Upload>
        </Space>
      </>
    );
  }

  const fileList: UploadFile[] = value
    ? [{ uid: '-1', name: 'image', status: 'done', url: value }]
    : [];

  return (
    <>
      {contextHolder}
      <Spin spinning={loading}>
        <Upload
          listType="picture-card"
          accept="image/*"
          maxCount={1}
          fileList={fileList}
          beforeUpload={handleFile}
          onRemove={() => onChange?.(undefined)}
          onPreview={() => setPreviewOpen(true)}
        >
          {fileList.length === 0 && (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>{text ?? 'Thêm ảnh'}</div>
            </div>
          )}
        </Upload>
      </Spin>
      {value && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (v) => setPreviewOpen(v),
          }}
          src={value}
        />
      )}
    </>
  );
};

export default ImageUpload;
