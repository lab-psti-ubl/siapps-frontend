import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Employee, AttendanceRecord, NotificationState } from './types';
import { employeesAPI, attendanceAPI } from '../../services/api';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import EmployeesView from './views/EmployeesView';
import AttendanceView from './views/AttendanceView';
import SettingsView from './views/SettingsView';
import SalaryView from './views/SalaryView';
import RfidDevicesView from './views/RfidDevicesView';
import AddEmployeeModal from './modals/AddEmployeeModal';
import DetailModal from './modals/DetailModal';
import EditModal from './modals/EditModal';
import ScannerModal from './modals/ScannerModal';
import PhotoModal from './modals/PhotoModal';
import NotificationToast from './components/NotificationToast';

const AdminDashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
  const [photoType, setPhotoType] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: 'success',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    phone: '',
    nik: '',
    birthPlace: '',
    birthDate: '',
    basicSalary: '',
    rfidGuid: '',
    divisionId: '',
    workShiftId: '',
  });

  const { logout } = useAuth();

  // Load data from API on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Function to load all data from API
  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading admin data from API...');
      
      // Load employees
      const employeesResponse = await employeesAPI.getAll();
      if (employeesResponse.success) {
        const employeesData = employeesResponse.data.map((emp: any) => ({
          ...emp,
          id: emp._id,
          createdAt: new Date(emp.createdAt)
        }));
        console.log('Loaded employees from API:', employeesData);
        setEmployees(employeesData);
      }

      // Load today's attendance with proper date format
      const today = new Date().toISOString().split('T')[0];
      console.log('Loading attendance for date:', today);
      const attendanceResponse = await attendanceAPI.getAll({ date: today });
      if (attendanceResponse.success) {
        console.log('Raw attendance response:', attendanceResponse.data);
        const attendanceData = attendanceResponse.data.map((att: any) => ({
          ...att,
          id: att._id,
          employeeId: typeof att.employeeId === 'object' && att.employeeId._id 
            ? att.employeeId._id 
            : att.employeeId
        }));
        console.log('Loaded attendance from API:', attendanceData);
        setAttendance(attendanceData);
      } else {
        console.log('Failed to load attendance:', attendanceResponse);
        setAttendance([]);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      showNotification('error', 'Gagal memuat data dari server');
      setEmployees([]);
      setAttendance([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time data update without loading states
  const updateDataSilently = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [employeesResponse, attendanceResponse] = await Promise.all([
        employeesAPI.getAll(),
        attendanceAPI.getAll({ date: today })
      ]);
      
      if (employeesResponse.success) {
        const employeesData = employeesResponse.data.map((emp: any) => ({
          ...emp,
          id: emp._id,
          createdAt: new Date(emp.createdAt)
        }));
        setEmployees(employeesData);
      }
      
      if (attendanceResponse.success) {
        const attendanceData = attendanceResponse.data.map((att: any) => ({
          ...att,
          id: att._id,
          employeeId: typeof att.employeeId === 'object' && att.employeeId._id 
            ? att.employeeId._id 
            : att.employeeId
        }));
        setAttendance(attendanceData);
      }
    } catch (error) {
      console.error('Error updating data silently:', error);
    }
  };

  // Auto-refresh data every 30 seconds without loading states
  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        updateDataSilently();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isLoading]);

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

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const employeeData = {
        name: formData.name,
        phone: formData.phone,
        position: formData.position,
        nik: formData.nik,
        birthPlace: formData.birthPlace,
        birthDate: formData.birthDate,
        basicSalary: parseFloat(formData.basicSalary),
        rfidGuid: formData.rfidGuid,
        divisionId: formData.divisionId,
        workShiftId: formData.workShiftId
      };

      const response = await employeesAPI.create(employeeData);
      
      if (response.success) {
        const newEmployee = {
          ...response.data,
          id: response.data._id,
          createdAt: new Date(response.data.createdAt)
        };
        
        setEmployees(prev => [...prev, newEmployee]);
        
        // Reset form data after successful addition
        setFormData({
          name: '',
          position: '',
          phone: '',
          nik: '',
          birthPlace: '',
          birthDate: '',
          basicSalary: '',
          rfidGuid: '',
        });
        setShowAddEmployeeModal(false);
        showNotification('success', `✅ Pegawai ${formData.name} berhasil ditambahkan! Data akan otomatis muncul di manajemen gaji.`);
        
        // Update data silently to reflect changes
        setTimeout(() => {
          updateDataSilently();
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error adding employee:', error);
      showNotification('error', error.message || 'Gagal menambahkan pegawai');
    }
  };

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      const employeeData = {
        name: formData.name,
        phone: formData.phone,
        position: formData.position,
        nik: formData.nik,
        birthPlace: formData.birthPlace,
        birthDate: formData.birthDate,
        basicSalary: parseFloat(formData.basicSalary),
        rfidGuid: formData.rfidGuid,
        divisionId: formData.divisionId,
        workShiftId: formData.workShiftId
      };

      const response = await employeesAPI.update(selectedEmployee.id, employeeData);
      
      if (response.success) {
        const updatedEmployee = {
          ...response.data,
          id: response.data._id,
          createdAt: new Date(response.data.createdAt)
        };
        
        setEmployees(prev => prev.map(emp => 
          emp.id === selectedEmployee.id ? updatedEmployee : emp
        ));
        
        setShowEditModal(false);
        setSelectedEmployee(null);
        showNotification('success', `✅ Data pegawai ${formData.name} berhasil diperbarui! Perubahan akan terlihat di manajemen gaji.`);
        
        // Update data silently to reflect changes
        setTimeout(() => {
          updateDataSilently();
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error updating employee:', error);
      showNotification('error', error.message || 'Gagal memperbarui pegawai');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    const employeeToDelete = employees.find(emp => emp.id === id);
    if (!confirm(`Apakah Anda yakin ingin menghapus data pegawai ${employeeToDelete?.name}?`)) {
      return;
    }

    try {
      const response = await employeesAPI.delete(id);
      
      if (response.success) {
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        showNotification('success', `✅ Pegawai ${employeeToDelete?.name} berhasil dihapus! Data gaji terkait akan dibersihkan otomatis.`);
        
        // Update data silently to reflect changes
        setTimeout(() => {
          updateDataSilently();
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      showNotification('error', error.message || 'Gagal menghapus pegawai');
    }
  };

  const handleQRScan = async (scannedData: any) => {
    try {
      const response = await attendanceAPI.qrScan(scannedData.content);
      
      if (response.success) {
        // Update local attendance state
        const newAttendanceRecord = {
          ...response.data,
          id: response.data._id,
          employeeId: response.data.employeeId._id || response.data.employeeId
        };
        
        setAttendance(prev => {
          const existingIndex = prev.findIndex(att => att.id === newAttendanceRecord.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = newAttendanceRecord;
            return updated;
          } else {
            return [...prev, newAttendanceRecord];
          }
        });
        
        showNotification('success', response.message);
        
        // Update data silently to reflect changes
        setTimeout(() => {
          updateDataSilently();
        }, 1000);
      } else {
        showNotification('error', response.message);
      }
    } catch (error: any) {
      console.error('QR scan error:', error);
      showNotification('error', error.message || 'QR Code tidak dapat dibaca atau terjadi kesalahan');
    }
    
    setShowScannerModal(false);
  };

  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    // Format birthDate properly for date input
    const formattedBirthDate = employee.birthDate ? 
      new Date(employee.birthDate).toISOString().split('T')[0] : '';
    
    setFormData({
      name: employee.name,
      position: employee.position,
      phone: employee.phone,
      nik: employee.nik,
      birthPlace: employee.birthPlace,
      birthDate: formattedBirthDate,
      basicSalary: employee.basicSalary.toString(),
      rfidGuid: employee.rfidGuid || '',
      divisionId: employee.divisionId || '',
      workShiftId: employee.workShiftId || '',
    });
    setShowEditModal(true);
  };

  const getTodayAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    return attendance.filter(att => att.date === today);
  };

  const viewAttendancePhoto = (record: AttendanceRecord, type: 'checkIn' | 'checkOut') => {
    setSelectedAttendance(record);
    setPhotoType(type);
    setShowPhotoModal(true);
  };

  const handleMenuChange = (menu: string) => {
    setActiveMenu(menu);
    setSidebarOpen(false);
  };

  const handleSettingsUpdate = () => {
    showNotification('success', '⚙️ Pengaturan berhasil diperbarui');
  };

  // Function to handle data updates from child components
  const handleDataUpdate = () => {
    // Use silent update instead of showing loading
    updateDataSilently();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (activeMenu) {
      case 'dashboard':
        return <DashboardView employees={employees} attendance={getTodayAttendance()} />;
      case 'attendance':
        return (
          <AttendanceView 
            attendance={attendance} 
            employees={employees}
            onScanQR={() => setShowScannerModal(true)}
            onViewPhoto={viewAttendancePhoto}
            onDataUpdate={handleDataUpdate}
          />
        );
      case 'employees':
        return (
          <EmployeesView 
            employees={employees}
            onAddEmployee={() => setShowAddEmployeeModal(true)}
            onViewEmployee={(employee) => {
              setSelectedEmployee(employee);
              setShowDetailModal(true);
            }}
            onEditEmployee={openEditModal}
            onDeleteEmployee={handleDeleteEmployee}
          />
        );
      case 'settings':
        return <SettingsView onSettingsUpdate={handleSettingsUpdate} />;
      case 'salary':
        return <SalaryView onNotification={showNotification} employees={employees} />;
      case 'rfid-devices':
        return <RfidDevicesView onNotification={showNotification} />;
      default:
        return <DashboardView employees={employees} attendance={getTodayAttendance()} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
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
        <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 truncate mx-2">Admin Panel</h1>
        <div className="w-8 sm:w-10"></div>
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
          activeMenu={activeMenu}
          onMenuChange={handleMenuChange}
          onLogout={logout}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 lg:overflow-y-auto">
        <div className="p-3 sm:p-4 lg:p-6 xl:p-8 pt-16 sm:pt-18 lg:pt-8 min-h-screen overflow-y-auto">
          {renderContent()}
        </div>
      </div>

      {/* Modals */}
      {showAddEmployeeModal && (
        <AddEmployeeModal
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleAddEmployee}
          onClose={() => {
            // Reset form when closing modal
            setFormData({
              name: '',
              position: '',
              phone: '',
              nik: '',
              birthPlace: '',
              birthDate: '',
              basicSalary: '',
              rfidGuid: '',
              divisionId: '',
              workShiftId: '',
            });
            setShowAddEmployeeModal(false);
          }}
        />
      )}

      {showDetailModal && selectedEmployee && (
        <DetailModal
          employee={selectedEmployee}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {showEditModal && selectedEmployee && (
        <EditModal
          employee={selectedEmployee}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleEditEmployee}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEmployee(null);
            // Reset form when closing edit modal
            setFormData({
              name: '',
              position: '',
              phone: '',
              nik: '',
              birthPlace: '',
              birthDate: '',
              basicSalary: '',
              rfidGuid: '',
              divisionId: '',
              workShiftId: '',
            });
          }}
        />
      )}

      {showScannerModal && (
        <ScannerModal
          onScan={handleQRScan}
          onClose={() => setShowScannerModal(false)}
        />
      )}

      {showPhotoModal && selectedAttendance && (
        <PhotoModal
          attendance={selectedAttendance}
          photoType={photoType}
          onClose={() => setShowPhotoModal(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;