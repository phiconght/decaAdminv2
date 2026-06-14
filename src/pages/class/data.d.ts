export type ClassStatus = 'ACTIVE' | 'INACTIVE';

export type ClassItem = {
  id: string;
  code: string;
  name: string;
  subjectId: number;
  subjectName: string;
  gradeLevel: string;
  startDate?: string;
  endDate?: string;
  status: ClassStatus;
  studentCount: number;
  examCount: number;
  createdBy: string;
  createdAt: string;
};

export type StudentOption = {
  id: number;
  username: string;
  fullName: string;
};

export type ClassExamItem = {
  id: number;
  code: string;
  name: string;
  type: 'BY_CLASS' | 'SUPPLEMENTARY';
  durationMinutes?: number;
  status: 'ACTIVE' | 'INACTIVE';
};

export type ClassDetail = {
  name: string;
  subjectId: number;
  startDate?: string;
  endDate?: string;
  status: ClassStatus;
};

export type ClassQuery = {
  code?: string;
  name?: string;
  subjectId?: number;
  status?: ClassStatus;
  current?: number;
  pageSize?: number;
};
