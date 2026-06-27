export type ExerciseStatus = 'ACTIVE' | 'INACTIVE';

export type ExerciseType = 'MULTIPLE_CHOICE' | 'ESSAY' | 'TRUE_FALSE';

export type ExerciseDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

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
  topicId?: number;
  topicName?: string;
  type: string;
  difficulty: ExerciseDifficulty;
  createdBy: string;
  createdAt: string;
  status: ExerciseStatus;
};

/** Payload tạo bài tập. Mã bài do BE tự sinh. */
export type ExerciseDetail = {
  title?: string;
  subjectId: number;
  topicId?: number;
  difficulty: ExerciseDifficulty;
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
  topicId?: number;
  topicName?: string;
  type: ExerciseType;
  difficulty: ExerciseDifficulty;
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
  topicId?: number;
  difficulty?: ExerciseDifficulty;
  createdBy?: string;
  createdFrom?: string;
  createdTo?: string;
  status?: ExerciseStatus;
  current?: number;
  pageSize?: number;
};
