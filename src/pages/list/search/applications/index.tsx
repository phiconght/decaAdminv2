import {
  DownloadOutlined,
  EditOutlined,
  EllipsisOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  Avatar,
  Card,
  Col,
  Dropdown,
  Form,
  List,
  Row,
  Select,
  Tooltip,
} from 'antd';
import type { FC } from 'react';
import React from 'react';
import { StandardFormRow, TagSelect } from '@/components';
import { formatNumber } from '@/utils/format';
import { categoryOptions } from '../../mock';
import type { ListItemDataType } from './data.d';
import { queryFakeList } from './service';
import useStyles from './style.style';

function formatWan(val: number) {
  const v = val * 1;
  if (!v || Number.isNaN(v)) return '';
  let result: React.ReactNode = val;
  if (val > 10000) {
    result = (
      <span>
        {Math.floor(val / 10000)}
        <span
          style={{
            position: 'relative',
            top: -2,
            fontSize: 14,
            fontStyle: 'normal',
            marginLeft: 2,
          }}
        >
          Vạn
        </span>
      </span>
    );
  }
  return result;
}
const formItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};
const CardInfo: React.FC<{
  activeUser: React.ReactNode;
  newUser: React.ReactNode;
}> = ({ activeUser, newUser }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.cardInfo}>
      <div>
        <p>Người dùng hoạt động</p>
        <p>{activeUser}</p>
      </div>
      <div>
        <p>Người dùng mới</p>
        <p>{newUser}</p>
      </div>
    </div>
  );
};
const Applications: FC<Record<string, any>> = () => {
  const { styles } = useStyles();
  const {
    data,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ['search-applications'],
    queryFn: () => queryFakeList({ count: 8 }).then((res) => res.data),
  });

  const run = (values: any) => {
    console.log('form data', values);
    refetch();
  };

  const list = data?.list || [];

  return (
    <div className={styles.filterCardList}>
      <Card variant="borderless">
        <Form
          onValuesChange={(_, values) => {
            run(values);
          }}
        >
          <StandardFormRow
            title="Danh mục thuộc"
            block
            style={{
              paddingBottom: 11,
            }}
          >
            <Form.Item name="category">
              <TagSelect expandable>
                {categoryOptions.flatMap((category) =>
                  category.value !== undefined && category.value !== null
                    ? [
                        <TagSelect.Option
                          value={category.value}
                          key={category.value}
                        >
                          {category.label}
                        </TagSelect.Option>,
                      ]
                    : [],
                )}
              </TagSelect>
            </Form.Item>
          </StandardFormRow>
          <StandardFormRow title="Tùy chọn khác" grid last>
            <Row gutter={16}>
              <Col lg={8} md={10} sm={10} xs={24}>
                <Form.Item {...formItemLayout} name="author" label="Tác giả">
                  <Select
                    placeholder="Không giới hạn"
                    style={{
                      maxWidth: 200,
                      width: '100%',
                    }}
                    options={[
                      {
                        label: 'Vương Chiêu Quân',
                        value: 'lisa',
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col lg={8} md={10} sm={10} xs={24}>
                <Form.Item
                  {...formItemLayout}
                  name="rate"
                  label="Mức độ đánh giá cao"
                >
                  <Select
                    placeholder="Không giới hạn"
                    style={{
                      maxWidth: 200,
                      width: '100%',
                    }}
                    options={[
                      {
                        label: 'Xuất sắc',
                        value: 'good',
                      },
                      {
                        label: 'Bình thường',
                        value: 'normal',
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
          </StandardFormRow>
        </Form>
      </Card>
      <br />
      <List<ListItemDataType>
        rowKey="id"
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 3,
          xl: 4,
          xxl: 4,
        }}
        loading={loading}
        dataSource={list}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card
              hoverable
              styles={{
                body: {
                  paddingBottom: 20,
                },
              }}
              actions={[
                <Tooltip key="download" title="Tải xuống">
                  <DownloadOutlined />
                </Tooltip>,
                <Tooltip key="edit" title="Chỉnh sửa">
                  <EditOutlined />
                </Tooltip>,
                <Tooltip title="Chia sẻ" key="share">
                  <ShareAltOutlined />
                </Tooltip>,
                <Dropdown
                  key="ellipsis"
                  menu={{
                    items: [
                      {
                        key: '1',
                        title: '1st menu item',
                      },
                      {
                        key: '2',
                        title: '2st menu item',
                      },
                    ],
                  }}
                >
                  <EllipsisOutlined />
                </Dropdown>,
              ]}
            >
              <Card.Meta
                avatar={<Avatar size="small" src={item.avatar} />}
                title={item.title}
              />
              <div>
                <CardInfo
                  activeUser={formatWan(item.activeUser)}
                  newUser={formatNumber(item.newUser)}
                />
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};
export default Applications;
