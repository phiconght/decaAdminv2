import {
  DingdingOutlined,
  DownOutlined,
  EllipsisOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  GridContent,
  PageContainer,
  RouteContext,
} from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import type { DescriptionsProps } from 'antd';
import {
  Badge,
  Button,
  Card,
  Descriptions,
  Divider,
  Dropdown,
  Empty,
  Popover,
  Space,
  Statistic,
  Steps,
  Table,
  Tooltip,
} from 'antd';
import type { IconRenderType, StepsProps } from 'antd/es/steps';
import type { FC } from 'react';
import React, { useState } from 'react';
import type { AdvancedProfileData } from './data.d';
import { queryAdvancedProfile } from './service';
import useStyles from './style.style';

const action = (
  <RouteContext.Consumer>
    {({ isMobile }) => {
      if (isMobile) {
        return (
          <Dropdown.Button
            type="primary"
            icon={<DownOutlined />}
            menu={{
              items: [
                {
                  key: '1',
                  label: 'Thao tác 1',
                },
                {
                  key: '2',
                  label: 'Thao tác 2',
                },
                {
                  key: '3',
                  label: 'Thao tác 3',
                },
              ],
            }}
            placement="bottomRight"
          >
            Thao tác chính
          </Dropdown.Button>
        );
      }
      return (
        <Space>
          <Space.Compact>
            <Button>Thao tác 1</Button>
            <Button>Thao tác 2</Button>
            <Dropdown
              menu={{
                items: [
                  {
                    key: '1',
                    label: 'Tùy chọn 1',
                  },
                  {
                    key: '2',
                    label: 'Tùy chọn 2',
                  },
                  {
                    key: '3',
                    label: 'Tùy chọn 3',
                  },
                ],
              }}
              placement="bottomRight"
            >
              <Button>
                <EllipsisOutlined />
              </Button>
            </Dropdown>
          </Space.Compact>
          <Button type="primary">Thao tác chính</Button>
        </Space>
      );
    }}
  </RouteContext.Consumer>
);

