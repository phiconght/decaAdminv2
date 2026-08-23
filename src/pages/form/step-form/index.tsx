import {
  PageContainer,
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  StepsForm,
} from '@ant-design/pro-components';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Divider,
  Form,
  Result,
  Statistic,
} from 'antd';
import React, { useState } from 'react';
import type { StepDataType } from './data.d';
import useStyles from './style.style';

const StepDescriptions: React.FC<{
  stepData: StepDataType;
  bordered?: boolean;
}> = ({ stepData, bordered }) => {
  const { payAccount, receiverAccount, receiverName, amount } = stepData;
  const items = [
    { key: 'payAccount', label: 'Tài khoản thanh toán', children: payAccount },
    {
      key: 'receiverAccount',
      label: 'Tài khoản nhận',
      children: receiverAccount,
    },
    { key: 'receiverName', label: 'Tên người nhận', children: receiverName },
    {
      key: 'amount',
      label: 'Số tiền chuyển',
      children: (
        <Statistic
          value={amount}
          suffix={<span style={{ fontSize: 14 }}>VND</span>}
          precision={2}
        />
      ),
    },
  ];
  return <Descriptions column={1} bordered={bordered} items={items} />;
};
const StepResult: React.FC<{
  onFinish: () => Promise<void>;
  children?: React.ReactNode;
}> = (props) => {
  const { styles } = useStyles();
  return (
    <Result
      status="success"
      title="Thao tác thành công"
      subTitle="Dự kiến đến tài khoản trong 2 giờ"
      extra={
        <>
          <Button type="primary" onClick={props.onFinish}>
            Chuyển lại
          </Button>
          <Button>Xem hóa đơn</Button>
        </>
      }
      className={styles.result}
    >
      {props.children}
    </Result>
  );
};
const StepForm: React.FC<Record<string, any>> = () => {
  const { styles } = useStyles();
  const [stepData, setStepData] = useState<StepDataType>({
    payAccount: 'ant-design@alipay.com',
    receiverAccount: 'test@example.com',
    receiverName: 'Alex',
    amount: '500',
    receiverMode: 'alipay',
  });
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm<StepDataType>();
  return (
    <PageContainer content="Chia tác vụ biểu mẫu dài hoặc không quen thuộc thành nhiều bước để hướng dẫn người dùng hoàn thành.">
      <Card variant="borderless">
        <StepsForm
          current={current}
          onCurrentChange={setCurrent}
          submitter={{
            render: (props, dom) => {
              if (props.step === 2) {
                return null;
              }
              return dom;
            },
          }}
        >
          <StepsForm.StepForm<StepDataType>
            formRef={{
              current: form,
            }}
            title="Nhập thông tin chuyển tiền"
            initialValues={stepData}
            onFinish={async (values) => {
              setStepData(values);
              return true;
            }}
          >
            <ProFormSelect
              label="Tài khoản thanh toán"
              width="md"
              name="payAccount"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng chọn tài khoản thanh toán',
                },
              ]}
              valueEnum={{
                'ant-design@alipay.com': 'ant-design@alipay.com',
              }}
            />

            <ProForm.Group title="Tài khoản nhận" size={8}>
              <ProFormSelect
                name="receiverMode"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn tài khoản thanh toán',
                  },
                ]}
                valueEnum={{
                  alipay: 'Alipay',
                  bank: 'Tài khoản ngân hàng',
                }}
              />
              <ProFormText
                name="receiverAccount"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập tài khoản người nhận',
                  },
                  {
                    type: 'email',
                    message: 'Tên tài khoản phải ở định dạng email',
                  },
                ]}
                placeholder="test@example.com"
              />
            </ProForm.Group>
            <ProFormText
              label="Tên người nhận"
              width="md"
              name="receiverName"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập tên người nhận',
                },
              ]}
              placeholder="Vui lòng nhập tên người nhận"
            />
            <ProFormDigit
              label="Số tiền chuyển"
              name="amount"
              width="md"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập số tiền chuyển',
                },
                {
                  pattern: /^(\d+)((?:\.\d+)?)$/,
                  message: 'Vui lòng nhập số tiền hợp lệ',
                },
              ]}
              placeholder="Vui lòng nhập số tiền"
              fieldProps={{
                prefix: '￥',
              }}
            />
          </StepsForm.StepForm>

          <StepsForm.StepForm title="Xác nhận thông tin chuyển tiền">
            <div className={styles.result}>
              <Alert
                closable
                showIcon
                title="Sau khi xác nhận chuyển tiền, quỹ sẽ được chuyển trực tiếp vào tài khoản của người khác, không thể hoàn lại."
                style={{
                  marginBottom: 24,
                }}
              />
              <StepDescriptions stepData={stepData} bordered />
              <Divider
                style={{
                  margin: '24px 0',
                }}
              />
              <ProFormText.Password
                label="Mật khẩu thanh toán"
                width="md"
                name="password"
                required={false}
                rules={[
                  {
                    required: true,
                    message: 'Cần mật khẩu thanh toán để thực hiện thanh toán',
                  },
                ]}
              />
            </div>
          </StepsForm.StepForm>
          <StepsForm.StepForm title="Hoàn thành">
            <StepResult
              onFinish={async () => {
                setCurrent(0);
                form.resetFields();
              }}
            >
              <StepDescriptions stepData={stepData} />
            </StepResult>
          </StepsForm.StepForm>
        </StepsForm>
        <Divider
          style={{
            margin: '40px 0 24px',
          }}
        />
        <div>
          <h3>Hướng dẫn</h3>
          <h4>Chuyển đến tài khoản Alipay</h4>
          <p>
            Nếu cần, bạn có thể đặt một số câu hỏi thường gặp về sản phẩm tại
            đây. Nếu cần, bạn có thể đặt một số câu hỏi thường gặp về sản phẩm
            tại đây. Nếu cần, bạn có thể đặt một số câu hỏi thường gặp về sản
            phẩm tại đây.
          </p>
          <h4>Chuyển đến thẻ ngân hàng</h4>
          <p>
            Nếu cần, bạn có thể đặt một số câu hỏi thường gặp về sản phẩm tại
            đây. Nếu cần, bạn có thể đặt một số câu hỏi thường gặp về sản phẩm
            tại đây. Nếu cần, bạn có thể đặt một số câu hỏi thường gặp về sản
            phẩm tại đây.
          </p>
        </div>
      </Card>
    </PageContainer>
  );
};
export default StepForm;
