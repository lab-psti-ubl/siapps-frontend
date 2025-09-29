import { useState, useEffect } from 'react';
import { Employee, AttendanceRecord } from '../types';
import { employeesAPI, attendanceAPI } from '../../../services/api';

export const useAdminData = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from API on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Function to load all data from API
  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading admin data from API...');
      
      // Load employees
      const employeesResponse = await employeesAPI.getAll();
      if (employeesResponse.success) {
        const employeesData = employeesResponse.data.map((emp: any) => ({
          ...emp,
          id: emp._id,
          createdAt: new Date(emp.createdAt)
        }));
        console.log('Loaded employees from API:', employeesData);
        setEmployees(employeesData);
      }

      // Load today's attendance with proper date format
      const today = new Date().toISOString().split('T')[0];
      console.log('Loading attendance for date:', today);
      const attendanceResponse = await attendanceAPI.getAll({ date: today });
      if (attendanceResponse.success) {
        console.log('Raw attendance response:', attendanceResponse.data);
        const attendanceData = attendanceResponse.data.map((att: any) => ({
          ...att,
          id: att._id,
          employeeId: typeof att.employeeId === 'object' && att.employeeId._id 
            ? att.employeeId._id 
            : att.employeeId
        }));
        console.log('Loaded attendance from API:', attendanceData);
        setAttendance(attendanceData);
      } else {
        console.log('Failed to load attendance:', attendanceResponse);
        setAttendance([]);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      setEmployees([]);
      setAttendance([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time data update without loading states
  const updateDataSilently = async () => {
    try {
      console.log('Updating admin data silently...');
      const today = new Date().toISOString().split('T')[0];
      console.log('Loading data for today:', today);
      
      const [employeesResponse, attendanceResponse] = await Promise.all([
        employeesAPI.getAll(),
        attendanceAPI.getAll({ date: today })
      ]);
      
      if (employeesResponse.success) {
        const employeesData = employeesResponse.data.map((emp: any) => ({
          ...emp,
          id: emp._id,
          createdAt: new Date(emp.createdAt)
        }));
        console.log('Updated employees data:', employeesData.length, 'employees');
        setEmployees(employeesData);
      }
      
      if (attendanceResponse.success) {
        const attendanceData = attendanceResponse.data.map((att: any) => ({
          ...att,
          id: att._id,
          employeeId: typeof att.employeeId === 'object' && att.employeeId._id 
            ? att.employeeId._id 
            : att.employeeId
        }));
        console.log('Updated attendance data:', attendanceData.length, 'records for', today);
        setAttendance(attendanceData);
      } else {
        console.log('No attendance data returned for today:', today);
        setAttendance([]);
      }
    } catch (error) {
      console.error('Error updating data silently:', error);
    }
  };

  // Auto-refresh data every 30 seconds without loading states
  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        console.log('Auto-refreshing admin data...');
        updateDataSilently();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  return {
    employees,
    setEmployees,
    attendance,
    setAttendance,
    isLoading,
    loadData,
    updateDataSilently
  };
};