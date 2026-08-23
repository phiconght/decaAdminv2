export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'Đăng nhập',
        path: '/user/login',
        component: './user/login',
      },
    ],
  },
  {
    path: '/welcome',
    name: 'Chào mừng',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/admin',
    name: 'Trang quản lý',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      {
        path: '/admin',
        redirect: '/admin/sub-page',
      },
      {
        path: '/admin/sub-page',
        name: 'Trang quản lý cấp 2',
        component: './Admin',
      },
    ],
  },
  {
    name: 'Bảng truy vấn',
    icon: 'table',
    path: '/list',
    component: './table-list',
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    component: './exception/404',
    layout: false,
    path: './*',
  },
];
