import type { Request, Response } from 'express';

const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    fullName: 'Quản trị viên',
    email: 'admin@trungtam.vn',
    phone: '0901234567',
    status: 'ACTIVE',
    roles: ['ADMIN'],
    permissions: ['USER:READ', 'USER:WRITE', 'USER:DELETE'],
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    username: 'gvnguyen',
    fullName: 'Nguyễn Văn A',
    email: 'gva@trungtam.vn',
    phone: '0912345678',
    status: 'ACTIVE',
    roles: ['TEACHER'],
    permissions: ['EXERCISE:READ', 'CLASS:READ'],
    createdBy: 'admin',
    createdAt: '2026-02-10T08:00:00Z',
  },
  {
    id: 3,
    username: 'hvtran',
    fullName: 'Trần Thị B',
    email: 'ttb@trungtam.vn',
    phone: '0923456789',
    status: 'ACTIVE',
    roles: ['STUDENT'],
    permissions: [],
    createdBy: 'admin',
    createdAt: '2026-03-15T09:00:00Z',
  },
  {
    id: 4,
    username: 'nvle',
    fullName: 'Lê Văn C',
    email: 'lvc@trungtam.vn',
    phone: '0934567890',
    status: 'DISABLED',
    roles: ['EMPLOYEE'],
    permissions: ['USER:READ'],
    createdBy: 'admin',
    createdAt: '2026-04-01T10:00:00Z',
  },
];

let nextId = 5;
const users = [...MOCK_USERS];

export default {
  'GET /api/v1/admin/users': (req: Request, res: Response) => {
    const {
      username,
      fullName,
      phone,
      role,
      status,
      current = 1,
      pageSize = 10,
    } = req.query;
    const filtered = users.filter((u) => {
      if (
        username &&
        !u.username.toLowerCase().includes(String(username).toLowerCase())
      )
        return false;
      if (
        fullName &&
        !u.fullName.toLowerCase().includes(String(fullName).toLowerCase())
      )
        return false;
      if (phone && !u.phone.includes(String(phone))) return false;
      if (role && !u.roles.includes(String(role))) return false;
      if (status && u.status !== status) return false;
      return true;
    });
    const total = filtered.length;
    const start = (Number(current) - 1) * Number(pageSize);
    const data = filtered.slice(start, start + Number(pageSize));
    res.json({
      success: true,
      data,
      total,
      timestamp: new Date().toISOString(),
    });
  },

  'GET /api/v1/admin/users/:id': (req: Request, res: Response) => {
    const user = users.find((u) => u.id === Number(req.params.id));
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: { code: 'USER_NOT_FOUND' } });
    return res.json({ success: true, data: user });
  },

  'POST /api/v1/admin/users': (req: Request, res: Response) => {
    const {
      username,
      fullName,
      email,
      phone,
      roles,
      status = 'ACTIVE',
    } = req.body;
    const newUser = {
      id: nextId++,
      username,
      fullName: fullName ?? '',
      email: email ?? '',
      phone: phone ?? '',
      status,
      roles: roles ?? [],
      permissions: [],
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    res.status(201).json({ success: true, data: newUser });
  },

  'PUT /api/v1/admin/users/:id': (req: Request, res: Response) => {
    const idx = users.findIndex((u) => u.id === Number(req.params.id));
    if (idx === -1)
      return res
        .status(404)
        .json({ success: false, error: { code: 'USER_NOT_FOUND' } });
    const { fullName, email, phone, roles } = req.body;
    users[idx] = { ...users[idx], fullName, email, phone, roles };
    return res.json({ success: true, data: users[idx] });
  },

  'PATCH /api/v1/admin/users/:id/status': (req: Request, res: Response) => {
    const idx = users.findIndex((u) => u.id === Number(req.params.id));
    if (idx === -1)
      return res
        .status(404)
        .json({ success: false, error: { code: 'USER_NOT_FOUND' } });
    users[idx].status = req.body.status;
    return res.json({ success: true, data: users[idx] });
  },

  'POST /api/v1/admin/users/:id/reset-password': (
    _req: Request,
    res: Response,
  ) => {
    res.json({ success: true, data: null });
  },

  'DELETE /api/v1/admin/users/:id': (req: Request, res: Response) => {
    const idx = users.findIndex((u) => u.id === Number(req.params.id));
    if (idx === -1)
      return res
        .status(404)
        .json({ success: false, error: { code: 'USER_NOT_FOUND' } });
    users[idx].status = 'DISABLED';
    return res.json({ success: true, data: null });
  },
};
