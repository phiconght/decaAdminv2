import {
  PageContainer,
  ProForm,
  ProFormDateRangePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, message } from 'antd';
import type { FC } from 'react';
import { fakeSubmitForm } from './service';
import useStyles from './style.style';

const BasicForm: FC<Record<string, any>> = () => {
  const { styles } = useStyles();
  const queryClient = useQueryClient();
  const { mutate: run } = useMutation({
    mutationFn: fakeSubmitForm,
    onSuccess: () => {
      message.success('Nộp thành công');
      queryClient.invalidateQueries({ queryKey: ['basic-form'] });
    },
  });
  const onFinish = async (values: Record<string, any>) => {
    run(values);
  };
  return (
    <PageContainer content="Trang biểu mẫu được sử dụng để thu thập hoặc xác thực thông tin từ người dùng, biểu mẫu cơ bản thường gặp ở các kịch bản biểu mẫu có ít mục dữ liệu.">
      <Card variant="borderless">
        <ProForm
          requiredMark={false}
          style={{
            margin: 'auto',
            marginTop: 8,
            maxWidth: 600,
          }}
          name="basic"
          layout="vertical"
          initialValues={{
            public: '1',
          }}
          onFinish={onFinish}
        >
          <ProFormText
            width="md"
            label="Tiêu đề"
            name="title"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập tiêu đề',
              },
            ]}
            placeholder="Đặt tên cho mục tiêu của bạn"
          />
          <ProFormDateRangePicker
            label="Ngày bắt đầu - kết thúc"
            width="md"
            name="date"
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn ngày bắt đầu - kết thúc',
              },
            ]}
            placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
          />
          <ProFormTextArea
            label="Mô tả mục tiêu"
            width="xl"
            name="goal"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập mô tả mục tiêu',
              },
            ]}
            placeholder="Vui lòng nhập mục tiêu công việc giai đoạn của bạn"
          />

          <ProFormTextArea
            label="Tiêu chuẩn đo lường"
            name="standard"
            width="xl"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập tiêu chuẩn đo lường',
              },
            ]}
            placeholder="Vui lòng nhập tiêu chuẩn đo lường"
          />

          <ProFormText
            width="md"
            label={
              <span>
                Khách hàng
                <em className={styles.optional}>(tùy chọn)</em>
              </span>
            }
            tooltip="Đối tượng phục vụ của mục tiêu"
            name="client"
            placeholder="Vui lòng mô tả khách hàng bạn phục vụ, khách hàng nội bộ trực tiếp @tên/mã số"
          />

          <ProFormText
            width="md"
            label={
              <span>
                Người mời đánh giá
                <em className={styles.optional}>(tùy chọn)</em>
              </span>
            }
            name="invites"
            placeholder="Vui lòng @tên/mã số trực tiếp, có thể mời tối đa 5 người"
          />

          <ProFormDigit
            label={
              <span>
                Trọng số
                <em className={styles.optional}>(tùy chọn)</em>
              </span>
            }
            name="weight"
            placeholder="Vui lòng nhập"
            min={0}
            max={100}
            width="xs"
            fieldProps={{
              formatter: (value) => `${value || 0}%`,
              parser: (value) => Number(value ? value.replace('%', '') : '0'),
            }}
          />

          <ProFormRadio.Group
            options={[
              {
                value: '1',
                label: 'Công khai',
              },
              {
                value: '2',
                label: 'Công khai một phần',
              },
              {
                value: '3',
                label: 'Không công khai',
              },
            ]}
            label="Mục tiêu công khai"
            help="Khách hàng, người mời đánh giá được chia sẻ mặc định"
            name="publicType"
          />
          <ProFormDependency name={['publicType']}>
            {({ publicType }) => {
              return (
                <ProFormSelect
                  width="md"
                  name="publicUsers"
                  fieldProps={{
                    style: {
                      margin: '8px 0',
                      display:
                        publicType && publicType === '2' ? 'block' : 'none',
                    },
                  }}
                  options={[
                    {
                      value: '1',
                      label: 'Đồng nghiệp A',
                    },
                    {
                      value: '2',
                      label: 'Đồng nghiệp B',
                    },
                    {
                      value: '3',
                      label: 'Đồng nghiệp C',
                    },
                  ]}
                />
              );
            }}
          </ProFormDependency>
        </ProForm>
      </Card>
    </PageContainer>
  );
};
export default BasicForm;
