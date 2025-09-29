import { useState } from 'react';
import { AttendanceRecord, LeaveRequest } from '../../types';
import { leaveRequestsAPI } from '../../../../services/api';

interface UseAttendanceActionsProps {
  leaveRequests: LeaveRequest[];
  setLeaveRequests: (requests: LeaveRequest[]) => void;
  loadLeaveRequests: () => void;
  onDataUpdate?: () => void;
  showNotification: (type: 'success' | 'error', message: string) => void;
}

export const useAttendanceActions = ({
  leaveRequests,
  setLeaveRequests,
  loadLeaveRequests,
  onDataUpdate,
  showNotification
}: UseAttendanceActionsProps) => {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);

  const handleViewLeaveRequest = (record: AttendanceRecord) => {
    if (record.leaveRequestId) {
      const leaveRequest = leaveRequests.find(req => req.id === record.leaveRequestId);
      if (leaveRequest) {
        setSelectedLeaveRequest(leaveRequest);
        setShowLeaveModal(true);
      } else {
        // Show error if leave request not found
        showNotification('error', 'Data surat izin tidak ditemukan. Kemungkinan data sudah dihapus atau rusak.');
      }
    }
  };

  const handleLeaveRequestAction = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const response = await leaveRequestsAPI.updateStatus(requestId, {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewNotes: notes
      });
      
      if (response.success) {
        // Update local state
        const updatedRequest = {
          ...response.data,
          id: response.data._id,
          employeeId: typeof response.data.employeeId === 'object' && response.data.employeeId._id 
            ? response.data.employeeId._id 
            : response.data.employeeId,
          submittedAt: response.data.createdAt
        };
        
        setLeaveRequests(prev => prev.map(req => 
          req.id === requestId ? updatedRequest : req
        ));
        
        setShowLeaveModal(false);
        setSelectedLeaveRequest(null);
        
        // Update attendance data
        loadLeaveRequests();
        
        // Notify parent component to reload attendance data
        if (onDataUpdate) {
          onDataUpdate();
        }
        
        // Show success message
        const actionText = action === 'approve' ? 'disetujui' : 'ditolak';
        showNotification('success', `✅ Pengajuan izin berhasil ${actionText}! Pegawai akan mendapat pemberitahuan.`);
      }
    } catch (error) {
      console.error('Error processing leave request:', error);
      showNotification('error', 'Terjadi kesalahan saat memproses pengajuan izin.');
    }
  };

  return {
    showLeaveModal,
    setShowLeaveModal,
    selectedLeaveRequest,
    setSelectedLeaveRequest,
    handleViewLeaveRequest,
    handleLeaveRequestAction
  };
};