import React from 'react';
import { Users, CheckCircle, XCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { Employee, AttendanceRecord } from '../types';
import { getStatusColor, getStatusText } from '../../../utils/attendanceUtils';

interface DashboardViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ employees, attendance }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getTodayStats = () => {
    const present = attendance.filter(att => att.attendanceType === 'present').length;
    const leave = attendance.filter(att => att.attendanceType === 'leave').length;
    const absent = employees.length - present - leave; // Calculate absent as employees without any attendance record
    const late = attendance.filter(att => att.checkInStatus === 'late').length;
    const earlyLeave = attendance.filter(att => att.checkOutStatus === 'early').length;
    
    return { present, leave, absent: absent > 0 ? absent : 0, late, earlyLeave };
  };

  const getAttendanceTypeText = (record: AttendanceRecord) => {
    if (record.attendanceType === 'leave') {
      return 'Izin';
    } else if (record.attendanceType === 'absent') {
      return 'Tidak Hadir';
    }
    return 'Hadir';
  };

  const getAttendanceTypeColor = (record: AttendanceRecord) => {
    if (record.attendanceType === 'leave') {
      return 'bg-blue-100 text-blue-800';
    } else if (record.attendanceType === 'absent') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const stats = getTodayStats();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Selamat datang di sistem manajemen pegawai</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm">Total Pegawai</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{employees.length}</p>
            </div>
            <Users className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs sm:text-sm">Hadir</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.present}</p>
            </div>
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm">Izin</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.leave}</p>
            </div>
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-xs sm:text-sm">Tidak Hadir</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.absent}</p>
            </div>
            <XCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-red-200" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Absensi Hari Ini</h2>
        {employees.length === 0 ? (
          <p className="text-sm sm:text-base text-gray-500 text-center py-6 sm:py-8">Belum ada pegawai terdaftar</p>
        ) : (
          <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
            {employees.map((employee) => {
              const employeeAttendance = attendance.find(att => {
                // Handle both string and object employeeId
                const attEmployeeId = typeof att.employeeId === 'object' && att.employeeId._id 
                  ? att.employeeId._id 
                  : att.employeeId;
                return attEmployeeId === employee.id;
              });
              
              return (
                <div key={employee.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                  <div>
                    <p className="font-medium text-gray-800 text-xs sm:text-sm lg:text-base">{employee.name}</p>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 lg:gap-4 text-xs sm:text-sm text-gray-600">
                      {employeeAttendance ? (
                        <>
                          {employeeAttendance.attendanceType === 'leave' ? (
                            <span>Izin</span>
                          ) : (
                            <>
                              {employeeAttendance.checkInTime && (
                                <span>Masuk: {employeeAttendance.checkInTime}</span>
                              )}
                              {employeeAttendance.checkOutTime && (
                                <span>Keluar: {employeeAttendance.checkOutTime}</span>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <span>Tidak hadir</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 justify-start sm:justify-end">
                    {employeeAttendance ? (
                      <>
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${getAttendanceTypeColor(employeeAttendance)}`}>
                          {getAttendanceTypeText(employeeAttendance)}
                        </span>
                        {employeeAttendance.attendanceType === 'present' && (
                          <>
                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${getStatusColor(employeeAttendance.checkInStatus)}`}>
                              {getStatusText(employeeAttendance.checkInStatus)}
                            </span>
                            {employeeAttendance.checkOutTime && (
                              <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${getStatusColor(employeeAttendance.checkOutStatus)}`}>
                                {getStatusText(employeeAttendance.checkOutStatus)}
                              </span>
                            )}
                            {employeeAttendance.checkInMethod === 'rfid' && employeeAttendance.rfidDeviceName && (
                              <span className="text-purple-600 text-xs">via {employeeAttendance.rfidDeviceName}</span>
                            )}
                            {employeeAttendance.checkOutMethod === 'rfid' && employeeAttendance.checkOutRfidDeviceName && (
                              <span className="text-orange-600 text-xs">keluar via {employeeAttendance.checkOutRfidDeviceName}</span>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium bg-red-100 text-red-800 whitespace-nowrap">
                        Tidak Hadir
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;