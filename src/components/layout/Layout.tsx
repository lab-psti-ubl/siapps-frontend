import React from 'react';
import { User } from '../../types/auth';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationBell from '../user/components/NotificationBell';

interface LayoutProps {
  userType: 'admin' | 'user';
  currentUser?: User;
  activeMenu: string;
  attendanceSubmenu?: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onMenuChange: (menu: string) => void;
  onAttendanceMenuClick?: () => void;
  onAbsenMasukClick?: () => void;
  onAbsenKeluarClick?: () => void;
  onAbsenSekarangClick?: () => void;
  onLogout: () => void;
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({
  userType,
  currentUser,
  activeMenu,
  attendanceSubmenu,
  sidebarOpen,
  setSidebarOpen,
  onMenuChange,
  onAttendanceMenuClick,
  onAbsenMasukClick,
  onAbsenKeluarClick,
  onAbsenSekarangClick,
  onLogout,
  children,
  title
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Mobile Header */}
      <Header
        userType={userType}
        currentUserId={currentUser?.id}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        title={title}
      />

      {/* Desktop Notification Bell for User */}
      {userType === 'user' && currentUser && (
        <div className="hidden lg:block fixed top-0 right-0 z-40 p-3 lg:p-4">
          <NotificationBell userId={currentUser.id} />
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:sticky lg:top-0 inset-y-0 left-0 z-40 w-56 sm:w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar
          userType={userType}
          currentUser={currentUser}
          activeMenu={activeMenu}
          attendanceSubmenu={attendanceSubmenu}
          onMenuChange={onMenuChange}
          onAttendanceMenuClick={onAttendanceMenuClick}
          onAbsenMasukClick={onAbsenMasukClick}
          onAbsenKeluarClick={onAbsenKeluarClick}
          onAbsenSekarangClick={onAbsenSekarangClick}
          onLogout={onLogout}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 lg:overflow-y-auto">
        <div className="p-3 sm:p-4 lg:p-6 xl:p-8 pt-4 sm:pt-18 lg:pt-16 min-h-screen overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;