const operationTabList = [
  {
    key: 'tab1',
    tab: 'Nhật ký thao tác 1',
  },
  {
    key: 'tab2',
    tab: 'Nhật ký thao tác 2',
  },
  {
    key: 'tab3',
    tab: 'Nhật ký thao tác 3',
  },
];
const columns = [
  {
    title: 'Loại thao tác',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: 'Người thao tác',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Kết quả thực hiện',
    dataIndex: 'status',
    key: 'status',
    render: (text: string) => {
      if (text === 'agree') {
        return <Badge status="success" text="Thành công" />;
      }
      return <Badge status="error" text="Từ chối" />;
    },
  },
  {
    title: 'Thời gian thao tác',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
  },
  {
    title: 'Ghi chú',
    dataIndex: 'memo',
    key: 'memo',
  },
];
const descriptionItems: DescriptionsProps['items'] = [
  { key: '1', label: 'Người tạo', children: 'Khúc Lệ Lệ' },
  { key: '2', label: 'Sản phẩm đặt hàng', children: 'Dịch vụ XX' },
  { key: '3', label: 'Thời gian tạo', children: '2017-07-07' },
  { key: '4', label: 'Tài liệu liên kết', children: <a href="#">12421</a> },
  { key: '5', label: 'Ngày có hiệu lực', children: '2017-07-07 ~ 2017-08-08' },
  {
    key: '6',
    label: 'Ghi chú',
    children: 'Vui lòng xác nhận trong hai ngày làm việc',
  },
];
const userInfoItems: DescriptionsProps['items'] = [
  { key: '1', label: 'Tên người dùng', children: 'Phụ Tiểu Tiểu' },
  { key: '2', label: 'Số thẻ thành viên', children: '32943898021309809423' },
  { key: '3', label: 'Chứng minh thư', children: '3321944288191034921' },
  { key: '4', label: 'Phương thức liên hệ', children: '18112345678' },
  {
    key: '5',
    label: 'Địa chỉ liên hệ',
    children:
      'Khúc Lệ Lệ 18100000000 Giao lộ Đường Huáng Gū Shān, Quận Tây Hồ, Hàng Châu, Tỉnh Chiết Giang',
  },
];
const infoGroupItems: DescriptionsProps['items'] = [
  { key: '1', label: 'Dữ liệu nào đó', children: '725' },
  { key: '2', label: 'Thời gian cập nhật dữ liệu này', children: '2017-08-08' },
  {
    key: '3',
    label: (
      <span>
        Dữ liệu nào đó
        <Tooltip title="Giải thích dữ liệu">
          <InfoCircleOutlined
            style={{ color: 'rgba(0, 0, 0, 0.43)', marginLeft: 4 }}
          />
        </Tooltip>
      </span>
    ),
    children: '725',
  },
  { key: '4', label: 'Thời gian cập nhật dữ liệu này', children: '2017-08-08' },
];
const groupItems1: DescriptionsProps['items'] = [
  { key: '1', label: 'Người chịu trách nhiệm', children: 'Lâm Đông Đông' },
  { key: '2', label: 'Mã vai trò', children: '1234567' },
  { key: '3', label: 'Bộ phận', children: 'Công ty XX - Bộ phận YY' },
  { key: '4', label: 'Thời gian hết hạn', children: '2017-08-08' },
  {
    key: '5',
    label: 'Mô tả',
    children:
      'Mô tả này rất dài rất dài rất dài rất dài rất dài rất dài rất dài rất dài rất dài rất dài rất dài rất dài rất dài rất dài...',
  },
];
const groupItems2: DescriptionsProps['items'] = [
  {
    key: '1',
    label: 'Tên khoa học',
    children:
      'Citrullus lanatus (Thunb.) Matsum. et Nakai một năm cây dây leo; thân, chi khỏe, có gờ rõ ràng. Cuộn tròn tương đối dày..',
  },
];
const groupItems3: DescriptionsProps['items'] = [
  { key: '1', label: 'Người chịu trách nhiệm', children: 'Phụ Tiểu Tiểu' },
  { key: '2', label: 'Mã vai trò', children: '1234568' },
];
const customDot: IconRenderType = (dot: React.ReactNode, { active }) => {
  if (active) {
    const popoverContent = (
      <div
        style={{
          width: 160,
        }}
      >
        Vũ Gia Hào
        <span
          style={{
            float: 'right',
          }}
        >
          <Badge
            status="default"
            text={
              <span
                style={{
                  color: 'rgba(0, 0, 0, 0.45)',
                }}
              >
                Chưa phản hồi
              </span>
            }
          />
        </span>
        <div
          style={{
            marginTop: 4,
          }}
        >
          Thời gian tiêu tốn: 2 giờ 25 phút
        </div>
      </div>
    );
    return (
      <Popover
        placement="topLeft"
        arrow={{
          pointAtCenter: true,
        }}
        content={popoverContent}
      >
        <span>{dot}</span>
      </Popover>
    );
  }
  return dot;
};

