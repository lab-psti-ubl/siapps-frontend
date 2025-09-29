import { User } from '../../../../../types/auth';
import { AttendanceRecord, LeaveRequest } from '../../../types';
import { leaveRequestsAPI } from '../../../../../services/api';

export const useAbsenKeluarLogic = (currentUser: User, todayAttendance?: AttendanceRecord) => {
  // Check if user has pending leave request for today
  const hasPendingLeaveToday = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await leaveRequestsAPI.getAll({ 
        employeeId: currentUser.id, 
        status: 'pending' 
      });
      
      if (response.success) {
        return response.data.some((req: LeaveRequest) => 
          new Date(req.startDate) <= new Date(today) &&
          new Date(req.endDate) >= new Date(today)
        );
      }
      return false;
    } catch (error) {
      console.error('Error checking pending leave:', error);
      return false;
    }
  };

  // Check if user is on approved leave today
  const isOnApprovedLeaveToday = async () => {
    if (todayAttendance?.attendanceType === 'leave' && todayAttendance.leaveRequestId) {
      try {
        const response = await leaveRequestsAPI.getById(todayAttendance.leaveRequestId);
        return response.success && response.data.status === 'approved';
      } catch (error) {
        console.error('Error checking leave request:', error);
        return false;
      }
    }
    return false;
  };

  return {
    hasPendingLeaveToday,
    isOnApprovedLeaveToday
  };
};