import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormText,
} from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';

type AppSettings = { supportHotline: string };

const getAppSettings = () =>
  request<{ success: boolean; data: AppSettings }>('/api/v1/app-settings');

const updateAppSettings = (data: AppSettings) =>
  request<{ success: boolean; data: AppSettings }>('/api/v1/app-settings', {
    method: 'PUT',
    data,
  });

/**
 * Cấu hình chung toàn hệ thống (hotline...) — Web/Mobile tải 1 lần lúc mở
 * app, sửa 1 chỗ ở đây thì cả 2 nền tảng tự cập nhật, không cần build lại.
 */
const AppSettingsPage: React.FC = () => {
  const [form] = ProForm.useForm<AppSettings>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAppSettings()
      .then((res) => {
        if (res.data) form.setFieldsValue(res.data);
      })
      .catch(() => message.error('Không tải được cấu hình'))
      .finally(() => setLoading(false));
  }, [form]);

  return (
    <PageContainer header={{ title: 'Cấu hình chung' }}>
      <ProCard loading={loading} style={{ maxWidth: 480 }}>
        <ProForm<AppSettings>
          form={form}
          submitter={{
            searchConfig: { submitText: 'Lưu' },
            resetButtonProps: false,
          }}
          onFinish={async (values) => {
            try {
              await updateAppSettings(values);
              message.success('Đã lưu cấu hình');
              return true;
            } catch {
              message.error('Lưu cấu hình thất bại');
              return false;
            }
          }}
        >
          <ProFormText
            name="supportHotline"
            label="Số điện thoại hỗ trợ (hotline)"
            tooltip="Hiện trên mọi Card/trang chi tiết khóa học ở Web &amp; Mobile."
            placeholder="VD: 1900 9999"
            rules={[{ required: true, message: 'Nhập số hotline' }]}
          />
        </ProForm>
      </ProCard>
    </PageContainer>
  );
};

export default AppSettingsPage;
