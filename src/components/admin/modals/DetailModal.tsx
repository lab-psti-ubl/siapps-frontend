import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Employee } from '../types';
import DetailModalHeader from './detail/DetailModalHeader';
import DetailModalTabs from './detail/DetailModalTabs';
import DetailModalContent from './detail/DetailModalContent';
import { useDetailModalData } from './detail/hooks/useDetailModalData';

interface DetailModalProps {
  employee: Employee;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ employee, onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'kta'>('profile');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const {
    employeeAttendance,
    isLoading,
    isGeneratingKTA,
    setIsGeneratingKTA
  } = useDetailModalData(employee.id, selectedMonth, activeTab);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl">
        <DetailModalHeader employee={employee} onClose={onClose} />
        
        <DetailModalTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          employeeAttendance={employeeAttendance}
        />

        <DetailModalContent
          activeTab={activeTab}
          employee={employee}
          employeeAttendance={employeeAttendance}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          isLoading={isLoading}
          isGeneratingKTA={isGeneratingKTA}
          onGenerateKTA={setIsGeneratingKTA}
        />
      </div>
    </div>
  );
};

export default DetailModal;