import { PlusOutlined } from '@ant-design/icons';
import {
  DrawerForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, message } from 'antd';
import React from 'react';
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserDetail,
  UserStatus,
} from '../data';
import { createUser, updateUser } from '../service';

const ROLE_OPTIONS = [
  { label: 'ADMIN', value: 'ADMIN' },
  { label: 'EMPLOYEE', value: 'EMPLOYEE' },
  { label: 'TEACHER', value: 'TEACHER' },
  { label: 'ASSISTANT', value: 'ASSISTANT' },
  { label: 'STUDENT', value: 'STUDENT' },
  { label: 'PARENT', value: 'PARENT' },
];

const STATUS_OPTIONS = [
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'DISABLED', value: 'DISABLED' },
  { label: 'LOCKED', value: 'LOCKED' },
];

type Props = {
  mode: 'create' | 'edit';
  editData?: UserDetail | null;
  onSuccess?: () => void;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type FormValues = {
  username?: string;
  password?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  roles: string[];
  status?: UserStatus;
};

const UserForm: React.FC<Props> = ({
  mode,
  editData,
  onSuccess,
  trigger,
  open,
  onOpenChange,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const isEdit = mode === 'edit';

  const initialValues: Partial<FormValues> =
    isEdit && editData
      ? {
          fullName: editData.fullName,
          email: editData.email,
          phone: editData.phone,
          roles: editData.roles,
          status: editData.status,
        }
      : { status: 'ACTIVE' };

  const handleFinish = async (values: FormValues) => {
    try {
      if (isEdit && editData) {
        const payload: UpdateUserPayload = {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          roles: values.roles as any,
        };
        await updateUser(editData.id, payload);
        messageApi.success('Cập nhật người dùng thành công');
      } else {
        if (!values.username || !values.password) return false;
        const payload: CreateUserPayload = {
          username: values.username,
          password: values.password,
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          roles: values.roles as any,
          status: values.status,
        };
        await createUser(payload);
        messageApi.success('Tạo tài khoản thành công');
      }
      onSuccess?.();
      return true;
    } catch {
      // Lỗi (vd: trùng username/email) đã hiện ở global error handler
      return false;
    }
  };

  return (
    <>
      {contextHolder}
      <DrawerForm<FormValues>
        title={isEdit ? 'Sửa người dùng' : 'Tạo tài khoản'}
        width={520}
        trigger={
          // Edit là controlled (open/onOpenChange) nên không render nút trigger
          isEdit
            ? undefined
            : (trigger ?? (
                <Button type="primary" icon={<PlusOutlined />}>
                  Tạo tài khoản
                </Button>
              ))
        }
        open={open}
        onOpenChange={onOpenChange}
        initialValues={initialValues}
        key={editData?.id ?? 'create'}
        drawerProps={{ destroyOnHidden: true }}
        onFinish={handleFinish}
      >
        <ProFormText
          name="username"
          label="Tên đăng nhập"
          placeholder="Ít nhất 3 ký tự"
          disabled={isEdit}
          rules={
            isEdit
              ? []
              : [
                  { required: true, message: 'Nhập tên đăng nhập' },
                  { min: 3, message: 'Tối thiểu 3 ký tự' },
                ]
          }
        />

        {!isEdit && (
          <ProFormText.Password
            name="password"
            label="Mật khẩu"
            placeholder="Ít nhất 6 ký tự"
            rules={[
              { required: true, message: 'Nhập mật khẩu' },
              { min: 6, message: 'Tối thiểu 6 ký tự' },
            ]}
          />
        )}

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

        <ProFormSelect
          name="roles"
          label="Vai trò"
          options={ROLE_OPTIONS}
          fieldProps={{ mode: 'multiple' }}
          placeholder="Chọn ít nhất 1 vai trò"
          rules={[{ required: true, message: 'Chọn ít nhất 1 vai trò' }]}
        />

        {/* Status chỉ hiện khi tạo mới; khi sửa dùng menu ⋯ ở bảng danh sách */}
        {!isEdit && (
          <ProFormSelect
            name="status"
            label="Trạng thái"
            options={STATUS_OPTIONS}
            allowClear={false}
          />
        )}
      </DrawerForm>
    </>
  );
};

export default UserForm;
