import { PlusOutlined } from '@ant-design/icons';
import {
  DrawerForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Button, message } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { ClassDetail, ClassItem } from '../data';
import { createClass, updateClass } from '../service';

type Props = {
  mode: 'create' | 'edit';
  /** Dữ liệu khóa khi sửa (fill sẵn). */
  editData?: ClassItem | null;
  /** Controlled cho chế độ sửa. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
};

// Dùng CHUNG cho Tạo & Sửa khóa — chỉ khác: sửa thì fill dữ liệu sẵn.
const ClassForm: React.FC<Props> = ({
  mode,
  editData,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const isEdit = mode === 'edit';

  const initialValues: Partial<ClassDetail> =
    isEdit && editData
      ? {
          name: editData.name,
          subjectId: editData.subjectId,
          teacherIds: editData.teachers?.map((t) => t.id) ?? [],
          startDate: editData.startDate
            ? (dayjs(editData.startDate) as unknown as string)
            : undefined,
          endDate: editData.endDate
            ? (dayjs(editData.endDate) as unknown as string)
            : undefined,
          status: editData.status,
        }
      : { status: 'ACTIVE' };

  const handleFinish = async (values: ClassDetail) => {
    if (isEdit && editData) {
      await updateClass(Number(editData.id), values);
      messageApi.success('Cập nhật khóa thành công');
    } else {
      await createClass(values);
      messageApi.success('Tạo khóa thành công');
    }
    onSuccess?.();
    return true;
  };

  return (
    <>
      {contextHolder}
      <DrawerForm<ClassDetail>
        title={isEdit ? 'Sửa khóa' : 'Tạo khóa'}
        width="520px"
        // Sửa: controlled (mở từ ngoài, không có nút trigger)
        trigger={
          isEdit ? undefined : (
            <Button type="primary" icon={<PlusOutlined />}>
              Tạo khóa
            </Button>
          )
        }
        open={open}
        onOpenChange={onOpenChange}
        key={editData?.id ?? 'create'}
        initialValues={initialValues}
        drawerProps={{ destroyOnHidden: true }}
        dateFormatter={(value) => value.format('YYYY-MM-DD')}
        onFinish={handleFinish}
      >
        <ProFormText
          name="name"
          label="Tên khóa"
          placeholder="Ví dụ: 10A1, Toán K10A"
          rules={[{ required: true, message: 'Nhập tên khóa' }]}
        />
        <ProFormSelect
          name="subjectId"
          label="Môn học"
          placeholder="Chọn môn học"
          request={async () => {
            const res = await request('/api/v1/subjects', {
              params: { pageSize: 100 },
            });
            return (res.data ?? []).map(
              (s: { id: number; name: string; gradeLevel: string }) => ({
                label: `${s.name} — ${s.gradeLevel}`,
                value: s.id,
              }),
            );
          }}
          fieldProps={{
            showSearch: true,
            filterOption: (input: string, option?: { label?: string }) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase()),
          }}
          rules={[{ required: true, message: 'Chọn môn học' }]}
        />
        <ProFormSelect
          name="teacherIds"
          label="Giáo viên phụ trách"
          placeholder="Chọn giáo viên"
          mode="multiple"
          request={async () => {
            const res = await request('/api/v1/admin/users', {
              params: { role: 'TEACHER', status: 'ACTIVE', pageSize: 100 },
            });
            return (res.data ?? []).map(
              (u: { id: number; username: string; fullName: string }) => ({
                label: `${u.fullName || u.username} (${u.username})`,
                value: u.id,
              }),
            );
          }}
          fieldProps={{
            showSearch: true,
            filterOption: (input: string, option?: { label?: string }) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase()),
          }}
        />
        <ProFormDatePicker
          name="startDate"
          label="Ngày bắt đầu"
          placeholder="dd/mm/yyyy"
          fieldProps={{ format: 'DD/MM/YYYY' }}
        />
        <ProFormDatePicker
          name="endDate"
          label="Ngày kết thúc"
          placeholder="dd/mm/yyyy"
          fieldProps={{ format: 'DD/MM/YYYY' }}
        />
        <ProFormSelect
          name="status"
          label="Trạng thái"
          options={[
            { label: 'Hoạt động', value: 'ACTIVE' },
            { label: 'Tạm dừng', value: 'INACTIVE' },
          ]}
          allowClear={false}
        />
      </DrawerForm>
    </>
  );
};

export default ClassForm;
