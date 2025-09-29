import { useState } from 'react';
import { AttendanceRecord } from '../types';
import { attendanceAPI } from '../../../services/api';

export const useQRScanner = (
  attendance: AttendanceRecord[],
  setAttendance: (attendance: AttendanceRecord[]) => void,
  updateDataSilently: () => void,
  showNotification: (type: 'success' | 'error', message: string) => void
) => {
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
    handleQRScan
  };
};