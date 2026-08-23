import {
  ModalForm,
  ProFormDigit,
  ProFormRadio,
  ProFormText,
} from '@ant-design/pro-components';
import { message } from 'antd';
import React from 'react';
import type { InvoiceItem } from '../data';
import { adjustInvoice } from '../service';
import { formatVnd } from '../utils';

type Props = {
  open: boolean;
  invoice: InvoiceItem | null;
  onClose: () => void;
  onDone: () => void;
};

type FormValues = {
  direction: 'ADD' | 'SUBTRACT';
  amount: number;
  reason: string;
};

/**
 * Modal "Cộng/Trừ học phí" — doc lap voi buoc xac nhan, dung duoc bat cu
 * luc nao tren 1 dot thu (kể cả da CONFIRMED/PAID), tru dot thu da hủy.
 * Mirror UX cua CoinAdjustModal.tsx (Radio hướng + số tiền + lý do bắt buộc).
 */
const AdjustInvoiceModal: React.FC<Props> = ({
  open,
  invoice,
  onClose,
  onDone,
}) => (
  <ModalForm<FormValues>
    title={
      invoice ? `Cộng/Trừ học phí — ${invoice.studentName}` : 'Cộng/Trừ học phí'
    }
    open={open}
    modalProps={{ destroyOnClose: true, onCancel: onClose }}
    initialValues={{ direction: 'ADD' }}
    width={480}
    onFinish={async (values) => {
      if (!invoice) return false;
      const signed =
        values.direction === 'SUBTRACT'
          ? -Math.abs(values.amount)
          : Math.abs(values.amount);
      try {
        const res = await adjustInvoice(invoice.id, signed, values.reason);
        message.success(
          `Đã điều chỉnh học phí. Số tiền mới: ${formatVnd(res.data.amount)}`,
        );
        onDone();
        return true;
      } catch {
        message.error('Điều chỉnh học phí thất bại');
        return false;
      }
    }}
  >
    {invoice && (
      <p style={{ marginBottom: 16, color: 'rgba(0,0,0,0.65)' }}>
        Số tiền hiện tại: <strong>{formatVnd(invoice.amount)}</strong>
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
      label="Số tiền (₫)"
      min={1}
      fieldProps={{ precision: 0, step: 1000 }}
      rules={[{ required: true, message: 'Nhập số tiền (≥ 1)' }]}
    />
    <ProFormText
      name="reason"
      label="Lý do"
      placeholder="VD: Giảm giá thiếu niên, phí phạt trễ hạn..."
      rules={[
        { required: true, message: 'Nhập lý do' },
        { max: 255, message: 'Tối đa 255 ký tự' },
      ]}
    />
  </ModalForm>
);

export default AdjustInvoiceModal;
