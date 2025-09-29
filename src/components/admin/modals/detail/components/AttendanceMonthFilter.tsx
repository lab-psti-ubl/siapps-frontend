import React from 'react';
import { Filter } from 'lucide-react';

interface AttendanceMonthFilterProps {
  selectedMonth: string;
  monthOptions: Array<{ value: string; label: string }>;
  onMonthChange: (month: string) => void;
}

const AttendanceMonthFilter: React.FC<AttendanceMonthFilterProps> = ({
  selectedMonth,
  monthOptions,
  onMonthChange
}) => {
  return (
    <div className="bg-gray-50 rounded-xl p-3 lg:p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Filter className="w-5 h-5 text-blue-500" />
          <h4 className="text-lg font-bold text-gray-800">Filter Bulan</h4>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[40px]"
        >
          {monthOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AttendanceMonthFilter;