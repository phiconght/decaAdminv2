import { PlusOutlined } from '@ant-design/icons';
import { DrawerForm, ProFormText } from '@ant-design/pro-components';
import { Button, message } from 'antd';
import React from 'react';
import type { CreateUserPayload, UserStatus } from '../data';
import { createStudent } from '../service';

type Props = {
  onSuccess?: () => void;
};

type FormValues = {
  username?: string;
  password?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  status?: UserStatus;
};

// Tạo học viên (vai trò STUDENT cố định).
const StudentForm: React.FC<Props> = ({ onSuccess }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const handleFinish = async (values: FormValues) => {
    if (!values.username || !values.password) return false;
    try {
      const payload: CreateUserPayload = {
        username: values.username,
        password: values.password,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        roles: ['STUDENT'],
        status: values.status,
      };
      await createStudent(payload);
      messageApi.success('Tạo học viên thành công');
      onSuccess?.();
      return true;
    } catch {
      return false;
    }
  };

  return (
    <>
      {contextHolder}
      <DrawerForm<FormValues>
        title="Tạo học viên"
        width={520}
        trigger={
          <Button type="primary" icon={<PlusOutlined />}>
            Tạo học viên
          </Button>
        }
        initialValues={{ status: 'ACTIVE' }}
        drawerProps={{ destroyOnHidden: true }}
        onFinish={handleFinish}
      >
        <ProFormText
          name="username"
          label="Tên đăng nhập"
          placeholder="Ít nhất 3 ký tự"
          rules={[
            { required: true, message: 'Nhập tên đăng nhập' },
            { min: 3, message: 'Tối thiểu 3 ký tự' },
          ]}
        />
        <ProFormText.Password
          name="password"
          label="Mật khẩu"
          placeholder="Ít nhất 6 ký tự"
          rules={[
            { required: true, message: 'Nhập mật khẩu' },
            { min: 6, message: 'Tối thiểu 6 ký tự' },
          ]}
        />
        <ProFormText
          name="fullName"
          label="Họ tên"
          placeholder="Nguyễn Văn A"
        />
        <ProFormText
          name="email"
          label="Email"
          placeholder="example@email.com"
          rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
        />
        <ProFormText
          name="phone"
          label="Số điện thoại"
          placeholder="0901234567"
          fieldProps={{ maxLength: 20 }}
        />
      </DrawerForm>
    </>
  );
};

export default StudentForm;
