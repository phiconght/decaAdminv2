import { CloseCircleOutlined, RightOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-components';
import { Button, Card, Result } from 'antd';
import useStyles from './index.style';

export default () => {
  const { styles } = useStyles();
  const Content = (
    <>
      <div className={styles.title}>
        <span>Nội dung bạn gửi có các lỗi sau:</span>
      </div>
      <div
        style={{
          marginBottom: 16,
        }}
      >
        <CloseCircleOutlined
          style={{
            marginRight: 8,
          }}
          className={styles.error_icon}
        />
        <span>Tài khoản của bạn đã bị đóng băng</span>
        <a
          href="#"
          style={{
            marginLeft: 16,
          }}
        >
          <span>Mở khóa ngay</span>
          <RightOutlined />
        </a>
      </div>
      <div>
        <CloseCircleOutlined
          style={{
            marginRight: 8,
          }}
          className={styles.error_icon}
        />
        <span>Tài khoản của bạn chưa đủ điều kiện để đăng ký</span>
        <a
          href="#"
          style={{
            marginLeft: 16,
          }}
        >
          <span>Nâng cấp ngay</span>
          <RightOutlined />
        </a>
      </div>
    </>
  );
  return (
    <GridContent>
      <Card variant="borderless">
        <Result
          status="error"
          title="Nộp thất bại"
          subTitle="Vui lòng kiểm tra và sửa đổi thông tin dưới đây, sau đó gửi lại."
          extra={
            <Button type="primary">
              <span>Quay lại sửa đổi</span>
            </Button>
          }
          style={{
            marginTop: 48,
            marginBottom: 16,
          }}
        >
          {Content}
        </Result>
      </Card>
    </GridContent>
  );
};
