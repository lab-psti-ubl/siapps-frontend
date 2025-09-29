import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Layout } from '../../layout';
import { useAdminData } from '../hooks/useAdminData';
import { useEmployeeForm } from '../hooks/useEmployeeForm';
import { useEmployeeActions } from '../hooks/useEmployeeActions';
import { useModalState } from '../hooks/useModalState';
import { useNotification } from '../hooks/useNotification';
import AdminMainContent from '../components/AdminMainContent';
import AdminModals from '../components/AdminModals';
import NotificationToast from '../components/NotificationToast';
import DashboardView from '../dashboard/DashboardView';
import EmployeesView from '../views/employees/EmployeesView';
import AttendanceView from '../attendance/AttendanceView';
import SettingsView from '../views/SettingsView';
import SalaryView from '../views/SalaryView';
import RfidDevicesView from '../views/rfid/RfidDevicesView';

const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { logout } = useAuth();

  // Get current menu from URL
  const getCurrentMenu = () => {
    const path = location.pathname.split('/').pop();
    return path || 'dashboard';
  };

  const activeMenu = getCurrentMenu();
  
  // Custom hooks
  const { employees, setEmployees, attendance, setAttendance, isLoading, updateDataSilently } = useAdminData();
  const { formData, setFormData, resetForm, setFormDataFromEmployee } = useEmployeeForm();
  const { notification, showNotification, hideNotification } = useNotification();
  const {
    showAddEmployeeModal,
    setShowAddEmployeeModal,
    showDetailModal,
    setShowDetailModal,
    showEditModal,
    setShowEditModal,
    showScannerModal,
    setShowScannerModal,
    showPhotoModal,
    setShowPhotoModal,
    selectedEmployee,
    setSelectedEmployee,
    selectedAttendance,
    photoType,
    openEditModal,
    closeAllModals,
    viewAttendancePhoto
  } = useModalState();
  
  const { handleAddEmployee, handleEditEmployee, handleDeleteEmployee, handleQRScan } = useEmployeeActions({
    employees,
    setEmployees,
    setAttendance,
    formData,
    resetForm,
    updateDataSilently,
    showNotification
  });

  const handleMenuChange = (menu: string) => {
    navigate(`/admin/${menu}`);
    setSidebarOpen(false);
  };

  const handleSettingsUpdate = () => {
    showNotification('success', '⚙️ Pengaturan berhasil diperbarui');
  };

  // Function to handle data updates from child components
  const handleDataUpdate = () => {
    // Force reload data from API to ensure fresh data
    console.log('Forcing data update from AdminDashboard');
    updateDataSilently();
    
    // Show brief notification that data is being updated
    showNotification('info', '🔄 Memperbarui data dari database...');
  };

  const getTodayAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    return attendance.filter(att => att.date === today);
  };

  return (
    <>
      <NotificationToast 
        notification={notification}
        onClose={hideNotification}
      />

      <Layout
        userType="admin"
        activeMenu={activeMenu}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onMenuChange={handleMenuChange}
        onLogout={logout}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/dashboard" element={
            isLoading ? (
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <DashboardView employees={employees} attendance={getTodayAttendance()} />
            )
          } />
          <Route path="/data-absen" element={
            <AttendanceView 
              attendance={attendance} 
              employees={employees}
              onScanQR={() => setShowScannerModal(true)}
              onViewPhoto={viewAttendancePhoto}
              onDataUpdate={handleDataUpdate}
              onNotification={showNotification}
            />
          } />
          <Route path="/data-pegawai" element={
            <EmployeesView 
              employees={employees}
              onAddEmployee={() => setShowAddEmployeeModal(true)}
              onViewEmployee={(employee) => {
                setSelectedEmployee(employee);
                setShowDetailModal(true);
              }}
              onEditEmployee={(employee) => openEditModal(employee, setFormDataFromEmployee)}
              onDeleteEmployee={handleDeleteEmployee}
            />
          } />
          <Route path="/data-alat-rfid" element={
            <RfidDevicesView onNotification={showNotification} />
          } />
          <Route path="/manajemen-gaji" element={
            <SalaryView onNotification={showNotification} />
          } />
          <Route path="/pengaturan" element={
            <SettingsView onSettingsUpdate={handleSettingsUpdate} />
          } />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Layout>

      <AdminModals 
        showAddEmployeeModal={showAddEmployeeModal}
        showDetailModal={showDetailModal}
        showEditModal={showEditModal}
        showScannerModal={showScannerModal}
        showPhotoModal={showPhotoModal}
        selectedEmployee={selectedEmployee}
        selectedAttendance={selectedAttendance}
        photoType={photoType}
        formData={formData}
        onFormDataChange={setFormData}
        onAddEmployee={handleAddEmployee}
        onEditEmployee={(e) => handleEditEmployee(e, selectedEmployee!)}
        onQRScan={(data) => {
          handleQRScan(data);
          setShowScannerModal(false);
        }}
        onCloseAddModal={() => {
          resetForm();
          setShowAddEmployeeModal(false);
        }}
        onCloseDetailModal={() => {
          setShowDetailModal(false);
          setSelectedEmployee(null);
        }}
        onCloseEditModal={() => {
          closeAllModals(resetForm);
        }}
        onCloseScannerModal={() => setShowScannerModal(false)}
        onClosePhotoModal={() => setShowPhotoModal(false)}
      />
    </>
  );
};

export default AdminDashboard;