import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AttendanceRecord, LeaveRequest } from './types';
import { attendanceAPI, leaveRequestsAPI } from '../../services/api';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import AttendanceView from './views/AttendanceView';
import AbsenMasukView from './views/AbsenMasukView';
import AbsenKeluarView from './views/AbsenKeluarView';
import AbsenSekarangView from './views/AbsenSekarangView';
import SalaryView from './views/SalaryView';
import ProfileView from './views/ProfileView';
import NotificationBell from './components/NotificationBell';
import NotificationToast from './components/NotificationToast';

const UserDashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [attendanceSubmenu, setAttendanceSubmenu] = useState(false);
  const [userAttendance, setUserAttendance] = useState<AttendanceRecord[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
    show: false,
    type: 'success',
    message: ''
  });
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { currentUser, logout } = useAuth();

  // Auto hide notification after 4 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({
      show: true,
      type,
      message
    });
  };

  // Function to load attendance data from API
  const loadAttendanceData = async () => {
    if (!currentUser) return;

    try {
      const response = await attendanceAPI.getSummary(currentUser.id);
      if (response.success) {
        const attendanceData = response.data.attendance.map((att: any) => ({
          ...att,
          id: att._id,
          employeeId: att.employeeId._id || att.employeeId
        }));
        
        console.log('Loaded user attendance from API:', attendanceData);
        setUserAttendance(attendanceData);
      }
    } catch (error) {
      console.error('Error loading attendance from API:', error);
      showNotification('error', 'Gagal memuat data absensi');
      setUserAttendance([]);
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Silent data update without loading states
  const updateAttendanceDataSilently = async () => {
    if (!currentUser) return;

    try {
      const response = await attendanceAPI.getSummary(currentUser.id);
      if (response.success) {
        const attendanceData = response.data.attendance.map((att: any) => ({
          ...att,
          id: att._id,
          employeeId: att.employeeId._id || att.employeeId
        }));
        setUserAttendance(attendanceData);
      }
    } catch (error) {
      console.error('Error updating attendance silently:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setIsInitialLoading(true);
      loadAttendanceData();
    }
  }, [currentUser]);

  // Auto-refresh data every 30 seconds without loading states
  useEffect(() => {
    if (!isInitialLoading && currentUser) {
      const interval = setInterval(() => {
        updateAttendanceDataSilently();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isInitialLoading, currentUser?.id]);

  if (!currentUser) {
    return null;
  }

  const getTodayAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    return userAttendance.find(att => att.date === today);
  };

  // Check if user has pending leave request for today
  const hasPendingLeaveToday = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await leaveRequestsAPI.getAll({ 
        employeeId: currentUser.id, 
        status: 'pending' 
      });
      
      if (response.success) {
        return response.data.some((req: LeaveRequest) => 
          new Date(req.startDate) <= new Date(today) &&
          new Date(req.endDate) >= new Date(today)
        );
      }
      return false;
    } catch (error) {
      console.error('Error checking pending leave:', error);
      return false;
    }
  };

  const handleAttendanceMenuClick = () => {
    setActiveMenu('attendance');
    setAttendanceSubmenu(!attendanceSubmenu);
  };

  const handleAbsenMasukClick = async () => {
    // Check if user has pending leave request for today
    const hasPendingLeave = await hasPendingLeaveToday();
    if (hasPendingLeave) {
      showNotification('error', 'Anda tidak dapat melakukan absensi karena memiliki pengajuan izin yang sedang pending untuk hari ini.');
      return;
    }

    // Check if user is on leave today
    const todayAttendance = getTodayAttendance();
    if (todayAttendance?.attendanceType === 'leave') {
      try {
        const response = await leaveRequestsAPI.getById(todayAttendance.leaveRequestId!);
        if (response.success && response.data.status === 'approved') {
          showNotification('error', 'Anda tidak dapat melakukan absensi karena sedang dalam status izin yang disetujui hari ini.');
          return;
        }
      } catch (error) {
        console.error('Error checking leave request:', error);
      }
    }

    // Check if already checked in today
    if (todayAttendance?.checkInTime) {
      showNotification('error', 'Anda sudah melakukan absen masuk hari ini.');
      return;
    }
    
    setActiveMenu('absen-masuk');
    setAttendanceSubmenu(false);
    setSidebarOpen(false);
  };

  const handleAbsenKeluarClick = async () => {
    // Check if user has pending leave request for today
    const hasPendingLeave = await hasPendingLeaveToday();
    if (hasPendingLeave) {
      showNotification('error', 'Anda tidak dapat melakukan absensi karena memiliki pengajuan izin yang sedang pending untuk hari ini.');
      return;
    }

    // Check if user is on leave today
    const todayAttendance = getTodayAttendance();
    if (todayAttendance?.attendanceType === 'leave') {
      try {
        const response = await leaveRequestsAPI.getById(todayAttendance.leaveRequestId!);
        if (response.success && response.data.status === 'approved') {
          showNotification('error', 'Anda tidak dapat melakukan absensi karena sedang dalam status izin yang disetujui hari ini.');
          return;
        }
      } catch (error) {
        console.error('Error checking leave request:', error);
      }
    }

    // Check if not checked in yet
    if (!todayAttendance?.checkInTime) {
      showNotification('error', 'Anda harus melakukan absen masuk terlebih dahulu.');
      return;
    }

    // Check if already checked out
    if (todayAttendance?.checkOutTime) {
      showNotification('error', 'Anda sudah melakukan absen keluar hari ini.');
      return;
    }
    
    setActiveMenu('absen-keluar');
    setAttendanceSubmenu(false);
    setSidebarOpen(false);
  };

  const handleAbsenSekarangClick = () => {
    setActiveMenu('absen-sekarang');
    setAttendanceSubmenu(false);
    setSidebarOpen(false);
  };

  const handleAttendanceSubmit = async (newAttendance: AttendanceRecord) => {
    try {
      // Submit to API
      const response = await attendanceAPI.checkIn({
        employeeId: currentUser.id,
        checkInPhoto: newAttendance.checkInPhoto,
        location: newAttendance.location ? {
          latitude: newAttendance.location.latitude,
          longitude: newAttendance.location.longitude
        } : undefined,
        method: newAttendance.checkInMethod
      });
      
      if (response.success) {
        // Reload attendance data
        await updateAttendanceDataSilently();
        
        setActiveMenu('dashboard');
        
        // Show success notification
        const statusText = response.data.checkInStatus === 'on-time' ? 'tepat waktu' : 'terlambat';
        showNotification('success', `✅ Absen masuk berhasil! Status: ${statusText}. Foto telah dikirim ke admin.`);
      }
    } catch (error: any) {
      console.error('Error submitting attendance:', error);
      showNotification('error', error.message || 'Gagal menyimpan absensi. Silakan coba lagi.');
    }
  };

  const handleAttendanceUpdate = async (updatedAttendance: AttendanceRecord) => {
    try {
      // Submit to API
      const response = await attendanceAPI.checkOut({
        employeeId: currentUser.id,
        checkOutPhoto: updatedAttendance.checkOutPhoto,
        location: updatedAttendance.location ? {
          latitude: updatedAttendance.location.latitude,
          longitude: updatedAttendance.location.longitude
        } : undefined,
        method: updatedAttendance.checkOutMethod
      });
      
      if (response.success) {
        // Reload attendance data
        await updateAttendanceDataSilently();
        
        setActiveMenu('dashboard');
        
        // Show success notification
        const statusText = response.data.checkOutStatus === 'on-time' ? 'tepat waktu' : 'pulang cepat';
        showNotification('success', `✅ Absen keluar berhasil! Status: ${statusText}. Foto telah dikirim ke admin.`);
      }
    } catch (error: any) {
      console.error('Error updating attendance:', error);
      showNotification('error', error.message || 'Gagal memperbarui absensi. Silakan coba lagi.');
    }
  };

  const handleLeaveRequestSubmit = async (leaveRequestData: Omit<LeaveRequest, 'id' | 'submittedAt'>) => {
    try {
      console.log('Submitting leave request:', leaveRequestData);
      
      const response = await leaveRequestsAPI.create({
        employeeId: currentUser.id,
        reason: leaveRequestData.reason,
        startDate: leaveRequestData.startDate,
        endDate: leaveRequestData.endDate,
        days: leaveRequestData.days
      });
      
      console.log('Leave request response:', response);
      
      if (response.success) {
        setActiveMenu('dashboard');
        showNotification('success', '📝 Pengajuan izin berhasil dikirim! Menunggu persetujuan admin.');
        
        // Reload attendance data to show new leave records
        await updateAttendanceDataSilently();
      } else {
        console.error('Leave request failed:', response);
        showNotification('error', response.message || 'Gagal mengirim pengajuan izin.');
      }
    } catch (error: any) {
      console.error('Error submitting leave request:', error);
      
      // Check if it's a specific error from server response
      if (error.message) {
        if (error.message.includes('overlapping') || error.message.includes('pengajuan izin')) {
          showNotification('error', error.message);
        } else if (error.message.includes('success') || error.message.includes('berhasil')) {
          // Sometimes the API returns success message in error format
          setActiveMenu('dashboard');
          showNotification('success', '📝 Pengajuan izin berhasil dikirim! Menunggu persetujuan admin.');
          await updateAttendanceDataSilently();
        } else {
          showNotification('error', error.message);
        }
      } else {
        // If no specific error message, assume success since data was created
        setActiveMenu('dashboard');
        showNotification('success', '📝 Pengajuan izin berhasil dikirim! Menunggu persetujuan admin.');
        await updateAttendanceDataSilently();
      }
    }
  };

  const handleMenuChange = (menu: string) => {
    setActiveMenu(menu);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    if (isInitialLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (activeMenu) {
      case 'dashboard':
        return (
          <DashboardView 
            currentUser={currentUser}
            userAttendance={userAttendance}
            todayAttendance={getTodayAttendance()}
            onAbsenMasuk={handleAbsenMasukClick}
            onAbsenKeluar={handleAbsenKeluarClick}
            onViewAttendance={() => handleMenuChange('attendance')}
          />
        );
      case 'absen-masuk':
        return (
          <AbsenMasukView
            currentUser={currentUser}
            todayAttendance={getTodayAttendance()}
            onAttendanceSubmit={handleAttendanceSubmit}
            onBackToDashboard={() => handleMenuChange('dashboard')}
          />
        );
      case 'absen-keluar':
        return (
          <AbsenKeluarView
            currentUser={currentUser}
            todayAttendance={getTodayAttendance()}
            onAttendanceUpdate={handleAttendanceUpdate}
            onBackToDashboard={() => handleMenuChange('dashboard')}
          />
        );
      case 'absen-sekarang':
        return (
          <AbsenSekarangView
            currentUser={currentUser}
            onLeaveRequestSubmit={handleLeaveRequestSubmit}
            onBackToDashboard={() => handleMenuChange('dashboard')}
          />
        );
      case 'attendance':
        return <AttendanceView userAttendance={userAttendance} />;
      case 'salary':
        return <SalaryView currentUser={currentUser} />;
      case 'profile':
        return <ProfileView currentUser={currentUser} />;
      default:
        return (
          <DashboardView 
            currentUser={currentUser}
            userAttendance={userAttendance}
            todayAttendance={getTodayAttendance()}
            onAbsenMasuk={handleAbsenMasukClick}
            onAbsenKeluar={handleAbsenKeluarClick}
            onViewAttendance={() => handleMenuChange('attendance')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Notification Toast */}
      <NotificationToast 
        notification={notification}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />

      {/* Mobile Header */}
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
        <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate mx-2">Sistem Absensi</h1>
        <NotificationBell userId={currentUser.id} />
      </div>

      {/* Desktop Header with Notification */}
      <div className="hidden lg:block fixed top-0 right-0 z-40 p-3 lg:p-4">
        <NotificationBell userId={currentUser.id} />
      </div>

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
          currentUser={currentUser}
          activeMenu={activeMenu}
          attendanceSubmenu={attendanceSubmenu}
          onMenuChange={handleMenuChange}
          onAttendanceMenuClick={handleAttendanceMenuClick}
          onAbsenMasukClick={handleAbsenMasukClick}
          onAbsenKeluarClick={handleAbsenKeluarClick}
          onAbsenSekarangClick={handleAbsenSekarangClick}
          onLogout={logout}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 lg:overflow-y-auto">
        <div className="p-3 sm:p-4 lg:p-6 xl:p-8 pt-16 sm:pt-18 lg:pt-16 min-h-screen overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;