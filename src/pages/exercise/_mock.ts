import type { Request, Response } from 'express';
import type { ExerciseItem } from './data';

// Mirror subjects.ts — dùng để tra subjectName / gradeLevel khi tạo bài tập
const SUBJECT_MAP: Record<number, { name: string; gradeLevel: string }> = {
  1: { name: 'Toán', gradeLevel: 'Khối 6' },
  2: { name: 'Toán', gradeLevel: 'Khối 7' },
  3: { name: 'Toán', gradeLevel: 'Khối 8' },
  4: { name: 'Toán', gradeLevel: 'Khối 9' },
  5: { name: 'Toán', gradeLevel: 'Khối 10' },
  6: { name: 'Toán', gradeLevel: 'Khối 11' },
  7: { name: 'Toán', gradeLevel: 'Khối 12' },
  8: { name: 'Vật lý', gradeLevel: 'Khối 6' },
  9: { name: 'Vật lý', gradeLevel: 'Khối 7' },
  10: { name: 'Vật lý', gradeLevel: 'Khối 8' },
  11: { name: 'Vật lý', gradeLevel: 'Khối 9' },
  12: { name: 'Vật lý', gradeLevel: 'Khối 10' },
  13: { name: 'Vật lý', gradeLevel: 'Khối 11' },
  14: { name: 'Vật lý', gradeLevel: 'Khối 12' },
  15: { name: 'Hóa học', gradeLevel: 'Khối 6' },
  16: { name: 'Hóa học', gradeLevel: 'Khối 7' },
  17: { name: 'Hóa học', gradeLevel: 'Khối 8' },
  18: { name: 'Hóa học', gradeLevel: 'Khối 9' },
  19: { name: 'Hóa học', gradeLevel: 'Khối 10' },
  20: { name: 'Hóa học', gradeLevel: 'Khối 11' },
  21: { name: 'Hóa học', gradeLevel: 'Khối 12' },
  22: { name: 'Ngữ văn', gradeLevel: 'Khối 6' },
  23: { name: 'Ngữ văn', gradeLevel: 'Khối 7' },
  24: { name: 'Ngữ văn', gradeLevel: 'Khối 8' },
  25: { name: 'Ngữ văn', gradeLevel: 'Khối 9' },
  26: { name: 'Ngữ văn', gradeLevel: 'Khối 10' },
  27: { name: 'Ngữ văn', gradeLevel: 'Khối 11' },
  28: { name: 'Ngữ văn', gradeLevel: 'Khối 12' },
  29: { name: 'Tiếng Anh', gradeLevel: 'Khối 6' },
  30: { name: 'Tiếng Anh', gradeLevel: 'Khối 7' },
  31: { name: 'Tiếng Anh', gradeLevel: 'Khối 8' },
  32: { name: 'Tiếng Anh', gradeLevel: 'Khối 9' },
  33: { name: 'Tiếng Anh', gradeLevel: 'Khối 10' },
  34: { name: 'Tiếng Anh', gradeLevel: 'Khối 11' },
  35: { name: 'Tiếng Anh', gradeLevel: 'Khối 12' },
  36: { name: 'Sinh học', gradeLevel: 'Khối 6' },
  37: { name: 'Sinh học', gradeLevel: 'Khối 7' },
  38: { name: 'Sinh học', gradeLevel: 'Khối 8' },
  39: { name: 'Sinh học', gradeLevel: 'Khối 9' },
  40: { name: 'Sinh học', gradeLevel: 'Khối 10' },
  41: { name: 'Sinh học', gradeLevel: 'Khối 11' },
  42: { name: 'Sinh học', gradeLevel: 'Khối 12' },
  43: { name: 'Tin học', gradeLevel: 'Khối 6' },
  44: { name: 'Tin học', gradeLevel: 'Khối 7' },
  45: { name: 'Tin học', gradeLevel: 'Khối 8' },
  46: { name: 'Tin học', gradeLevel: 'Khối 9' },
  47: { name: 'Tin học', gradeLevel: 'Khối 10' },
  48: { name: 'Tin học', gradeLevel: 'Khối 11' },
  49: { name: 'Tin học', gradeLevel: 'Khối 12' },
};

