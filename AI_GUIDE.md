# AI_GUIDE — Web Admin (ADMIN)

> Tài liệu ngữ cảnh cho AI/dev tiếp nhận. Đọc xong là đủ để code tiếp web admin.
> Đọc kèm `CLAUDE.md` (quy ước gốc của Ant Design Pro). File này tập trung phần **đã chỉnh để nối backend**.

## 1. Đây là gì
Web quản trị cho hệ thống quản lý trung tâm đào tạo, dựng từ **Ant Design Pro** (template React enterprise). Đã **gỡ mock và nối vào backend thật** (`BE/`, Spring Boot, port 9090). Hiện chạy được luồng **đăng nhập thật** bằng tài khoản của BE.

## 2. Công nghệ
| Thành phần | Lựa chọn |
|---|---|
| Framework | React + **UmiJS Max v4** (`@umijs/max`) |
| UI | Ant Design (antd) v6 + ProComponents v3 |
| Ngôn ngữ | TypeScript (strict) |
| Data/request | `request` của Umi (axios bên dưới), `@tanstack/react-query` |
| Lint/format | **Biome** (KHÔNG dùng ESLint/Prettier) |
| Runtime | Node ≥ 22, package-lock.json (npm) |

**Port: 8000.** Backend: **9090** (qua proxy `/api/v1`).

## 3. Cách chạy
```bash
npm install            # lần đầu
npm run dev            # chạy KHÔNG mock, nối BE thật  <-- DÙNG CÁI NÀY
# npm start           # chạy CÓ mock (UMI_ENV=dev, MOCK bật) - không nối BE
```
- Mở `http://localhost:8000`, đăng nhập **`admin` / `Admin@123`** (tab "账户密码登录" = tài khoản/mật khẩu).
- Yêu cầu **BE đang chạy ở 9090** (xem `BE/AI_GUIDE.md`).

## 4. Các file ĐÃ CHỈNH để nối BE (quan trọng nhất)
| File | Vai trò |
|---|---|
| `config/proxy.ts` | Proxy `dev`: `/api/v1/` → `http://localhost:9090` (đổi đây nếu BE đổi port) |
| `src/services/auth.ts` | **Service tự viết** — `login` / `getMe` / `logout` + `tokenStore` (localStorage) + `toCurrentUser` (map user BE → CurrentUser của ProLayout) |
| `src/requestErrorConfig.ts` | `requestInterceptors` gắn `Authorization: Bearer <access_token>` cho mọi request |
| `src/app.tsx` | `getInitialState.fetchUserInfo` gọi `getMe()` (`/api/v1/auth/me`) thay cho mock `/api/currentUser` |
| `src/pages/User/Login/index.tsx` | `handleSubmit` gọi `login` của BE, lưu token, rồi `fetchUserInfo` + redirect |
| `src/components/RightContent/AvatarDropdown.tsx` | Logout gọi `logout()` (`/api/v1/auth/logout`) + xóa token |
| `src/access.ts` | `canAdmin = currentUser.access === 'admin'` (map từ role `ADMIN` trong `toCurrentUser`) |

## 5. Luồng đăng nhập (cách đi luồng)
```
LoginPage (src/pages/User/Login/index.tsx)
  -> handleSubmit -> services/auth.ts login()  -> POST /api/v1/auth/login (proxy -> BE 9090)
  -> tokenStore.set(access, refresh)            (localStorage)
  -> fetchUserInfo() [initialState.fetchUserInfo trong app.tsx]
       -> services/auth.ts getMe() -> GET /api/v1/auth/me  (interceptor tự gắn Bearer)
       -> toCurrentUser(user)  (role ADMIN -> access:'admin')
  -> setInitialState({ currentUser }) -> redirect
ProLayout đọc initialState.currentUser; access.ts quyết định quyền hiển thị menu/route.
```
Response BE dạng `{ success, data, error }` — service đọc `res.data`.

## 6. Map dữ liệu BE ↔ FE
- BE `user` = `{ id, username, fullName, email, status, roles[], permissions[] }`.
- `toCurrentUser` (trong `src/services/auth.ts`) chuyển sang `API.CurrentUser` của ProLayout: `name`, `userid`, `avatar`, `access` (`'admin'` nếu có role `ADMIN`, ngược lại `'user'`), kèm `roles`/`permissions`.
- Muốn phân quyền theo nhiều vai trò hơn: sửa `src/access.ts` (vd `canTeacher = currentUser.roles?.includes('TEACHER')`) và dùng field `access` trong `config/routes.ts`.

## 7. Cách THÊM một trang mới có gọi API BE
1. Khai báo route trong `config/routes.ts` (field `name` → key i18n trong `src/locales/`, field `access` để gắt quyền).
2. Tạo thư mục trang `src/pages/<Ten>/` với `index.tsx` (+ `service.ts` cho API riêng, `_mock.ts` chỉ khi cần).
3. Viết API ở **`service.ts` của trang** (hoặc thêm vào `src/services/` tự viết) — gọi `request('/api/v1/...')`. Interceptor đã tự gắn token.
4. **KHÔNG sửa `src/services/ant-design-pro/`** (auto-generated từ OpenAPI; muốn đổi thì `npm run openapi`).
5. Dữ liệu bảng: dùng prop `request` của `ProTable` trả `{ data, total, success }`.

## 8. Quy ước & lưu ý (bắt buộc)
- **Biome only**: `npm run lint` và `npx antd lint ./src` phải pass trước khi commit. `npm run tsc` để type-check.
- **`npx antd info <Component>` trước khi viết code antd** — đừng đoán API.
- Conventional commits (commitlint enforced).
- **KHÔNG sửa `src/services/ant-design-pro/`** (vùng auto-gen).
- Token lưu ở `localStorage` key `access_token` / `refresh_token`. Khi token hết hạn, request `me` sẽ 401 → `getInitialState` redirect về `/user/login` (đã xử lý). **Chưa có auto-refresh** access token — có thể bổ sung interceptor gọi `/auth/refresh` khi 401.
- Trang login còn vài label tiếng Trung (tab) — dọn i18n nếu cần.
- Git remote: `https://github.com/phiconght/decaAdminv2`.
