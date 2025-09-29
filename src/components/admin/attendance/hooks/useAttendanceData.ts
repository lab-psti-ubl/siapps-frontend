import { useState, useEffect } from 'react';
import { AttendanceRecord, LeaveRequest } from '../../types';
import { attendanceAPI, leaveRequestsAPI } from '../../../../services/api';

export const useAttendanceData = (selectedDate: string) => {
  const [localAttendance, setLocalAttendance] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoadingLeaveRequests, setIsLoadingLeaveRequests] = useState(false);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

  // Load leave requests from API
  useEffect(() => {
    loadLeaveRequests();
  }, []);

  // Load attendance data when selected date changes
  useEffect(() => {
    const loadAttendanceForDate = async () => {
      if (!selectedDate) return;
      
      setIsLoadingAttendance(true);
      console.log('Loading attendance for selected date:', selectedDate);
      
      try {
        // Ensure date is in correct format (YYYY-MM-DD)
        const formattedDate = new Date(selectedDate).toISOString().split('T')[0];
        console.log('Formatted date for API:', formattedDate);
        
        const response = await attendanceAPI.getAll({ date: formattedDate });
        if (response.success) {
          console.log('Loaded attendance for date', formattedDate, ':', response.data);
          const attendanceData = response.data.map((att: any) => ({
            ...att,
            id: att._id,
            employeeId: typeof att.employeeId === 'object' && att.employeeId._id 
              ? att.employeeId._id 
              : att.employeeId
          }));
          setLocalAttendance(attendanceData);
        } else {
          console.log('No attendance data found for date:', formattedDate);
          setLocalAttendance([]);
        }
      } catch (error) {
        console.error('Error loading attendance for date:', error);
        setLocalAttendance([]);
      } finally {
        setIsLoadingAttendance(false);
      }
    };
    
    loadAttendanceForDate();
  }, [selectedDate]);

  const loadLeaveRequests = async () => {
    setIsLoadingLeaveRequests(true);
    try {
      const response = await leaveRequestsAPI.getAll();
      if (response.success) {
        const leaveRequestsData = response.data.map((req: any) => {
          // Ensure proper date formatting
          const submittedAt = req.createdAt || req.submittedAt || new Date().toISOString();
          
          return {
            ...req,
            id: req._id,
            employeeId: typeof req.employeeId === 'object' && req.employeeId._id 
              ? req.employeeId._id 
              : req.employeeId,
            submittedAt: submittedAt
          };
        });
        setLeaveRequests(leaveRequestsData);
      }
    } catch (error) {
      console.error('Error loading leave requests:', error);
      setLeaveRequests([]);
    } finally {
      setIsLoadingLeaveRequests(false);
    }
  };

  const updateAttendanceData = async () => {
    if (!selectedDate) return false;
    
    setIsLoadingAttendance(true);
    console.log('Updating attendance data for date:', selectedDate);
    
    try {
      // Force reload from database with properly formatted date
      const formattedDate = new Date(selectedDate).toISOString().split('T')[0];
      console.log('Refreshing attendance for formatted date:', formattedDate);
      
      const response = await attendanceAPI.getAll({ date: formattedDate });
      if (response.success) {
        console.log('Reloaded attendance data:', response.data);
        const attendanceData = response.data.map((att: any) => ({
          ...att,
          id: att._id,
          employeeId: typeof att.employeeId === 'object' && att.employeeId._id 
            ? att.employeeId._id 
            : att.employeeId
        }));
        setLocalAttendance(attendanceData);
        return true;
      } else {
        console.log('No data returned from API for date:', formattedDate);
        setLocalAttendance([]);
        return true;
      }
    } catch (error) {
      console.error('Error reloading attendance data:', error);
      return false;
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  return {
    localAttendance,
    setLocalAttendance,
    leaveRequests,
    setLeaveRequests,
    isLoadingLeaveRequests,
    isLoadingAttendance,
    loadLeaveRequests,
    updateAttendanceData
  };
};