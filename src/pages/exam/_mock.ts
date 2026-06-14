import type { Request, Response } from 'express';

const EXAMS = [
  {
    id: 1,
    code: 'D-TOA-10-L-001',
    name: 'Đề kiểm tra giữa kỳ 1',
    subjectId: 5,
    subjectName: 'Toán',
    gradeLevel: 'Khối 10',
    type: 'BY_CLASS',
    durationMinutes: 45,
    publishAt: '2025-10-15T07:00:00.000Z',
    endAt: '2025-10-15T08:00:00.000Z',
    status: 'ACTIVE',
    exerciseCount: 3,
    classCount: 1,
    classIds: [1],
    createdBy: 'admin',
    createdAt: '2025-09-01T00:00:00.000Z',
  },
  {
    id: 2,
    code: 'D-TOA-10-B-002',
    name: 'Đề bổ sung cho học sinh yếu',
    subjectId: 5,
    subjectName: 'Toán',
    gradeLevel: 'Khối 10',
    type: 'SUPPLEMENTARY',
    durationMinutes: 30,
    publishAt: null,
    endAt: null,
    status: 'INACTIVE',
    exerciseCount: 1,
    classCount: 1,
    classIds: [1],
    createdBy: 'admin',
    createdAt: '2025-09-10T00:00:00.000Z',
  },
];

const EXAM_DETAIL = {
  id: 1,
  code: 'D-TOA-10-L-001',
  name: 'Đề kiểm tra giữa kỳ 1',
  subjectId: 5,
  subjectName: 'Toán',
  gradeLevel: 'Khối 10',
  type: 'BY_CLASS',
  durationMinutes: 45,
  publishAt: '2025-10-15T07:00:00.000Z',
  endAt: '2025-10-15T08:00:00.000Z',
  status: 'ACTIVE',
  createdBy: 'admin',
  createdAt: '2025-09-01T00:00:00.000Z',
  exercises: [
    {
      exerciseId: 1,
      code: 'BTO10-00001N',
      title: 'Phương trình bậc 2 – Trắc nghiệm',
      type: 'MULTIPLE_CHOICE',
      sortOrder: 0,
      points: 3,
      itemScores: [],
    },
    {
      exerciseId: 2,
      code: 'BTO10-00002L',
      title: 'Hàm số bậc 2 – Tự luận',
      type: 'ESSAY',
      sortOrder: 1,
      points: 5,
      itemScores: [],
    },
    {
      exerciseId: 3,
      code: 'BTO10-00003D',
      title: 'Bất phương trình – Đúng/Sai',
      type: 'TRUE_FALSE',
      sortOrder: 2,
      points: null,
      itemScores: [
        { tfItemId: 1, text: 'x + 1 > 0 thì x > −1', points: 1 },
        { tfItemId: 2, text: 'x² ≥ 0 với mọi x thực', points: 1 },
        { tfItemId: 3, text: '|x| < 0 vô nghiệm', points: 1 },
      ],
    },
  ],
  classes: [{ id: 1, code: 'CTO10-00001L', name: '10A1' }],
  students: [],
};

const STUDENT_OPTIONS = [
  { id: 10, username: 'sv001', fullName: 'Nguyễn Văn An' },
  { id: 11, username: 'sv002', fullName: 'Trần Thị Bình' },
  { id: 12, username: 'sv003', fullName: 'Lê Văn Cường' },
];

let nextId = 3;

