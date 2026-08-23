import {
  ModalForm,
  ProFormDigit,
  ProFormRadio,
  ProFormText,
} from '@ant-design/pro-components';
import { message } from 'antd';
import React from 'react';
import type { CoinTopupItem } from '../data';
import { adjustCoinTopup } from '../service';

type Props = {
  open: boolean;
  topup: CoinTopupItem | null;
  onClose: () => void;
  onDone: () => void;
};

type FormValues = {
  direction: 'ADD' | 'SUBTRACT';
  amount: number;
  reason: string;
};

const fmt = (v: number) => new Intl.NumberFormat('vi-VN').format(v);

/**
 * Modal "Cộng/Trừ Xu" cho 1 yêu cầu nạp — doc lap voi buoc xac nhan, dung
 * duoc bat cu luc nao (kể cả da CONFIRMED), tru yeu cau da hủy. Mirror UX
 * cua CoinAdjustModal.tsx / AdjustInvoiceModal.tsx.
 */
const AdjustCoinTopupModal: React.FC<Props> = ({
  open,
  topup,
  onClose,
  onDone,
}) => (
  <ModalForm<FormValues>
    title={topup ? `Cộng/Trừ Xu — ${topup.studentName}` : 'Cộng/Trừ Xu'}
    open={open}
    modalProps={{ destroyOnClose: true, onCancel: onClose }}
    initialValues={{ direction: 'ADD' }}
    width={480}
    onFinish={async (values) => {
      if (!topup) return false;
      const signed =
        values.direction === 'SUBTRACT'
          ? -Math.abs(values.amount)
          : Math.abs(values.amount);
      try {
        const res = await adjustCoinTopup(topup.id, signed, values.reason);
        message.success(
          `Đã điều chỉnh. Số Xu của yêu cầu này: ${fmt(res.data.coinAmount)} Xu`,
        );
        onDone();
        return true;
      } catch {
        message.error('Điều chỉnh Xu thất bại');
        return false;
      }
    }}
  >
    {topup && (
      <p style={{ marginBottom: 16, color: 'rgba(0,0,0,0.65)' }}>
        Số Xu hiện tại: <strong>{fmt(topup.coinAmount)} Xu</strong> (
        {fmt(topup.amountVnd)} ₫)
      </p>
    )}
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
      placeholder="VD: Khuyến mãi nạp lần đầu"
      rules={[
        { required: true, message: 'Nhập lý do' },
        { max: 255, message: 'Tối đa 255 ký tự' },
      ]}
    />
  </ModalForm>
);

export default AdjustCoinTopupModal;
