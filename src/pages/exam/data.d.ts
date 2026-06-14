export type ExamType = 'BY_CLASS' | 'SUPPLEMENTARY';
export type ExamStatus = 'ACTIVE' | 'INACTIVE';

export type ExamItem = {
  id: number;
  code: string;
  name: string;
  subjectId: number;
  subjectName: string;
  gradeLevel: string;
  type: ExamType;
  durationMinutes?: number;
  publishAt?: string;
  endAt?: string;
  status: ExamStatus;
  exerciseCount: number;
  classCount: number;
  studentCount: number;
  createdBy: string;
  createdAt: string;
};

export type TfItemScoreLine = {
  tfItemId: number;
  text: string;
  points: number;
};

export type ExamExerciseLine = {
  examExerciseId?: number;
  exerciseId: number;
  code: string;
  title?: string;
  type: string;
  sortOrder: number;
  points?: number;
  itemScores?: TfItemScoreLine[];
};

export type ClassRef = {
  id: number;
  code: string;
  name: string;
};

export type StudentOption = {
  id: number;
  username: string;
  fullName: string;
};

export type ExamDetailView = {
  id: number;
  code: string;
  name: string;
  subjectId: number;
  subjectName: string;
  gradeLevel: string;
  type: ExamType;
  durationMinutes?: number;
  publishAt?: string;
  endAt?: string;
  status: ExamStatus;
  exercises: ExamExerciseLine[];
  classes: ClassRef[];
  students: StudentOption[];
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string;
};

export type ExamQuery = {
  code?: string;
  name?: string;
  subjectId?: number;
  type?: ExamType;
  status?: ExamStatus;
  current?: number;
  pageSize?: number;
};

export type ExamPayload = {
  name: string;
  subjectId: number;
  type: ExamType;
  durationMinutes?: number;
  publishAt?: string;
  endAt?: string;
  status: ExamStatus;
  exercises: {
    exerciseId: number;
    sortOrder: number;
    points?: number;
    itemScores?: { tfItemId: number; points: number }[];
  }[];
  classIds: number[];
  studentIds?: number[];
};
