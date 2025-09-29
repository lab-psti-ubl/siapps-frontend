import React from 'react';
import { Menu, X } from 'lucide-react';
import NotificationBell from '../user/components/NotificationBell';

interface HeaderProps {
  userType: 'admin' | 'user';
  currentUserId?: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({
  userType,
  currentUserId,
  sidebarOpen,
  setSidebarOpen,
  title
}) => {
  const defaultTitle = userType === 'admin' ? 'Admin Panel' : 'Sistem Absensi';

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-40 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target"
      >
        {sidebarOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
        ) : (
          <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
        )}
      </button>
      
      <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate mx-2">
        {title || defaultTitle}
      </h1>
      
      {userType === 'user' && currentUserId ? (
        <NotificationBell userId={currentUserId} />
      ) : (
        <div className="w-10"></div>
      )}
    </div>
  );
};

export default Header;