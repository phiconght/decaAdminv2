import { PlusOutlined } from '@ant-design/icons';
import {
  DrawerForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Button, message } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { useDrawerWidth } from '@/hooks/useResponsiveWidth';
import type { ClassDetail, ClassItem } from '../data';
import { createClass, updateClass } from '../service';
import ClassContentModal from './ClassContentModal';

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
  const [contentOpen, setContentOpen] = React.useState(false);
  const drawerWidth = useDrawerWidth(520);
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
          pricePerSession: editData.pricePerSession,
          coinPrice: editData.coinPrice,
          fullPrice: editData.fullPrice,
          paymentType: editData.paymentType ?? 'PREPAID_COIN',
          deliveryMode: editData.deliveryMode ?? 'OFFLINE',
        }
      : {
          status: 'ACTIVE',
          paymentType: 'PREPAID_COIN',
          deliveryMode: 'OFFLINE',
        };

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
      {isEdit && editData && (
        <ClassContentModal
          classId={Number(editData.id)}
          className={editData.name}
          open={contentOpen}
          onOpenChange={setContentOpen}
        />
      )}
      <DrawerForm<ClassDetail>
        title={isEdit ? 'Sửa khóa' : 'Tạo khóa'}
        width={drawerWidth}
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
        drawerProps={{
          destroyOnHidden: true,
          extra: isEdit && editData && (
            <Button onClick={() => setContentOpen(true)}>Nội dung</Button>
          ),
        }}
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
        <ProFormSelect
          name="deliveryMode"
          label="Hình thức học"
          tooltip="Quyết định cách điểm danh: ONLINE = học sinh tự bấm nút Điểm danh; OFFLINE = quét QR xoay vòng hoặc GV/Admin điểm danh thủ công."
          options={[
            { label: 'Trực tuyến (Online)', value: 'ONLINE' },
            { label: 'Trực tiếp tại lớp (Offline)', value: 'OFFLINE' },
          ]}
          allowClear={false}
        />
        <ProFormDigit
          name="pricePerSession"
          label="Đơn giá mỗi buổi (VND)"
          tooltip="Dùng tính lương/công giáo viên — KHÔNG phải giá bán cho học viên."
          min={0}
          fieldProps={{ precision: 0, step: 10000 }}
          placeholder="0"
        />
        <ProFormSelect
          name="paymentType"
          label="Hình thức thanh toán"
          tooltip="Thanh toán trước = học sinh tự đăng ký, trừ Xu trọn khóa ngay. Thanh toán sau = Admin chốt đợt thu hàng tháng, phụ huynh/học sinh chuyển khoản theo mã (QR)."
          options={[
            { label: 'Thanh toán trước (Xu trọn khóa)', value: 'PREPAID_COIN' },
            {
              label: 'Thanh toán sau (chuyển khoản, chốt hàng tháng)',
              value: 'POSTPAID_TRANSFER',
            },
          ]}
          allowClear={false}
        />
        <ProFormDigit
          name="coinPrice"
          label="Giá Xu trọn khóa (khi Thanh toán trước)"
          tooltip="Chỉ áp dụng khi Hình thức thanh toán = Thanh toán trước. Bỏ trống hoặc 0 = không mở bán qua Xu ở Mobile/Web."
          min={0}
          fieldProps={{ precision: 0, step: 1000 }}
          placeholder="Bỏ trống nếu không mở bán qua Xu"
        />
        <ProFormDigit
          name="fullPrice"
          label="Giá trọn gói (đăng ký chuyển khoản)"
          tooltip="Học viên chưa ghi danh bấm 'Đăng ký' ở Card/trang chi tiết khóa học sẽ thấy giá này (kèm mã QR chuyển khoản nếu khóa online). Bỏ trống = ẩn nút Đăng ký + QR, chỉ còn hotline."
          min={0}
          fieldProps={{ precision: 0, step: 100000 }}
          placeholder="Bỏ trống nếu chưa mở đăng ký chuyển khoản"
        />
      </DrawerForm>
    </>
  );
};

export default ClassForm;
