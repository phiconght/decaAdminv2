import { PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, List, Typography } from 'antd';
import type { CardListItemDataType } from './data.d';
import { queryFakeList } from './service';
import useStyles from './style.style';

const { Paragraph } = Typography;
const CardList = () => {
  const { styles } = useStyles();
  const { data, isLoading: loading } = useQuery({
    queryKey: ['card-list'],
    queryFn: () => queryFakeList({ count: 8 }).then((res) => res.data),
  });
  const list = data?.list || [];
  const content = (
    <div className={styles.pageHeaderContent}>
      <p>
        Hướng dẫn: Nền tảng thiết kế Ant Group ant.design, với công việc tối
        thiểu, tích hợp liền mạch vào hệ sinh thái Ant Group, cung cấp giải pháp
        trải nghiệm vượt qua thiết kế và phát triển.
      </p>
      <div className={styles.contentLink}>
        <a href="#">
          <img
            alt=""
            src="https://gw.alipayobjects.com/zos/rmsportal/MjEImQtenlyueSmVEfUD.svg"
          />{' '}
          Bắt đầu nhanh
        </a>
        <a href="#">
          <img
            alt=""
            src="https://gw.alipayobjects.com/zos/rmsportal/NbuDUAuBlIApFuDvWiND.svg"
          />{' '}
          Giới thiệu sản phẩm
        </a>
        <a href="#">
          <img
            alt=""
            src="https://gw.alipayobjects.com/zos/rmsportal/ohOEPSYdDTNnyMbGuyLb.svg"
          />{' '}
          Tài liệu sản phẩm
        </a>
      </div>
    </div>
  );
  const extraContent = (
    <div className={styles.extraImg}>
      <img
        alt="Đây là một tiêu đề"
        src="https://gw.alipayobjects.com/zos/rmsportal/RzwpdLnhmvDJToTdfDPe.png"
      />
    </div>
  );
  const nullData: Partial<CardListItemDataType> = {};
  return (
    <PageContainer content={content} extraContent={extraContent}>
      <div className={styles.cardList}>
        <List<Partial<CardListItemDataType>>
          rowKey="id"
          loading={loading}
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 4,
            xxl: 4,
          }}
          dataSource={[nullData, ...list]}
          renderItem={(item) => {
            if (item?.id) {
              return (
                <List.Item key={item.id}>
                  <Card
                    hoverable
                    className={styles.card}
                    actions={[
                      <a key="option1" href="#">
                        Thao tác 1
                      </a>,
                      <a key="option2" href="#">
                        Thao tác 2
                      </a>,
                    ]}
                  >
                    <Card.Meta
                      avatar={
                        <img
                          alt=""
                          className={styles.cardAvatar}
                          src={item.avatar}
                        />
                      }
                      title={<a href="#">{item.title}</a>}
                      description={
                        <Paragraph
                          className={styles.item}
                          ellipsis={{
                            rows: 3,
                          }}
                        >
                          {item.description}
                        </Paragraph>
                      }
                    />
                  </Card>
                </List.Item>
              );
            }
            return (
              <List.Item>
                <Button type="dashed" className={styles.newButton}>
                  <PlusOutlined /> Thêm sản phẩm mới
                </Button>
              </List.Item>
            );
          }}
        />
      </div>
    </PageContainer>
  );
};
export default CardList;
