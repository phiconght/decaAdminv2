import { List, Switch } from 'antd';
import React from 'react';

type Unpacked<T> = T extends (infer U)[] ? U : T;

const Action = (
  <Switch checkedChildren="Bật" unCheckedChildren="Tắt" defaultChecked />
);

const NotificationView: React.FC = () => {
  const getData = () => {
    return [
      {
        title: 'Thông báo của người dùng',
        description:
          'Thông báo từ những người dùng khác sẽ được gửi dưới dạng tin nhắn nội bộ',
        actions: [Action],
      },
      {
        title: 'Thông báo hệ thống',
        description: 'Thông báo hệ thống sẽ được gửi dưới dạng tin nhắn nội bộ',
        actions: [Action],
      },
      {
        title: 'Tác vụ cần làm',
        description: 'Các tác vụ cần làm sẽ được gửi dưới dạng tin nhắn nội bộ',
        actions: [Action],
      },
    ];
  };

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

export default NotificationView;
