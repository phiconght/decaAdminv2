import { Column } from '@ant-design/plots';
import { Button, Card, Col, DatePicker, Row, Tabs } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import { formatNumber } from '@/utils/format';
import type { DataItem } from '../data.d';
import useStyles from '../style.style';

export type TimeType = 'today' | 'week' | 'month' | 'year';
const { RangePicker } = DatePicker;

const rankingListData: {
  title: string;
  total: number;
}[] = [];

for (let i = 0; i < 7; i += 1) {
  rankingListData.push({
    title: `Cửa hàng ${i} đường Gongzhuan`,
    total: 323234,
  });
}

const SalesCard = ({
  rangePickerValue,
  salesData,
  isActive,
  handleRangePickerChange,
  loading,
  selectDate,
}: {
  rangePickerValue: RangePickerProps['value'];
  isActive: (key: TimeType) => string;
  salesData: DataItem[];
  loading: boolean;
  handleRangePickerChange: RangePickerProps['onChange'];
  selectDate: (key: TimeType) => void;
}) => {
  const { styles } = useStyles();
  return (
    <Card
      loading={loading}
      variant="borderless"
      styles={{
        body: {
          padding: loading ? 24 : 0,
        },
      }}
    >
      <Tabs
        className={styles.salesCard}
        tabBarExtraContent={
          <div className={styles.salesExtraWrap}>
            <div className={styles.salesExtra}>
              <Button
                type="text"
                className={isActive('today')}
                onClick={() => selectDate('today')}
              >
                Hôm nay
              </Button>
              <Button
                type="text"
                className={isActive('week')}
                onClick={() => selectDate('week')}
              >
                Tuần này
              </Button>
              <Button
                type="text"
                className={isActive('month')}
                onClick={() => selectDate('month')}
              >
                Tháng này
              </Button>
              <Button
                type="text"
                className={isActive('year')}
                onClick={() => selectDate('year')}
              >
                Năm này
              </Button>
            </div>
            <RangePicker
              value={rangePickerValue}
              onChange={handleRangePickerChange}
              variant="filled"
              style={{
                width: 256,
              }}
            />
          </div>
        }
        size="large"
        tabBarStyle={{
          marginBottom: 24,
        }}
        items={[
          {
            key: 'sales',
            label: 'Doanh số bán hàng',
            children: (
              <Row>
                <Col xl={16} lg={12} md={12} sm={24} xs={24}>
                  <div className={styles.salesBar}>
                    <Column
                      height={300}
                      data={salesData}
                      xField="x"
                      yField="y"
                      paddingBottom={12}
                      axis={{
                        x: {
                          title: false,
                        },
                        y: {
                          title: false,
                          gridLineDash: null,
                          gridStroke: '#ccc',
                        },
                      }}
                      scale={{
                        x: { paddingInner: 0.4 },
                      }}
                      tooltip={{
                        name: 'Lượng bán hàng',
                        channel: 'y',
                      }}
                    />
                  </div>
                </Col>
                <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                  <div className={styles.salesRank}>
                    <h4 className={styles.rankingTitle}>
                      Xếp hạng doanh số bán hàng cửa hàng
                    </h4>
                    <ul className={styles.rankingList}>
                      {rankingListData.map((item, i) => (
                        <li key={item.title}>
                          <span
                            className={`${styles.rankingItemNumber} ${
                              i < 3 ? styles.rankingItemNumberActive : ''
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span
                            className={styles.rankingItemTitle}
                            title={item.title}
                          >
                            {item.title}
                          </span>
                          <span>{formatNumber(item.total)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Col>
              </Row>
            ),
          },
          {
            key: 'views',
            label: 'Lượng truy cập',
            children: (
              <Row>
                <Col xl={16} lg={12} md={12} sm={24} xs={24}>
                  <div className={styles.salesBar}>
                    <Column
                      height={300}
                      data={salesData}
                      xField="x"
                      yField="y"
                      paddingBottom={12}
                      axis={{
                        x: {
                          title: false,
                        },
                        y: {
                          title: false,
                        },
                      }}
                      scale={{
                        x: { paddingInner: 0.4 },
                      }}
                      tooltip={{
                        name: 'Lượng truy cập',
                        channel: 'y',
                      }}
                    />
                  </div>
                </Col>
                <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                  <div className={styles.salesRank}>
                    <h4 className={styles.rankingTitle}>
                      Xếp hạng lượng truy cập cửa hàng
                    </h4>
                    <ul className={styles.rankingList}>
                      {rankingListData.map((item, i) => (
                        <li key={item.title}>
                          <span
                            className={`${
                              i < 3
                                ? styles.rankingItemNumberActive
                                : styles.rankingItemNumber
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span
                            className={styles.rankingItemTitle}
                            title={item.title}
                          >
                            {item.title}
                          </span>
                          <span>{formatNumber(item.total)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Col>
              </Row>
            ),
          },
        ]}
      />
    </Card>
  );
};
export default SalesCard;
