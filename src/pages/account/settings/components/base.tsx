import { UploadOutlined } from '@ant-design/icons';
import {
  ProForm,
  ProFormDependency,
  ProFormFieldSet,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { Button, Input, message, Upload } from 'antd';
import React from 'react';
import { queryCity, queryCurrent, queryProvince } from '../service';
import useStyles from './index.style';

const validatorPhone = (
  _rule: any,
  value: string[],
  callback: (message?: string) => void,
) => {
  if (!value[0]) {
    callback('Please input your area code!');
  }
  if (!value[1]) {
    callback('Please input your phone number!');
  }
  callback();
};

const BaseView: React.FC = () => {
  const { styles } = useStyles();

  const { data: currentUser, isLoading: loading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => queryCurrent().then((res) => res.data),
  });
  const getAvatarURL = () => {
    if (currentUser) {
      if (currentUser.avatar) {
        return currentUser.avatar;
      }
      const url =
        'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png';
      return url;
    }
    return '';
  };
  const handleFinish = async () => {
    message.success('Cập nhật thông tin cơ bản thành công');
  };
  return (
    <div className={styles.baseView}>
      {loading ? null : (
        <>
          <div className={styles.left}>
            <ProForm
              layout="vertical"
              onFinish={handleFinish}
              submitter={{
                searchConfig: {
                  submitText: 'Cập nhật thông tin cơ bản',
                },
                render: (_, dom) => dom[1],
              }}
              initialValues={{
                ...currentUser,
                phone: currentUser?.phone?.split('-'),
              }}
              requiredMark={false}
            >
              <ProFormText
                width="md"
                name="email"
                label="Email"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập email của bạn!',
                  },
                ]}
              />
              <ProFormText
                width="md"
                name="name"
                label="Biệt danh"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập biệt danh của bạn!',
                  },
                ]}
              />
              <ProFormTextArea
                name="profile"
                label="Tiểu sử cá nhân"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập tiểu sử cá nhân!',
                  },
                ]}
                placeholder="Tiểu sử cá nhân"
              />
              <ProFormSelect
                width="sm"
                name="country"
                label="Quốc gia/Khu vực"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập quốc gia hoặc khu vực của bạn!',
                  },
                ]}
                options={[
                  {
                    label: 'Trung Quốc',
                    value: 'China',
                  },
                ]}
              />

              <ProForm.Group title="Tỉnh/Thành phố" size={8}>
                <ProFormSelect
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập tỉnh của bạn!',
                    },
                  ]}
                  width="sm"
                  fieldProps={{
                    labelInValue: true,
                  }}
                  name="province"
                  request={async () => {
                    return queryProvince().then(({ data }) => {
                      return data.map((item) => {
                        return {
                          label: item.name,
                          value: item.id,
                        };
                      });
                    });
                  }}
                />
                <ProFormDependency name={['province']}>
                  {({ province }) => {
                    return (
                      <ProFormSelect
                        params={{
                          key: province?.value,
                        }}
                        name="city"
                        width="sm"
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng nhập thành phố của bạn!',
                          },
                        ]}
                        disabled={!province}
                        request={async () => {
                          if (!province?.key) {
                            return [];
                          }
                          return queryCity(province.key || '').then(
                            ({ data }) => {
                              return data.map((item) => {
                                return {
                                  label: item.name,
                                  value: item.id,
                                };
                              });
                            },
                          );
                        }}
                      />
                    );
                  }}
                </ProFormDependency>
              </ProForm.Group>
              <ProFormText
                width="md"
                name="address"
                label="Địa chỉ đường phố"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập địa chỉ đường phố của bạn!',
                  },
                ]}
              />
              <ProFormFieldSet
                name="phone"
                label="Số điện thoại liên hệ"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập số điện thoại liên hệ của bạn!',
                  },
                  {
                    validator: validatorPhone,
                  },
                ]}
              >
                <Input className={styles.area_code} />
                <Input className={styles.phone_number} />
              </ProFormFieldSet>
            </ProForm>
          </div>
          <div className={styles.right}>
            <AvatarView avatar={getAvatarURL()} />
          </div>
        </>
      )}
    </div>
  );
};
export default BaseView;

const AvatarView = ({ avatar }: { avatar: string }) => {
  const { styles } = useStyles();

  return (
    <>
      <div className={styles.avatar_title}>Ảnh đại diện</div>
      <div className={styles.avatar}>
        <img src={avatar} alt="avatar" />
      </div>
      <Upload showUploadList={false}>
        <div className={styles.button_view}>
          <Button>
            <UploadOutlined />
            Thay đổi ảnh đại diện
          </Button>
        </div>
      </Upload>
    </>
  );
};
