import { PlusOutlined } from '@ant-design/icons';
import {
  DrawerForm,
  ProForm,
  ProFormDatePicker,
  ProFormDependency,
  ProFormRadio,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, type FormInstance, message } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { CreateLeavePayload } from '../data';
import {
  createLeave,
  queryStudentClassesForLeave,
  queryStudentOptionsForLeave,
  queryStudentSessions,
} from '../service';

type FormValues = {
  studentId: number;
  scope: 'SESSION' | 'RANGE';
  sessionId?: number;
  classId?: number;
  dateFrom?: string;
  dateTo?: string;
  reason?: string;
};

type Props = {
  onSuccess?: () => void;
};

// DrawerForm tạo đơn nghỉ thay mặt học viên (chỉ hiện khi có LEAVE:WRITE).
const LeaveForm: React.FC<Props> = ({ onSuccess }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const handleFinish = async (values: FormValues) => {
    const payload: CreateLeavePayload = {
      studentId: values.studentId,
      scope: values.scope,
      reason: values.reason,
    };
    if (values.scope === 'SESSION') {
      payload.sessionId = values.sessionId;
    } else {
      payload.classId = values.classId;
      payload.dateFrom = values.dateFrom;
      payload.dateTo = values.dateTo;
    }
    await createLeave(payload);
    messageApi.success('Đã tạo đơn nghỉ');
    onSuccess?.();
    return true;
  };

  return (
    <>
      {contextHolder}
      <DrawerForm<FormValues>
        title="Tạo đơn xin nghỉ"
        trigger={
          <Button type="primary" icon={<PlusOutlined />}>
            Tạo đơn
          </Button>
        }
        initialValues={{ scope: 'SESSION' }}
        drawerProps={{ destroyOnHidden: true }}
        dateFormatter={(value) => value.format('YYYY-MM-DD')}
        onFinish={handleFinish}
      >
        <ProFormSelect
          name="studentId"
          label="Học viên"
          placeholder="Chọn học viên"
          rules={[{ required: true, message: 'Chọn học viên' }]}
          showSearch
          debounceTime={300}
          request={async ({ keyWords }) => {
            const res = await queryStudentOptionsForLeave(keyWords);
            return (res.data ?? []).map((u) => ({
              label: `${u.fullName || u.username} (${u.username})`,
              value: u.id,
            }));
          }}
          fieldProps={{ filterOption: false }}
        />

        <ProFormRadio.Group
          name="scope"
          label="Phạm vi nghỉ"
          rules={[{ required: true }]}
          radioType="button"
          options={[
            { label: 'Một buổi', value: 'SESSION' },
            { label: 'Khoảng ngày', value: 'RANGE' },
          ]}
        />

        <ProFormDependency name={['studentId', 'scope']}>
          {({ studentId, scope }) => {
            if (scope === 'SESSION') {
              return (
                <ProFormSelect
                  key={`session-${studentId ?? 'none'}`}
                  name="sessionId"
                  label="Buổi học"
                  placeholder={
                    studentId ? 'Chọn buổi của học viên' : 'Chọn học viên trước'
                  }
                  rules={[{ required: true, message: 'Chọn buổi học' }]}
                  showSearch
                  disabled={!studentId}
                  request={async () => {
                    if (!studentId) return [];
                    const from = dayjs().format('YYYY-MM-DD');
                    const to = dayjs().add(8, 'week').format('YYYY-MM-DD');
                    const res = await queryStudentSessions(studentId, from, to);
                    return (res.data ?? []).map((s) => ({
                      label: `${dayjs(s.date).format('DD/MM')} ${s.startTime.slice(
                        0,
                        5,
                      )} — ${s.className}`,
                      value: s.sessionId,
                    }));
                  }}
                  fieldProps={{
                    filterOption: (
                      input: string,
                      option?: { label?: string },
                    ) =>
                      String(option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase()),
                  }}
                />
              );
            }
            return (
              <>
                <ProFormSelect
                  key={`class-${studentId ?? 'none'}`}
                  name="classId"
                  label="Lớp"
                  placeholder={studentId ? 'Tất cả lớp' : 'Chọn học viên trước'}
                  allowClear
                  showSearch
                  disabled={!studentId}
                  request={async () => {
                    if (!studentId) return [];
                    const res = await queryStudentClassesForLeave(studentId);
                    return (res.data ?? []).map((c) => ({
                      label: c.name,
                      value: c.id,
                    }));
                  }}
                  fieldProps={{
                    filterOption: (
                      input: string,
                      option?: { label?: string },
                    ) =>
                      String(option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase()),
                  }}
                />
                <ProForm.Group>
                  <ProFormDatePicker
                    name="dateFrom"
                    label="Từ ngày"
                    placeholder="dd/mm/yyyy"
                    rules={[{ required: true, message: 'Chọn ngày bắt đầu' }]}
                    fieldProps={{ format: 'DD/MM/YYYY' }}
                  />
                  <ProFormDatePicker
                    name="dateTo"
                    label="Đến ngày"
                    placeholder="dd/mm/yyyy"
                    fieldProps={{ format: 'DD/MM/YYYY' }}
                    rules={[
                      { required: true, message: 'Chọn ngày kết thúc' },
                      ({ getFieldValue }: FormInstance) => ({
                        validator(_rule: unknown, value: unknown) {
                          const from = getFieldValue('dateFrom');
                          if (!value || !from) return Promise.resolve();
                          if (
                            dayjs(value as dayjs.ConfigType).isBefore(
                              dayjs(from),
                              'day',
                            )
                          ) {
                            return Promise.reject(
                              new Error('Đến ngày phải >= Từ ngày'),
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  />
                </ProForm.Group>
              </>
            );
          }}
        </ProFormDependency>

        <ProFormTextArea
          name="reason"
          label="Lý do"
          placeholder="Nhập lý do xin nghỉ"
          fieldProps={{ maxLength: 500, showCount: true, rows: 3 }}
        />
      </DrawerForm>
    </>
  );
};

export default LeaveForm;
