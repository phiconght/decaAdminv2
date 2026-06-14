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
import type { ClassDetail } from '../data';
import { createClass } from '../service';

type CreateClassFormProps = {
  onSuccess?: () => void;
};

const CreateClassForm: React.FC<CreateClassFormProps> = ({ onSuccess }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const handleFinish = async (values: ClassDetail) => {
    const payload = {
      ...values,
      startDate: values.startDate
        ? dayjs(values.startDate).format('YYYY-MM-DD')
        : undefined,
      endDate: values.endDate
        ? dayjs(values.endDate).format('YYYY-MM-DD')
        : undefined,
    };
    await createClass(payload);
    messageApi.success('Tạo lớp thành công');
    onSuccess?.();
    return true;
  };

  return (
    <>
      {contextHolder}
      <DrawerForm<ClassDetail>
        title="Tạo lớp"
        width="520px"
        trigger={
          <Button type="primary" icon={<PlusOutlined />}>
            Tạo lớp
          </Button>
        }
        initialValues={{ status: 'ACTIVE' }}
        drawerProps={{ destroyOnHidden: true }}
        onFinish={handleFinish}
      >
        <ProFormText
          name="name"
          label="Tên lớp"
          placeholder="Ví dụ: 10A1, Toán K10A"
          rules={[{ required: true, message: 'Nhập tên lớp' }]}
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
            { label: 'ACTIVE', value: 'ACTIVE' },
            { label: 'INACTIVE', value: 'INACTIVE' },
          ]}
          allowClear={false}
        />
      </DrawerForm>
    </>
  );
};

export default CreateClassForm;
