import React from 'react';
import { Employee, AttendanceRecord } from '../types';
import { EmployeeFormData } from '../hooks/useEmployeeForm';
import AddEmployeeModal from '../modals/AddEmployeeModal';
import DetailModal from '../modals/DetailModal';
import EditModal from '../modals/EditModal';
import ScannerModal from '../modals/ScannerModal';
import PhotoModal from '../modals/PhotoModal';

interface AdminModalsProps {
  showAddEmployeeModal: boolean;
  showDetailModal: boolean;
  showEditModal: boolean;
  showScannerModal: boolean;
  showPhotoModal: boolean;
  selectedEmployee: Employee | null;
  selectedAttendance: AttendanceRecord | null;
  photoType: 'checkIn' | 'checkOut';
  formData: EmployeeFormData;
  onFormDataChange: (data: EmployeeFormData) => void;
  onAddEmployee: (e: React.FormEvent) => void;
  onEditEmployee: (e: React.FormEvent) => void;
  onQRScan: (data: any) => void;
  onCloseAddModal: () => void;
  onCloseDetailModal: () => void;
  onCloseEditModal: () => void;
  onCloseScannerModal: () => void;
  onClosePhotoModal: () => void;
}

const AdminModals: React.FC<AdminModalsProps> = ({
  showAddEmployeeModal,
  showDetailModal,
  showEditModal,
  showScannerModal,
  showPhotoModal,
  selectedEmployee,
  selectedAttendance,
  photoType,
  formData,
  onFormDataChange,
  onAddEmployee,
  onEditEmployee,
  onQRScan,
  onCloseAddModal,
  onCloseDetailModal,
  onCloseEditModal,
  onCloseScannerModal,
  onClosePhotoModal
}) => {
  return (
    <>
      {showAddEmployeeModal && (
        <AddEmployeeModal
          formData={formData}
          onFormDataChange={onFormDataChange}
          onSubmit={onAddEmployee}
          onClose={onCloseAddModal}
        />
      )}

      {showDetailModal && selectedEmployee && (
        <DetailModal
          employee={selectedEmployee}
          onClose={onCloseDetailModal}
        />
      )}

      {showEditModal && selectedEmployee && (
        <EditModal
          employee={selectedEmployee}
          formData={formData}
          onFormDataChange={onFormDataChange}
          onSubmit={onEditEmployee}
          onClose={onCloseEditModal}
        />
      )}

      {showScannerModal && (
        <ScannerModal
          onScan={onQRScan}
          onClose={onCloseScannerModal}
        />
      )}

      {showPhotoModal && selectedAttendance && (
        <PhotoModal
          attendance={selectedAttendance}
          photoType={photoType}
          onClose={onClosePhotoModal}
        />
      )}
    </>
  );
};

export default AdminModals;