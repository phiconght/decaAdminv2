import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import HeroImageUpload from './components/HeroImageUpload';
import type { HeroForm } from './data';
import { getHero, updateHero } from './service';

/**
 * Quản trị nội dung Hero của Trang chủ công khai Web (khách chưa đăng
 * nhập) — gộp vào mục "Nội Dung", cạnh Bài Viết / Thông Báo. Bản ghi
 * singleton (1 dòng duy nhất) nên dùng 1 ProForm thay vì ProTable, theo
 * đúng khuôn `src/pages/fee/Settings.tsx`.
 */
const HeroContentPage: React.FC = () => {
  const access = useAccess();
  const [form] = ProForm.useForm<HeroForm>();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<HeroForm>();

  const load = () => {
    setLoading(true);
    getHero()
      .then((res) => {
        if (res.data) {
          form.setFieldsValue(res.data);
          setPreview(res.data);
        }
      })
      .catch(() => message.error('Không tải được nội dung Hero'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [form]);

  return (
    <PageContainer header={{ title: 'Trang chủ Web — Khối giới thiệu (Hero)' }}>
      <ProCard
        loading={loading}
        style={{ maxWidth: 720 }}
        title="Nội dung Hero"
        extra={
          !access.canWriteHero && (
            <span style={{ color: 'rgba(0,0,0,0.45)' }}>Chỉ xem</span>
          )
        }
      >
        <ProForm<HeroForm>
          form={form}
          readonly={!access.canWriteHero}
          submitter={
            access.canWriteHero
              ? {
                  searchConfig: { submitText: 'Lưu nội dung' },
                  resetButtonProps: false,
                }
              : false
          }
          onValuesChange={(_, values) => setPreview(values as HeroForm)}
          onFinish={async (values) => {
            try {
              const res = await updateHero(values);
              message.success('Đã lưu nội dung Hero');
              if (res.data) setPreview(res.data);
              return true;
            } catch {
              message.error('Lưu nội dung thất bại');
              return false;
            }
          }}
        >
          <ProFormSwitch
            name="visible"
            label="Hiển thị Hero trên Trang chủ"
            initialValue
          />
          <ProFormText
            name="badgeText"
            label="Nhãn nhỏ (badge)"
            placeholder="VD: Trung tâm giáo dục DecaMath"
            fieldProps={{ maxLength: 60, showCount: true }}
          />
          <ProFormText
            name="title"
            label="Tiêu đề lớn"
            rules={[{ required: true, message: 'Nhập tiêu đề' }]}
            fieldProps={{ maxLength: 150, showCount: true }}
          />
          <ProFormTextArea
            name="subtitle"
            label="Mô tả"
            fieldProps={{ maxLength: 400, showCount: true, rows: 3 }}
          />
          <ProFormText
            name="primaryCtaLabel"
            label="Nút chính — nhãn"
            placeholder="Đăng nhập"
            fieldProps={{ maxLength: 60 }}
          />
          <ProFormText
            name="primaryCtaHref"
            label="Nút chính — đường dẫn"
            placeholder="/login"
            fieldProps={{ maxLength: 255 }}
          />
          <ProFormText
            name="secondaryCtaLabel"
            label="Nút phụ — nhãn"
            placeholder="Khám phá khóa học"
            fieldProps={{ maxLength: 60 }}
          />
          <ProFormText
            name="secondaryCtaHref"
            label="Nút phụ — đường dẫn"
            placeholder="/catalog"
            fieldProps={{ maxLength: 255 }}
          />
          <ProForm.Item name="backgroundImageUrl" label="Ảnh nền">
            <HeroImageUpload />
          </ProForm.Item>
        </ProForm>
      </ProCard>

      {preview && (
        <ProCard title="Xem trước" style={{ maxWidth: 720, marginTop: 16 }}>
          <div
            style={{
              position: 'relative',
              borderRadius: 12,
              overflow: 'hidden',
              padding: '40px 32px',
              minHeight: 220,
              // Gradient sáng cobalt→cobalt-nhạt — khớp đúng màu Hero thật
              // trên Web (không dùng cobalt-dark làm nền lớn, quá tối so
              // với phần còn lại giao diện — phản hồi người dùng 13/09/2026).
              background: preview.backgroundImageUrl
                ? `linear-gradient(rgba(30,40,120,0.4), rgba(30,40,120,0.4)), url(${preview.backgroundImageUrl}) center/cover`
                : 'linear-gradient(135deg, #2E43E8, #5B6CFF)',
              color: '#fff',
            }}
          >
            {preview.badgeText && (
              <div
                style={{
                  display: 'inline-block',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.18)',
                  marginBottom: 12,
                }}
              >
                {preview.badgeText}
              </div>
            )}
            <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              {preview.title || 'Tiêu đề Hero'}
            </div>
            {preview.subtitle && (
              <div style={{ fontSize: 14, opacity: 0.9, maxWidth: 480 }}>
                {preview.subtitle}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {preview.primaryCtaLabel && (
                <span
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    background: '#fff',
                    color: '#1E2FB8',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {preview.primaryCtaLabel}
                </span>
              )}
              {preview.secondaryCtaLabel && (
                <span
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.7)',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {preview.secondaryCtaLabel}
                </span>
              )}
            </div>
            {!preview.visible && (
              <div style={{ marginTop: 16, fontSize: 12, color: '#FFD666' }}>
                ⚠ Hero đang tắt — khách sẽ không thấy khối này trên Trang chủ.
              </div>
            )}
          </div>
        </ProCard>
      )}
    </PageContainer>
  );
};

export default HeroContentPage;
