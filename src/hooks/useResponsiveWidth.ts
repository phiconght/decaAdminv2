import { Grid } from 'antd';

/**
 * antd Modal đã tự giới hạn `max-width: calc(100vw - 16px)` dưới 767px (screenSMMax),
 * nhưng Drawer thì không — width cố định (px/vw) sẽ tràn màn hình điện thoại.
 * Dùng hook này cho width của DrawerForm/Drawer để tự chuyển full-screen dưới breakpoint `md`.
 */
export function useIsMobile(): boolean {
  const screens = Grid.useBreakpoint();
  return screens.md === false;
}

export function useDrawerWidth(desktopWidth: number | string): number | string {
  const isMobile = useIsMobile();
  return isMobile ? '100%' : desktopWidth;
}
