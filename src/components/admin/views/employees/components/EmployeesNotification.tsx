import React from 'react';
import { X } from 'lucide-react';

interface EmployeesNotificationProps {
  showNotification: boolean;
  onClose: () => void;
}

const EmployeesNotification: React.FC<EmployeesNotificationProps> = ({
  showNotification,
  onClose
}) => {
  if (!showNotification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className="flex items-center space-x-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 shadow-lg min-w-[300px]">
        <div className="flex-shrink-0">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">Berhasil!</p>
          <p className="text-sm text-green-700">Data pegawai berhasil didownload</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-green-500 hover:text-green-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default EmployeesNotification;