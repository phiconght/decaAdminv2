export type EnrollmentRequestStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export type EnrollmentRequestItem = {
  id: number;
  classId: number;
  className: string;
  studentId: number;
  studentUsername: string;
  studentFullName: string;
  amount: number;
  registrationCode: string;
  status: EnrollmentRequestStatus;
  createdAt: string;
  confirmedAt?: string;
};
