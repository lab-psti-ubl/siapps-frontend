import React from 'react';
import { X } from 'lucide-react';
import { Employee } from '../../types';

interface DetailModalHeaderProps {
  employee: Employee;
  onClose: () => void;
}

const DetailModalHeader: React.FC<DetailModalHeaderProps> = ({ employee, onClose }) => {
  const calculateYearsOfService = () => {
    const joinDate = new Date(employee.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} tahun ${months} bulan`;
    } else {
      return `${months} bulan`;
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {employee.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{employee.name}</h2>
            <p className="text-blue-100">{employee.position}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                ID: {employee.qrId}
              </span>
              <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                {calculateYearsOfService()} masa kerja
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default DetailModalHeader;