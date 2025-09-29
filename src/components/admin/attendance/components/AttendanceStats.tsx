import React from 'react';
import { CheckCircle, XCircle, FileText, Clock } from 'lucide-react';

interface AttendanceStatsProps {
  stats: {
    present: number;
    leave: number;
    absent: number;
    total: number;
  };
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
      <div className="bg-green-50 rounded-lg p-2 sm:p-3 lg:p-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
        </div>
        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 mb-1">{stats.present}</div>
        <div className="text-xs sm:text-sm text-green-800">Hadir</div>
      </div>
      <div className="bg-blue-50 rounded-lg p-2 sm:p-3 lg:p-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
        </div>
        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 mb-1">{stats.leave}</div>
        <div className="text-xs sm:text-sm text-blue-800">Izin</div>
      </div>
      <div className="bg-red-50 rounded-lg p-2 sm:p-3 lg:p-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
        </div>
        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 mb-1">{stats.absent}</div>
        <div className="text-xs sm:text-sm text-red-800">Tidak Hadir</div>
      </div>
      <div className="bg-gray-50 rounded-lg p-2 sm:p-3 lg:p-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
        </div>
        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-600 mb-1">{stats.total}</div>
        <div className="text-xs sm:text-sm text-gray-800">Total Pegawai</div>
      </div>
    </div>
  );
};

export default AttendanceStats;