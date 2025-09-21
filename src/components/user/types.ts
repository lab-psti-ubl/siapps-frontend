export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  checkInStatus: 'on-time' | 'late' | 'absent';
  checkOutStatus: 'on-time' | 'early' | 'not-checked-out';
  checkInMethod?: 'qr' | 'photo' | 'rfid';
  checkOutMethod?: 'qr' | 'photo' | 'rfid';
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
  checkInTime: string;
  checkOutTime: string;
  lateThresholdMinutes: number;
  earlyLeaveThresholdMinutes: number;
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

export interface SalaryCalculation {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  basicSalary: number;
  workingDays: number;
  presentDays: number;
  leaveDays: number;
  absentDays: number;
  totalLateMinutes: number;
  totalEarlyLeaveMinutes: number;
  lateBlocks: number;
  earlyLeaveBlocks: number;
  absentDeduction: number;
  leaveDeduction: number;
  lateDeduction: number;
  earlyLeaveDeduction: number;
  totalDeduction: number;
  netSalary: number;
  salarySettings: {
    absentDeduction: number;
    leaveDeduction: number;
    lateDeduction: number;
    earlyLeaveDeduction: number;
    lateBlockMinutes: number;
    earlyLeaveBlockMinutes: number;
  };
  createdAt: string;
}