type DetailData = {
  questionText: string;
  questionImage?: string;
  options?: { text: string; image?: string; isCorrect: boolean }[];
  essayAnswer?: string;
  essayAnswerImage?: string;
  trueFalseItems?: {
    id?: number;
    text: string;
    image?: string;
    answer: boolean;
  }[];
};

// Lưu full content (đề + đáp án) riêng để không làm nặng list
const detailStore: Record<string, DetailData> = {
  '1': {
    questionText: 'Tìm nghiệm của phương trình bậc 2: x² − 5x + 6 = 0',
    options: [
      { text: 'x = 2 và x = 3', isCorrect: true },
      { text: 'x = −2 và x = −3', isCorrect: false },
      { text: 'x = 1 và x = 6', isCorrect: false },
      { text: 'x = 2 và x = −3', isCorrect: false },
    ],
  },
  '2': {
    questionText:
      'Cho hàm số f(x) = x² − 4x + 3. Xác định chiều biến thiên và vẽ đồ thị hàm số trên đoạn [−1; 5].',
    essayAnswer:
      'Hàm số có đỉnh tại x = 2, f(2) = −1.\n' +
      '- Giảm trên (−∞; 2] và tăng trên [2; +∞).\n' +
      '- f(−1) = 8, f(5) = 8.\n' +
      'Đồ thị là parabol mở lên, đỉnh (2; −1), cắt Ox tại x=1 và x=3.',
  },
  '3': {
    questionText:
      'Xác định tính đúng/sai của các mệnh đề sau liên quan đến bất phương trình:',
    trueFalseItems: [
      { id: 1, text: 'x + 1 > 0 thì x > −1', answer: true },
      { id: 2, text: 'x² ≥ 0 với mọi x thực', answer: true },
      { id: 3, text: '|x| < 0 vô nghiệm', answer: true },
      { id: 4, text: 'x² < 0 có nghiệm', answer: false },
    ],
  },
  '4': {
    questionText:
      'Xác định tính đúng/sai của các phát biểu sau về điện từ học:',
    trueFalseItems: [
      {
        id: 1,
        text: 'Điện trường và từ trường là hai mặt của cùng một hiện tượng',
        answer: true,
      },
      {
        id: 2,
        text: 'Lực Lorentz tác dụng lên điện tích chuyển động trong từ trường',
        answer: true,
      },
      {
        id: 3,
        text: 'Từ thông qua mạch kín luôn bằng 0 khi không có nguồn điện',
        answer: false,
      },
    ],
  },
  '5': {
    questionText:
      'Choose the best answer to complete the sentence:\n' +
      '"She ___ to the market when it started raining."',
    options: [
      { text: 'walks', isCorrect: false },
      { text: 'was walking', isCorrect: true },
      { text: 'has walked', isCorrect: false },
      { text: 'walked', isCorrect: false },
    ],
  },
  '6': {
    questionText:
      'Phân tích hình tượng nhân vật trong đoạn trích "Nam quốc sơn hà" — Lý Thường Kiệt.\n' +
      'Nêu giá trị nội dung và nghệ thuật của bài thơ.',
    essayAnswer:
      'Bài thơ khẳng định chủ quyền lãnh thổ qua 2 luận điểm:\n' +
      '1. Núi sông nước Nam là của người Nam — tuyên ngôn độc lập.\n' +
      '2. Kẻ xâm lăng sẽ chuốc thất bại — ý chí quyết chiến bảo vệ Tổ quốc.\n' +
      'Nghệ thuật: thể thất ngôn tứ tuyệt, giọng khẳng định dứt khoát, mang sức mạnh hịch văn.',
  },
};

