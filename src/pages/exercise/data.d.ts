export type ExerciseStatus = 'ACTIVE' | 'INACTIVE';

export type ExerciseType = 'MULTIPLE_CHOICE' | 'ESSAY' | 'TRUE_FALSE';

/** 1 đáp án trắc nghiệm */
export type ChoiceOption = {
  text: string;
  image?: string;
  isCorrect: boolean;
};

/** 1 ý câu hỏi Đúng/Sai */
export type TrueFalseItem = {
  text: string;
  image?: string;
  answer: boolean;
};

export type ExerciseItem = {
  id: string;
  code: string;
  title: string;
  subjectId: number;
  subjectName: string;
  gradeLevel: string;
  type: string;
  createdBy: string;
  createdAt: string;
  status: ExerciseStatus;
};

/** Payload tạo bài tập. Mã bài do BE tự sinh. */
export type ExerciseDetail = {
  title?: string;
  subjectId: number;
  status: ExerciseStatus;
  type: ExerciseType;
  questionText: string;
  questionImage?: string;
  // Trắc nghiệm
  options?: ChoiceOption[];
  // Tự luận
  essayAnswer?: string;
  essayAnswerImage?: string;
  // Đúng/Sai
  trueFalseItems?: TrueFalseItem[];
};

/** Chi tiết bài tập đọc từ GET /exercises/{id} */
export type ExerciseDetailView = {
  id: number;
  code: string;
  title: string;
  subjectId: number;
  subjectName: string;
  gradeLevel: string;
  type: ExerciseType;
  status: ExerciseStatus;
  questionText: string;
  questionImage?: string;
  essayAnswer?: string;
  essayAnswerImage?: string;
  options?: ChoiceOption[];
  trueFalseItems?: TrueFalseItem[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
};

export type ExerciseQuery = {
  code?: string;
  subjectId?: number;
  createdBy?: string;
  createdFrom?: string;
  createdTo?: string;
  status?: ExerciseStatus;
  current?: number;
  pageSize?: number;
};
