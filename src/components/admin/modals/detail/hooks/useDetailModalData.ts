import { useState, useEffect } from 'react';
import { AttendanceRecord } from '../../../types';
import { employeesAPI } from '../../../../../services/api';

export const useDetailModalData = (
  employeeId: string,
  selectedMonth: string,
  activeTab: string
) => {
  const [employeeAttendance, setEmployeeAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingKTA, setIsGeneratingKTA] = useState(false);

  // Load employee attendance data from API
  useEffect(() => {
    const loadAttendanceData = async () => {
      if (activeTab === 'attendance') {
        setIsLoading(true);
        try {
          const [year, month] = selectedMonth.split('-');
          const response = await employeesAPI.getAttendance(employeeId, { month, year });
          
          if (response.success) {
            const attendanceData = response.data.map((att: any) => ({
              ...att,
              id: att._id,
              employeeId: att.employeeId._id || att.employeeId
            }));
            
            // Sort by date (newest first)
            attendanceData.sort((a: AttendanceRecord, b: AttendanceRecord) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setEmployeeAttendance(attendanceData);
          }
        } catch (error) {
          console.error('Error loading employee attendance:', error);
          setEmployeeAttendance([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadAttendanceData();
  }, [employeeId, selectedMonth, activeTab]);

  return {
    employeeAttendance,
    isLoading,
    isGeneratingKTA,
    setIsGeneratingKTA
  };
};