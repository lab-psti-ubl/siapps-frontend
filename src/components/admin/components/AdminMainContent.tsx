import React from 'react';
import { Employee, AttendanceRecord } from '../types';

interface AdminMainContentProps {
  activeMenu: string;
  employees: Employee[];
  attendance: AttendanceRecord[];
  isLoading: boolean;
  onAddEmployee: () => void;
  onViewEmployee: (employee: Employee) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onScanQR: () => void;
  onViewPhoto: (record: AttendanceRecord, type: 'checkIn' | 'checkOut') => void;
  onDataUpdate: () => void;
  onSettingsUpdate: () => void;
  onNotification: (type: 'success' | 'error', message: string) => void;
}

// This component is no longer needed as routing is handled in AdminDashboard
// Keeping it for backward compatibility but it's essentially a pass-through now
const AdminMainContent: React.FC<AdminMainContentProps> = () => {
  return null;
};

export default AdminMainContent;