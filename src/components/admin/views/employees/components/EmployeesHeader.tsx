import React from 'react';
import { Plus } from 'lucide-react';

interface EmployeesHeaderProps {
  onAddEmployee: () => void;
}

const EmployeesHeader: React.FC<EmployeesHeaderProps> = ({ onAddEmployee }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Data Pegawai</h1>
        <p className="text-sm sm:text-base text-gray-600">Kelola data pegawai perusahaan</p>
      </div>
      <button
        onClick={onAddEmployee}
        className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 sm:py-3 rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base min-h-[44px] w-full sm:w-auto"
      >
        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Tambah Pegawai</span>
      </button>
    </div>
  );
};

export default EmployeesHeader;