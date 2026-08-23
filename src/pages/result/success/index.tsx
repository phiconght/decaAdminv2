import { DingdingOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-components';
import { Button, Card, Descriptions, Result, Steps } from 'antd';
import React from 'react';
import useStyles from './index.style';

const descriptionItems = [
  { key: 'id', label: 'ID Dự án', children: '23421' },
  { key: 'owner', label: 'Người chịu trách nhiệm', children: 'Qu Lili' },
  {
    key: 'time',
    label: 'Thời gian có hiệu lực',
    children: '2016-12-12 ~ 2017-12-12',
  },
];

const extra = (
  <>
    <Button type="primary">Quay lại danh sách</Button>
    <Button>Xem dự án</Button>
    <Button>In</Button>
  </>
);

const Success: React.FC = () => {
  const { styles } = useStyles();
  const desc1 = (
    <div className={styles.title}>
      <div
        style={{
          margin: '8px 0 4px',
        }}
      >
        <span>Qu Lili</span>
        <DingdingOutlined
          style={{
            marginLeft: 8,
            color: '#00A0E9',
          }}
        />
      </div>
      <div>2016-12-12 12:32</div>
    </div>
  );
  const desc2 = (
    <div
      style={{
        fontSize: 12,
      }}
      className={styles.title}
    >
      <div
        style={{
          margin: '8px 0 4px',
        }}
      >
        <span>Zhou Maomao</span>
        <a href="#">
          <DingdingOutlined
            style={{
              color: '#00A0E9',
              marginLeft: 8,
            }}
          />
          <span>Nhắc nhở</span>
        </a>
      </div>
    </div>
  );
  const content = (
    <>
      <Descriptions title="Tên dự án" items={descriptionItems} />
      <br />
      <Steps
        type="dot"
        current={1}
        items={[
          {
            title: (
              <span
                style={{
                  fontSize: 14,
                }}
              >
                Tạo dự án
              </span>
            ),
            content: desc1,
          },
          {
            title: (
              <span
                style={{
                  fontSize: 14,
                }}
              >
                Xem xét sơ bộ bộ phận
              </span>
            ),
            content: desc2,
          },
          {
            title: (
              <span
                style={{
                  fontSize: 14,
                }}
              >
                Xem xét tài chính
              </span>
            ),
          },
          {
            title: (
              <span
                style={{
                  fontSize: 14,
                }}
              >
                Hoàn thành
              </span>
            ),
          },
        ]}
      />
    </>
  );
  return (
    <GridContent>
      <Card variant="borderless">
        <Result
          status="success"
          title="Nộp thành công"
          subTitle='Trang kết quả nộp được sử dụng để phản hồi kết quả xử lý một loạt tác vụ hoạt động. Nếu chỉ là hoạt động đơn giản, bạn có thể sử dụng Thông báo toàn cục để phản hồi. Khu vực văn bản này có thể hiển thị các giải thích bổ sung đơn giản, nếu có yêu cầu tương tự như hiển thị "Chứng từ", khu vực màu xám dưới đây có thể trình bày nội dung phức tạp hơn.'
          extra={extra}
          style={{
            marginBottom: 16,
          }}
        >
          {content}
        </Result>
      </Card>
    </GridContent>
  );
};

export default Success;
