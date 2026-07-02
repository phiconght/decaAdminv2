import { useAccess } from '@umijs/max';
import { InputNumber, message, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import type { StudentDiscountItem } from '../data';
import { updateStudentDiscount } from '../service';
import { formatVnd } from '../utils';

type Props = {
  classId: number;
  defaultPrice: number;
  data: StudentDiscountItem[];
  loading: boolean;
  onChanged: () => void;
};

const StudentDiscountTable: React.FC<Props> = ({
  classId,
  defaultPrice,
  data,
  loading,
  onChanged,
}) => {
  const access = useAccess();
  const [savingId, setSavingId] = useState<number | null>(null);

  const save = async (studentId: number, percent: number | null) => {
    if (percent == null || percent < 0 || percent > 100) {
      message.warning('Mức giảm phải từ 0 đến 100');
      return;
    }
    setSavingId(studentId);
    try {
      await updateStudentDiscount(classId, studentId, percent);
      message.success('Đã cập nhật mức giảm');
      onChanged();
    } catch {
      message.error('Cập nhật mức giảm thất bại');
    } finally {
      setSavingId(null);
    }
  };

  const columns: ColumnsType<StudentDiscountItem> = [
    { title: 'Học viên', dataIndex: 'fullName' },
    { title: 'Tài khoản', dataIndex: 'username', width: 160 },
    {
      title: '% giảm',
      dataIndex: 'discountPercent',
      width: 160,
      render: (val: number, r) =>
        access.canWriteFee ? (
          <InputNumber
            min={0}
            max={100}
            defaultValue={val}
            disabled={savingId === r.studentId}
            style={{ width: 120 }}
            addonAfter="%"
            onBlur={(e) =>
              save(r.studentId, Number(e.target.value.replace(/[^\d.]/g, '')))
            }
          />
        ) : (
          `${val}%`
        ),
    },
    {
      title: 'Học phí / buổi thực',
      width: 180,
      render: (_, r) =>
        formatVnd(Math.round(defaultPrice * (1 - r.discountPercent / 100))),
    },
  ];

  return (
    <Table<StudentDiscountItem>
      rowKey="studentId"
      size="small"
      loading={loading}
      dataSource={data}
      columns={columns}
      pagination={{ pageSize: 15, showSizeChanger: false }}
      locale={{ emptyText: 'Khóa chưa có học viên' }}
    />
  );
};

export default StudentDiscountTable;
