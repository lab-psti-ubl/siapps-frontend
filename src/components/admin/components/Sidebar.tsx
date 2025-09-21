import React from 'react';
import { LayoutDashboard, Users, Clock, LogOut, Settings, DollarSign, Wifi } from 'lucide-react';

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, onMenuChange, onLogout }) => {
  return (
    <div className="w-56 sm:w-64 bg-white shadow-lg flex flex-col h-full">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Admin Panel</h2>
      </div>
      
      <nav className="flex-1 mt-4 sm:mt-6 overflow-y-auto">
        <div className="px-3 sm:px-6 space-y-1 sm:space-y-2">
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
          
          <button
            onClick={() => onMenuChange('attendance')}
            className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors touch-target ${
              activeMenu === 'attendance'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-sm sm:text-base">Data Absen</span>
          </button>
          
          <button
            onClick={() => onMenuChange('employees')}
            className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors touch-target ${
              activeMenu === 'employees'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-sm sm:text-base">Data Pegawai</span>
          </button>

          <button
            onClick={() => onMenuChange('salary')}
            className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors touch-target ${
              activeMenu === 'salary'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-sm sm:text-base">Manajemen Gaji</span>
          </button>

          <button
            onClick={() => onMenuChange('rfid-devices')}
            className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors touch-target ${
              activeMenu === 'rfid-devices'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Wifi className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-sm sm:text-base">Data Alat RFID</span>
          </button>

          <button
            onClick={() => onMenuChange('settings')}
            className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors touch-target ${
              activeMenu === 'settings'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-sm sm:text-base">Pengaturan</span>
          </button>
        </div>
      </nav>

      {/* Logout Button at Bottom */}
      <div className="p-3 sm:p-6 border-t border-gray-200 mt-auto flex-shrink-0">
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