import { useState } from 'react';
import { Employee, AttendanceRecord } from '../types';

export const useModalState = () => {
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
  const [photoType, setPhotoType] = useState<'checkIn' | 'checkOut'>('checkIn');

  const openEditModal = (employee: Employee, setFormDataFromEmployee: (employee: Employee) => void) => {
    setSelectedEmployee(employee);
    setFormDataFromEmployee(employee);
    setShowEditModal(true);
  };

  const closeAllModals = (resetForm: () => void) => {
    setShowAddEmployeeModal(false);
    setShowDetailModal(false);
    setShowEditModal(false);
    setShowScannerModal(false);
    setShowPhotoModal(false);
    setSelectedEmployee(null);
    setSelectedAttendance(null);
    resetForm();
  };

  const viewAttendancePhoto = (record: AttendanceRecord, type: 'checkIn' | 'checkOut') => {
    setSelectedAttendance(record);
    setPhotoType(type);
    setShowPhotoModal(true);
  };

  return {
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
    setSelectedAttendance,
    photoType,
    setPhotoType,
    openEditModal,
    closeAllModals,
    viewAttendancePhoto
  };
};