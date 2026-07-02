import {
  PageContainer,
  ProCard,
  ProFormSelect,
  QueryFilter,
} from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Button, InputNumber, message, Space, Tabs, Typography } from 'antd';
import React, { useState } from 'react';
import SessionPriceTable from './components/SessionPriceTable';
import StudentDiscountTable from './components/StudentDiscountTable';
import type { SessionPriceItem, StudentDiscountItem } from './data';
import {
  getSessionPrices,
  getStudentDiscounts,
  queryClassOptions,
  updateClassPrice,
} from './service';

// Trang định giá: chọn khóa → đơn giá mặc định + bảng buổi + tab giảm giá HV.
const Pricing: React.FC = () => {
  const access = useAccess();
  const [classId, setClassId] = useState<number | undefined>(undefined);
  const [defaultPrice, setDefaultPrice] = useState<number>(0);
  const [savingPrice, setSavingPrice] = useState(false);

  const [sessions, setSessions] = useState<SessionPriceItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [discounts, setDiscounts] = useState<StudentDiscountItem[]>([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);

  const loadSessions = async (id: number) => {
    setLoadingSessions(true);
    try {
      const res = await getSessionPrices(id, {});
      setSessions(res.data ?? []);
    } catch {
      message.error('Không tải được danh sách buổi');
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadDiscounts = async (id: number) => {
    setLoadingDiscounts(true);
    try {
      const res = await getStudentDiscounts(id);
      setDiscounts(res.data ?? []);
    } catch {
      message.error('Không tải được danh sách học viên');
    } finally {
      setLoadingDiscounts(false);
    }
  };

  const handleSelectClass = (id?: number) => {
    setClassId(id);
    if (id) {
      loadSessions(id);
      loadDiscounts(id);
    }
  };

  const handleSaveDefaultPrice = async () => {
    if (!classId) return;
    setSavingPrice(true);
    try {
      const res = await updateClassPrice(classId, defaultPrice);
      message.success(
        `Đã áp dụng cho ${res.data?.updatedSessions ?? 0} buổi chưa bắt đầu`,
      );
      loadSessions(classId);
    } catch {
      message.error('Cập nhật đơn giá thất bại');
    } finally {
      setSavingPrice(false);
    }
  };

  return (
    <PageContainer header={{ title: 'Định giá học phí' }}>
      <ProCard style={{ marginBottom: 16 }}>
        <QueryFilter<{ classId: number }>
          layout="inline"
          submitter={false}
          onValuesChange={(_, all) => handleSelectClass(all.classId)}
        >
          <ProFormSelect
            name="classId"
            label="Khóa học"
            request={async ({ keyWords }) => {
              const res = await queryClassOptions(keyWords);
              return (res.data ?? []).map((c) => ({
                label: `${c.code} — ${c.name}`,
                value: Number(c.id),
              }));
            }}
            fieldProps={{
              showSearch: true,
              filterOption: false,
              style: { minWidth: 320 },
            }}
          />
        </QueryFilter>
      </ProCard>

      {classId ? (
        <>
          <ProCard
            title="Đơn giá mặc định (đ/buổi)"
            style={{ marginBottom: 16 }}
          >
            <Space>
              <InputNumber
                min={0}
                step={1000}
                value={defaultPrice}
                style={{ width: 200 }}
                disabled={!access.canWriteFee}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                parser={(v) => Number((v ?? '').replace(/\./g, ''))}
                onChange={(v) => setDefaultPrice((v as number) ?? 0)}
              />
              <Typography.Text type="secondary">₫</Typography.Text>
              {access.canWriteFee ? (
                <Button
                  type="primary"
                  loading={savingPrice}
                  onClick={handleSaveDefaultPrice}
                >
                  Lưu
                </Button>
              ) : null}
            </Space>
          </ProCard>

          <ProCard>
            <Tabs
              items={[
                {
                  key: 'sessions',
                  label: 'Giá theo buổi',
                  children: (
                    <SessionPriceTable
                      data={sessions}
                      loading={loadingSessions}
                      onChanged={() => loadSessions(classId)}
                    />
                  ),
                },
                {
                  key: 'discounts',
                  label: 'Học phí học viên',
                  children: (
                    <StudentDiscountTable
                      classId={classId}
                      defaultPrice={defaultPrice}
                      data={discounts}
                      loading={loadingDiscounts}
                      onChanged={() => loadDiscounts(classId)}
                    />
                  ),
                },
              ]}
            />
          </ProCard>
        </>
      ) : (
        <ProCard>
          <Typography.Text type="secondary">
            Chọn khóa học để xem và chỉnh giá.
          </Typography.Text>
        </ProCard>
      )}
    </PageContainer>
  );
};

export default Pricing;
