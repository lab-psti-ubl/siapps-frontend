import { Employee } from '../types';
import { employeesAPI, attendanceAPI } from '../../../services/api';
import { EmployeeFormData } from './useEmployeeForm';

interface UseEmployeeActionsProps {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  setAttendance: (attendance: any[]) => void;
  formData: EmployeeFormData;
  resetForm: () => void;
  updateDataSilently: () => void;
  showNotification: (type: 'success' | 'error', message: string) => void;
}

export const useEmployeeActions = ({
  employees,
  setEmployees,
  setAttendance,
  formData,
  resetForm,
  updateDataSilently,
  showNotification
}: UseEmployeeActionsProps) => {
  
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
        
        setEmployees([...employees, newEmployee]);
        resetForm();
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

  const handleEditEmployee = async (e: React.FormEvent, selectedEmployee: Employee) => {
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
        
        setEmployees(employees.map(emp => 
          emp.id === selectedEmployee.id ? updatedEmployee : emp
        ));
        
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
        setEmployees(employees.filter(emp => emp.id !== id));
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
  };

  return {
    handleAddEmployee,
    handleEditEmployee,
    handleDeleteEmployee,
    handleQRScan
  };
};