const mockData: ExerciseItem[] = [
  {
    id: '1',
    code: 'BTO10-00001N',
    title: 'Phương trình bậc 2 – Trắc nghiệm',
    subjectId: 5,
    subjectName: 'Toán',
    gradeLevel: 'Khối 10',
    type: 'MULTIPLE_CHOICE',
    createdBy: 'nguyenvana',
    createdAt: '2026-06-10T08:00:00Z',
    status: 'ACTIVE',
  },
  {
    id: '2',
    code: 'BTO10-00002L',
    title: 'Hàm số bậc 2 – Tự luận',
    subjectId: 5,
    subjectName: 'Toán',
    gradeLevel: 'Khối 10',
    type: 'ESSAY',
    createdBy: 'nguyenvana',
    createdAt: '2026-06-11T09:30:00Z',
    status: 'ACTIVE',
  },
  {
    id: '3',
    code: 'BTO10-00003D',
    title: 'Bất phương trình – Đúng/Sai',
    subjectId: 5,
    subjectName: 'Toán',
    gradeLevel: 'Khối 10',
    type: 'TRUE_FALSE',
    createdBy: 'nguyenvana',
    createdAt: '2026-06-09T14:00:00Z',
    status: 'ACTIVE',
  },
  {
    id: '4',
    code: 'BLY11-00004D',
    title: 'Vật lý điện từ – Bài 3',
    subjectId: 13,
    subjectName: 'Vật lý',
    gradeLevel: 'Khối 11',
    type: 'TRUE_FALSE',
    createdBy: 'phamthid',
    createdAt: '2026-06-08T10:00:00Z',
    status: 'ACTIVE',
  },
  {
    id: '5',
    code: 'BAN12-00005N',
    title: 'Listening Practice – Unit 5',
    subjectId: 35,
    subjectName: 'Tiếng Anh',
    gradeLevel: 'Khối 12',
    type: 'MULTIPLE_CHOICE',
    createdBy: 'tranthib',
    createdAt: '2026-06-07T11:00:00Z',
    status: 'ACTIVE',
  },
  {
    id: '6',
    code: 'BVA11-00006L',
    title: 'Phân tích truyện ngắn Nam Quốc Sơn Hà',
    subjectId: 27,
    subjectName: 'Ngữ văn',
    gradeLevel: 'Khối 11',
    type: 'ESSAY',
    createdBy: 'levanc',
    createdAt: '2026-06-06T09:00:00Z',
    status: 'INACTIVE',
  },
];

let nextId = 7;

