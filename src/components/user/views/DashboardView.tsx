import React from 'react';
import { 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Camera,
  QrCode,
  LogIn,
  LogOut as LogOutIcon,
  FileText
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { User as UserType } from '../../../types/auth';
import { AttendanceRecord, LeaveRequest } from '../types';
import { getStatusColor, getStatusText } from '../../../utils/attendanceUtils';
import { leaveRequestsAPI } from '../../../services/api';

interface DashboardViewProps {
  currentUser: UserType;
  userAttendance: AttendanceRecord[];
  todayAttendance?: AttendanceRecord;
  onAbsenMasuk: () => void;
  onAbsenKeluar: () => void;
  onViewAttendance: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  userAttendance,
  todayAttendance,
  onAbsenMasuk,
  onAbsenKeluar,
  onViewAttendance
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Check if user has pending leave request for today
  const hasPendingLeaveToday = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // This will be checked by parent component via API
    return false;
  };

  // Check if user is on approved leave today
  const isOnApprovedLeaveToday = () => {
    if (todayAttendance?.attendanceType === 'leave' && todayAttendance.leaveRequestId) {
      // This will be handled by parent component via API
      return true;
    }
    return false;
  };

  const isOnLeaveToday = isOnApprovedLeaveToday();
  const hasPendingLeave = hasPendingLeaveToday();

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Dashboard</h1>
        <p className="text-xs sm:text-sm lg:text-base text-gray-600">Selamat datang, {currentUser.name}</p>
      </div>

      {/* Leave Notice */}
      {isOnLeaveToday && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" />
            <div>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-blue-800">Anda Sedang Izin Hari Ini</h3>
              <p className="text-blue-600 text-xs sm:text-sm">
                Anda tidak dapat melakukan absensi masuk atau keluar karena sedang dalam status izin yang disetujui.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Leave Notice */}
      {hasPendingLeave && !isOnLeaveToday && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-yellow-800">Pengajuan Izin Sedang Pending</h3>
              <p className="text-yellow-600 text-xs sm:text-sm">
                Anda tidak dapat melakukan absensi karena memiliki pengajuan izin yang sedang menunggu persetujuan admin untuk hari ini.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Card with Responsive Layout */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8">
        {/* Mobile Layout - Vertical with icon next to title */}
        <div className="block lg:hidden space-y-4 sm:space-y-6">
          {/* Header Section - Mobile Optimized */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 rounded-full bg-white/20 backdrop-blur-sm flex-shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold mb-1">Selamat Datang!</h2>
              <p className="text-blue-100 text-xs sm:text-sm">
                Anda berhasil login ke sistem absensi
              </p>
            </div>
          </div>

          {/* User Info Cards - Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3">
              <div className="flex items-center space-x-2 mb-1">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Nama</span>
              </div>
              <p className="font-medium text-xs sm:text-sm truncate">{currentUser.name}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Telepon</span>
              </div>
              <p className="font-medium text-xs sm:text-sm">{currentUser.phone}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 sm:col-span-2">
              <div className="flex items-center space-x-2 mb-1">
                <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">QR Code</span>
              </div>
              <p className="font-medium text-xs sm:text-sm">Kode Absensi Anda</p>
            </div>
          </div>
        </div>

        {/* Desktop/Tablet Layout - Horizontal */}
        <div className="hidden lg:block space-y-6">
          {/* Header Section */}
          <div className="flex items-center space-x-6">
            <div className="p-6 rounded-full bg-white/20 backdrop-blur-sm flex-shrink-0">
              <User className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Selamat Datang!</h2>
              <p className="text-blue-100 text-base">
                Anda berhasil login ke sistem absensi
              </p>
            </div>
          </div>

          {/* User Info Cards - Desktop/Tablet - Horizontal Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">Nama</span>
              </div>
              <p className="font-bold text-lg truncate">{currentUser.name}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Phone className="w-5 h-5" />
                <span className="text-sm font-medium">Telepon</span>
              </div>
              <p className="font-bold text-lg">{currentUser.phone}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <QrCode className="w-5 h-5" />
                <span className="text-sm font-medium">QR Code</span>
              </div>
              <p className="font-bold text-base">Kode Absensi Anda</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Attendance Status and QR Code */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-500 flex-shrink-0" />
            <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-gray-800">Status Absensi Hari Ini</h3>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {isOnLeaveToday ? (
              <div className="flex items-center justify-center p-4 sm:p-6 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <FileText className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-blue-500" />
                  <p className="font-medium text-blue-800 text-sm sm:text-base lg:text-lg">Sedang Izin</p>
                  <p className="text-xs sm:text-sm text-blue-600">Anda sedang dalam status izin hari ini</p>
                </div>
              </div>
            ) : hasPendingLeave ? (
              <div className="flex items-center justify-center p-4 sm:p-6 bg-yellow-50 rounded-lg">
                <div className="text-center">
                  <FileText className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-yellow-500" />
                  <p className="font-medium text-yellow-800 text-sm sm:text-base lg:text-lg">Izin Pending</p>
                  <p className="text-xs sm:text-sm text-yellow-600">Pengajuan izin menunggu persetujuan</p>
                </div>
              </div>
            ) : (
              <>
                {/* Check In Status */}
                <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <LogIn className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800 text-xs sm:text-sm">Absen Masuk</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {todayAttendance?.checkInTime || 'Belum absen'}
                      </p>
                    </div>
                  </div>
                  <div>
                    {todayAttendance?.checkInTime ? (
                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${getStatusColor(todayAttendance.checkInStatus)}`}>
                        {getStatusText(todayAttendance.checkInStatus)}
                      </span>
                    ) : (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        Belum Absen
                      </span>
                    )}
                  </div>
                </div>

                {/* Check Out Status */}
                <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <LogOutIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800 text-xs sm:text-sm">Absen Keluar</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {todayAttendance?.checkOutTime || 'Belum absen'}
                      </p>
                    </div>
                  </div>
                  <div>
                    {todayAttendance?.checkOutTime ? (
                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${getStatusColor(todayAttendance.checkOutStatus)}`}>
                        {getStatusText(todayAttendance.checkOutStatus)}
                      </span>
                    ) : (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        Belum Absen
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* QR Code Card */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <QrCode className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-500 flex-shrink-0" />
            <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-gray-800">QR Code Anda</h3>
          </div>
          
          <div className="text-center space-y-2 sm:space-y-3 lg:space-y-4">
            <div className="inline-block p-2 sm:p-3 lg:p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
              <QRCodeSVG
                value={currentUser.qrCode}
                size={80}
                level="M"
                includeMargin={true}
                className="block w-20 h-20 sm:w-24 sm:h-24 lg:w-[120px] lg:h-[120px]"
              />
            </div>
            <div>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-1">Gunakan QR Code ini untuk absensi</p>
              <p className="text-xs sm:text-sm text-gray-500">
                {isOnLeaveToday || hasPendingLeave ? 'QR Code tidak dapat digunakan saat izin/pending' : 'Tunjukkan ke admin untuk scan absensi'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Card */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-500 flex-shrink-0" />
          <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-gray-800">Statistik Absensi</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 mb-1">{userAttendance.length}</div>
            <div className="text-xs sm:text-sm lg:text-base text-blue-800">Total Absensi</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 mb-1">
              {userAttendance.filter(att => {
                const attDate = new Date(att.date);
                const now = new Date();
                return attDate.getMonth() === now.getMonth() && attDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <div className="text-xs sm:text-sm lg:text-base text-green-800">Bulan Ini</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 sm:p-4 text-center sm:col-span-1">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600 mb-1">
              {userAttendance.filter(att => {
                const attDate = new Date(att.date);
                const now = new Date();
                const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                return attDate >= startOfWeek;
              }).length}
            </div>
            <div className="text-xs sm:text-sm lg:text-base text-purple-800">Minggu Ini</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
        <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <button
            onClick={onAbsenMasuk}
            disabled={!!todayAttendance?.checkInTime || isOnLeaveToday || hasPendingLeave}
            className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border transition-colors touch-target ${
              todayAttendance?.checkInTime || isOnLeaveToday || hasPendingLeave
                ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800 hover:shadow-md transform hover:scale-105 cursor-pointer'
            }`}
          >
            <LogIn className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
            <div className="text-left">
              <p className="font-medium text-xs sm:text-sm lg:text-base">
                {isOnLeaveToday 
                  ? 'Sedang Izin' 
                  : hasPendingLeave
                    ? 'Izin Pending'
                    : todayAttendance?.checkInTime 
                      ? 'Sudah Absen Masuk' 
                      : 'Absen Masuk'
                }
              </p>
              <p className="text-xs sm:text-sm">
                {isOnLeaveToday 
                  ? 'Tidak dapat absen saat izin'
                  : hasPendingLeave
                    ? 'Tidak dapat absen saat pending'
                    : todayAttendance?.checkInTime 
                      ? 'Anda sudah melakukan absen masuk' 
                      : 'Lakukan absensi masuk dengan foto'
                }
              </p>
            </div>
          </button>

          <button
            onClick={onAbsenKeluar}
            disabled={!todayAttendance?.checkInTime || !!todayAttendance?.checkOutTime || isOnLeaveToday || hasPendingLeave}
            className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border transition-colors touch-target ${
              !todayAttendance?.checkInTime || todayAttendance?.checkOutTime || isOnLeaveToday || hasPendingLeave
                ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800 hover:shadow-md transform hover:scale-105 cursor-pointer'
            }`}
          >
            <LogOutIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
            <div className="text-left">
              <p className="font-medium text-xs sm:text-sm lg:text-base">
                {isOnLeaveToday 
                  ? 'Sedang Izin'
                  : hasPendingLeave
                    ? 'Izin Pending'
                    : !todayAttendance?.checkInTime 
                      ? 'Absen Masuk Dulu' 
                      : todayAttendance?.checkOutTime 
                        ? 'Sudah Absen Keluar' 
                        : 'Absen Keluar'
                }
              </p>
              <p className="text-xs sm:text-sm">
                {isOnLeaveToday 
                  ? 'Tidak dapat absen saat izin'
                  : hasPendingLeave
                    ? 'Tidak dapat absen saat pending'
                    : !todayAttendance?.checkInTime 
                      ? 'Lakukan absen masuk terlebih dahulu'
                      : todayAttendance?.checkOutTime 
                        ? 'Anda sudah melakukan absen keluar'
                        : 'Lakukan absensi keluar dengan foto'
                }
              </p>
            </div>
          </button>
          
          <button
            onClick={onViewAttendance}
            className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors hover:shadow-md transform hover:scale-105 cursor-pointer touch-target sm:col-span-2 lg:col-span-1"
          >
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-500 flex-shrink-0" />
            <div className="text-left">
              <p className="font-medium text-green-800 text-xs sm:text-sm lg:text-base">Riwayat Absensi</p>
              <p className="text-xs sm:text-sm text-green-600">Lihat riwayat absensi Anda</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;