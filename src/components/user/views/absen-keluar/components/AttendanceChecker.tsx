import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface AttendanceCheckerProps {
  title: string;
  subtitle: string;
  status: 'not-checked-in' | 'already-checked-out';
  checkOutTime?: string;
  checkOutMethod?: string;
  onBackToDashboard: () => void;
}

const AttendanceChecker: React.FC<AttendanceCheckerProps> = ({
  title,
  subtitle,
  status,
  checkOutTime,
  checkOutMethod,
  onBackToDashboard
}) => {
  const getStatusConfig = () => {
    if (status === 'not-checked-in') {
      return {
        icon: <XCircle className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-red-500" />,
        title: 'Anda Belum Absen Masuk',
        message: 'Silakan lakukan absen masuk terlebih dahulu sebelum absen keluar'
      };
    } else {
      return {
        icon: <CheckCircle className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-green-500" />,
        title: 'Anda Sudah Absen Keluar Hari Ini',
        message: `Absen keluar pada ${checkOutTime} menggunakan ${checkOutMethod === 'qr' ? 'QR Code' : 'Foto'}`
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

export default AttendanceChecker;