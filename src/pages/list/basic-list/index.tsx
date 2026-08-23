import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Avatar,
  Button,
  Card,
  Col,
  Dropdown,
  Input,
  List,
  Modal,
  Progress,
  Row,
  Segmented,
} from 'antd';
import dayjs from 'dayjs';
import type { FC } from 'react';
import React, { useState } from 'react';
import OperationModal from './components/OperationModal';
import type { BasicListItemDataType } from './data.d';
import {
  addFakeList,
  queryFakeList,
  removeFakeList,
  updateFakeList,
} from './service';
import useStyles from './style.style';

const { Search } = Input;
const Info: FC<{
  title: React.ReactNode;
  value: React.ReactNode;
  bordered?: boolean;
}> = ({ title, value, bordered }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.headerInfo}>
      <span>{title}</span>
      <p>{value}</p>
      {bordered && <em />}
    </div>
  );
};
const ListContent = ({
  data: { owner, createdAt, percent, status },
}: {
  data: BasicListItemDataType;
}) => {
  const { styles } = useStyles();
  return (
    <div>
      <div className={styles.listContentItem}>
        <span>Owner</span>
        <p>{owner}</p>
      </div>
      <div className={styles.listContentItem}>
        <span>开始时间</span>
        <p>{dayjs(createdAt).format('YYYY-MM-DD HH:mm')}</p>
      </div>
      <div className={styles.listContentItem}>
        <Progress
          percent={percent}
          status={status}
          size={6}
          style={{
            width: 180,
          }}
        />
      </div>
    </div>
  );
};
const BasicList: FC = () => {
  const { styles } = useStyles();
  const [done, setDone] = useState<boolean>(false);
  const [open, setVisible] = useState<boolean>(false);
  const [current, setCurrent] = useState<
    Partial<BasicListItemDataType> | undefined
  >(undefined);
  const { data: listData, isLoading: loading } = useQuery({
    queryKey: ['basic-list'],
    queryFn: () => queryFakeList({ count: 50 }).then((res) => res.data),
  });

  const queryClient = useQueryClient();
  const { mutate: postRun } = useMutation({
    mutationFn: async ({ method, params }: { method: string; params: any }) => {
      if (method === 'remove') {
        return removeFakeList(params);
      }
      if (method === 'update') {
        return updateFakeList(params);
      }
      return addFakeList(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['basic-list'] });
    },
  });

  // Wrapper to handle the original calling convention
  const runListOperation = (method: string, params: any) => {
    postRun({ method, params });
  };
  const list = listData?.list || [];
  const paginationProps = {
    showSizeChanger: true,
    showQuickJumper: true,
    pageSize: 5,
    total: list.length,
  };
  const showEditModal = (item: BasicListItemDataType) => {
    setVisible(true);
    setCurrent(item);
  };
  const deleteItem = (id: string) => {
    runListOperation('remove', {
      id,
    });
  };
  const editAndDelete = (
    key: string | number,
    currentItem: BasicListItemDataType,
  ) => {
    if (key === 'edit') showEditModal(currentItem);
    else if (key === 'delete') {
      Modal.confirm({
        title: 'Xóa tác vụ',
        content: 'Bạn có chắc chắn muốn xóa tác vụ này không?',
        okText: 'Xác nhận',
        cancelText: 'Hủy',
        onOk: () => deleteItem(currentItem.id),
      });
    }
  };
  const extraContent = (
    <div>
      <Segmented
        defaultValue="all"
        options={[
          { label: 'Tất cả', value: 'all' },
          { label: 'Đang xử lý', value: 'progress' },
          { label: 'Đang chờ', value: 'waiting' },
        ]}
        // Nếu cần thiết, có thể thêm sự kiện onChange
      />
      <Search
        className={styles.extraContentSearch}
        placeholder="Vui lòng nhập"
        onSearch={() => ({})}
        variant="filled"
      />
    </div>
  );

  const renderMoreBtn = (item: BasicListItemDataType) => {
    return (
      <Dropdown
        menu={{
          onClick: ({ key }) => editAndDelete(key, item),
          items: [
            {
              key: 'edit',
              label: 'Chỉnh sửa',
            },
            {
              key: 'delete',
              label: 'Xóa',
            },
          ],
        }}
      >
        <a href="#">
          Thêm <DownOutlined />
        </a>
      </Dropdown>
    );
  };

  const handleDone = () => {
    setDone(false);
    setVisible(false);
    setCurrent({});
  };
  const handleSubmit = (values: BasicListItemDataType) => {
    setDone(true);
    const method = values?.id ? 'update' : 'add';
    runListOperation(method, values);
  };
  return (
    <div>
      <PageContainer>
        <div className={styles.standardList}>
          <Card variant="borderless">
            <Row>
              <Col sm={8} xs={24}>
                <Info title="Việc của tôi" value="8 tác vụ" bordered />
              </Col>
              <Col sm={8} xs={24}>
                <Info
                  title="Thời gian xử lý tác vụ trung bình trong tuần này"
                  value="32 phút"
                  bordered
                />
              </Col>
              <Col sm={8} xs={24}>
                <Info
                  title="Số tác vụ hoàn thành trong tuần này"
                  value="24 tác vụ"
                />
              </Col>
            </Row>
          </Card>

          <Card
            className={styles.listCard}
            variant="borderless"
            title="Danh sách cơ bản"
            style={{
              marginTop: 24,
            }}
            styles={{
              body: {
                padding: '0 32px 40px 32px',
              },
            }}
            extra={extraContent}
          >
            <List
              size="large"
              rowKey="id"
              loading={loading}
              pagination={paginationProps}
              dataSource={list}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <a
                      key="edit"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        showEditModal(item);
                      }}
                    >
                      Chỉnh sửa
                    </a>,
                    renderMoreBtn(item),
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar src={item.logo} shape="square" size="large" />
                    }
                    title={<a href={item.href}>{item.title}</a>}
                    description={item.subDescription}
                  />
                  <ListContent data={item} />
                </List.Item>
              )}
            />
          </Card>
        </div>
      </PageContainer>
      <Button
        type="dashed"
        onClick={() => {
          setVisible(true);
        }}
        style={{
          width: '100%',
          marginBottom: 8,
        }}
      >
        <PlusOutlined />
        Thêm
      </Button>
      <OperationModal
        done={done}
        open={open}
        current={current}
        onDone={handleDone}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
export default BasicList;
