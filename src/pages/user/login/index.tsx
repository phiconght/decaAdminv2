import { LockOutlined, UserOutlined } from '@ant-design/icons';
import {
  LoginForm,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import {
  FormattedMessage,
  Helmet,
  SelectLang,
  useIntl,
  useModel,
} from '@umijs/max';
import { Alert, App } from 'antd';
import { createStyles } from 'antd-style';
import React, { startTransition, useState } from 'react';
import { Footer } from '@/components';
import { login, tokenStore } from '@/services/auth';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(({ token }) => {
  return {
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      title={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const { message } = App.useApp();
  const intl = useIntl();

  /**
   * Validate redirect URL to prevent open redirect attacks
   * Only allow same-origin relative paths starting with '/'
   */
  const getSafeRedirectUrl = (redirect: string | null): string => {
    if (!redirect?.startsWith('/')) return '/';

    // Block protocol-relative URLs (//example.com)
    if (redirect.startsWith('//')) return '/';

    try {
      const parsed = new URL(redirect, window.location.origin);
      // Only allow same-origin URLs
      if (parsed.origin !== window.location.origin) return '/';
      // Return the path with query and hash preserved
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return '/';
    }
  };

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      startTransition(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // Goi login cua backend Spring Boot, luu token
      const result = await login({
        username: values.username ?? '',
        password: values.password ?? '',
      });
      tokenStore.set(result.accessToken, result.refreshToken);

      const defaultLoginSuccessMessage = intl.formatMessage({
        id: 'pages.login.success',
        defaultMessage: 'Đăng nhập thành công!',
      });
      message.success(defaultLoginSuccessMessage);
      await fetchUserInfo();
      const urlParams = new URL(window.location.href).searchParams;
      const redirectUrl = getSafeRedirectUrl(urlParams.get('redirect'));
      window.location.href = redirectUrl;
      return;
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: 'Đăng nhập thất bại, vui lòng thử lại!',
      });
      console.log(error);
      message.error(defaultLoginFailureMessage);
      setUserLoginState({ status: 'error' });
    }
  };
  const { status } = userLoginState;

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: 'Trang đăng nhập',
          })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo-deca.png" />}
          title="DecaMath"
          subTitle="Trung tâm giáo dục DecaMath — Cổng quản trị"
          initialValues={{
            autoLogin: true,
          }}
          submitter={{
            searchConfig: {
              submitText: 'Đăng Nhập',
            },
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          {status === 'error' && (
            <LoginMessage content="Tài khoản hoặc mật khẩu không chính xác" />
          )}
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
            }}
            placeholder="Tên đăng nhập"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.username.required"
                    defaultMessage="Vui lòng nhập tên người dùng!"
                  />
                ),
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder="Mật khẩu"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.password.required"
                    defaultMessage="Vui lòng nhập mật khẩu!"
                  />
                ),
              },
            ]}
          />
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage
                id="pages.login.rememberMe"
                defaultMessage="Tự động đăng nhập"
              />
            </ProFormCheckbox>
          </div>
        </LoginForm>
      </div>
      <Footer showMeta={false} />
    </div>
  );
};

export default Login;
