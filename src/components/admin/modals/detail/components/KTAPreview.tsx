import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Employee } from '../../../types';

interface KTAPreviewProps {
  employee: Employee;
  side: 'front' | 'back';
}

const KTAPreview: React.FC<KTAPreviewProps> = ({ employee, side }) => {
  const formatBirthDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (side === 'front') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h5 className="text-lg font-bold text-gray-800 mb-4 text-center">Sisi Depan</h5>
        <div 
          className="w-80 h-[500px] bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #7C3AED 100%)'
          }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-400/20 rounded-full translate-x-12 -translate-y-12"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -translate-x-20 translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-28 h-28 bg-orange-400/15 rounded-full translate-x-14 translate-y-14"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-xl font-bold">Pertamina</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="bg-white p-3 rounded-lg">
                <QRCodeSVG
                  value={employee.qrCode}
                  size={120}
                  level="M"
                  includeMargin={false}
                />
              </div>
            </div>

            {/* Employee Info */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-1">{employee.name}</h3>
              <p className="text-lg text-blue-100">{employee.position}</p>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>No. ID</span>
                <span>: {employee.qrId}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal Lahir</span>
                <span>: {formatBirthDate(employee.birthDate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Telepon</span>
                <span>: {employee.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h5 className="text-lg font-bold text-gray-800 mb-4 text-center">Sisi Belakang</h5>
      <div className="w-80 h-[500px] bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 -translate-y-16"></div>
          <div className="absolute top-0 left-0 w-24 h-24 bg-orange-400/20 rounded-full -translate-x-12 -translate-y-12"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-20 translate-y-20"></div>
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-orange-400/15 rounded-full -translate-x-14 translate-y-14"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
              </div>
              <span className="text-xl font-bold">Pertamina</span>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Terms & Conditions</h3>
          </div>

          {/* Terms Text */}
          <div className="text-xs leading-relaxed space-y-3">
            <p>
              By using the services provided by Larana, Inc., you agree to comply with our terms and conditions, which outline your rights and responsibilities while accessing our digital banking solutions.
            </p>
            <p>
              These terms govern your use of our services, including any content, features, and functionalities, you acknowledge that you have read, understood, and accepted these terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KTAPreview;