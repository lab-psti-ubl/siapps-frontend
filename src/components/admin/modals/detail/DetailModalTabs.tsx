import React from 'react';
import { User, Clock, CreditCard } from 'lucide-react';
import { AttendanceRecord } from '../../types';

interface DetailModalTabsProps {
  activeTab: 'profile' | 'attendance' | 'kta';
  onTabChange: (tab: 'profile' | 'attendance' | 'kta') => void;
  employeeAttendance: AttendanceRecord[];
}

const DetailModalTabs: React.FC<DetailModalTabsProps> = ({
  activeTab,
  onTabChange,
  employeeAttendance
}) => {
  return (
    <div className="border-b border-gray-200 bg-gray-50">
      <nav className="flex space-x-8 px-8">
        <button
          onClick={() => onTabChange('profile')}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
            activeTab === 'profile'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Profil Pegawai</span>
          </div>
        </button>
        <button
          onClick={() => onTabChange('attendance')}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
            activeTab === 'attendance'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Data Absensi</span>
            {employeeAttendance.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {employeeAttendance.length}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => onTabChange('kta')}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
            activeTab === 'kta'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Kartu Pegawai</span>
          </div>
        </button>
      </nav>
    </div>
  );
};

export default DetailModalTabs;