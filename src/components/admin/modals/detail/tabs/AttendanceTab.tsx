import React from 'react';
import { Filter, Calendar } from 'lucide-react';
import { Employee, AttendanceRecord } from '../../../types';
import { getStatusColor, getStatusText } from '../../../../../utils/attendanceUtils';
import AttendanceMonthFilter from '../components/AttendanceMonthFilter';
import AttendanceStats from '../components/AttendanceStats';
import AttendanceTable from '../components/AttendanceTable';

interface AttendanceTabProps {
  employee: Employee;
  employeeAttendance: AttendanceRecord[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  isLoading: boolean;
}

const AttendanceTab: React.FC<AttendanceTabProps> = ({
  employee,
  employeeAttendance,
  selectedMonth,
  onMonthChange,
  isLoading
}) => {
  // Filter attendance by selected month
  const filteredAttendance = employeeAttendance.filter(record => {
    const recordDate = new Date(record.date);
    const recordMonth = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
    return recordMonth === selectedMonth;
  });

  // Generate month options for the last 12 months
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    
    return options;
  };

  const monthOptions = getMonthOptions();

  // Calculate monthly statistics
  const calculateMonthlyStats = () => {
    const present = filteredAttendance.filter(record => record.attendanceType === 'present').length;
    const leave = filteredAttendance.filter(record => record.attendanceType === 'leave').length;
    const absent = filteredAttendance.filter(record => record.attendanceType === 'absent').length;
    
    return { present, leave, absent, total: present + leave + absent };
  };

  const monthlyStats = calculateMonthlyStats();

  return (
    <div className="space-y-6">
      <AttendanceMonthFilter
        selectedMonth={selectedMonth}
        monthOptions={monthOptions}
        onMonthChange={onMonthChange}
      />

      <AttendanceStats monthlyStats={monthlyStats} />

      <AttendanceTable
        filteredAttendance={filteredAttendance}
        monthOptions={monthOptions}
        selectedMonth={selectedMonth}
        isLoading={isLoading}
        employeeAttendance={employeeAttendance}
      />
    </div>
  );
};

export default AttendanceTab;