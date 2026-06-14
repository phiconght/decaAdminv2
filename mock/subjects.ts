import type { Request, Response } from 'express';

const SUBJECTS = [
  { id: 1,  code: 'LTO06T', name: 'Toán',       gradeLevel: 'Khối 6'  },
  { id: 2,  code: 'LTO07T', name: 'Toán',       gradeLevel: 'Khối 7'  },
  { id: 3,  code: 'LTO08T', name: 'Toán',       gradeLevel: 'Khối 8'  },
  { id: 4,  code: 'LTO09T', name: 'Toán',       gradeLevel: 'Khối 9'  },
  { id: 5,  code: 'LTO10T', name: 'Toán',       gradeLevel: 'Khối 10' },
  { id: 6,  code: 'LTO11T', name: 'Toán',       gradeLevel: 'Khối 11' },
  { id: 7,  code: 'LTO12T', name: 'Toán',       gradeLevel: 'Khối 12' },
  { id: 8,  code: 'LLY06T', name: 'Vật lý',    gradeLevel: 'Khối 6'  },
  { id: 9,  code: 'LLY07T', name: 'Vật lý',    gradeLevel: 'Khối 7'  },
  { id: 10, code: 'LLY08T', name: 'Vật lý',    gradeLevel: 'Khối 8'  },
  { id: 11, code: 'LLY09T', name: 'Vật lý',    gradeLevel: 'Khối 9'  },
  { id: 12, code: 'LLY10T', name: 'Vật lý',    gradeLevel: 'Khối 10' },
  { id: 13, code: 'LLY11T', name: 'Vật lý',    gradeLevel: 'Khối 11' },
  { id: 14, code: 'LLY12T', name: 'Vật lý',    gradeLevel: 'Khối 12' },
  { id: 15, code: 'LHO06T', name: 'Hóa học',   gradeLevel: 'Khối 6'  },
  { id: 16, code: 'LHO07T', name: 'Hóa học',   gradeLevel: 'Khối 7'  },
  { id: 17, code: 'LHO08T', name: 'Hóa học',   gradeLevel: 'Khối 8'  },
  { id: 18, code: 'LHO09T', name: 'Hóa học',   gradeLevel: 'Khối 9'  },
  { id: 19, code: 'LHO10T', name: 'Hóa học',   gradeLevel: 'Khối 10' },
  { id: 20, code: 'LHO11T', name: 'Hóa học',   gradeLevel: 'Khối 11' },
  { id: 21, code: 'LHO12T', name: 'Hóa học',   gradeLevel: 'Khối 12' },
  { id: 22, code: 'LVA06T', name: 'Ngữ văn',   gradeLevel: 'Khối 6'  },
  { id: 23, code: 'LVA07T', name: 'Ngữ văn',   gradeLevel: 'Khối 7'  },
  { id: 24, code: 'LVA08T', name: 'Ngữ văn',   gradeLevel: 'Khối 8'  },
  { id: 25, code: 'LVA09T', name: 'Ngữ văn',   gradeLevel: 'Khối 9'  },
  { id: 26, code: 'LVA10T', name: 'Ngữ văn',   gradeLevel: 'Khối 10' },
  { id: 27, code: 'LVA11T', name: 'Ngữ văn',   gradeLevel: 'Khối 11' },
  { id: 28, code: 'LVA12T', name: 'Ngữ văn',   gradeLevel: 'Khối 12' },
  { id: 29, code: 'LAN06T', name: 'Tiếng Anh', gradeLevel: 'Khối 6'  },
  { id: 30, code: 'LAN07T', name: 'Tiếng Anh', gradeLevel: 'Khối 7'  },
  { id: 31, code: 'LAN08T', name: 'Tiếng Anh', gradeLevel: 'Khối 8'  },
  { id: 32, code: 'LAN09T', name: 'Tiếng Anh', gradeLevel: 'Khối 9'  },
  { id: 33, code: 'LAN10T', name: 'Tiếng Anh', gradeLevel: 'Khối 10' },
  { id: 34, code: 'LAN11T', name: 'Tiếng Anh', gradeLevel: 'Khối 11' },
  { id: 35, code: 'LAN12T', name: 'Tiếng Anh', gradeLevel: 'Khối 12' },
  { id: 36, code: 'LSI06T', name: 'Sinh học',  gradeLevel: 'Khối 6'  },
  { id: 37, code: 'LSI07T', name: 'Sinh học',  gradeLevel: 'Khối 7'  },
  { id: 38, code: 'LSI08T', name: 'Sinh học',  gradeLevel: 'Khối 8'  },
  { id: 39, code: 'LSI09T', name: 'Sinh học',  gradeLevel: 'Khối 9'  },
  { id: 40, code: 'LSI10T', name: 'Sinh học',  gradeLevel: 'Khối 10' },
  { id: 41, code: 'LSI11T', name: 'Sinh học',  gradeLevel: 'Khối 11' },
  { id: 42, code: 'LSI12T', name: 'Sinh học',  gradeLevel: 'Khối 12' },
  { id: 43, code: 'LTI06T', name: 'Tin học',   gradeLevel: 'Khối 6'  },
  { id: 44, code: 'LTI07T', name: 'Tin học',   gradeLevel: 'Khối 7'  },
  { id: 45, code: 'LTI08T', name: 'Tin học',   gradeLevel: 'Khối 8'  },
  { id: 46, code: 'LTI09T', name: 'Tin học',   gradeLevel: 'Khối 9'  },
  { id: 47, code: 'LTI10T', name: 'Tin học',   gradeLevel: 'Khối 10' },
  { id: 48, code: 'LTI11T', name: 'Tin học',   gradeLevel: 'Khối 11' },
  { id: 49, code: 'LTI12T', name: 'Tin học',   gradeLevel: 'Khối 12' },
];

export default {
  'GET /api/v1/subjects': (req: Request, res: Response) => {
    const {
      code,
      gradeLevel,
      current = '1',
      pageSize = '10',
    } = req.query as Record<string, string>;

    let list = [...SUBJECTS];
    if (code)
      list = list.filter((s) =>
        s.code.toLowerCase().includes(code.toLowerCase()),
      );
    if (gradeLevel) list = list.filter((s) => s.gradeLevel === gradeLevel);

    const total = list.length;
    const start = (Number(current) - 1) * Number(pageSize);
    const data = list.slice(start, start + Number(pageSize));

    res.json({ success: true, data, total });
  },

  'GET /api/v1/subjects/:id': (req: Request, res: Response) => {
    const item = SUBJECTS.find((s) => s.id === Number(req.params.id));
    if (!item) {
      res.status(404).json({ success: false });
      return;
    }
    res.json({ success: true, data: item });
  },
};
