import { User } from '../../types/auth';

export interface Employee extends User {
  position: string;
  divisionId?: string;
  workShiftId?: string;
  nik: string;
  birthPlace: string;
  birthDate: string;
  basicSalary: number;
  qrId: string;
  rfidGuid?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  checkInStatus: 'on-time' | 'late' | 'absent';
  checkOutStatus: 'on-time' | 'early' | 'not-checked-out';
  checkInMethod?: 'qr' | 'photo';
  checkOutMethod?: 'qr' | 'photo';
  checkInPhoto?: string;
  checkOutPhoto?: string;
  attendanceType: 'present' | 'leave' | 'absent';
  leaveRequestId?: string;
  rfidDeviceId?: string;
  rfidDeviceName?: string;
  checkOutRfidDeviceId?: string;
  checkOutRfidDeviceName?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  reason: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface WorkSettings {
  checkInTime: string; // Format: "HH:MM"
  checkOutTime: string; // Format: "HH:MM"
  lateThresholdMinutes: number;
  earlyLeaveThresholdMinutes: number;
  companyLatitude: number;
  companyLongitude: number;
  radiusMeters: number;
}

export interface NotificationState {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export interface UserNotification {
  id: string;
  type: 'leave_approved' | 'leave_rejected' | 'leave_pending' | 'general';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

export interface RfidDevice {
  id: string;
  name: string;
  macAddress: string;
  location: string;
  description?: string;
  isActive: boolean;
  lastActivity?: string;
  createdAt: string;
}

export interface Division {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface WorkShift {
  id: string;
  name: string;
  checkInTime: string;
  checkOutTime: string;
  lateThresholdMinutes: number;
  earlyLeaveThresholdMinutes: number;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  periodStart: string;
  periodEnd: string;
  basicSalary: number;
  workingDays: number;
  attendedDays: number;
  absentDays: number;
  leaveDays: number;
  lateCount: number;
  earlyLeaveCount: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  presentDays: number;
  deductions: {
    absent: number;
    leave: number;
    late: number;
    earlyLeave: number;
    breakdown?: {
      absentDays: number;
      leaveDays: number;
      lateBlocks: number;
      earlyLeaveBlocks: number;
      lateMinutes: number;
      earlyLeaveMinutes: number;
    };
    total: number;
  };
  totalSalary: number;
  status: 'draft' | 'finalized' | 'paid';
  calculationMethod?: 'standard' | 'reverse_attendance';
  attendanceBreakdown?: {
    totalWorkingDays: number;
    initialAbsentDays: number;
    finalAbsentDays: number;
    attendanceRecordsProcessed: number;
  };
  validationResult?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  calculatedAt: string;
  finalizedAt?: string;
  paidAt?: string;
}

export interface SalarySettings {
  absentDeduction: number;
  leaveDeduction: number;
  lateDeduction: number;
  earlyLeaveDeduction: number;
  lateTimeBlock: number;
  earlyLeaveTimeBlock: number;
  workingDaysPerWeek: number[];
  salaryPaymentDate: number;
  holidays: string[];
}

export interface SalaryPeriod {
  period: string;
  label: string;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
}