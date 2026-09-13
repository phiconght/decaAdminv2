import { UploadOutlined } from '@ant-design/icons';
import { Button, Image, message, Space, Upload } from 'antd';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import React, { useState } from 'react';
import { uploadFile } from '@/services/file';

/**
 * Upload ảnh nền Hero → trả URL từ /api/v1/files, gắn vào field
 * backgroundImageUrl. Viết mới thay vì tái dùng `CoverUpload` của
 * content/posts/components/PostForm.tsx — tránh mọi rủi ro cho màn Bài viết
 * đang chạy (xem KEHOACH_WEB_TrangChuCongKhai_HeroContent.md mục 5, 7.2).
 */
const HeroImageUpload: React.FC<{
  value?: string;
  onChange?: (url?: string) => void;
}> = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);

  const customRequest = async (options: UploadRequestOption) => {
    setLoading(true);
    try {
      const res = await uploadFile(options.file as File, 'hero');
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
            Tải ảnh nền
          </Button>
        </Upload>
        {value && (
          <Button type="link" danger onClick={() => onChange?.(undefined)}>
            Xóa
          </Button>
        )}
      </Space>
      {value && <Image src={value} width={280} alt="hero background" />}
    </Space>
  );
};

export default HeroImageUpload;
