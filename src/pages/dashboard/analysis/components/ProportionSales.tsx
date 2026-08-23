import { Pie } from '@ant-design/plots';
import { Card, Segmented, Typography } from 'antd';
import React from 'react';
import { formatNumber } from '@/utils/format';
import type { DataItem } from '../data.d';
import useStyles from '../style.style';

const { Text } = Typography;
const ProportionSales = ({
  dropdownGroup,
  salesType,
  loading,
  salesPieData,
  handleChangeSalesType,
}: {
  loading: boolean;
  dropdownGroup: React.ReactNode;
  salesType: 'all' | 'online' | 'stores';
  salesPieData: DataItem[];
  handleChangeSalesType?: (value: 'all' | 'online' | 'stores') => void;
}) => {
  const { styles } = useStyles();
  return (
    <Card
      loading={loading}
      className={styles.salesCard}
      variant="borderless"
      title="Tỷ lệ bán hàng theo loại"
      style={{
        height: '100%',
      }}
      extra={
        <div className={styles.salesCardExtra}>
          {dropdownGroup}
          <Segmented
            className={styles.salesTypeRadio}
            value={salesType}
            onChange={handleChangeSalesType}
            options={[
              { label: 'Tất cả các kênh', value: 'all' },
              { label: 'Trực tuyến', value: 'online' },
              { label: 'Cửa hàng', value: 'stores' },
            ]}
            size="middle"
          />
        </div>
      }
    >
      <Text>Doanh số bán hàng</Text>
      <Pie
        height={340}
        radius={0.8}
        innerRadius={0.5}
        angleField="y"
        colorField="x"
        data={salesPieData as any}
        legend={false}
        label={{
          position: 'spider',
          text: (item: { x: number; y: number }) =>
            `${item.x}: ${formatNumber(item.y)}`,
        }}
      />
    </Card>
  );
};
export default ProportionSales;
