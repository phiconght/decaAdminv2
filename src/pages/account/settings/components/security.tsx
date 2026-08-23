import { List } from 'antd';
import React from 'react';

type Unpacked<T> = T extends (infer U)[] ? U : T;

const passwordStrength = {
  strong: <span className="strong">Mạnh</span>,
  medium: <span className="medium">Trung bình</span>,
  weak: <span className="weak">Yếu</span>,
};

const SecurityView: React.FC = () => {
  const getData = () => [
    {
      title: 'Mật khẩu tài khoản',
      description: (
        <>
          Độ mạnh mật khẩu hiện tại:
          {passwordStrength.strong}
        </>
      ),
      actions: [
        <a key="Modify" href="#">
          Sửa đổi
        </a>,
      ],
    },
    {
      title: 'Điện thoại bảo mật',
      description: `Điện thoại đã liên kết: 138****8293`,
      actions: [
        <a key="Modify" href="#">
          Sửa đổi
        </a>,
      ],
    },
    {
      title: 'Câu hỏi bảo mật',
      description:
        'Chưa đặt câu hỏi bảo mật, câu hỏi bảo mật có thể bảo vệ an toàn tài khoản của bạn một cách hiệu quả',
      actions: [
        <a key="Set" href="#">
          Đặt
        </a>,
      ],
    },
    {
      title: 'Email dự phòng',
      description: `Email đã liên kết: ant***sign.com`,
      actions: [
        <a key="Modify" href="#">
          Sửa đổi
        </a>,
      ],
    },
    {
      title: 'Thiết bị MFA',
      description:
        'Chưa liên kết thiết bị MFA, sau khi liên kết có thể thực hiện xác nhận lần thứ hai',
      actions: [
        <a key="bind" href="#">
          Liên kết
        </a>,
      ],
    },
  ];

  const data = getData();
  return (
    <List<Unpacked<typeof data>>
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(item) => (
        <List.Item actions={item.actions}>
          <List.Item.Meta title={item.title} description={item.description} />
        </List.Item>
      )}
    />
  );
};

export default SecurityView;
