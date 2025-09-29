import React from 'react';
import { Search, Download, Filter, X } from 'lucide-react';
import { Employee } from '../../../types';

interface EmployeesSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterPosition: string;
  setFilterPosition: (position: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  uniquePositions: string[];
  clearFilters: () => void;
  handleExportPDF: () => void;
  isExporting: boolean;
  filteredEmployees: Employee[];
  totalEmployees: number;
}

const EmployeesSearch: React.FC<EmployeesSearchProps> = ({
  searchTerm,
  setSearchTerm,
  filterPosition,
  setFilterPosition,
  showFilters,
  setShowFilters,
  uniquePositions,
  clearFilters,
  handleExportPDF,
  isExporting,
  filteredEmployees,
  totalEmployees
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari pegawai..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 touch-target"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-2 sm:space-x-3">
          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border transition-colors min-h-[40px] sm:min-h-[44px] text-sm sm:text-base ${
              showFilters || filterPosition
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Filter
            {filterPosition && (
              <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">1</span>
            )}
          </button>

          {/* Export Button */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting || filteredEmployees.length === 0}
            className="flex items-center justify-center space-x-1 sm:space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] sm:min-h-[44px] text-sm sm:text-base"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                Export
              </>
            ) : (
              <>
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Export
              </>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters - Collapsible */}
      {showFilters && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-4">
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Filter Jabatan
              </label>
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base min-h-[40px]"
              >
                <option value="">Semua Jabatan</option>
                {uniquePositions.map(position => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end sm:flex-shrink-0">
              <button
                onClick={clearFilters}
                className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors min-h-[40px] text-sm sm:text-base"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 text-xs sm:text-sm text-gray-600">
        <span>
          Menampilkan {filteredEmployees.length} dari {totalEmployees} pegawai
          {searchTerm && ` untuk "${searchTerm}"`}
          {filterPosition && ` dengan jabatan "${filterPosition}"`}
        </span>
        {(searchTerm || filterPosition) && (
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm"
          >
            Hapus semua filter
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployeesSearch;