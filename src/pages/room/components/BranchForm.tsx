import { PlusOutlined } from '@ant-design/icons';
import {
  DrawerForm,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, message } from 'antd';
import React from 'react';
import type { BranchForm as BranchFormValues, BranchItem } from '../data';
import { createBranch, updateBranch } from '../service';

type Props = {
  mode: 'create' | 'edit';
  editData?: BranchItem | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
};

// Dùng CHUNG cho Tạo & Sửa cơ sở.
const BranchForm: React.FC<Props> = ({
  mode,
  editData,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const isEdit = mode === 'edit';

  const initialValues: Partial<BranchFormValues> =
    isEdit && editData
      ? {
          code: editData.code,
          name: editData.name,
          address: editData.address,
          active: editData.active,
        }
      : { active: true };

  const handleFinish = async (values: BranchFormValues) => {
    const payload: BranchFormValues = { ...values, code: values.code.trim() };
    if (isEdit && editData) {
      await updateBranch(editData.id, payload);
      messageApi.success('Cập nhật cơ sở thành công');
    } else {
      await createBranch(payload);
      messageApi.success('Tạo cơ sở thành công');
    }
    onSuccess?.();
    return true;
  };

  return (
    <>
      {contextHolder}
      <DrawerForm<BranchFormValues>
        title={isEdit ? 'Sửa cơ sở' : 'Thêm cơ sở'}
        trigger={
          isEdit ? undefined : (
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm cơ sở
            </Button>
          )
        }
        open={open}
        onOpenChange={onOpenChange}
        key={editData?.id ?? 'create'}
        initialValues={initialValues}
        drawerProps={{ destroyOnHidden: true }}
        onFinish={handleFinish}
      >
        <ProFormText
          name="code"
          label="Mã cơ sở"
          placeholder="Ví dụ: CG"
          fieldProps={{ maxLength: 20 }}
          rules={[{ required: true, message: 'Nhập mã cơ sở' }]}
        />
        <ProFormText
          name="name"
          label="Tên cơ sở"
          placeholder="Ví dụ: CS Cầu Giấy"
          fieldProps={{ maxLength: 150 }}
          rules={[{ required: true, message: 'Nhập tên cơ sở' }]}
        />
        <ProFormTextArea
          name="address"
          label="Địa chỉ"
          placeholder="Địa chỉ cơ sở"
          fieldProps={{ maxLength: 255, rows: 2 }}
        />
        <ProFormSwitch
          name="active"
          label="Trạng thái"
          checkedChildren="Hoạt động"
          unCheckedChildren="Ngừng"
        />
      </DrawerForm>
    </>
  );
};

export default BranchForm;
