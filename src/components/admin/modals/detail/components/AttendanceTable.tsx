import React from 'react';
import { Calendar } from 'lucide-react';
import { AttendanceRecord } from '../../../types';
import { getStatusColor, getStatusText } from '../../../../../utils/attendanceUtils';

interface AttendanceTableProps {
  filteredAttendance: AttendanceRecord[];
  monthOptions: Array<{ value: string; label: string }>;
  selectedMonth: string;
  isLoading: boolean;
  employeeAttendance: AttendanceRecord[];
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  filteredAttendance,
  monthOptions,
  selectedMonth,
  isLoading,
  employeeAttendance
}) => {
  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
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

  return (
    <>
      {/* Attendance Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-3 lg:p-4 border-b border-gray-200">
          <h4 className="text-lg font-bold text-gray-800">
            Riwayat Absensi - {monthOptions.find(opt => opt.value === selectedMonth)?.label}
          </h4>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keterangan
                  </th>
                  <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Jam Masuk
                  </th>
                  <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Status Masuk
                  </th>
                  <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Jam Keluar
                  </th>
                  <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Status Keluar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center space-y-2">
                        <Calendar className="w-12 h-12 text-gray-300" />
                        <p>Belum ada data absensi untuk bulan ini</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-3 lg:px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatDateOnly(record.date)}</div>
                      </td>
                      <td className="px-3 lg:px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getAttendanceTypeColor(record)}`}>
                          {getAttendanceTypeText(record)}
                        </span>
                        <div className="md:hidden text-xs text-gray-500 mt-1">
                          {record.attendanceType === 'leave' ? '-' : (record.checkInTime || '-')} / {record.attendanceType === 'leave' ? '-' : (record.checkOutTime || '-')}
                        </div>
                      </td>
                      <td className="px-3 lg:px-4 py-3 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-900">
                          {record.attendanceType === 'leave' ? '-' : (record.checkInTime || '-')}
                        </div>
                      </td>
                      <td className="px-3 lg:px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                        {record.attendanceType === 'leave' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Izin
                          </span>
                        ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.checkInStatus)}`}>
                            {getStatusText(record.checkInStatus)}
                          </span>
                        )}
                      </td>
                      <td className="px-3 lg:px-4 py-3 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-900">
                          {record.attendanceType === 'leave' ? '-' : (record.checkOutTime || '-')}
                        </div>
                      </td>
                      <td className="px-3 lg:px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                        {record.attendanceType === 'leave' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Izin
                          </span>
                        ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.checkOutStatus)}`}>
                            {getStatusText(record.checkOutStatus)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Summary Info */}
      {employeeAttendance.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h5 className="font-medium text-blue-800">Ringkasan Absensi</h5>
          </div>
          <p className="text-sm text-blue-700">
            Total record absensi: <strong>{employeeAttendance.length}</strong> hari
          </p>
          <p className="text-sm text-blue-700">
            Bulan {monthOptions.find(opt => opt.value === selectedMonth)?.label}: 
            <strong> {filteredAttendance.length}</strong> hari
          </p>
        </div>
      )}
    </>
  );
};

export default AttendanceTable;