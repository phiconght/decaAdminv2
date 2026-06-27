// Cơ sở (Branch)
export type BranchItem = {
  id: number;
  code: string;
  name: string;
  address?: string;
  active: boolean;
};

export type BranchForm = {
  code: string;
  name: string;
  address?: string;
  active?: boolean;
};

// Phòng (Room)
export type RoomItem = {
  id: number;
  code: string;
  name: string;
  branchId: number;
  branchName: string;
  capacity?: number;
  note?: string;
  active: boolean;
};

export type RoomForm = {
  code: string;
  name: string;
  branchId: number;
  capacity?: number;
  note?: string;
  active?: boolean;
};

export type RoomQuery = {
  branchId?: number;
  keyword?: string;
  active?: boolean;
  current?: number;
  pageSize?: number;
};

// Ngày nghỉ (Holiday)
export type HolidayItem = {
  id: number;
  holidayDate: string;
  name: string;
  branchId?: number | null;
  branchName?: string | null;
};

export type HolidayForm = {
  holidayDate: string;
  name: string;
  branchId?: number; // undefined = toàn hệ thống
};

export type HolidayQuery = {
  from: string;
  to: string;
};
