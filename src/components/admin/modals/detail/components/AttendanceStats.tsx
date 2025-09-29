import React from 'react';

interface AttendanceStatsProps {
  monthlyStats: {
    present: number;
    leave: number;
    absent: number;
    total: number;
  };
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ monthlyStats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <div className="bg-green-50 rounded-lg p-3 text-center">
        <div className="text-lg lg:text-xl font-bold text-green-600 mb-1">{monthlyStats.present}</div>
        <div className="text-xs text-green-800">Hadir</div>
      </div>
      <div className="bg-blue-50 rounded-lg p-3 text-center">
        <div className="text-lg lg:text-xl font-bold text-blue-600 mb-1">{monthlyStats.leave}</div>
        <div className="text-xs text-blue-800">Izin</div>
      </div>
      <div className="bg-red-50 rounded-lg p-3 text-center">
        <div className="text-lg lg:text-xl font-bold text-red-600 mb-1">{monthlyStats.absent}</div>
        <div className="text-xs text-red-800">Tidak Hadir</div>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <div className="text-lg lg:text-xl font-bold text-gray-600 mb-1">{monthlyStats.total}</div>
        <div className="text-xs text-gray-800">Total</div>
      </div>
    </div>
  );
};

export default AttendanceStats;