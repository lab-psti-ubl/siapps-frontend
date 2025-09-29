import React, { useState, useEffect } from 'react';
import { AttendanceRecord, LeaveRequest } from '../types';
import LeaveRequestModal from '../modals/LeaveRequestModal';
import AttendanceHeader from './components/AttendanceHeader';
import AttendanceFilters from './components/AttendanceFilters';
import AttendanceStats from './components/AttendanceStats';
import AttendanceTable from './components/AttendanceTable';
import { useAttendanceData } from './hooks/useAttendanceData';
import { useAttendanceActions } from './hooks/useAttendanceActions';
import { calculateDailyStats, handleExportPDF } from './utils/attendanceUtils';

interface AttendanceViewProps {
  attendance: AttendanceRecord[];
  employees: any[];
  onScanQR: () => void;
  onViewPhoto: (record: AttendanceRecord, type: 'checkIn' | 'checkOut') => void;
  onDataUpdate?: () => void;
  onNotification?: (type: 'success' | 'error', message: string) => void;
}

const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendance,
  employees,
  onScanQR,
  onViewPhoto,
  onDataUpdate,
  onNotification
}) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [isExporting, setIsExporting] = useState(false);

  // Custom hooks
  const {
    localAttendance,
    setLocalAttendance,
    leaveRequests,
    setLeaveRequests,
    isLoadingLeaveRequests,
    isLoadingAttendance,
    loadLeaveRequests,
    updateAttendanceData
  } = useAttendanceData(selectedDate);

  const {
    showLeaveModal,
    setShowLeaveModal,
    selectedLeaveRequest,
    setSelectedLeaveRequest,
    handleViewLeaveRequest,
    handleLeaveRequestAction
  } = useAttendanceActions({
    leaveRequests,
    setLeaveRequests,
    loadLeaveRequests,
    onDataUpdate,
    showNotification: onNotification || (() => {})
  });

  // Update local attendance when prop changes
  useEffect(() => {
    console.log('Received attendance data:', attendance);
    
    if (attendance && attendance.length > 0) {
      // Normalize attendance data to ensure consistent employeeId format
      const normalizedAttendance = attendance.map(att => ({
        ...att,
        employeeId: typeof att.employeeId === 'object' && att.employeeId._id 
          ? att.employeeId._id 
          : att.employeeId
      }));
      console.log('Normalized attendance:', normalizedAttendance);
      setLocalAttendance(normalizedAttendance);
    } else {
      setLocalAttendance([]);
    }
  }, [attendance]);

  const handleExportPDFClick = async () => {
    setIsExporting(true);
    await handleExportPDF(selectedDate, localAttendance, employees, onNotification || (() => {}));
    setIsExporting(false);
  };

  // Filter attendance by selected date
  const filteredAttendance = localAttendance.filter(record => {
    // Direct comparison since data is already filtered by date from API
    return true;
  });
  
  console.log('Displaying attendance for', selectedDate, ':', filteredAttendance);

  // Calculate daily statistics
  const dailyStats = calculateDailyStats(filteredAttendance, employees, leaveRequests);

  const handleRefreshData = async () => {
    const success = await updateAttendanceData();
    if (success) {
      onNotification?.('success', '🔄 Data absensi berhasil diperbarui dari database');
    } else {
      onNotification?.('error', '❌ Gagal memperbarui data absensi');
    }
    
    loadLeaveRequests();
    
    // Notify parent component to update its data
    if (onDataUpdate) {
      onDataUpdate();
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">

      <AttendanceHeader onScanQR={onScanQR} />

      <AttendanceFilters
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onTodayClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
        onRefreshClick={handleRefreshData}
        onExportPDF={handleExportPDFClick}
        isExporting={isExporting}
        hasData={filteredAttendance.length > 0}
        isLoadingAttendance={isLoadingAttendance}
      />

      {/* Date Filter with Statistics */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
        <AttendanceStats stats={dailyStats} />
      </div>

      <AttendanceTable
        employees={employees}
        filteredAttendance={filteredAttendance}
        leaveRequests={leaveRequests}
        selectedDate={selectedDate}
        isLoadingLeaveRequests={isLoadingLeaveRequests}
        isLoadingAttendance={isLoadingAttendance}
        onViewPhoto={onViewPhoto}
        onViewLeaveRequest={handleViewLeaveRequest}
      />

      {/* Leave Request Modal */}
      {showLeaveModal && selectedLeaveRequest && (
        <LeaveRequestModal
          leaveRequest={selectedLeaveRequest}
          onApprove={(notes) => handleLeaveRequestAction(selectedLeaveRequest.id, 'approve', notes)}
          onReject={(notes) => handleLeaveRequestAction(selectedLeaveRequest.id, 'reject', notes)}
          onClose={() => {
            setShowLeaveModal(false);
            setSelectedLeaveRequest(null);
          }}
        />
      )}
    </div>
  );
};

export default AttendanceView;