type AdvancedState = {
  operationKey: 'tab1' | 'tab2' | 'tab3';
  tabActiveKey: string;
};
const Advanced: FC = () => {
  const { styles } = useStyles();

  const extra = (
    <div className={styles.moreInfo}>
      <Statistic title="状态" value="待审批" />
      <Statistic title="订单金额" value={568.08} prefix="¥" />
    </div>
  );
  const description = (
    <RouteContext.Consumer>
      {({ isMobile }) => (
        <Descriptions
          className={styles.headerList}
          size="small"
          column={isMobile ? 1 : 2}
          items={descriptionItems}
        />
      )}
    </RouteContext.Consumer>
  );
  const desc1 = (
    <div className={styles.stepDescription}>
      曲丽丽
      <DingdingOutlined
        style={{
          marginLeft: 8,
        }}
      />
      <div>2016-12-12 12:32</div>
    </div>
  );
  const desc2 = (
    <div className={styles.stepDescription}>
      周毛毛
      <DingdingOutlined
        style={{
          color: '#00A0E9',
          marginLeft: 8,
        }}
      />
      <div>
        <a href="#">催一下</a>
      </div>
    </div>
  );
  const stepsItems: StepsProps['items'] = [
    { title: '创建项目', content: desc1 },
    { title: '部门初审', content: desc2 },
    { title: '财务复核' },
    { title: '完成' },
  ];

  const [tabStatus, seTabStatus] = useState<AdvancedState>({
    operationKey: 'tab1',
    tabActiveKey: 'detail',
  });

  const { data = {}, isLoading: loading } = useQuery<AdvancedProfileData>({
    queryKey: ['profile-advanced'],
    queryFn: () => queryAdvancedProfile().then((res) => res.data),
  });
  const { advancedOperation1, advancedOperation2, advancedOperation3 } = data;
  const contentList = {
    tab1: (
      <Table
        pagination={false}
        loading={loading}
        dataSource={advancedOperation1}
        columns={columns}
      />
    ),
    tab2: (
      <Table
        pagination={false}
        loading={loading}
        dataSource={advancedOperation2}
        columns={columns}
      />
    ),
    tab3: (
      <Table
        pagination={false}
        loading={loading}
        dataSource={advancedOperation3}
        columns={columns}
      />
    ),
  };
  const onTabChange = (tabActiveKey: string) => {
    seTabStatus({
      ...tabStatus,
      tabActiveKey,
    });
  };
  const onOperationTabChange = (key: string) => {
    seTabStatus({
      ...tabStatus,
      operationKey: key as 'tab1',
    });
  };
  return (
    <PageContainer
      title="单号：234231029431"
      extra={action}
      className={styles.pageHeader}
      content={description}
      extraContent={extra}
      tabActiveKey={tabStatus.tabActiveKey}
      onTabChange={onTabChange}
      tabList={[
        {
          key: 'detail',
          tab: '详情',
        },
        {
          key: 'rule',
          tab: '规则',
        },
      ]}
    >
      <div className={styles.main}>
        <GridContent>
          <Card
            title="流程进度"
            style={{
              marginBottom: 24,
            }}
          >
            <RouteContext.Consumer>
              {({ isMobile }) => (
                <Steps
                  orientation={isMobile ? 'vertical' : 'horizontal'}
                  iconRender={customDot}
                  current={1}
                  items={stepsItems}
                />
              )}
            </RouteContext.Consumer>
          </Card>
          <Card
            title="用户信息"
            style={{
              marginBottom: 24,
            }}
            variant="borderless"
          >
            <Descriptions
              style={{
                marginBottom: 24,
              }}
              items={userInfoItems}
            />
            <Descriptions
              style={{
                marginBottom: 24,
              }}
              title="信息组"
              items={infoGroupItems}
            />
            <h4
              style={{
                marginBottom: 16,
              }}
            >
              信息组
            </h4>
            <Card type="inner" title="多层级信息组">
              <Descriptions title="组名称" items={groupItems1} />
              <Divider size="large" />
              <Descriptions title="组名称" column={1} items={groupItems2} />
              <Divider size="large" />
              <Descriptions title="组名称" items={groupItems3} />
            </Card>
          </Card>
          <Card
            title="用户近半年来电记录"
            style={{
              marginBottom: 24,
            }}
            variant="borderless"
          >
            <Empty />
          </Card>
          <Card
            variant="borderless"
            tabList={operationTabList}
            onTabChange={onOperationTabChange}
          >
            {contentList[tabStatus.operationKey] as React.ReactNode}
          </Card>
        </GridContent>
      </div>
    </PageContainer>
  );
};
export default Advanced;
