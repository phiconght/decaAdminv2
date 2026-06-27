import {
  DatePicker,
  Form,
  InputNumber,
  Modal,
  message,
  Select,
  TimePicker,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import type {
  CreateManualSessionPayload,
  RoomOption,
  SessionDetail,
  TeacherOption,
  UpdateSessionPayload,
} from '../schedule.data';
import { sessionDayLabel } from '../schedule.helper';
import { createManualSession, updateSession } from '../schedule.service';

type Props = {
  open: boolean;
  classId: number;
  /** 'edit' = sửa buổi (PATCH diff), 'create' = thêm buổi bù. */
  mode: 'edit' | 'create';
  session?: SessionDetail | null;
  rooms: RoomOption[];
  teachers: TeacherOption[];
  onClose: () => void;
  onSaved: () => void;
};

type FormValues = {
  sessionDate?: dayjs.Dayjs;
  startTime?: dayjs.Dayjs;
  durationMinutes?: number;
  roomId?: number;
  teacherId?: number;
};

// Suy ra thời lượng (phút) từ start/end của buổi hiện tại (cùng ngày).
function durationOf(s: SessionDetail): number | undefined {
  const start = dayjs(s.startTime.slice(0, 5), 'HH:mm');
  const end = dayjs(s.endTime.slice(0, 5), 'HH:mm');
  const diff = end.diff(start, 'minute');
  return diff > 0 ? diff : undefined;
}

const SessionEditModal: React.FC<Props> = ({
  open,
  classId,
  mode,
  session,
  rooms,
  teachers,
  onClose,
  onSaved,
}) => {
  const [form] = Form.useForm<FormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const [saving, setSaving] = useState(false);
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!open) return;
    if (isEdit && session) {
      form.setFieldsValue({
        startTime: dayjs(session.startTime.slice(0, 5), 'HH:mm'),
        durationMinutes: durationOf(session),
        roomId: session.roomId ?? undefined,
        teacherId: session.teacherId ?? undefined,
      });
    } else {
      form.resetFields();
    }
  }, [open, session, isEdit, form]);

  const crossesMidnight = (v: FormValues): boolean => {
    if (!v.startTime || !v.durationMinutes) return false;
    return !v.startTime
      .add(v.durationMinutes, 'minute')
      .isSame(v.startTime, 'day');
  };

  const handleSave = async () => {
    let v: FormValues;
    try {
      v = await form.validateFields();
    } catch {
      return;
    }
    if (crossesMidnight(v)) {
      messageApi.error('Buổi học không được vắt qua nửa đêm.');
      return;
    }
    if (v.durationMinutes !== undefined && v.durationMinutes <= 0) {
      messageApi.error('Thời lượng phải lớn hơn 0.');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && session) {
        // PATCH chỉ gửi field đổi.
        const orig = {
          startTime: session.startTime.slice(0, 5),
          durationMinutes: durationOf(session),
          roomId: session.roomId ?? undefined,
          teacherId: session.teacherId ?? undefined,
        };
        const next = {
          startTime: v.startTime?.format('HH:mm'),
          durationMinutes: v.durationMinutes,
          roomId: v.roomId,
          teacherId: v.teacherId,
        };
        const payload: UpdateSessionPayload = {};
        if (next.startTime !== orig.startTime)
          payload.startTime = next.startTime;
        if (next.durationMinutes !== orig.durationMinutes)
          payload.durationMinutes = next.durationMinutes;
        if (next.roomId !== orig.roomId) payload.roomId = next.roomId ?? null;
        if (next.teacherId !== orig.teacherId)
          payload.teacherId = next.teacherId ?? null;

        if (Object.keys(payload).length === 0) {
          messageApi.info('Không có thay đổi nào.');
          setSaving(false);
          return;
        }
        await updateSession(session.id, payload);
      } else {
        const payload: CreateManualSessionPayload = {
          sessionDate: v.sessionDate?.format('YYYY-MM-DD') ?? '',
          startTime: v.startTime?.format('HH:mm') ?? '',
          durationMinutes: v.durationMinutes ?? 0,
          roomId: v.roomId ?? null,
          teacherId: v.teacherId ?? null,
        };
        await createManualSession(classId, payload);
      }
      messageApi.success(isEdit ? 'Đã cập nhật buổi.' : 'Đã thêm buổi bù.');
      onSaved();
    } catch (err) {
      // 409 trùng phòng/GV (skipErrorHandler) -> giữ modal mở, toast lỗi BE.
      const bizMessage = (
        err as { response?: { data?: { error?: { message?: string } } } }
      ).response?.data?.error?.message;
      messageApi.error(bizMessage || 'Không lưu được buổi, thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const title =
    isEdit && session
      ? `Sửa buổi · ${sessionDayLabel(session.sessionDate)}`
      : 'Thêm buổi bù';

  return (
    <>
      {contextHolder}
      <Modal
        title={title}
        open={open}
        width={560}
        style={{ maxWidth: '95vw' }}
        onCancel={onClose}
        destroyOnHidden
        maskClosable={false}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={saving}
        onOk={handleSave}
      >
        <Form<FormValues> form={form} layout="vertical">
          {!isEdit && (
            <Form.Item
              name="sessionDate"
              label="Ngày"
              rules={[{ required: true, message: 'Chọn ngày buổi học' }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
          )}

          <Form.Item
            name="startTime"
            label="Giờ bắt đầu"
            rules={
              isEdit ? [] : [{ required: true, message: 'Chọn giờ bắt đầu' }]
            }
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
            rules={
              isEdit
                ? [{ type: 'number', min: 1, message: 'Phải lớn hơn 0' }]
                : [
                    { required: true, message: 'Nhập thời lượng' },
                    { type: 'number', min: 1, message: 'Phải lớn hơn 0' },
                  ]
            }
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

          <div style={{ color: '#8c8c8c' }}>
            ⓘ Khi lưu hệ thống kiểm tra trùng phòng/GV lại.
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default SessionEditModal;
