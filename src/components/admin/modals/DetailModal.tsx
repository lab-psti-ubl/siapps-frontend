import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Download, 
  User, 
  Clock, 
  Calendar, 
  Filter, 
  Phone, 
  MapPin, 
  Briefcase, 
  CreditCard, 
  Hash, 
  Mail,
  Award,
  TrendingUp,
  FileText,
  Camera,
  FileImage
} from 'lucide-react';
import { Employee, AttendanceRecord } from '../types';
import { getStatusColor, getStatusText } from '../../../utils/attendanceUtils';
import { employeesAPI, attendanceAPI } from '../../../services/api';
import { generateEmployeeKTA } from '../../../utils/ktaUtils';

interface DetailModalProps {
  employee: Employee;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ employee, onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'kta'>('profile');
  const [employeeAttendance, setEmployeeAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingKTA, setIsGeneratingKTA] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const ktaPreviewRef = useRef<HTMLDivElement>(null);

  // Load employee attendance data from API
  useEffect(() => {
    const loadAttendanceData = async () => {
      if (activeTab === 'attendance') {
        setIsLoading(true);
        try {
          const [year, month] = selectedMonth.split('-');
          const response = await employeesAPI.getAttendance(employee.id, { month, year });
          
          if (response.success) {
            const attendanceData = response.data.map((att: any) => ({
              ...att,
              id: att._id,
              employeeId: att.employeeId._id || att.employeeId
            }));
            
            // Sort by date (newest first)
            attendanceData.sort((a: AttendanceRecord, b: AttendanceRecord) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setEmployeeAttendance(attendanceData);
          }
        } catch (error) {
          console.error('Error loading employee attendance:', error);
          setEmployeeAttendance([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadAttendanceData();
  }, [employee.id, selectedMonth, activeTab]);

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

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
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

  const formatBirthDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDownloadKTA = async () => {
    setIsGeneratingKTA(true);
    try {
      await generateEmployeeKTA(employee);
    } catch (error) {
      console.error('Error generating KTA:', error);
      alert('Terjadi kesalahan saat membuat KTA. Silakan coba lagi.');
    } finally {
      setIsGeneratingKTA(false);
    }
  };

  const getAttendanceTypeText = (record: AttendanceRecord) => {
    if (record.attendanceType === 'leave') {
      return 'Izin';
    } else if (record.attendanceType === 'absent') {
      return 'Tidak Hadir';
    }
    return 'Hadir';
  };

  const getAttendanceTypeColor = (record: AttendanceRecord) => {
    if (record.attendanceType === 'leave') {
      return 'bg-blue-100 text-blue-800';
    } else if (record.attendanceType === 'absent') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-green-100 text-green-800';
  };

  // Filter attendance by selected month
  const filteredAttendance = employeeAttendance.filter(record => {
    const recordDate = new Date(record.date);
    const recordMonth = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
    return recordMonth === selectedMonth;
  });

  // Generate month options for the last 12 months
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    
    return options;
  };

  const monthOptions = getMonthOptions();

  // Calculate monthly statistics
  const calculateMonthlyStats = () => {
    const present = filteredAttendance.filter(record => record.attendanceType === 'present').length;
    const leave = filteredAttendance.filter(record => record.attendanceType === 'leave').length;
    const absent = filteredAttendance.filter(record => record.attendanceType === 'absent').length;
    
    return { present, leave, absent, total: present + leave + absent };
  };

  const monthlyStats = calculateMonthlyStats();

  // Calculate years of service
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
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

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex space-x-8 px-8">
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
                <span>Profil Pegawai</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === 'attendance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Data Absensi</span>
                {employeeAttendance.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {employeeAttendance.length}
                  </span>
                )}
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
                <span>Kartu Pegawai</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
          {activeTab === 'profile' ? (
            /* Profile Tab */
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
                    <div className="bg-white rounded-lg p-4 shadow-sm md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Tempat, Tanggal Lahir</label>
                      <p className="text-lg font-semibold text-gray-800">
                        {employee.birthPlace}, {formatBirthDate(employee.birthDate)}
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
                      <label className="block text-sm font-medium text-gray-500 mb-1">Gaji Pokok</label>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(employee.basicSalary)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <label className="block text-sm font-medium text-gray-500 mb-1">ID QR</label>
                      <p className="text-lg font-semibold text-gray-800">{employee.qrId}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Tanggal Bergabung</label>
                      <p className="text-lg font-semibold text-gray-800">{formatDate(employee.createdAt.toISOString())}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - QR Code & Quick Stats */}
              <div className="space-y-6">
                {/* QR Code Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100" id="detail-qr">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
                    <FileImage className="w-5 h-5 mr-2 text-purple-600" />
                    QR Code Absensi
                  </h4>
                  <div className="flex flex-col items-center space-y-4">
                    <div ref={qrRef} className="p-6 bg-white border-2 border-purple-200 rounded-xl shadow-lg">
                      <QRCodeSVG
                        value={employee.qrCode}
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
          ) : activeTab === 'kta' ? (
            /* KTA Preview Tab */
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
                    ref={ktaPreviewRef}
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
              </div>
            </div>
          ) : (
            /* Attendance Tab */
            <div className="space-y-6">
              {/* Month Filter */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Filter className="w-5 h-5 text-blue-500" />
                    <h4 className="text-lg font-bold text-gray-800">Filter Bulan</h4>
                  </div>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {monthOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Monthly Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-green-600 mb-1">{monthlyStats.present}</div>
                    <div className="text-xs text-green-800">Hadir</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-blue-600 mb-1">{monthlyStats.leave}</div>
                    <div className="text-xs text-blue-800">Izin</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-red-600 mb-1">{monthlyStats.absent}</div>
                    <div className="text-xs text-red-800">Tidak Hadir</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-gray-600 mb-1">{monthlyStats.total}</div>
                    <div className="text-xs text-gray-800">Total</div>
                  </div>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="text-lg font-bold text-gray-800">
                    Riwayat Absensi - {monthOptions.find(opt => opt.value === selectedMonth)?.label}
                  </h4>
                </div>
                
                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Keterangan
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Jam Masuk
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status Masuk
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Jam Keluar
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status Keluar
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAttendance.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                              <div className="flex flex-col items-center space-y-2">
                                <Calendar className="w-12 h-12 text-gray-300" />
                                <p>Belum ada data absensi untuk bulan ini</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredAttendance.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{formatDateOnly(record.date)}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getAttendanceTypeColor(record)}`}>
                                  {getAttendanceTypeText(record)}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {record.attendanceType === 'leave' ? '-' : (record.checkInTime || '-')}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {record.attendanceType === 'leave' ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    Izin
                                  </span>
                                ) : (
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.checkInStatus)}`}>
                                    {getStatusText(record.checkInStatus)}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {record.attendanceType === 'leave' ? '-' : (record.checkOutTime || '-')}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {record.attendanceType === 'leave' ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    Izin
                                  </span>
                                ) : (
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.checkOutStatus)}`}>
                                    {getStatusText(record.checkOutStatus)}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Summary Info */}
              {employeeAttendance.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <h5 className="font-medium text-blue-800">Ringkasan Absensi</h5>
                  </div>
                  <p className="text-sm text-blue-700">
                    Total record absensi: <strong>{employeeAttendance.length}</strong> hari
                  </p>
                  <p className="text-sm text-blue-700">
                    Bulan {monthOptions.find(opt => opt.value === selectedMonth)?.label}: 
                    <strong> {filteredAttendance.length}</strong> hari
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailModal;