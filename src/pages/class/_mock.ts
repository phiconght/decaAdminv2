import type { Request, Response } from 'express';
import type { ClassItem, StudentOption } from './data';

let nextId = 5;

// Học sinh đã ghi danh vào từng lớp: classId -> userId[]
const classStudentMap: Record<string, number[]> = {
  '1': [10, 11],
  '2': [12],
  '3': [],
  '4': [10, 13, 14],
};

// Pool học sinh có thể thêm
const ALL_STUDENTS: StudentOption[] = [
  { id: 10, username: 'sv001', fullName: 'Nguyễn Văn An' },
  { id: 11, username: 'sv002', fullName: 'Trần Thị Bình' },
  { id: 12, username: 'sv003', fullName: 'Lê Văn Cường' },
  { id: 13, username: 'sv004', fullName: 'Phạm Thị Dung' },
  { id: 14, username: 'sv005', fullName: 'Hoàng Văn Em' },
  { id: 15, username: 'sv006', fullName: 'Đặng Thị Fương' },
];

const mockData: ClassItem[] = [
  {
    id: '1',
    code: 'CTO10-00001L',
    name: '10A1',
    subjectId: 5,
    subjectName: 'Toán',
    gradeLevel: 'Khối 10',
    startDate: '2025-09-01',
    endDate: '2026-05-31',
    status: 'ACTIVE',
    studentCount: 2,
    examCount: 2,
    createdBy: 'admin',
    createdAt: '2025-08-20T08:00:00Z',
  },
  {
    id: '2',
    code: 'CLY11-00001L',
    name: '11B1',
    subjectId: 12,
    subjectName: 'Vật lý',
    gradeLevel: 'Khối 11',
    startDate: '2025-09-01',
    endDate: '2026-05-31',
    status: 'ACTIVE',
    studentCount: 1,
    examCount: 0,
    createdBy: 'admin',
    createdAt: '2025-08-21T09:00:00Z',
  },
  {
    id: '3',
    code: 'CAN09-00001L',
    name: '9A2',
    subjectId: 32,
    subjectName: 'Tiếng Anh',
    gradeLevel: 'Khối 9',
    startDate: '2025-09-05',
    endDate: '2026-05-30',
    status: 'INACTIVE',
    studentCount: 0,
    examCount: 0,
    createdBy: 'teacher01',
    createdAt: '2025-08-22T10:00:00Z',
  },
  {
    id: '4',
    code: 'CTO12-00001L',
    name: '12A1',
    subjectId: 7,
    subjectName: 'Toán',
    gradeLevel: 'Khối 12',
    startDate: '2025-09-01',
    endDate: '2026-05-31',
    status: 'ACTIVE',
    studentCount: 3,
    examCount: 0,
    createdBy: 'admin',
    createdAt: '2025-08-23T11:00:00Z',
  },
];

export default {
  'GET /api/v1/classes': (req: Request, res: Response) => {
    const {
      code,
      name,
      subjectId,
      status,
      current = '1',
      pageSize = '10',
    } = req.query as Record<string, string>;

    let list = [...mockData];
    if (code)
      list = list.filter((i) =>
        i.code.toLowerCase().includes(code.toLowerCase()),
      );
    if (name)
      list = list.filter((i) =>
        i.name.toLowerCase().includes(name.toLowerCase()),
      );
    if (subjectId) list = list.filter((i) => i.subjectId === Number(subjectId));
    if (status) list = list.filter((i) => i.status === status);

    const total = list.length;
    const start = (Number(current) - 1) * Number(pageSize);
    const data = list.slice(start, start + Number(pageSize));

    res.json({ success: true, data, total });
  },

  'GET /api/v1/classes/:id': (req: Request, res: Response) => {
    const item = mockData.find((i) => i.id === String(req.params.id));
    if (!item) {
      res.status(404).json({ success: false });
      return;
    }
    res.json({ success: true, data: item });
  },

  'POST /api/v1/classes': (req: Request, res: Response) => {
    const body = req.body ?? {};
    const item: ClassItem = {
      id: String(++nextId),
      code: `C-${String(nextId).padStart(5, '0')}L`,
      name: body.name ?? '',
      subjectId: body.subjectId ?? 1,
      subjectName: 'Toán',
      gradeLevel: 'Khối 10',
      startDate: body.startDate ?? '',
      endDate: body.endDate ?? '',
      status: body.status ?? 'ACTIVE',
      studentCount: 0,
      examCount: 0,
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
    };
    mockData.unshift(item);
    res.status(201).json({ success: true, data: item });
  },

  'PATCH /api/v1/classes/:id/status': (req: Request, res: Response) => {
    const item = mockData.find((i) => i.id === String(req.params.id));
    if (!item) {
      res.status(404).json({ success: false });
      return;
    }
    item.status = req.body.status;
    res.json({ success: true });
  },

  // ── Enrollment endpoints ──────────────────────────────────────────

  'GET /api/v1/classes/:id/students': (req: Request, res: Response) => {
    const id = String(req.params.id);
    const enrolled = (classStudentMap[id] ?? [])
      .map((uid) => ALL_STUDENTS.find((s) => s.id === uid))
      .filter(Boolean);
    res.json({
      success: true,
      data: enrolled,
      total: enrolled.length,
      timestamp: new Date().toISOString(),
    });
  },

  'GET /api/v1/classes/:id/eligible-students': (
    req: Request,
    res: Response,
  ) => {
    const id = String(req.params.id);
    const { keyword = '' } = req.query as Record<string, string>;
    const enrolled = new Set(classStudentMap[id] ?? []);
    const eligible = ALL_STUDENTS.filter(
      (s) =>
        !enrolled.has(s.id) &&
        (keyword === '' ||
          s.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
          s.username.toLowerCase().includes(keyword.toLowerCase())),
    );
    res.json({
      success: true,
      data: eligible,
      total: eligible.length,
      timestamp: new Date().toISOString(),
    });
  },

  'POST /api/v1/classes/:id/students': (req: Request, res: Response) => {
    const id = String(req.params.id);
    const { studentIds = [] } = req.body as { studentIds: number[] };
    if (!classStudentMap[id]) classStudentMap[id] = [];
    for (const uid of studentIds) {
      if (!classStudentMap[id].includes(uid)) classStudentMap[id].push(uid);
    }
    const item = mockData.find((i) => i.id === id);
    if (item) item.studentCount = classStudentMap[id].length;
    res.json({
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    });
  },

  'DELETE /api/v1/classes/:id/students/:userId': (
    req: Request,
    res: Response,
  ) => {
    const id = String(req.params.id);
    const userId = Number(req.params.userId);
    if (classStudentMap[id]) {
      classStudentMap[id] = classStudentMap[id].filter((uid) => uid !== userId);
    }
    const item = mockData.find((i) => i.id === id);
    if (item) item.studentCount = (classStudentMap[id] ?? []).length;
    res.json({
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    });
  },
};