export default {
  'GET /api/v1/exercises': (req: Request, res: Response) => {
    const {
      code,
      title,
      subjectId,
      createdBy,
      createdFrom,
      createdTo,
      status,
      current = 1,
      pageSize = 10,
    } = req.query as Record<string, string>;

    let list = [...mockData];

    if (code)
      list = list.filter((i) =>
        i.code.toLowerCase().includes(code.toLowerCase()),
      );
    if (title)
      list = list.filter((i) =>
        (i.title ?? '').toLowerCase().includes(title.toLowerCase()),
      );
    if (subjectId) list = list.filter((i) => i.subjectId === Number(subjectId));
    if (createdBy)
      list = list.filter((i) =>
        i.createdBy.toLowerCase().includes(createdBy.toLowerCase()),
      );
    if (status) list = list.filter((i) => i.status === status);
    if (createdFrom) list = list.filter((i) => i.createdAt >= createdFrom);
    if (createdTo)
      list = list.filter((i) => i.createdAt <= `${createdTo}T23:59:59Z`);

    const total = list.length;
    const start = (Number(current) - 1) * Number(pageSize);
    res.json({
      success: true,
      data: list.slice(start, start + Number(pageSize)),
      total,
    });
  },

  'GET /api/v1/exercises/:id': (req: Request, res: Response) => {
    const item = mockData.find((i) => i.id === String(req.params.id));
    if (!item) {
      res
        .status(404)
        .json({ success: false, error: { code: 'EXERCISE_NOT_FOUND' } });
      return;
    }
    const detail = detailStore[item.id] ?? {};
    // trueFalseItems trả về dạng { id, text } (cho ExercisePickerModal) hoặc { text, answer } (cho ViewExerciseDrawer)
    res.json({
      success: true,
      data: { ...item, ...detail, trueFalseItems: detail.trueFalseItems ?? [] },
      timestamp: new Date().toISOString(),
    });
  },

  'PUT /api/v1/exercises/:id': (req: Request, res: Response) => {
    const id = String(req.params.id);
    const idx = mockData.findIndex((i) => i.id === id);
    if (idx === -1) {
      res
        .status(404)
        .json({ success: false, error: { code: 'EXERCISE_NOT_FOUND' } });
      return;
    }
    const body = req.body ?? {};
    const subject = SUBJECT_MAP[Number(body.subjectId)] ?? {
      name: mockData[idx].subjectName,
      gradeLevel: mockData[idx].gradeLevel,
    };
    mockData[idx] = {
      ...mockData[idx],
      title: body.title ?? mockData[idx].title,
      subjectId: Number(body.subjectId) || mockData[idx].subjectId,
      subjectName: subject.name,
      gradeLevel: subject.gradeLevel,
      type: body.type ?? mockData[idx].type,
      status: body.status ?? mockData[idx].status,
    };
    detailStore[id] = {
      questionText: body.questionText ?? '',
      questionImage: body.questionImage,
      options:
        body.type === 'MULTIPLE_CHOICE' ? (body.options ?? []) : undefined,
      essayAnswer: body.type === 'ESSAY' ? body.essayAnswer : undefined,
      essayAnswerImage:
        body.type === 'ESSAY' ? body.essayAnswerImage : undefined,
      trueFalseItems:
        body.type === 'TRUE_FALSE'
          ? (body.trueFalseItems ?? []).map(
              (item: { text: string; answer: boolean }, i: number) => ({
                ...item,
                id: i + 1,
              }),
            )
          : undefined,
    };
    res.json({
      success: true,
      data: mockData[idx],
      timestamp: new Date().toISOString(),
    });
  },

  'PATCH /api/v1/exercises/:id/status': (req: Request, res: Response) => {
    const id = String(req.params.id);
    const idx = mockData.findIndex((i) => i.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false });
      return;
    }
    mockData[idx].status = req.body?.status ?? mockData[idx].status;
    res.json({
      success: true,
      data: mockData[idx],
      timestamp: new Date().toISOString(),
    });
  },

  'POST /api/v1/exercises': (req: Request, res: Response) => {
    const body = req.body ?? {};
    const id = String(nextId++);
    const subject = SUBJECT_MAP[Number(body.subjectId)] ?? {
      name: 'Không rõ',
      gradeLevel: 'Không rõ',
    };

    // Sinh mã theo pattern: B + 2 ký tự môn + 2 số khối + 5 số thứ tự + suffix loại
    const subjCode =
      subject.name === 'Toán'
        ? 'TO'
        : subject.name === 'Vật lý'
          ? 'LY'
          : subject.name === 'Hóa học'
            ? 'HO'
            : subject.name === 'Ngữ văn'
              ? 'VA'
              : subject.name === 'Tiếng Anh'
                ? 'AN'
                : subject.name === 'Sinh học'
                  ? 'SI'
                  : subject.name === 'Tin học'
                    ? 'TI'
                    : 'XX';
    const gradeNum = subject.gradeLevel.replace('Khối ', '');
    const typeSuffix =
      body.type === 'MULTIPLE_CHOICE' ? 'N' : body.type === 'ESSAY' ? 'L' : 'D';
    const code = `B${subjCode}${gradeNum}-${id.padStart(5, '0')}${typeSuffix}`;

    const item: ExerciseItem = {
      id,
      code,
      title: body.title ?? `Bài tập ${id}`,
      subjectId: Number(body.subjectId) ?? 0,
      subjectName: subject.name,
      gradeLevel: subject.gradeLevel,
      type: body.type ?? 'MULTIPLE_CHOICE',
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      status: body.status ?? 'ACTIVE',
    };

    // Lưu full content vào detailStore
    detailStore[id] = {
      questionText: body.questionText ?? '',
      questionImage: body.questionImage,
      options:
        body.type === 'MULTIPLE_CHOICE' ? (body.options ?? []) : undefined,
      essayAnswer: body.type === 'ESSAY' ? body.essayAnswer : undefined,
      essayAnswerImage:
        body.type === 'ESSAY' ? body.essayAnswerImage : undefined,
      trueFalseItems:
        body.type === 'TRUE_FALSE' ? (body.trueFalseItems ?? []) : undefined,
    };

    mockData.unshift(item);
    res.json({ success: true, data: item });
  },
};
