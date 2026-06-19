import { Form, Input, Modal, message } from 'antd';
import React, { useState } from 'react';
import { resetUserPassword } from '../service';

type Props = {
  userId: number | null;
  username?: string;
  open: boolean;
  onClose: () => void;
};

const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$';

function generatePassword(len = 10): string {
  let result = '';
  for (let i = 0; i < len; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
}

const ResetPasswordModal: React.FC<Props> = ({
  userId,
  username,
  open,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleGenerate = () => {
    const pw = generatePassword();
    form.setFieldsValue({ newPassword: pw, confirm: pw });
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (!userId) return;
    setLoading(true);
    try {
      await resetUserPassword(userId, values.newPassword);
      messageApi.success('Đã đặt lại mật khẩu. Người dùng cần đăng nhập lại.');
      form.resetFields();
      onClose();
    } catch {
      // Lỗi đã hiện ở global error handler
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={`Đặt lại mật khẩu — ${username ?? ''}`}
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Đặt lại"
        cancelText="Hủy"
        confirmLoading={loading}
        destroyOnHidden
        afterClose={() => form.resetFields()}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Nhập mật khẩu mới' },
              { min: 6, message: 'Tối thiểu 6 ký tự' },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Xác nhận mật khẩu"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Nhập lại mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu không khớp'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu" />
          </Form.Item>
          <a onClick={handleGenerate} style={{ fontSize: 13 }}>
            Sinh mật khẩu ngẫu nhiên
          </a>
        </Form>
      </Modal>
    </>
  );
};

export default ResetPasswordModal;
