import {
  ModalForm,
  ProFormDigit,
  ProFormRadio,
  ProFormText,
} from '@ant-design/pro-components';
import { message } from 'antd';
import React from 'react';
import { adjustCoin } from '../service';

type Props = {
  open: boolean;
  student: { id: number; fullName: string; username: string } | null;
  onClose: () => void;
  onDone: () => void;
};

type FormValues = {
  direction: 'ADD' | 'SUBTRACT';
  amount: number;
  reason: string;
};

// Modal "Cộng/Trừ Xu": Radio hướng + số Xu nguyên (min 1) + lý do bắt buộc.
const CoinAdjustModal: React.FC<Props> = ({
  open,
  student,
  onClose,
  onDone,
}) => (
  <ModalForm<FormValues>
    title={student ? `Cộng/Trừ Xu — ${student.fullName}` : 'Cộng/Trừ Xu'}
    open={open}
    modalProps={{ destroyOnClose: true, onCancel: onClose }}
    initialValues={{ direction: 'ADD' }}
    width={480}
    onFinish={async (values) => {
      if (!student) return false;
      const signed =
        values.direction === 'SUBTRACT'
          ? -Math.abs(values.amount)
          : Math.abs(values.amount);
      try {
        const res = await adjustCoin(student.id, {
          amount: signed,
          reason: values.reason,
        });
        message.success(
          `Đã điều chỉnh Xu. Số dư mới: ${new Intl.NumberFormat('vi-VN').format(
            res.data.balance,
          )} Xu`,
        );
        onDone();
        return true;
      } catch {
        message.error('Điều chỉnh Xu thất bại');
        return false;
      }
    }}
  >
    <ProFormRadio.Group
      name="direction"
      label="Thao tác"
      options={[
        { label: 'Cộng', value: 'ADD' },
        { label: 'Trừ', value: 'SUBTRACT' },
      ]}
      rules={[{ required: true }]}
    />
    <ProFormDigit
      name="amount"
      label="Số Xu"
      min={1}
      fieldProps={{ precision: 0, step: 1 }}
      rules={[{ required: true, message: 'Nhập số Xu (nguyên, ≥ 1)' }]}
    />
    <ProFormText
      name="reason"
      label="Lý do"
      placeholder="VD: Thưởng điểm 10"
      rules={[
        { required: true, message: 'Nhập lý do' },
        { max: 255, message: 'Tối đa 255 ký tự' },
      ]}
    />
  </ModalForm>
);

export default CoinAdjustModal;
