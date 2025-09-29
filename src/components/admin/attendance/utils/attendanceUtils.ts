import { AttendanceRecord } from '../../types';

export const calculateDailyStats = (
  filteredAttendance: AttendanceRecord[],
  employees: any[],
  leaveRequests: any[]
) => {
  const totalEmployees = employees.length;
  const attendedEmployees = filteredAttendance.filter(record => record.attendanceType === 'present');
  
  // Count approved leaves only
  const approvedLeaveEmployees = filteredAttendance.filter(record => {
    if (record.attendanceType === 'leave' && record.leaveRequestId) {
      const leaveRequest = leaveRequests.find(req => req.id === record.leaveRequestId);
      return leaveRequest?.status === 'approved';
    }
    return false;
  });
  
  const present = attendedEmployees.length;
  const leave = approvedLeaveEmployees.length;
  const absent = totalEmployees - present - leave;

  return {
    present,
    leave,
    absent: absent > 0 ? absent : 0,
    total: totalEmployees
  };
};

export const handleExportPDF = async (
  selectedDate: string,
  localAttendance: AttendanceRecord[],
  employees: any[],
  showNotification: (type: 'success' | 'error', message: string) => void
) => {
  try {
    const { generateAttendancePDF } = await import('../../../../utils/pdfUtils');
    
    // Filter attendance by selected date
    const filteredAttendance = localAttendance.filter(record => {
      return record.date === selectedDate;
    });

    // Format date for display
    const selectedDateLabel = new Date(selectedDate).toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });

    // Generate PDF
    generateAttendancePDF({
      title: 'Laporan Absensi Pegawai',
      period: selectedDateLabel,
      data: filteredAttendance,
      employees: employees,
      isAdmin: true
    });

    // Show success message
    setTimeout(() => {
      showNotification('success', '📄 Laporan PDF berhasil diunduh!');
    }, 500);
  } catch (error) {
    console.error('Error generating PDF:', error);
    showNotification('error', '❌ Terjadi kesalahan saat membuat laporan PDF. Silakan coba lagi.');
  }
};