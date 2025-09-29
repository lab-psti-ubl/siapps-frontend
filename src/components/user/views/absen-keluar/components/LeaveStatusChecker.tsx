import React from 'react';
import { FileText } from 'lucide-react';

interface LeaveStatusCheckerProps {
  title: string;
  subtitle: string;
  status: 'pending' | 'approved';
  onBackToDashboard: () => void;
}

const LeaveStatusChecker: React.FC<LeaveStatusCheckerProps> = ({
  title,
  subtitle,
  status,
  onBackToDashboard
}) => {
  const getStatusConfig = () => {
    if (status === 'pending') {
      return {
        icon: <FileText className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-yellow-500" />,
        title: 'Pengajuan Izin Sedang Pending',
        message: 'Anda tidak dapat melakukan absensi karena memiliki pengajuan izin yang sedang menunggu persetujuan admin untuk hari ini'
      };
    } else {
      return {
        icon: <FileText className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-blue-500" />,
        title: 'Anda Sedang Izin Hari Ini',
        message: 'Anda tidak dapat melakukan absensi keluar karena sedang dalam status izin yang disetujui'
      };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">{title}</h1>
          <p className="text-sm lg:text-base text-gray-600">{subtitle}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 text-center">
        {config.icon}
        <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-2">{config.title}</h3>
        <p className="text-sm lg:text-base text-gray-600 mb-4">
          {config.message}
        </p>
        <button
          onClick={onBackToDashboard}
          className="px-4 lg:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
};

export default LeaveStatusChecker;