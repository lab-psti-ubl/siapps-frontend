import React from 'react';
import { Employee, AttendanceRecord } from '../../types';
import ProfileTab from './tabs/ProfileTab';
import AttendanceTab from './tabs/AttendanceTab';
import KTATab from './tabs/KTATab';

interface DetailModalContentProps {
  activeTab: 'profile' | 'attendance' | 'kta';
  employee: Employee;
  employeeAttendance: AttendanceRecord[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  isLoading: boolean;
  isGeneratingKTA: boolean;
  onGenerateKTA: (generating: boolean) => void;
}

const DetailModalContent: React.FC<DetailModalContentProps> = ({
  activeTab,
  employee,
  employeeAttendance,
  selectedMonth,
  onMonthChange,
  isLoading,
  isGeneratingKTA,
  onGenerateKTA
}) => {
  return (
    <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
      {activeTab === 'profile' && (
        <ProfileTab employee={employee} />
      )}
      
      {activeTab === 'attendance' && (
        <AttendanceTab
          employee={employee}
          employeeAttendance={employeeAttendance}
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
          isLoading={isLoading}
        />
      )}
      
      {activeTab === 'kta' && (
        <KTATab
          employee={employee}
          isGeneratingKTA={isGeneratingKTA}
          onGenerateKTA={onGenerateKTA}
        />
      )}
    </div>
  );
};

export default DetailModalContent;