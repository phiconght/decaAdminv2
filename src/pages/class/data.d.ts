export type ClassStatus = 'ACTIVE' | 'INACTIVE';
export type PaymentType = 'PREPAID_COIN' | 'POSTPAID_TRANSFER';
export type DeliveryMode = 'ONLINE' | 'OFFLINE';

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
  teachers: { id: number; username: string; fullName: string }[];
  pricePerSession?: number;
  coinPrice?: number;
  /** Giá trọn gói cho đăng ký tự phục vụ bằng chuyển khoản (khác coinPrice — VND thật, không phải Xu). */
  fullPrice?: number;
  paymentType?: PaymentType;
  deliveryMode?: DeliveryMode;
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
  teacherIds?: number[];
  /** Đơn giá mỗi buổi (VND) — dùng tính lương/công GV, KHÔNG phải giá bán cho HV. */
  pricePerSession?: number;
  /** Giá Xu để HS tự đăng ký (Mobile/Web). Bỏ trống/0 = không mở bán qua Xu. */
  coinPrice?: number;
  /** Giá trọn gói cho đăng ký tự phục vụ bằng chuyển khoản. Bỏ trống = ẩn nút Đăng ký + QR ở Card/trang chi tiết. */
  fullPrice?: number;
  /** Hình thức thanh toán học phí — PREPAID_COIN hoặc POSTPAID_TRANSFER. */
  paymentType?: PaymentType;
  /** Hình thức học, quyết định cách điểm danh — ONLINE hoặc OFFLINE. */
  deliveryMode?: DeliveryMode;
};

export type ClassContent = {
  classId: number;
  title?: string;
  coverImageUrl?: string;
  contentMd?: string;
};

export type ClassQuery = {
  code?: string;
  name?: string;
  subjectId?: number;
  status?: ClassStatus;
  current?: number;
  pageSize?: number;
};
