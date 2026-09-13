import type { ProLayoutProps } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: ProLayoutProps & {
  logo?: string;
} = {
  navTheme: 'light',
  // Cobalt thương hiệu — khớp WEB (`--cobalt`)/MOBILE (`AppColors.brand`),
  // thay vì xanh mặc định của antd (phản hồi người dùng 13/09/2026).
  colorPrimary: '#2E43E8',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'DecaMath',
  logo: '/logo-deca.png',
  iconfontUrl: '',
  token: {
    // Đồng nhất nền với WEB (`--paper`)/MOBILE (`AppColors.paper`) —
    // #FAFAF5, sáng hơn bản mặc định #F5F5F5 của antd Pro (phản hồi người
    // dùng 13/09/2026). Xem WEB/src/global.less và
    // MOBILE/lib/core/theme/app_colors.dart.
    bgLayout: '#FAFAF5',
  },
};

export default Settings;
