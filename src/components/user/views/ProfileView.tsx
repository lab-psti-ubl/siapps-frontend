import React, { useState, useRef } from 'react';
import { 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  Briefcase, 
  CreditCard, 
  Hash, 
  Download,
  QrCode,
  FileImage,
  Award,
  Clock
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { User as UserType } from '../../../types/auth';
import { generateEmployeeKTA } from '../../../utils/ktaUtils';

interface ProfileViewProps {
  currentUser: UserType;
}

const ProfileView: React.FC<ProfileViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'kta'>('profile');
  const [isGeneratingKTA, setIsGeneratingKTA] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

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
            link.download = `qr-${currentUser.name.replace(/\s+/g, '-')}.png`;
            link.href = canvas.toDataURL();
            link.click();
          }
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      }
    }
  };

  const handleDownloadKTA = async () => {
    setIsGeneratingKTA(true);
    try {
      // Convert User to Employee format for KTA generation
      const employeeData = {
        ...currentUser,
        position: currentUser.position || 'Pegawai',
        nik: currentUser.nik || '-',
        birthPlace: currentUser.birthPlace || '-',
        birthDate: currentUser.birthDate || new Date().toISOString(),
        basicSalary: currentUser.basicSalary || 0,
        qrId: currentUser.qrId || currentUser.id
      };
      
      await generateEmployeeKTA(employeeData);
    } catch (error) {
      console.error('Error generating KTA:', error);
      alert('Terjadi kesalahan saat membuat KTA. Silakan coba lagi.');
    } finally {
      setIsGeneratingKTA(false);
    }
  };

  const calculateYearsOfService = () => {
    const joinDate = new Date(currentUser.createdAt);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Profil Saya</h1>
        <p className="text-gray-600">Lihat informasi profil dan kartu pegawai Anda</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white rounded-t-xl">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Informasi Profil</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('kta')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
              activeTab === 'kta'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Kartu Pegawai (KTA)</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-xl rounded-tr-xl shadow-lg overflow-hidden">
        {activeTab === 'profile' ? (
          /* Profile Tab */
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Personal Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Informasi Personal
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Nama Lengkap</label>
                      <p className="text-lg font-semibold text-gray-800">{currentUser.name}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Jabatan</label>
                      <p className="text-lg font-semibold text-gray-800">{currentUser.position || 'Pegawai'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <label className="block text-sm font-medium text-gray-500 mb-1">NIK</label>
                      <p className="text-lg font-semibold text-gray-800">{currentUser.nik || '-'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Telepon</label>
                      <p className="text-lg font-semibold text-gray-800">{currentUser.phone}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Tempat, Tanggal Lahir</label>
                      <p className="text-lg font-semibold text-gray-800">
                        {currentUser.birthPlace || '-'}, {currentUser.birthDate ? formatBirthDate(currentUser.birthDate) : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Employment Information Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-green-600" />
                    Informasi Kepegawaian
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <label className="block text-sm font-medium text-gray-500 mb-1">ID QR</label>
                      <p className="text-lg font-semibold text-gray-800">{currentUser.qrId || currentUser.id}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Masa Kerja</label>
                      <p className="text-lg font-semibold text-gray-800">{calculateYearsOfService()}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Tanggal Bergabung</label>
                      <p className="text-lg font-semibold text-gray-800">{formatDate(currentUser.createdAt.toISOString())}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - QR Code & Quick Actions */}
              <div className="space-y-6">
                {/* QR Code Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
                    <FileImage className="w-5 h-5 mr-2 text-purple-600" />
                    QR Code Absensi
                  </h4>
                  <div className="flex flex-col items-center space-y-4">
                    <div ref={qrRef} className="p-6 bg-white border-2 border-purple-200 rounded-xl shadow-lg">
                      <QRCodeSVG
                        value={currentUser.qrCode}
                        size={180}
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

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">
                    Aksi Cepat
                  </h4>
                  <div className="space-y-3">
                    <button
                      onClick={handleDownloadKTA}
                      disabled={isGeneratingKTA}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-3 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingKTA ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Membuat KTA...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Download KTA</span>
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-600 text-center">
                      Unduh Kartu Tanda Anggota (KTA) pegawai
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* KTA Preview Tab */
          <div className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="text-2xl font-bold text-gray-800 mb-2">Preview Kartu Tanda Anggota</h4>
                <p className="text-gray-600">Pratinjau KTA yang akan diunduh</p>
              </div>

              <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">
                {/* KTA Front Preview */}
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
                            value={currentUser.qrCode}
                            size={120}
                            level="M"
                            includeMargin={false}
                          />
                        </div>
                      </div>

                      {/* Employee Info */}
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold mb-1">{currentUser.name}</h3>
                        <p className="text-lg text-blue-100">{currentUser.position || 'Pegawai'}</p>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>No. ID</span>
                          <span>: {currentUser.qrId || currentUser.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tanggal Lahir</span>
                          <span>: {currentUser.birthDate ? formatBirthDate(currentUser.birthDate) : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Telepon</span>
                          <span>: {currentUser.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KTA Back Preview */}
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
              </div>

              {/* Download Button */}
              <div className="text-center">
                <button
                  onClick={handleDownloadKTA}
                  disabled={isGeneratingKTA}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  {isGeneratingKTA ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Membuat KTA...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Download KTA</span>
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-3">
                  Unduh kartu pegawai dalam format ZIP (depan & belakang)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;