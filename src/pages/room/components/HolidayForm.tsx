import { PlusOutlined } from '@ant-design/icons';
import {
  DrawerForm,
  ProFormDatePicker,
  ProFormDependency,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, message } from 'antd';
import React from 'react';
import type { HolidayForm as HolidayFormValues } from '../data';
import { createHoliday, queryBranches } from '../service';

type FormValues = {
  holidayDate: string;
  name: string;
  scope: 'ALL' | 'BRANCH';
  branchId?: number;
};

type Props = {
  onSuccess?: () => void;
};

// DrawerForm thêm ngày nghỉ: ngày + tên + phạm vi (toàn hệ thống / theo cơ sở).
const HolidayForm: React.FC<Props> = ({ onSuccess }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const handleFinish = async (values: FormValues) => {
    const payload: HolidayFormValues = {
      holidayDate: values.holidayDate,
      name: values.name.trim(),
      branchId: values.scope === 'BRANCH' ? values.branchId : undefined,
    };
    await createHoliday(payload);
    messageApi.success('Thêm ngày nghỉ thành công');
    onSuccess?.();
    return true;
  };

  return (
    <>
      {contextHolder}
      <DrawerForm<FormValues>
        title="Thêm ngày nghỉ"
        trigger={
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm ngày nghỉ
          </Button>
        }
        initialValues={{ scope: 'ALL' }}
        drawerProps={{ destroyOnHidden: true }}
        dateFormatter={(value) => value.format('YYYY-MM-DD')}
        onFinish={handleFinish}
      >
        <ProFormDatePicker
          name="holidayDate"
          label="Ngày nghỉ"
          placeholder="dd/mm/yyyy"
          fieldProps={{ format: 'DD/MM/YYYY', style: { width: '100%' } }}
          rules={[{ required: true, message: 'Chọn ngày nghỉ' }]}
        />
        <ProFormText
          name="name"
          label="Tên ngày nghỉ"
          placeholder="Ví dụ: Tết Dương lịch"
          fieldProps={{ maxLength: 150 }}
          rules={[{ required: true, message: 'Nhập tên ngày nghỉ' }]}
        />
        <ProFormRadio.Group
          name="scope"
          label="Phạm vi"
          options={[
            { label: 'Toàn hệ thống', value: 'ALL' },
            { label: 'Theo cơ sở', value: 'BRANCH' },
          ]}
        />
        <ProFormDependency name={['scope']}>
          {({ scope }) =>
            scope === 'BRANCH' ? (
              <ProFormSelect
                name="branchId"
                label="Cơ sở"
                placeholder="Chọn cơ sở"
                request={async () => {
                  const res = await queryBranches(false);
                  return (res.data ?? []).map((b) => ({
                    label: `${b.name} (${b.code})`,
                    value: b.id,
                  }));
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
            ) : null
          }
        </ProFormDependency>
      </DrawerForm>
    </>
  );
};

export default HolidayForm;
