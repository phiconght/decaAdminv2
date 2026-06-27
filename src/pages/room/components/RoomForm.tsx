import { PlusOutlined } from '@ant-design/icons';
import {
  DrawerForm,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, message } from 'antd';
import React from 'react';
import type { RoomForm as RoomFormValues, RoomItem } from '../data';
import { createRoom, queryBranches, updateRoom } from '../service';

type Props = {
  mode: 'create' | 'edit';
  editData?: RoomItem | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
};

// Dùng CHUNG cho Tạo & Sửa phòng.
const RoomForm: React.FC<Props> = ({
  mode,
  editData,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const isEdit = mode === 'edit';

  const initialValues: Partial<RoomFormValues> =
    isEdit && editData
      ? {
          code: editData.code,
          name: editData.name,
          branchId: editData.branchId,
          capacity: editData.capacity,
          note: editData.note,
          active: editData.active,
        }
      : { active: true };

  const handleFinish = async (values: RoomFormValues) => {
    const payload: RoomFormValues = { ...values, code: values.code.trim() };
    if (isEdit && editData) {
      await updateRoom(editData.id, payload);
      messageApi.success('Cập nhật phòng thành công');
    } else {
      await createRoom(payload);
      messageApi.success('Tạo phòng thành công');
    }
    onSuccess?.();
    return true;
  };

  return (
    <>
      {contextHolder}
      <DrawerForm<RoomFormValues>
        title={isEdit ? 'Sửa phòng' : 'Thêm phòng'}
        trigger={
          isEdit ? undefined : (
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm phòng
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
          label="Mã phòng"
          placeholder="Ví dụ: P101"
          fieldProps={{ maxLength: 20 }}
          rules={[{ required: true, message: 'Nhập mã phòng' }]}
        />
        <ProFormText
          name="name"
          label="Tên phòng"
          placeholder="Ví dụ: Phòng 101"
          fieldProps={{ maxLength: 150 }}
          rules={[{ required: true, message: 'Nhập tên phòng' }]}
        />
        <ProFormSelect
          name="branchId"
          label="Cơ sở"
          placeholder="Chọn cơ sở"
          request={async () => {
            const res = await queryBranches(false);
            const options = (res.data ?? []).map((b) => ({
              label: `${b.name} (${b.code})`,
              value: b.id,
            }));
            // Cơ sở của phòng đang sửa có thể đã ngừng (không nằm trong list active)
            // -> bổ sung option đơn lẻ để hiển thị đúng label.
            if (
              isEdit &&
              editData &&
              !options.some((o) => o.value === editData.branchId)
            ) {
              options.unshift({
                label: editData.branchName,
                value: editData.branchId,
              });
            }
            return options;
          }}
          fieldProps={{
            showSearch: true,
            filterOption: (input: string, option?: { label?: string }) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase()),
          }}
          rules={[{ required: true, message: 'Chọn cơ sở' }]}
        />
        <ProFormDigit
          name="capacity"
          label="Sức chứa"
          placeholder="Số chỗ ngồi"
          min={0}
          fieldProps={{ precision: 0 }}
        />
        <ProFormTextArea
          name="note"
          label="Ghi chú"
          placeholder="Ghi chú thêm"
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

export default RoomForm;
