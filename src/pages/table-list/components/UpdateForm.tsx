import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  StepsForm,
} from '@ant-design/pro-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, message } from 'antd';
import React, { cloneElement, useCallback, useState } from 'react';
import { updateRule } from '@/services/ant-design-pro/api';

type UpdateFormProps = {
  trigger?: React.ReactElement<any>;
  onOk?: () => void;
  values: Partial<API.RuleListItem>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { onOk, values, trigger } = props;

  const intl = useIntl();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const { mutateAsync: run } = useMutation({
    mutationFn: updateRule,
    onSuccess: () => {
      messageApi.success('Configuration is successful');
      queryClient.invalidateQueries({ queryKey: ['rule'] });
      onOk?.();
    },
    onError: () => {
      messageApi.error('Configuration failed, please try again!');
    },
  });

  const onCancel = useCallback(() => {
    setOpen(false);
  }, []);

  const onOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const onFinish = useCallback(
    async (values?: any) => {
      await run({ data: values });
      onCancel();
    },
    [onCancel, run],
  );

  return (
    <>
      {contextHolder}
      {trigger
        ? cloneElement(trigger, {
            onClick: onOpen,
          })
        : null}
      <StepsForm
        stepsProps={{
          size: 'small',
        }}
        stepsFormRender={(dom, submitter) => {
          return (
            <Modal
              width={640}
              styles={{
                body: {
                  padding: '32px 40px 48px',
                },
              }}
              destroyOnHidden
              title={intl.formatMessage({
                id: 'pages.searchTable.updateForm.ruleConfig',
                defaultMessage: 'Cấu hình quy tắc',
              })}
              open={open}
              footer={submitter}
              onCancel={onCancel}
            >
              {dom}
            </Modal>
          );
        }}
        onFinish={onFinish}
      >
        <StepsForm.StepForm
          initialValues={values}
          title={intl.formatMessage({
            id: 'pages.searchTable.updateForm.basicConfig',
            defaultMessage: 'Thông tin cơ bản',
          })}
        >
          <ProFormText
            name="name"
            label={intl.formatMessage({
              id: 'pages.searchTable.updateForm.ruleName.nameLabel',
              defaultMessage: 'Tên quy tắc',
            })}
            width="md"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.searchTable.updateForm.ruleName.nameRules"
                    defaultMessage="Vui lòng nhập tên quy tắc!"
                  />
                ),
              },
            ]}
          />
          <ProFormTextArea
            name="desc"
            width="md"
            label={intl.formatMessage({
              id: 'pages.searchTable.updateForm.ruleDesc.descLabel',
              defaultMessage: 'Mô tả quy tắc',
            })}
            placeholder={intl.formatMessage({
              id: 'pages.searchTable.updateForm.ruleDesc.descPlaceholder',
              defaultMessage: 'Vui lòng nhập ít nhất năm ký tự',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.searchTable.updateForm.ruleDesc.descRules"
                    defaultMessage="Vui lòng nhập mô tả quy tắc có ít nhất năm ký tự!"
                  />
                ),
                min: 5,
              },
            ]}
          />
        </StepsForm.StepForm>
        <StepsForm.StepForm
          initialValues={{
            target: '0',
            template: '0',
          }}
          title={intl.formatMessage({
            id: 'pages.searchTable.updateForm.ruleProps.title',
            defaultMessage: 'Cấu hình thuộc tính quy tắc',
          })}
        >
          <ProFormSelect
            name="target"
            width="md"
            label={intl.formatMessage({
              id: 'pages.searchTable.updateForm.object',
              defaultMessage: 'Đối tượng giám sát',
            })}
            valueEnum={{
              0: 'Bảng một',
              1: 'Bảng hai',
            }}
          />
          <ProFormSelect
            name="template"
            width="md"
            label={intl.formatMessage({
              id: 'pages.searchTable.updateForm.ruleProps.templateLabel',
              defaultMessage: 'Mẫu quy tắc',
            })}
            valueEnum={{
              0: 'Mẫu quy tắc một',
              1: 'Mẫu quy tắc hai',
            }}
          />
          <ProFormRadio.Group
            name="type"
            label={intl.formatMessage({
              id: 'pages.searchTable.updateForm.ruleProps.typeLabel',
              defaultMessage: 'Loại quy tắc',
            })}
            options={[
              {
                value: '0',
                label: 'Mạnh',
              },
              {
                value: '1',
                label: 'Yếu',
              },
            ]}
          />
        </StepsForm.StepForm>
        <StepsForm.StepForm
          initialValues={{
            type: '1',
            frequency: 'month',
          }}
          title={intl.formatMessage({
            id: 'pages.searchTable.updateForm.schedulingPeriod.title',
            defaultMessage: 'Đặt chu kỳ lên lịch',
          })}
        >
          <ProFormDateTimePicker
            name="time"
            width="md"
            label={intl.formatMessage({
              id: 'pages.searchTable.updateForm.schedulingPeriod.timeLabel',
              defaultMessage: 'Thời gian bắt đầu',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.searchTable.updateForm.schedulingPeriod.timeRules"
                    defaultMessage="Vui lòng chọn thời gian bắt đầu!"
                  />
                ),
              },
            ]}
          />
          <ProFormSelect
            name="frequency"
            label={intl.formatMessage({
              id: 'pages.searchTable.updateForm.object',
              defaultMessage: 'Đối tượng giám sát',
            })}
            width="md"
            valueEnum={{
              month: 'Tháng',
              week: 'Tuần',
            }}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  );
};

export default UpdateForm;
