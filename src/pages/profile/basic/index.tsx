import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import type { DescriptionsProps } from 'antd';
import { Badge, Card, Descriptions, Divider, Table } from 'antd';
import type { FC } from 'react';
import React from 'react';
import type { BasicGood, BasicProgress } from './data.d';
import { queryBasicProfile } from './service';

const progressColumns: ProColumns<BasicProgress>[] = [
  {
    title: 'Thời gian',
    dataIndex: 'time',
  },
  {
    title: 'Tiến độ hiện tại',
    dataIndex: 'rate',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    render: (text: React.ReactNode) => {
      if (text === 'success') {
        return <Badge status="success" text="Thành công" />;
      }
      return <Badge status="processing" text="Đang tiến hành" />;
    },
  },
  {
    title: 'ID Người vận hành',
    dataIndex: 'operator',
  },
  {
    title: 'Thời gian tiêu tốn',
    dataIndex: 'cost',
  },
];
const goodsColumns: ProColumns<BasicGood>[] = [
  {
    title: 'Mã sản phẩm',
    dataIndex: 'id',
  },
  {
    title: 'Tên sản phẩm',
    dataIndex: 'name',
  },
  {
    title: 'Mã vạch sản phẩm',
    dataIndex: 'barcode',
  },
  {
    title: 'Đơn giá',
    dataIndex: 'price',
  },
  {
    title: 'Số lượng (cái)',
    dataIndex: 'num',
    align: 'right',
  },
  {
    title: 'Số tiền',
    dataIndex: 'amount',
    align: 'right',
  },
];

const Descriptions1: DescriptionsProps['items'] = [
  {
    key: '1',
    label: 'Số phiếu lấy hàng',
    children: '1000000000',
  },
  {
    key: '2',
    label: 'Trạng thái',
    children: 'Đã lấy hàng',
  },
  {
    key: '3',
    label: 'Số đơn bán hàng',
    children: '1234123421',
  },
  {
    key: '4',
    label: 'Đơn hàng con',
    children: '3214321432',
  },
];
const Descriptions2: DescriptionsProps['items'] = [
  {
    key: '1',
    label: 'Tên người dùng',
    children: 'Phụ Tiểu Tiểu',
  },
  {
    key: '2',
    label: 'Số điện thoại liên hệ',
    children: '18100000000',
  },
  {
    key: '3',
    label: 'Dịch vụ giao hàng thường dùng',
    children: 'Kho lưu trữ Cai Niao',
  },
  {
    key: '4',
    label: 'Địa chỉ lấy hàng',
    children: '18 Wantang Road, Xihu District, Hangzhou, Zhejiang Province',
  },
  {
    key: '5',
    label: 'Ghi chú',
    children: 'Không',
  },
];

const Basic: FC = () => {
  const { data, isLoading: loading } = useQuery({
    queryKey: ['profile-basic'],
    queryFn: () => queryBasicProfile().then((res) => res.data),
  });
  const { basicGoods, basicProgress } = data || {
    basicGoods: [],
    basicProgress: [],
  };
  return (
    <PageContainer>
      <Card variant="borderless">
        <Descriptions title="退款申请" items={Descriptions1} />
        <Divider size="large" />
        <Descriptions title="用户信息" items={Descriptions2} />
        <Divider size="large" />
        <ProTable
          headerTitle="退货商品"
          style={{
            marginBottom: 24,
          }}
          pagination={false}
          search={false}
          loading={loading}
          options={false}
          dataSource={basicGoods}
          ghost
          columns={goodsColumns}
          rowKey="id"
          summary={(pageData) => {
            let totalNum = 0;
            let totalAmount = 0;
            pageData.forEach(({ num, amount }) => {
              totalNum += Number(num);
              totalAmount += Number(amount);
            });
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <span style={{ fontWeight: 600 }}>总计</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <span style={{ fontWeight: 600 }}>{totalNum}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">
                  <span style={{ fontWeight: 600 }}>{totalAmount}</span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
        <ProTable
          headerTitle="退货进度"
          pagination={false}
          loading={loading}
          search={false}
          options={false}
          ghost
          dataSource={basicProgress}
          columns={progressColumns}
        />
      </Card>
    </PageContainer>
  );
};
export default Basic;
