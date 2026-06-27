export type UserStatus = 'ACTIVE' | 'DISABLED' | 'LOCKED';

export type RoleName =
  | 'ADMIN'
  | 'EMPLOYEE'
  | 'TEACHER'
  | 'ASSISTANT'
  | 'STUDENT'
  | 'PARENT';

export type UserItem = {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  status: UserStatus;
  roles: string[];
  createdBy?: string;
  createdAt: string;
};

export type UserDetail = UserItem & { permissions: string[] };

export type CreateUserPayload = {
  username: string;
  password: string;
  fullName?: string;
  email?: string;
  phone?: string;
  roles: RoleName[];
  status?: UserStatus;
};

export type UpdateUserPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  roles: RoleName[];
};

export type UserQuery = {
  username?: string;
  fullName?: string;
  phone?: string;
  role?: RoleName;
  status?: UserStatus;
  current?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: string;
};
