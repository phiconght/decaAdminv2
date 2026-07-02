import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormText,
} from '@ant-design/pro-components';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import type { PaymentSettings } from './data';
import { getPaymentSettings, updatePaymentSettings } from './service';

// Trang cấu hình tài khoản nhận tiền (chỉ ADMIN).
const Settings: React.FC = () => {
  const [form] = ProForm.useForm<PaymentSettings>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPaymentSettings()
      .then((res) => {
        if (res.data) form.setFieldsValue(res.data);
      })
      .catch(() => message.error('Không tải được cấu hình'))
      .finally(() => setLoading(false));
  }, [form]);

  return (
    <PageContainer header={{ title: 'Cấu hình tài khoản nhận tiền' }}>
      <ProCard loading={loading} style={{ maxWidth: 640 }}>
        <ProForm<PaymentSettings>
          form={form}
          submitter={{
            searchConfig: { submitText: 'Lưu cấu hình' },
            resetButtonProps: false,
          }}
          onFinish={async (values) => {
            try {
              await updatePaymentSettings(values);
              message.success('Đã lưu cấu hình tài khoản');
              return true;
            } catch {
              message.error('Lưu cấu hình thất bại');
              return false;
            }
          }}
        >
          <ProFormText
            name="bankBin"
            label="Mã BIN ngân hàng (NAPAS)"
            placeholder="VD: 970436"
            rules={[{ required: true, message: 'Nhập mã BIN' }]}
          />
          <ProFormText
            name="bankName"
            label="Tên ngân hàng"
            placeholder="VD: Vietcombank"
            rules={[{ required: true, message: 'Nhập tên ngân hàng' }]}
          />
          <ProFormText
            name="accountNumber"
            label="Số tài khoản"
            rules={[{ required: true, message: 'Nhập số tài khoản' }]}
          />
          <ProFormText
            name="accountName"
            label="Chủ tài khoản (in hoa không dấu)"
            placeholder="VD: TRUNG TAM ABC"
            rules={[{ required: true, message: 'Nhập tên chủ tài khoản' }]}
          />
        </ProForm>
      </ProCard>
    </PageContainer>
  );
};

export default Settings;
