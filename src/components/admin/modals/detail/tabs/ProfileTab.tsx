import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  User, 
  Calendar, 
  Download, 
  Phone, 
  MapPin, 
  Briefcase, 
  CreditCard, 
  Hash, 
  FileImage
} from 'lucide-react';
import { Employee } from '../../../types';

interface ProfileTabProps {
  employee: Employee;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ employee }) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatBirthDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const downloadQR = () => {
    if (qrRef.current) {
      const svg = qrRef.current.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        canvas.width = 512;
        canvas.height = 512;

        img.onload = () => {
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const link = document.createElement('a');
            link.download = `qr-${employee.name.replace(/\s+/g, '-')}.png`;
            link.href = canvas.toDataURL();
            link.click();
          }
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Personal Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Personal Information Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 lg:p-6 border border-blue-100">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Informasi Personal
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-500 mb-1">Nama Lengkap</label>
              <p className="text-lg font-semibold text-gray-800">{employee.name}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-500 mb-1">Jabatan</label>
              <p className="text-lg font-semibold text-gray-800">{employee.position}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-500 mb-1">NIK</label>
              <p className="text-lg font-semibold text-gray-800">{employee.nik}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-500 mb-1">Telepon</label>
              <p className="text-lg font-semibold text-gray-800">{employee.phone}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm lg:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">Tempat, Tanggal Lahir</label>
              <p className="text-lg font-semibold text-gray-800">
                {employee.birthPlace}, {formatBirthDate(employee.birthDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Employment Information Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 lg:p-6 border border-green-100">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-600" />
            Informasi Kepegawaian
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-500 mb-1">Gaji Pokok</label>
              <p className="text-xl font-bold text-green-600">{formatCurrency(employee.basicSalary)}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-500 mb-1">ID QR</label>
              <p className="text-lg font-semibold text-gray-800">{employee.qrId}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm lg:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">Tanggal Bergabung</label>
              <p className="text-lg font-semibold text-gray-800">{formatDate(employee.createdAt.toISOString())}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Column - QR Code & Quick Stats */}
      <div className="space-y-6">
        {/* QR Code Card */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 lg:p-6 border border-purple-100" id="detail-qr">
          <h4 className="text-lg font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
            <FileImage className="w-5 h-5 mr-2 text-purple-600" />
            QR Code Absensi
          </h4>
          <div className="flex flex-col items-center space-y-4">
            <div ref={qrRef} className="p-4 lg:p-6 bg-white border-2 border-purple-200 rounded-xl shadow-lg">
              <QRCodeSVG
                value={employee.qrCode}
                size={160}
                level="M"
                includeMargin={true}
              />
            </div>
            <button
              onClick={downloadQR}
              className="inline-flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Download QR</span>
            </button>
            <p className="text-xs text-gray-600 text-center">
              QR Code untuk absensi pegawai
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;