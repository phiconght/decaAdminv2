/**
 * Service xac thuc — noi vao backend Spring Boot (Auth + RBAC).
 * Tach rieng khoi src/services/ant-design-pro/ (vung auto-generated, khong duoc sua).
 */
import { request } from '@umijs/max';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  set: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

/** Bao response chung cua backend */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
}

export interface BackendUser {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  fullName?: string;
  status: string;
  roles: string[];
  permissions: string[];
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: BackendUser;
}

/** POST /api/v1/auth/login */
export async function login(body: { username: string; password: string }) {
  const res = await request<ApiResponse<TokenResponse>>('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
    skipErrorHandler: true,
  });
  return res.data;
}

/** GET /api/v1/auth/me */
export async function getMe() {
  const res = await request<ApiResponse<BackendUser>>('/api/v1/auth/me', {
    method: 'GET',
    skipErrorHandler: true,
  });
  return res.data;
}

/** POST /api/v1/auth/logout — thu hoi refresh token, xoa token cuc bo */
export async function logout() {
  const refreshToken = tokenStore.getRefresh();
  if (refreshToken) {
    try {
      await request('/api/v1/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: { refreshToken },
        skipErrorHandler: true,
      });
    } catch {
      // bo qua loi mang khi dang xuat
    }
  }
  tokenStore.clear();
}

/** Map user cua backend sang dinh dang CurrentUser ma ProLayout dung */
export function toCurrentUser(user: BackendUser): API.CurrentUser {
  return {
    name: user.fullName || user.username,
    userid: String(user.id),
    access: user.roles.includes('ADMIN') ? 'admin' : 'user',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    email: user.email,
    roles: user.roles,
    permissions: user.permissions,
  } as API.CurrentUser;
}
