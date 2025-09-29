import React from 'react';
import { Calendar, Download } from 'lucide-react';

interface AttendanceFiltersProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onTodayClick: () => void;
  onRefreshClick: () => void;
  onExportPDF: () => void;
  isExporting: boolean;
  hasData: boolean;
  isLoadingAttendance?: boolean;
}

const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
  selectedDate,
  onDateChange,
  onTodayClick,
  onRefreshClick,
  onExportPDF,
  isExporting,
  hasData,
  isLoadingAttendance = false
}) => {
  const handleDateChange = (newDate: string) => {
    console.log('Date filter changed to:', newDate);
    onDateChange(newDate);
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-3 sm:mb-4 space-y-3 lg:space-y-0">
        <div className="flex items-center space-x-3">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          <h3 className="text-base sm:text-lg font-bold text-gray-800">Filter Tanggal</h3>
          {isLoadingAttendance && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex items-center space-x-2 flex-1 sm:flex-none">
            <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Tanggal:</label>
            <div className="relative">
              <Calendar className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm w-full sm:min-w-[140px] min-h-[40px] ${
                  isLoadingAttendance ? 'opacity-50 cursor-wait' : ''
                }`}
                disabled={isLoadingAttendance}
              />
            </div>
          </div>
          
          <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-2">
            <button
              onClick={onTodayClick}
              disabled={isLoadingAttendance}
              className="px-2 sm:px-3 py-2 text-xs sm:text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors min-h-[40px] flex items-center justify-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hari Ini
            </button>
          
            <button
              onClick={onRefreshClick}
              disabled={isLoadingAttendance}
              className="px-2 sm:px-3 py-2 text-xs sm:text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center space-x-1 min-h-[40px] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh data dari database"
            >
              <svg className={`w-3 h-3 sm:w-4 sm:h-4 ${isLoadingAttendance ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          
            <button
              onClick={onExportPDF}
              disabled={isExporting || !hasData || isLoadingAttendance}
              className="flex items-center justify-center space-x-1 sm:space-x-2 bg-green-500 hover:bg-green-600 text-white px-2 sm:px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm min-h-[40px] whitespace-nowrap"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Membuat PDF...</span>
                  <span className="sm:hidden">PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Export PDF</span>
                  <span className="sm:hidden">PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Date Info */}
      <div className="mt-3 text-xs sm:text-sm text-gray-600">
        <span>Menampilkan data absensi untuk: </span>
        <span className="font-medium text-gray-800">
          {new Date(selectedDate).toLocaleDateString('id-ID', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
          })}
        </span>
        {isLoadingAttendance && (
          <span className="ml-2 text-blue-600">- Memuat data...</span>
        )}
      </div>
    </div>
  );
};

export default AttendanceFilters;