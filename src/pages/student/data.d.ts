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

export type StudentExamStatus =
  | 'CHUA_PHAT_HANH'
  | 'DA_PHAT_HANH'
  | 'DANG_KIEM_TRA'
  | 'DA_LAM'
  | 'QUA_HAN'
  | 'DA_XOA';

export type StudentExamItem = {
  examId: number;
  code: string;
  name: string;
  courses: { id: number; name: string }[];
  publishAt?: string;
  endAt?: string;
  durationMinutes?: number;
  status: StudentExamStatus;
  canView: boolean;
  canTake: boolean;
};

export type GuardianRelationship = 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER';

// Khớp RelativeItem.java (BE)
export type RelativeItem = {
  id: number;
  username: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  relationship?: GuardianRelationship | null;
};

export type UserQuery = {
  username?: string;
  fullName?: string;
  phone?: string;
  role?: RoleName;
  status?: UserStatus;
  classId?: number;
  current?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: string;
};
