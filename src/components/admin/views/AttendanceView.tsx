import React, { useState, useEffect } from 'react';
import { QrCode, Image, Clock, CheckCircle, XCircle, FileText, Filter, Eye, Check, X, Calendar, Download, Wifi } from 'lucide-react';
import { AttendanceRecord, LeaveRequest } from '../types';
import { getStatusColor, getStatusText } from '../../../utils/attendanceUtils';
import { leaveRequestsAPI, attendanceAPI } from '../../../services/api';
import LeaveRequestModal from '../modals/LeaveRequestModal';

interface AttendanceViewProps {
  attendance: AttendanceRecord[];
  employees: any[];
  onScanQR: () => void;
  onViewPhoto: (record: AttendanceRecord, type: 'checkIn' | 'checkOut') => void;
  onDataUpdate?: () => void;
}

const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendance,
  employees,
  onScanQR,
  onViewPhoto,
  onDataUpdate
}) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [localAttendance, setLocalAttendance] = useState<AttendanceRecord[]>(attendance);
  const [notification, setNotification] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
    show: false,
    type: 'success',
    message: ''
  });
  const [isLoadingLeaveRequests, setIsLoadingLeaveRequests] = useState(false);

  // Load leave requests from API
  useEffect(() => {
    loadLeaveRequests();
  }, []);

  // Separate effect for initial data loading
  useEffect(() => {
    // Load attendance data when selected date changes
    const loadAttendanceForDate = async () => {
      console.log('Loading attendance for selected date:', selectedDate);
      try {
        const response = await attendanceAPI.getAll({ date: selectedDate });
        if (response.success) {
          console.log('Loaded attendance for date', selectedDate, ':', response.data);
          const attendanceData = response.data.map((att: any) => ({
            ...att,
            id: att._id,
            employeeId: typeof att.employeeId === 'object' && att.employeeId._id 
              ? att.employeeId._id 
              : att.employeeId
          }));
          setLocalAttendance(attendanceData);
        } else {
          console.log('No attendance data found for date:', selectedDate);
          setLocalAttendance([]);
        }
      } catch (error) {
        console.error('Error loading attendance for date:', error);
        setLocalAttendance([]);
      }
    };
    
    loadAttendanceForDate();
    
    // Auto-refresh every 30 seconds to keep data in sync
    const interval = setInterval(() => {
      loadAttendanceForDate();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [selectedDate]); // Reload when selected date changes
  const loadLeaveRequests = async () => {
    setIsLoadingLeaveRequests(true);
    try {
      const response = await leaveRequestsAPI.getAll();
      if (response.success) {
        const leaveRequestsData = response.data.map((req: any) => {
          // Ensure proper date formatting
          const submittedAt = req.createdAt || req.submittedAt || new Date().toISOString();
          
          return {
          ...req,
          id: req._id,
          employeeId: typeof req.employeeId === 'object' && req.employeeId._id 
            ? req.employeeId._id 
            : req.employeeId,
          submittedAt: submittedAt
          };
        });
        setLeaveRequests(leaveRequestsData);
      }
    } catch (error) {
      console.error('Error loading leave requests:', error);
      setLeaveRequests([]);
    } finally {
      setIsLoadingLeaveRequests(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getAttendanceTypeText = (record: AttendanceRecord) => {
    if (record.attendanceType === 'leave') {
      if (record.leaveRequestId) {
        // Find leave request from loaded data
        const leaveRequest = leaveRequests.find(req => req.id === record.leaveRequestId);
        if (leaveRequest) {
          return `Izin (${leaveRequest.status === 'approved' ? 'Diterima' : leaveRequest.status === 'rejected' ? 'Ditolak' : 'Pending'})`;
        } else {
          // If leave request not found, this might be orphaned data
          console.warn(`Leave request ${record.leaveRequestId} not found for attendance ${record.id}`);
          return 'Izin (Data Tidak Valid)';
        }
      }
      return 'Izin';
    } else if (record.attendanceType === 'absent') {
      return 'Tidak Hadir';
    }
    return 'Hadir';
  };

  const getAttendanceTypeColor = (record: AttendanceRecord) => {
    if (record.attendanceType === 'leave') {
      if (record.leaveRequestId) {
        const leaveRequest = leaveRequests.find(req => req.id === record.leaveRequestId);
        if (leaveRequest) {
          switch (leaveRequest.status) {
            case 'pending':
              return 'bg-yellow-100 text-yellow-800';
            case 'approved':
              return 'bg-green-100 text-green-800';
            case 'rejected':
              return 'bg-red-100 text-red-800';
            default:
              return 'bg-blue-100 text-blue-800';
          }
        } else {
          // If leave request not found, show as error
          return 'bg-red-100 text-red-800';
        }
      }
      return 'bg-blue-100 text-blue-800';
    } else if (record.attendanceType === 'absent') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-green-100 text-green-800';
  };

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

  const updateAttendanceData = () => {
    console.log('Updating attendance data for date:', selectedDate);
    
    // Reload attendance data for selected date
    const reloadAttendanceData = async () => {
      try {
        // Force reload from database
        const response = await attendanceAPI.getAll({ date: selectedDate });
        if (response.success) {
          console.log('Reloaded attendance data:', response.data);
          const attendanceData = response.data.map((att: any) => ({
            ...att,
            id: att._id,
            employeeId: typeof att.employeeId === 'object' && att.employeeId._id 
              ? att.employeeId._id 
              : att.employeeId
          }));
          setLocalAttendance(attendanceData);
          
          // Show success notification for data refresh
          showNotification('success', '🔄 Data absensi berhasil diperbarui dari database');
        }
      } catch (error) {
        console.error('Error reloading attendance data:', error);
        showNotification('error', '❌ Gagal memperbarui data absensi');
      }
    };
    
    reloadAttendanceData();
    loadLeaveRequests();

    // Notify parent component to update its data
    if (onDataUpdate) {
      onDataUpdate();
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
        
        // Notify parent to reload attendance data
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

  const handleExportPDF = async () => {
    setIsExporting(true);
    
    try {
      const { generateAttendancePDF } = await import('../../../utils/pdfUtils');
      
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
    } finally {
      setIsExporting(false);
    }
  };

  // Filter attendance by selected date
  const filteredAttendance = localAttendance.filter(record => {
    // Normalize both dates to ensure consistent comparison
    const recordDate = new Date(record.date).toISOString().split('T')[0];
    const searchDate = new Date(selectedDate).toISOString().split('T')[0];
    console.log('Comparing dates:', { recordDate, searchDate, match: recordDate === searchDate });
    return recordDate === searchDate;
  });
  
  console.log('Filtered attendance for', selectedDate, ':', filteredAttendance);

  // Calculate daily statistics based on employees and their attendance
  const calculateDailyStats = () => {
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

  const dailyStats = calculateDailyStats();


  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in max-w-sm">
          <div className={`flex items-start space-x-3 px-6 py-4 rounded-xl shadow-lg border-l-4 backdrop-blur-sm ${
            notification.type === 'success' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
              : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
          }`}>
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${
                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {notification.type === 'success' ? 'Berhasil!' : 'Gagal!'}
              </p>
              <p className={`text-sm mt-1 leading-relaxed ${
                notification.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
              className={`flex-shrink-0 ml-4 p-1 rounded-full hover:bg-white/20 transition-colors ${
                notification.type === 'success' ? 'text-green-500' : 'text-red-500'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Absen Pegawai</h1>
          <p className="text-gray-600">Kelola absensi pegawai</p>
        </div>
        <button
          onClick={onScanQR}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          <QrCode className="w-4 h-4" />
          <span>Scan QR</span>
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-gray-800">Filter Tanggal</h3>
           
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <label className="text-sm font-medium text-gray-700">Tanggal:</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    console.log('Date changed to:', e.target.value);
                    setSelectedDate(e.target.value);
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:min-w-[150px]"
                />
              </div>
            </div>
            
           
            
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-3 py-2 text-xs sm:text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex-1 sm:flex-none"
              >
                Hari Ini
              </button>
            
              <button
                onClick={updateAttendanceData}
                className="px-3 py-2 text-xs sm:text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-1 flex-1 sm:flex-none"
                title="Refresh data dari database"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
            
            <button
              onClick={handleExportPDF}
              disabled={isExporting || filteredAttendance.length === 0}
              className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm w-full sm:w-auto"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Membuat PDF...</span>
                  <span className="sm:hidden">PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export PDF</span>
                  <span className="sm:hidden">PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Daily Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">{dailyStats.present}</div>
            <div className="text-xs sm:text-sm text-green-800">Hadir</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">{dailyStats.leave}</div>
            <div className="text-xs sm:text-sm text-blue-800">Izin</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-red-600 mb-1">{dailyStats.absent}</div>
            <div className="text-xs sm:text-sm text-red-800">Tidak Hadir</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-gray-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-600 mb-1">{dailyStats.total}</div>
            <div className="text-xs sm:text-sm text-gray-800">Total Pegawai</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">
            Data Absensi - {new Date(selectedDate).toLocaleDateString('id-ID', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          {isLoadingLeaveRequests ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="hidden sm:inline">Nama Pegawai</span>
                    <span className="sm:hidden">Nama</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="hidden sm:inline">Keterangan</span>
                    <span className="sm:hidden">Status</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    <span className="hidden lg:inline">Jam Masuk</span>
                    <span className="lg:hidden">Masuk</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    <span className="hidden lg:inline">Status Masuk</span>
                    <span className="lg:hidden">S.Masuk</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    <span className="hidden lg:inline">Jam Keluar</span>
                    <span className="lg:hidden">Keluar</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    <span className="hidden lg:inline">Status Keluar</span>
                    <span className="lg:hidden">S.Keluar</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Show all employees for the selected date */}
                {employees.map((employee) => {
                  const employeeAttendance = filteredAttendance.find(att => {
                    // Handle both string and object employeeId
                    const attEmployeeId = typeof att.employeeId === 'object' && att.employeeId._id 
                      ? att.employeeId._id 
                      : att.employeeId;
                    return attEmployeeId === employee.id;
                  });
                  
                  return (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">{employee.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-900">{formatDate(selectedDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {employeeAttendance ? (
                          <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getAttendanceTypeColor(employeeAttendance)}`}>
                            {getAttendanceTypeText(employeeAttendance)}
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-red-100 text-red-800">
                            Tidak Hadir
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-xs sm:text-sm text-gray-900">
                          {employeeAttendance?.attendanceType === 'leave' ? '-' : (employeeAttendance?.checkInTime || '-')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        {employeeAttendance ? (
                          employeeAttendance.attendanceType === 'leave' ? (
                            <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getAttendanceTypeColor(employeeAttendance)}`}>
                              {getAttendanceTypeText(employeeAttendance)}
                            </span>
                          ) : (
                            <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(employeeAttendance.checkInStatus)}`}>
                              {getStatusText(employeeAttendance.checkInStatus)}
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-red-100 text-red-800">
                            Tidak Hadir
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-xs sm:text-sm text-gray-900">
                          {employeeAttendance?.attendanceType === 'leave' ? '-' : (employeeAttendance?.checkOutTime || '-')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        {employeeAttendance ? (
                          employeeAttendance.attendanceType === 'leave' ? (
                            <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getAttendanceTypeColor(employeeAttendance)}`}>
                              {getAttendanceTypeText(employeeAttendance)}
                            </span>
                          ) : (
                            <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(employeeAttendance.checkOutStatus)}`}>
                              {getStatusText(employeeAttendance.checkOutStatus)}
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-red-100 text-red-800">
                            Tidak Hadir
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                          {employeeAttendance ? (
                            employeeAttendance.attendanceType === 'leave' && employeeAttendance.leaveRequestId ? (
                              <button
                                onClick={() => handleViewLeaveRequest(employeeAttendance)}
                                className="text-blue-600 hover:text-blue-900 flex items-center justify-center space-x-1 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                                title="Lihat Surat Izin"
                              >
                                <FileText className="w-4 h-4" />
                                <span className="text-xs hidden sm:inline">Lihat Surat</span>
                                <span className="text-xs sm:hidden">Surat</span>
                              </button>
                            ) : (
                              <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1">
                                {/* Check In Action */}
                                {employeeAttendance.checkInTime && (
                                  <button
                                    onClick={() => onViewPhoto(employeeAttendance, 'checkIn')}
                                    className="text-blue-600 hover:text-blue-900 flex items-center justify-center space-x-1 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                                    title={
                                      employeeAttendance.checkInMethod === 'qr' 
                                        ? 'Lihat Detail Absen Masuk (QR)' 
                                        : employeeAttendance.checkInMethod === 'rfid'
                                          ? 'Lihat Detail Absen Masuk (RFID)'
                                          : 'Lihat Foto Masuk'
                                    }
                                  >
                                    {employeeAttendance.checkInMethod === 'qr' ? (
                                      <QrCode className="w-4 h-4" />
                                    ) : employeeAttendance.checkInMethod === 'rfid' ? (
                                      <Wifi className="w-4 h-4" />
                                    ) : (
                                      <Image className="w-4 h-4" />
                                    )}
                                    <span className="text-xs hidden sm:inline">Masuk</span>
                                    <span className="text-xs sm:hidden">In</span>
                                  </button>
                                )}
                                
                                {/* Check Out Action */}
                                {employeeAttendance.checkOutTime && (
                                  <button
                                    onClick={() => onViewPhoto(employeeAttendance, 'checkOut')}
                                    className="text-green-600 hover:text-green-900 flex items-center justify-center space-x-1 px-2 py-1 rounded bg-green-50 hover:bg-green-100 transition-colors"
                                    title={
                                      employeeAttendance.checkOutMethod === 'qr' 
                                        ? 'Lihat Detail Absen Keluar (QR)' 
                                        : employeeAttendance.checkOutMethod === 'rfid'
                                          ? 'Lihat Detail Absen Keluar (RFID)'
                                          : 'Lihat Foto Keluar'
                                    }
                                  >
                                    {employeeAttendance.checkOutMethod === 'qr' ? (
                                      <QrCode className="w-4 h-4" />
                                    ) : employeeAttendance.checkOutMethod === 'rfid' ? (
                                      <Wifi className="w-4 h-4" />
                                    ) : (
                                      <Image className="w-4 h-4" />
                                    )}
                                    <span className="text-xs hidden sm:inline">Keluar</span>
                                    <span className="text-xs sm:hidden">Out</span>
                                  </button>
                                )}
                                
                                {!employeeAttendance.checkInTime && !employeeAttendance.checkOutTime && (
                                  <span className="text-gray-400 text-xs">Tidak ada data</span>
                                )}
                              </div>
                            )
                          ) : (
                            <span className="text-gray-400 text-xs">Tidak hadir</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

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