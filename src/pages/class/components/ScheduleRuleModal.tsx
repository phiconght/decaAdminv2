import {
  Button,
  DatePicker,
  Form,
  InputNumber,
  Modal,
  message,
  Segmented,
  Select,
  Switch,
  TimePicker,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import type {
  CreateSchedulePayload,
  GeneratePreview,
  RecurrenceType,
  RoomOption,
  ScheduleItem,
  TeacherOption,
} from '../schedule.data';
import { DOW_OPTIONS } from '../schedule.helper';
import {
  createSchedule,
  previewSchedule,
  updateSchedule,
} from '../schedule.service';
import SchedulePreviewPanel from './SchedulePreviewPanel';

type Props = {
  open: boolean;
  classId: number;
  /** Có giá trị => chế độ sửa quy tắc. */
  editItem?: ScheduleItem | null;
  rooms: RoomOption[];
  teachers: TeacherOption[];
  onClose: () => void;
  onSaved: () => void;
};

type FormValues = {
  recurrenceType: RecurrenceType;
  dayOfWeek?: number;
  startDate?: dayjs.Dayjs;
  endDate?: dayjs.Dayjs;
  startTime?: dayjs.Dayjs;
  durationMinutes?: number;
  roomId?: number;
  teacherId?: number;
  active: boolean;
};

const RECURRENCE_SEG = [
  { label: 'Một ngày', value: 'ONCE' },
  { label: 'Hàng ngày', value: 'DAILY' },
  { label: 'Hàng tuần', value: 'WEEKLY' },
];

const ScheduleRuleModal: React.FC<Props> = ({
  open,
  classId,
  editItem,
  rooms,
  teachers,
  onClose,
  onSaved,
}) => {
  const [form] = Form.useForm<FormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const recurrenceType = Form.useWatch('recurrenceType', form);

  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<GeneratePreview | null>(null);

  const isEdit = !!editItem;

  // Reset form mỗi lần mở.
  useEffect(() => {
    if (!open) return;
    setPreview(null);
    if (editItem) {
      form.setFieldsValue({
        recurrenceType: editItem.recurrenceType,
        dayOfWeek: editItem.dayOfWeek ?? undefined,
        startDate: editItem.startDate ? dayjs(editItem.startDate) : undefined,
        endDate: editItem.endDate ? dayjs(editItem.endDate) : undefined,
        startTime: editItem.startTime
          ? dayjs(editItem.startTime.slice(0, 5), 'HH:mm')
          : undefined,
        durationMinutes: editItem.durationMinutes,
        roomId: editItem.roomId ?? undefined,
        teacherId: editItem.teacherId ?? undefined,
        active: editItem.active,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ recurrenceType: 'WEEKLY', active: true });
    }
  }, [open, editItem, form]);

  // Đổi field sau preview -> hủy preview cũ (tránh lưu theo preview cũ).
  const invalidatePreview = () => setPreview(null);

  const hasHardBlock = useMemo(() => {
    if (!preview) return false;
    return (
      preview.conflicts.some(
        (c) => c.type === 'ROOM' || c.type === 'TEACHER',
      ) || preview.sessions.some((s) => s.blocked)
    );
  }, [preview]);

  const buildPayload = (v: FormValues): CreateSchedulePayload => {
    const startDate = v.startDate?.format('YYYY-MM-DD') ?? '';
    const isOnce = v.recurrenceType === 'ONCE';
    return {
      recurrenceType: v.recurrenceType,
      dayOfWeek: v.recurrenceType === 'WEEKLY' ? (v.dayOfWeek ?? null) : null,
      startDate,
      endDate: isOnce ? startDate : (v.endDate?.format('YYYY-MM-DD') ?? null),
      startTime: v.startTime?.format('HH:mm') ?? '',
      durationMinutes: v.durationMinutes ?? 0,
      roomId: v.roomId ?? null,
      teacherId: v.teacherId ?? null,
      active: v.active,
    };
  };

  // Cảnh báo buổi vắt qua nửa đêm (giờ kết thúc rơi sang ngày kế tiếp).
  const crossesMidnight = (v: FormValues): boolean => {
    if (!v.startTime || !v.durationMinutes) return false;
    const end = v.startTime.add(v.durationMinutes, 'minute');
    return !end.isSame(v.startTime, 'day');
  };

  const handlePreview = async () => {
    try {
      const v = await form.validateFields();
      if (crossesMidnight(v)) {
        messageApi.error('Buổi học không được vắt qua nửa đêm.');
        return;
      }
      setPreviewing(true);
      const res = await previewSchedule(classId, buildPayload(v));
      setPreview(res.data);
    } catch (err) {
      if ((err as { errorFields?: unknown }).errorFields) return; // lỗi validate form
      messageApi.error('Không xem trước được, thử lại.');
    } finally {
      setPreviewing(false);
    }
  };

  const handleSave = async () => {
    if (!preview || hasHardBlock) return;
    try {
      const v = await form.validateFields();
      setSaving(true);
      const payload = buildPayload(v);
      const res = isEdit
        ? await updateSchedule(editItem.id, payload)
        : await createSchedule(classId, payload);
      messageApi.success(`Đã lưu lịch và sinh ${res.data.total} buổi.`);
      onSaved();
    } catch (err) {
      if ((err as { errorFields?: unknown }).errorFields) return;
      messageApi.error('Không lưu được lịch, thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={isEdit ? 'Sửa lịch' : 'Thêm lịch'}
        open={open}
        width={720}
        style={{ maxWidth: '95vw' }}
        onCancel={onClose}
        destroyOnHidden
        maskClosable={false}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={saving}
        okButtonProps={{ disabled: !preview || hasHardBlock }}
        onOk={handleSave}
      >
        <Form<FormValues>
          form={form}
          layout="vertical"
          onValuesChange={invalidatePreview}
        >
          {isEdit && (
            <div style={{ marginBottom: 12, color: '#faad14' }}>
              ⓘ Sửa quy tắc sẽ tạo lại các buổi tương lai chưa diễn ra (không
              ảnh hưởng buổi đã dạy hoặc buổi bù thủ công).
            </div>
          )}
          <Form.Item
            name="recurrenceType"
            label="Loại lặp"
            rules={[{ required: true }]}
          >
            <Segmented options={RECURRENCE_SEG} />
          </Form.Item>

          {recurrenceType === 'WEEKLY' && (
            <Form.Item
              name="dayOfWeek"
              label="Thứ"
              rules={[{ required: true, message: 'Chọn thứ trong tuần' }]}
            >
              <Select
                options={DOW_OPTIONS}
                placeholder="Chọn thứ"
                style={{ maxWidth: 200 }}
              />
            </Form.Item>
          )}

          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Chọn ngày bắt đầu' }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>

          {recurrenceType !== 'ONCE' && (
            <Form.Item
              name="endDate"
              label="Ngày kết thúc"
              dependencies={['startDate']}
              rules={[
                { required: true, message: 'Chọn ngày kết thúc' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const start = getFieldValue('startDate');
                    if (!value || !start || !value.isBefore(start, 'day')) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('Ngày kết thúc phải >= ngày bắt đầu'),
                    );
                  },
                }),
              ]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
          )}

          <Form.Item
            name="startTime"
            label="Giờ bắt đầu"
            rules={[{ required: true, message: 'Chọn giờ bắt đầu' }]}
          >
            <TimePicker
              format="HH:mm"
              minuteStep={5}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="durationMinutes"
            label="Thời lượng (phút)"
            rules={[
              { required: true, message: 'Nhập thời lượng' },
              {
                type: 'number',
                min: 1,
                message: 'Thời lượng phải lớn hơn 0',
              },
            ]}
          >
            <InputNumber
              min={15}
              step={15}
              addonAfter="phút"
              style={{ width: 200 }}
            />
          </Form.Item>

          <Form.Item name="roomId" label="Phòng">
            <Select
              allowClear
              showSearch
              placeholder={
                rooms.length ? 'Chọn phòng' : 'Không có quyền chọn phòng'
              }
              disabled={!rooms.length}
              optionFilterProp="label"
              options={rooms.map((r) => ({
                label: `${r.name} (${r.code})`,
                value: r.id,
              }))}
            />
          </Form.Item>

          <Form.Item name="teacherId" label="Giáo viên">
            <Select
              allowClear
              showSearch
              placeholder={
                teachers.length ? 'Chọn giáo viên' : 'Không có quyền chọn GV'
              }
              disabled={!teachers.length}
              optionFilterProp="label"
              options={teachers.map((t) => ({
                label: `${t.fullName || t.username} (${t.username})`,
                value: t.id,
              }))}
            />
          </Form.Item>

          <Form.Item name="active" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>

        <div>
          <Button onClick={handlePreview} loading={previewing}>
            Xem trước
          </Button>
        </div>

        {preview && (
          <SchedulePreviewPanel preview={preview} hasHardBlock={hasHardBlock} />
        )}
      </Modal>
    </>
  );
};

export default ScheduleRuleModal;
