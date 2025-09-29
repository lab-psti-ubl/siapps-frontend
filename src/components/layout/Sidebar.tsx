import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  LogOut, 
  Settings, 
  Wifi,
  User as UserIcon,
  Phone,
  ChevronDown,
  ChevronRight,
  LogIn,
  LogOut as LogOutIcon,
  FileText,
  DollarSign
} from 'lucide-react';
import { User } from '../../types/auth';

interface SidebarProps {
  userType: 'admin' | 'user';
  currentUser?: User;
  activeMenu: string;
  attendanceSubmenu?: boolean;
  onMenuChange: (menu: string) => void;
  onAttendanceMenuClick?: () => void;
  onAbsenMasukClick?: () => void;
  onAbsenKeluarClick?: () => void;
  onAbsenSekarangClick?: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  userType,
  currentUser,
  activeMenu,
  attendanceSubmenu = false,
  onMenuChange,
  onAttendanceMenuClick,
  onAbsenMasukClick,
  onAbsenKeluarClick,
  onAbsenSekarangClick,
  onLogout
}) => {
  const isAdmin = userType === 'admin';
  const isUser = userType === 'user';

  return (
    <div className="w-56 sm:w-64 bg-white shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              {isAdmin ? 'Admin Panel' : 'User Panel'}
            </h2>
            {currentUser && (
              <p className="text-xs sm:text-sm text-gray-600 truncate">{currentUser.name}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 mt-4 sm:mt-6 overflow-y-auto">
        <div className="px-3 sm:px-6 space-y-1 sm:space-y-2">
          {/* Dashboard - Common for both */}
          <button
            onClick={() => onMenuChange('dashboard')}
            className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors touch-target ${
              activeMenu === 'dashboard'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-sm sm:text-base">Dashboard</span>
          </button>

          {/* Admin Menu Items */}
          {isAdmin && (
            <>
              <button
                onClick={() => onMenuChange('data-absen')}
                className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors touch-target ${
                  activeMenu === 'data-absen'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">Data Absen</span>
              </button>
              
              <button
                onClick={() => onMenuChange('data-pegawai')}
                className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors touch-target ${
                  activeMenu === 'data-pegawai'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">Data Pegawai</span>
              </button>

              

              <button
                onClick={() => onMenuChange('data-alat-rfid')}
                className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors touch-target ${
                  activeMenu === 'data-alat-rfid'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Wifi className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">Data Alat RFID</span>
              </button>

              <button
                onClick={() => onMenuChange('manajemen-gaji')}
                className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors touch-target ${
                  activeMenu === 'manajemen-gaji'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">Manajemen Gaji</span>
              </button>

              <button
                onClick={() => onMenuChange('pengaturan')}
                className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors touch-target ${
                  activeMenu === 'pengaturan'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">Pengaturan</span>
              </button>
            </>
          )}

          {/* User Menu Items */}
          {isUser && (
            <>
              {/* Attendance Menu with Submenu */}
              <div className="space-y-1 sm:space-y-1">
                <button
                  onClick={onAttendanceMenuClick}
                  className={`w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors touch-target ${
                    activeMenu === 'riwayat-absensi' || activeMenu === 'absen-masuk' || activeMenu === 'absen-keluar' || activeMenu === 'ajukan-izin'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Absensi</span>
                  </div>
                  {attendanceSubmenu ? (
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  )}
                </button>
                
                {/* Submenu */}
                {attendanceSubmenu && (
                  <div className="ml-3 sm:ml-4 space-y-1">
                    <button
                      onClick={onAbsenMasukClick}
                      className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm touch-target ${
                        activeMenu === 'absen-masuk'
                          ? 'bg-blue-400 text-white'
                          : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
                      }`}
                    >
                      <LogIn className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>Absen Masuk</span>
                    </button>

                    <button
                      onClick={onAbsenKeluarClick}
                      className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm touch-target ${
                        activeMenu === 'absen-keluar'
                          ? 'bg-blue-400 text-white'
                          : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
                      }`}
                    >
                      <LogOutIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>Absen Keluar</span>
                    </button>

                    <button
                      onClick={onAbsenSekarangClick}
                      className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm touch-target ${
                        activeMenu === 'ajukan-izin'
                          ? 'bg-blue-400 text-white'
                          : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
                      }`}
                    >
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>Ajukan Izin</span>
                    </button>
                    
                    <button
                      onClick={() => onMenuChange('riwayat-absensi')}
                      className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm touch-target ${
                        activeMenu === 'riwayat-absensi'
                          ? 'bg-blue-400 text-white'
                          : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
                      }`}
                    >
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>Riwayat Absensi</span>
                    </button>
                  </div>
                )}
              </div>
              
              
              
              <button
                onClick={() => onMenuChange('profil')}
                className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors touch-target ${
                  activeMenu === 'profil'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">Profil Saya</span>
              </button>
              
              <button
                onClick={() => onMenuChange('data-gaji')}
                className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors touch-target ${
                  activeMenu === 'data-gaji'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">Data Gaji</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Logout Button at Bottom */}
      <div className="p-3 sm:p-6 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-target"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="text-sm sm:text-base">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;