export default {
  'GET /api/v1/exams': (req: Request, res: Response) => {
    const {
      status,
      type,
      code,
      name,
      classId,
      current = 1,
      pageSize = 10,
    } = req.query as Record<string, string>;
    let data = [...EXAMS];
    if (status) data = data.filter((e) => e.status === status);
    if (type) data = data.filter((e) => e.type === type);
    if (code) data = data.filter((e) => e.code.includes(String(code)));
    if (name) data = data.filter((e) => e.name.includes(String(name)));
    if (classId)
      data = data.filter((e) => (e.classIds ?? []).includes(Number(classId)));
    const start = (Number(current) - 1) * Number(pageSize);
    res.json({
      success: true,
      data: data.slice(start, start + Number(pageSize)),
      total: data.length,
      timestamp: new Date().toISOString(),
    });
  },

  'GET /api/v1/exams/:id': (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (id === 1) {
      res.json({
        success: true,
        data: EXAM_DETAIL,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    const found = EXAMS.find((e) => e.id === id);
    if (!found) {
      res.status(404).json({
        success: false,
        error: { code: 'EXAM_NOT_FOUND', message: 'Không tìm thấy đề thi' },
      });
      return;
    }
    res.json({
      success: true,
      data: {
        ...EXAM_DETAIL,
        ...found,
        exercises: [],
        classes: [],
        students: [],
      },
      timestamp: new Date().toISOString(),
    });
  },

  'POST /api/v1/exams': (req: Request, res: Response) => {
    const body = req.body ?? {};
    const newExam = {
      id: nextId++,
      code: `D-TOA-10-${body.type === 'SUPPLEMENTARY' ? 'B' : 'L'}-${String(nextId).padStart(3, '0')}`,
      name: body.name ?? 'Đề mới',
      subjectId: body.subjectId ?? 1,
      subjectName: 'Toán',
      gradeLevel: 'Lớp 10',
      type: body.type ?? 'BY_CLASS',
      durationMinutes: body.durationMinutes ?? null,
      publishAt: body.publishAt ?? null,
      endAt: body.endAt ?? null,
      status: body.status ?? 'ACTIVE',
      exerciseCount: (body.exercises ?? []).length,
      classCount: (body.classIds ?? []).length,
      classIds: (body.classIds ?? []) as number[],
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
    };
    EXAMS.push(newExam);
    res.json({
      success: true,
      data: { ...newExam, exercises: [], classes: [], students: [] },
      timestamp: new Date().toISOString(),
    });
  },

  'PUT /api/v1/exams/:id': (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const idx = EXAMS.findIndex((e) => e.id === id);
    if (idx === -1) {
      res.status(404).json({
        success: false,
        error: { code: 'EXAM_NOT_FOUND', message: 'Không tìm thấy đề thi' },
      });
      return;
    }
    const body = req.body ?? {};
    Object.assign(EXAMS[idx], {
      name: body.name ?? EXAMS[idx].name,
      type: body.type ?? EXAMS[idx].type,
      durationMinutes: body.durationMinutes ?? EXAMS[idx].durationMinutes,
      publishAt: body.publishAt ?? EXAMS[idx].publishAt,
      endAt: body.endAt ?? EXAMS[idx].endAt,
      status: body.status ?? EXAMS[idx].status,
      exerciseCount: (body.exercises ?? []).length,
      classCount: (body.classIds ?? []).length,
    });
    res.json({
      success: true,
      data: { ...EXAMS[idx], exercises: [], classes: [], students: [] },
      timestamp: new Date().toISOString(),
    });
  },

  'PATCH /api/v1/exams/:id/status': (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const idx = EXAMS.findIndex((e) => e.id === id);
    if (idx === -1) {
      res
        .status(404)
        .json({ success: false, error: { code: 'EXAM_NOT_FOUND' } });
      return;
    }
    EXAMS[idx].status = req.body?.status ?? EXAMS[idx].status;
    res.json({
      success: true,
      data: EXAMS[idx],
      timestamp: new Date().toISOString(),
    });
  },

  'DELETE /api/v1/exams/:id': (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const idx = EXAMS.findIndex((e) => e.id === id);
    if (idx !== -1) EXAMS.splice(idx, 1);
    res.json({
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    });
  },

  'GET /api/v1/exams/student-options': (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: STUDENT_OPTIONS,
      timestamp: new Date().toISOString(),
    });
  },
};
