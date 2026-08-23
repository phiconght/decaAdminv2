import { PageContainer } from '@ant-design/pro-components';
import { history, Outlet, useLocation, useMatch } from '@umijs/max';
import { Input } from 'antd';
import type { FC } from 'react';

type SearchProps = {
  children?: React.ReactNode;
};

const tabList = [
  {
    key: 'articles',
    tab: 'Bài viết',
  },
  {
    key: 'projects',
    tab: 'Dự án',
  },
  {
    key: 'applications',
    tab: 'Ứng dụng',
  },
];

const Search: FC<SearchProps> = () => {
  const location = useLocation();
  const match = useMatch(location.pathname);
  const handleTabChange = (key: string) => {
    const url =
      match?.pathname === '/'
        ? ''
        : match?.pathname.substring(0, match.pathname.lastIndexOf('/'));
    switch (key) {
      case 'articles':
        history.push(`${url}/articles`);
        break;
      case 'applications':
        history.push(`${url}/applications`);
        break;
      case 'projects':
        history.push(`${url}/projects`);
        break;
      default:
        break;
    }
  };

  const handleFormSubmit = (value: string) => {
    // eslint-disable-next-line no-console
    console.log(value);
  };

  const getTabKey = () => {
    const tabKey = location.pathname.substring(
      location.pathname.lastIndexOf('/') + 1,
    );
    if (tabKey && tabKey !== '/') {
      return tabKey;
    }
    return 'articles';
  };

  return (
    <PageContainer
      content={
        <div style={{ textAlign: 'center' }}>
          <Input.Search
            placeholder="Vui lòng nhập"
            enterButton="Tìm kiếm"
            size="large"
            onSearch={handleFormSubmit}
            style={{ maxWidth: 522, width: '100%' }}
          />
        </div>
      }
      tabList={tabList}
      tabActiveKey={getTabKey()}
      onTabChange={handleTabChange}
    >
      <Outlet />
    </PageContainer>
  );
};

export default Search;
