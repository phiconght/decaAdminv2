// Kiểu dữ liệu học phí + Xu — mirror DTO ở BE
// (com.trungtam.payment.dto.* và com.trungtam.coin.dto.*).

export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED';

// ---- Cấu hình tài khoản nhận tiền ----
export type PaymentSettings = {
  bankBin: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
};

// ---- Giá buổi học (PricingController) ----
export type SessionPriceItem = {
  sessionId: number;
  date: string;
  time: string;
  status: string;
  price: number;
  priceOverridden: boolean;
};

// ---- Giảm giá học viên ----
export type StudentDiscountItem = {
  studentId: number;
  fullName: string;
  username: string;
  discountPercent: number;
};

// ---- Preview đợt thu ----
export type InvoicePreviewItem = {
  studentId: number;
  fullName: string;
  username: string;
  sessionCount: number;
  grossAmount: number;
  discountPercent: number;
  amount: number;
  existingInvoiceId: number | null;
};

// ---- Invoice (danh sách + chi tiết) ----
export type InvoiceItem = {
  id: number;
  studentId: number;
  studentName: string;
  username: string;
  classId: number;
  className: string;
  periodFrom: string;
  periodTo: string;
  sessionCount: number;
  grossAmount: number;
  discountPercent: number;
  amount: number;
  paymentCode: string;
  status: InvoiceStatus;
  confirmedAt: string | null;
  paidAt: string | null;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
};

export type InvoiceLineItem = {
  id: number;
  sessionId: number;
  sessionDate: string;
  price: number;
};

export type InvoiceDetail = InvoiceItem & {
  items: InvoiceLineItem[];
};

export type InvoiceQuery = {
  classId?: number;
  studentId?: number;
  status?: InvoiceStatus;
  current?: number;
  pageSize?: number;
};

// ---- Báo cáo buổi học (PaymentReportController) ----
export type SessionReportSummary = {
  totalSessions: number;
  coMat: number;
  tre: number;
  vang: number;
  coPhep: number;
  chuaCheckin: number;
};

export type StudentSessionRow = {
  date: string;
  className: string;
  startTime: string;
  endTime: string;
  status: string;
  price: number;
};

export type StudentSessionReport = {
  summary: SessionReportSummary;
  items: StudentSessionRow[];
};

// ---- Tùy chọn học viên / khóa cho Select ----
export type ClassOption = {
  id: number;
  code: string;
  name: string;
  subjectName: string;
};

export type UserOption = {
  id: number;
  username: string;
  fullName: string;
};

// ---- Xu học viên (CoinController) ----
export type CoinBalance = {
  userId: number;
  fullName: string;
  username: string;
  balance: number;
};

export type CoinTransactionItem = {
  id: number;
  amount: number;
  balanceAfter: number;
  reason: string;
  createdBy: string | null;
  createdAt: string;
};
