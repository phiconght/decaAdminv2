import {
  AlipayOutlined,
  DingdingOutlined,
  TaobaoOutlined,
} from '@ant-design/icons';
import { List } from 'antd';
import React from 'react';

const BindingView: React.FC = () => {
  const getData = () => [
    {
      title: 'Liên kết Taobao',
      description: 'Hiện tại chưa liên kết tài khoản Taobao',
      actions: [
        <a key="Bind" href="#">
          Liên kết
        </a>,
      ],
      avatar: <TaobaoOutlined className="taobao" />,
    },
    {
      title: 'Liên kết Alipay',
      description: 'Hiện tại chưa liên kết tài khoản Alipay',
      actions: [
        <a key="Bind" href="#">
          Liên kết
        </a>,
      ],
      avatar: <AlipayOutlined className="alipay" />,
    },
    {
      title: 'Liên kết DingTalk',
      description: 'Hiện tại chưa liên kết tài khoản DingTalk',
      actions: [
        <a key="Bind" href="#">
          Liên kết
        </a>,
      ],
      avatar: <DingdingOutlined className="dingding" />,
    },
  ];

  return (
    <List
      itemLayout="horizontal"
      dataSource={getData()}
      renderItem={(item) => (
        <List.Item actions={item.actions}>
          <List.Item.Meta
            avatar={item.avatar}
            title={item.title}
            description={item.description}
          />
        </List.Item>
      )}
    />
  );
};

export default BindingView;
