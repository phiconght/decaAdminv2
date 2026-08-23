import { CloseCircleOutlined } from '@ant-design/icons';
import type { ProColumnType } from '@ant-design/pro-components';
import {
  EditableProTable,
  FooterToolbar,
  PageContainer,
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
  ProFormTimePicker,
} from '@ant-design/pro-components';
import { Card, Col, message, Popover, Row } from 'antd';
import type { FC } from 'react';
import { useRef, useState } from 'react';
import { fakeSubmitForm } from './service';
import useStyles from './style.style';

interface TableFormDateType {
  key: string;
  workId?: string;
  name?: string;
  department?: string;
  isNew?: boolean;
  editable?: boolean;
}
type InternalNamePath = (string | number)[];
const fieldLabels = {
  name: 'Tên kho lưu trữ',
  url: 'Tên miền kho lưu trữ',
  owner: 'Quản trị viên kho lưu trữ',
  approver: 'Người phê duyệt',
  dateRange: 'Ngày có hiệu lực',
  type: 'Loại kho lưu trữ',
  name2: 'Tên nhiệm vụ',
  url2: 'Mô tả nhiệm vụ',
  owner2: 'Người thực thi',
  approver2: 'Người chịu trách nhiệm',
  dateRange2: 'Ngày có hiệu lực',
  type2: 'Loại nhiệm vụ',
};
const tableData = [
  {
    key: '1',
    workId: '00001',
    name: 'John Brown',
    department: 'New York No. 1 Lake Park',
  },
  {
    key: '2',
    workId: '00002',
    name: 'Jim Green',
    department: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    workId: '00003',
    name: 'Joe Black',
    department: 'Sidney No. 1 Lake Park',
  },
];
interface ErrorField {
  name: InternalNamePath;
  errors: string[];
}
const AdvancedForm: FC<Record<string, any>> = () => {
  const { styles } = useStyles();
  const [error, setError] = useState<ErrorField[]>([]);
  const keyCounter = useRef(0);
  const getErrorInfo = (errors: ErrorField[]) => {
    const errorCount = errors.filter((item) => item.errors.length > 0).length;
    if (!errors || errorCount === 0) {
      return null;
    }
    const scrollToField = (fieldKey: string) => {
      const labelNode = document.querySelector(`label[for="${fieldKey}"]`);
      if (labelNode) {
        labelNode.scrollIntoView(true);
      }
    };
    const errorList = errors.map((err) => {
      if (!err || err.errors.length === 0) {
        return null;
      }
      const key = err.name[0] as
        | 'name'
        | 'url'
        | 'owner'
        | 'approver'
        | 'dateRange'
        | 'type';
      return (
        <button
          key={key}
          type="button"
          className={styles.errorListItem}
          onClick={() => scrollToField(key)}
        >
          <CloseCircleOutlined className={styles.errorIcon} />
          <div>{err.errors[0]}</div>
          <div className={styles.errorField}>{fieldLabels[key]}</div>
        </button>
      );
    });
    return (
      <span className={styles.errorIcon}>
        <Popover
          title="Thông tin xác thực biểu mẫu"
          content={errorList}
          classNames={{
            root: styles.errorPopover,
          }}
          trigger="click"
          getPopupContainer={(trigger: HTMLElement) => {
            if (trigger?.parentNode) {
              return trigger.parentNode as HTMLElement;
            }
            return trigger;
          }}
        >
          <CloseCircleOutlined />
        </Popover>
        {errorCount}
      </span>
    );
  };
  const onFinish = async (values: Record<string, any>) => {
    setError([]);
    try {
      await fakeSubmitForm(values);
      message.success('Nộp thành công');
    } catch {
      // console.log
    }
  };
  const onFinishFailed = (errorInfo: any) => {
    setError(errorInfo.errorFields);
  };
  const columns: ProColumnType<TableFormDateType>[] = [
    {
      title: 'Tên thành viên',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
    },
    {
      title: 'Mã nhân viên',
      dataIndex: 'workId',
      key: 'workId',
      width: '20%',
    },
    {
      title: 'Bộ phận',
      dataIndex: 'department',
      key: 'department',
      width: '40%',
    },
    {
      title: 'Thao tác',
      key: 'action',
      valueType: 'option',
      render: (_, record: TableFormDateType, _index, action) => {
        return [
          <a
            key="eidit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              action?.startEditable(record.key);
            }}
          >
            Chỉnh sửa
          </a>,
        ];
      },
    },
  ];
  return (
    <ProForm
      layout="vertical"
      requiredMark={false}
      submitter={{
        render: (_props, dom) => {
          return (
            <FooterToolbar>
              {getErrorInfo(error)}
              {dom}
            </FooterToolbar>
          );
        },
      }}
      initialValues={{
        members: tableData,
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <PageContainer content="Biểu mẫu nâng cao thường được sử dụng cho các kịch bản nhập một lần và gửi dữ liệu hàng loạt.">
        <Card
          title="Quản lý kho lưu trữ"
          className={styles.card}
          variant="borderless"
        >
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label={fieldLabels.name}
                name="name"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập tên kho lưu trữ',
                  },
                ]}
                placeholder="Vui lòng nhập tên kho lưu trữ"
              />
            </Col>
            <Col
              xl={{
                span: 6,
                offset: 2,
              }}
              lg={{
                span: 8,
              }}
              md={{
                span: 12,
              }}
              sm={24}
            >
              <ProFormText
                label={fieldLabels.url}
                name="url"
                rules={[
                  {
                    required: true,
                    message: '请选择',
                  },
                ]}
                fieldProps={{
                  style: {
                    width: '100%',
                  },
                  addonBefore: 'http://',
                  addonAfter: '.com',
                }}
                placeholder="请输入"
              />
            </Col>
            <Col
              xl={{
                span: 8,
                offset: 2,
              }}
              lg={{
                span: 10,
              }}
              md={{
                span: 24,
              }}
              sm={24}
            >
              <ProFormSelect
                label={fieldLabels.owner}
                name="owner"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn quản trị viên',
                  },
                ]}
                options={[
                  {
                    label: 'Fu Xiaoxiao',
                    value: 'xiao',
                  },
                  {
                    label: 'Zhou Maomao',
                    value: 'mao',
                  },
                ]}
                placeholder="Vui lòng chọn quản trị viên"
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormSelect
                label={fieldLabels.approver}
                name="approver"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn người phê duyệt',
                  },
                ]}
                options={[
                  {
                    label: 'Fu Xiaoxiao',
                    value: 'xiao',
                  },
                  {
                    label: 'Zhou Maomao',
                    value: 'mao',
                  },
                ]}
                placeholder="Vui lòng chọn người phê duyệt"
              />
            </Col>
            <Col
              xl={{
                span: 6,
                offset: 2,
              }}
              lg={{
                span: 8,
              }}
              md={{
                span: 12,
              }}
              sm={24}
            >
              <ProFormDateRangePicker
                label={fieldLabels.dateRange}
                name="dateRange"
                fieldProps={{
                  style: {
                    width: '100%',
                  },
                }}
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn ngày có hiệu lực',
                  },
                ]}
              />
            </Col>
            <Col
              xl={{
                span: 8,
                offset: 2,
              }}
              lg={{
                span: 10,
              }}
              md={{
                span: 24,
              }}
              sm={24}
            >
              <ProFormSelect
                label={fieldLabels.type}
                name="type"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn loại kho lưu trữ',
                  },
                ]}
                options={[
                  {
                    label: 'Riêng tư',
                    value: 'private',
                  },
                  {
                    label: 'Công khai',
                    value: 'public',
                  },
                ]}
                placeholder="Vui lòng chọn loại kho lưu trữ"
              />
            </Col>
          </Row>
        </Card>
        <Card
          title="Quản lý nhiệm vụ"
          className={styles.card}
          variant="borderless"
        >
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label={fieldLabels.name2}
                name="name2"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập',
                  },
                ]}
              />
            </Col>
            <Col
              xl={{
                span: 6,
                offset: 2,
              }}
              lg={{
                span: 8,
              }}
              md={{
                span: 12,
              }}
              sm={24}
            >
              <ProFormText
                label={fieldLabels.url2}
                name="url2"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn',
                  },
                ]}
              />
            </Col>
            <Col
              xl={{
                span: 8,
                offset: 2,
              }}
              lg={{
                span: 10,
              }}
              md={{
                span: 24,
              }}
              sm={24}
            >
              <ProFormSelect
                label={fieldLabels.owner2}
                name="owner2"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn quản trị viên',
                  },
                ]}
                options={[
                  {
                    label: 'Fu Xiaoxiao',
                    value: 'xiao',
                  },
                  {
                    label: 'Zhou Maomao',
                    value: 'mao',
                  },
                ]}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormSelect
                label={fieldLabels.approver2}
                name="approver2"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn người phê duyệt',
                  },
                ]}
                options={[
                  {
                    label: 'Fu Xiaoxiao',
                    value: 'xiao',
                  },
                  {
                    label: 'Zhou Maomao',
                    value: 'mao',
                  },
                ]}
                placeholder="Vui lòng chọn người phê duyệt"
              />
            </Col>
            <Col
              xl={{
                span: 6,
                offset: 2,
              }}
              lg={{
                span: 8,
              }}
              md={{
                span: 12,
              }}
              sm={24}
            >
              <ProFormTimePicker
                label={fieldLabels.dateRange2}
                name="dateRange2"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập',
                  },
                ]}
                placeholder="Thời gian nhắc nhở"
                fieldProps={{
                  style: {
                    width: '100%',
                  },
                }}
              />
            </Col>
            <Col
              xl={{
                span: 8,
                offset: 2,
              }}
              lg={{
                span: 10,
              }}
              md={{
                span: 24,
              }}
              sm={24}
            >
              <ProFormSelect
                label={fieldLabels.type2}
                name="type2"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn loại kho lưu trữ',
                  },
                ]}
                options={[
                  {
                    label: 'Riêng tư',
                    value: 'private',
                  },
                  {
                    label: 'Công khai',
                    value: 'public',
                  },
                ]}
                placeholder="Vui lòng chọn loại kho lưu trữ"
              />
            </Col>
          </Row>
        </Card>
        <Card title="Quản lý thành viên" variant="borderless">
          <ProForm.Item name="members">
            <EditableProTable<TableFormDateType>
              recordCreatorProps={{
                record: () => {
                  keyCounter.current += 1;
                  return {
                    key: `new-${keyCounter.current}`,
                  };
                },
              }}
              columns={columns}
              rowKey="key"
            />
          </ProForm.Item>
        </Card>
      </PageContainer>
    </ProForm>
  );
};
export default AdvancedForm;
