import { PlusOutlined } from '@ant-design/icons';
import { DrawerForm, ProFormText } from '@ant-design/pro-components';
import { Button, message } from 'antd';
import React from 'react';
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserDetail,
  UserStatus,
} from '../data';
import { createParent, updateParent } from '../service';

const FIXED_ROLE = 'PARENT';

type Props = {
  mode: 'create' | 'edit';
  editData?: UserDetail | null;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type FormValues = {
  username?: string;
  password?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  status?: UserStatus;
};

const ParentForm: React.FC<Props> = ({
  mode,
  editData,
  onSuccess,
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
          // Giữ nguyên các vai trò hiện có của tài khoản
          roles: editData.roles as any,
        };
        await updateParent(editData.id, payload);
        messageApi.success('Cập nhật phụ huynh thành công');
      } else {
        if (!values.username || !values.password) return false;
        const payload: CreateUserPayload = {
          username: values.username,
          password: values.password,
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          roles: [FIXED_ROLE as any],
          status: values.status,
        };
        await createParent(payload);
        messageApi.success('Tạo phụ huynh thành công');
      }
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
        title={isEdit ? 'Sửa phụ huynh' : 'Tạo phụ huynh'}
        width={520}
        trigger={
          isEdit ? undefined : (
            <Button type="primary" icon={<PlusOutlined />}>
              Tạo phụ huynh
            </Button>
          )
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
      </DrawerForm>
    </>
  );
};

export default ParentForm;
