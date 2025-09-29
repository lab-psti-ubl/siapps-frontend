import React from 'react';
import { Image as ImageIcon, QrCode, FileText, Wifi } from 'lucide-react';
import { AttendanceRecord, LeaveRequest } from '../../types';
import { getStatusColor, getStatusText } from '../../../../utils/attendanceUtils';

interface AttendanceTableProps {
  employees: any[];
  filteredAttendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  selectedDate: string;
  isLoadingLeaveRequests: boolean;
  isLoadingAttendance?: boolean;
  onViewPhoto: (record: AttendanceRecord, type: 'checkIn' | 'checkOut') => void;
  onViewLeaveRequest: (record: AttendanceRecord) => void;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  employees,
  filteredAttendance,
  leaveRequests,
  selectedDate,
  isLoadingLeaveRequests,
  isLoadingAttendance = false,
  onViewPhoto,
  onViewLeaveRequest
}) => {
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

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
      <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">
          Data Absensi - {new Date(selectedDate).toLocaleDateString('id-ID', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
          })}
        </h3>
      </div>
      
      {/* Mobile Card View */}
      <div className="block md:hidden">
        {isLoadingAttendance || isLoadingLeaveRequests ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">
                {isLoadingAttendance ? 'Memuat data absensi...' : 'Memuat data izin...'}
              </p>
            </div>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p className="text-sm">Belum ada data pegawai</p>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {employees.map((employee) => {
              const employeeAttendance = filteredAttendance.find(att => {
                const attEmployeeId = typeof att.employeeId === 'object' && att.employeeId._id 
                  ? att.employeeId._id 
                  : att.employeeId;
                return attEmployeeId === employee.id;
              });
              
              return (
                <div key={employee.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm truncate flex-1 mr-2">{employee.name}</h4>
                    {employeeAttendance ? (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getAttendanceTypeColor(employeeAttendance)}`}>
                        {getAttendanceTypeText(employeeAttendance)}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 whitespace-nowrap">
                        Tidak Hadir
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                    <div>
                      <span className="font-medium">Masuk:</span> {employeeAttendance?.attendanceType === 'leave' ? '-' : (employeeAttendance?.checkInTime || '-')}
                    </div>
                    <div>
                      <span className="font-medium">Keluar:</span> {employeeAttendance?.attendanceType === 'leave' ? '-' : (employeeAttendance?.checkOutTime || '-')}
                    </div>
                  </div>
                  
                  {employeeAttendance && (
                    <div className="flex flex-wrap gap-1">
                      {employeeAttendance.attendanceType === 'leave' && employeeAttendance.leaveRequestId ? (
                        <button
                          onClick={() => onViewLeaveRequest(employeeAttendance)}
                          className="flex items-center space-x-1 text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs hover:bg-blue-100 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Surat</span>
                        </button>
                      ) : (
                        <>
                          {employeeAttendance.checkInTime && (
                            <button
                              onClick={() => onViewPhoto(employeeAttendance, 'checkIn')}
                              className="flex items-center space-x-1 text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs hover:bg-blue-100 transition-colors"
                            >
                              {employeeAttendance.checkInMethod === 'qr' ? (
                                <QrCode className="w-3 h-3" />
                              ) : employeeAttendance.checkInMethod === 'rfid' ? (
                                <Wifi className="w-3 h-3" />
                              ) : (
                                <ImageIcon className="w-3 h-3" />
                              )}
                              <span>Masuk</span>
                            </button>
                          )}
                          
                          {employeeAttendance.checkOutTime && (
                            <button
                              onClick={() => onViewPhoto(employeeAttendance, 'checkOut')}
                              className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs hover:bg-green-100 transition-colors"
                            >
                              {employeeAttendance.checkOutMethod === 'qr' ? (
                                <QrCode className="w-3 h-3" />
                              ) : employeeAttendance.checkOutMethod === 'rfid' ? (
                                <Wifi className="w-3 h-3" />
                              ) : (
                                <ImageIcon className="w-3 h-3" />
                              )}
                              <span>Keluar</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        {isLoadingAttendance || isLoadingLeaveRequests ? (
          <div className="flex items-center justify-center py-8 lg:py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-sm lg:text-base text-gray-600">
                {isLoadingAttendance ? 'Memuat data absensi...' : 'Memuat data izin...'}
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Pegawai
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keterangan
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Jam Masuk
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                  Status Masuk
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Jam Keluar
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                  Status Keluar
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <td className="px-3 sm:px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">{employee.name}</div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">{formatDate(selectedDate)}</div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      {employeeAttendance ? (
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-xs leading-4 font-medium rounded-full ${getAttendanceTypeColor(employeeAttendance)}`}>
                          {getAttendanceTypeText(employeeAttendance)}
                        </span>
                      ) : (
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-xs leading-4 font-medium rounded-full bg-red-100 text-red-800">
                          Tidak Hadir
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-xs sm:text-sm text-gray-900">
                        {employeeAttendance?.attendanceType === 'leave' ? '-' : (employeeAttendance?.checkInTime || '-')}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap hidden xl:table-cell">
                      {employeeAttendance ? (
                        employeeAttendance.attendanceType === 'leave' ? (
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-xs leading-4 font-medium rounded-full ${getAttendanceTypeColor(employeeAttendance)}`}>
                            {getAttendanceTypeText(employeeAttendance)}
                          </span>
                        ) : (
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-xs leading-4 font-medium rounded-full ${getStatusColor(employeeAttendance.checkInStatus)}`}>
                            {getStatusText(employeeAttendance.checkInStatus)}
                          </span>
                        )
                      ) : (
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-xs leading-4 font-medium rounded-full bg-red-100 text-red-800">
                          Tidak Hadir
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-xs sm:text-sm text-gray-900">
                        {employeeAttendance?.attendanceType === 'leave' ? '-' : (employeeAttendance?.checkOutTime || '-')}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap hidden xl:table-cell">
                      {employeeAttendance ? (
                        employeeAttendance.attendanceType === 'leave' ? (
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-xs leading-4 font-medium rounded-full ${getAttendanceTypeColor(employeeAttendance)}`}>
                            {getAttendanceTypeText(employeeAttendance)}
                          </span>
                        ) : (
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-xs leading-4 font-medium rounded-full ${getStatusColor(employeeAttendance.checkOutStatus)}`}>
                            {getStatusText(employeeAttendance.checkOutStatus)}
                          </span>
                        )
                      ) : (
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-xs leading-4 font-medium rounded-full bg-red-100 text-red-800">
                          Tidak Hadir
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      <div className="flex flex-col xl:flex-row space-y-1 xl:space-y-0 xl:space-x-1">
                        {employeeAttendance ? (
                          employeeAttendance.attendanceType === 'leave' && employeeAttendance.leaveRequestId ? (
                            <button
                              onClick={() => onViewLeaveRequest(employeeAttendance)}
                              className="text-blue-600 hover:text-blue-900 flex items-center justify-center space-x-1 px-1.5 sm:px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors min-h-[28px] sm:min-h-[32px] text-xs"
                              title="Lihat Surat Izin"
                            >
                              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden lg:inline">Lihat Surat</span>
                              <span className="lg:hidden">Surat</span>
                            </button>
                          ) : (
                            <div className="flex flex-col xl:flex-row space-y-1 xl:space-y-0 xl:space-x-1">
                              {/* Check In Action */}
                              {employeeAttendance.checkInTime && (
                                <button
                                  onClick={() => onViewPhoto(employeeAttendance, 'checkIn')}
                                  className="text-blue-600 hover:text-blue-900 flex items-center justify-center space-x-1 px-1.5 sm:px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors min-h-[28px] sm:min-h-[32px] text-xs"
                                  title={
                                    employeeAttendance.checkInMethod === 'qr' 
                                      ? 'Lihat Detail Absen Masuk (QR)' 
                                      : employeeAttendance.checkInMethod === 'rfid'
                                        ? 'Lihat Detail Absen Masuk (RFID)'
                                        : 'Lihat Foto Masuk'
                                  }
                                >
                                  {employeeAttendance.checkInMethod === 'qr' ? (
                                    <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
                                  ) : employeeAttendance.checkInMethod === 'rfid' ? (
                                    <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
                                  ) : (
                                    <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                  )}
                                  <span className="hidden lg:inline">Masuk</span>
                                  <span className="lg:hidden">In</span>
                                </button>
                              )}
                              
                              {/* Check Out Action */}
                              {employeeAttendance.checkOutTime && (
                                <button
                                  onClick={() => onViewPhoto(employeeAttendance, 'checkOut')}
                                  className="text-green-600 hover:text-green-900 flex items-center justify-center space-x-1 px-1.5 sm:px-2 py-1 rounded bg-green-50 hover:bg-green-100 transition-colors min-h-[28px] sm:min-h-[32px] text-xs"
                                  title={
                                    employeeAttendance.checkOutMethod === 'qr' 
                                      ? 'Lihat Detail Absen Keluar (QR)' 
                                      : employeeAttendance.checkOutMethod === 'rfid'
                                        ? 'Lihat Detail Absen Keluar (RFID)'
                                        : 'Lihat Foto Keluar'
                                  }
                                >
                                  {employeeAttendance.checkOutMethod === 'qr' ? (
                                    <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
                                  ) : employeeAttendance.checkOutMethod === 'rfid' ? (
                                    <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
                                  ) : (
                                    <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                  )}
                                  <span className="hidden lg:inline">Keluar</span>
                                  <span className="lg:hidden">Out</span>
                                </button>
                              )}
                              
                              {!employeeAttendance.checkInTime && !employeeAttendance.checkOutTime && (
                                <span className="text-gray-400 text-xs min-h-[28px] sm:min-h-[32px] flex items-center">Tidak ada data</span>
                              )}
                            </div>
                          )
                        ) : (
                          <span className="text-gray-400 text-xs min-h-[28px] sm:min-h-[32px] flex items-center">Tidak hadir</span>
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
      
      {/* Loading Overlay for Table */}
      {isLoadingAttendance && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Memuat data absensi...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;