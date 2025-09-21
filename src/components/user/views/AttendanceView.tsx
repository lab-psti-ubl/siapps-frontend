import React, { useState } from 'react';
import { Image as ImageIcon, Clock, CheckCircle, XCircle, QrCode, FileText, Filter, Download, Wifi } from 'lucide-react';
import { AttendanceRecord } from '../types';
import { getStatusColor, getStatusText } from '../../../utils/attendanceUtils';

interface AttendanceViewProps {
  userAttendance: AttendanceRecord[];
}

const AttendanceView: React.FC<AttendanceViewProps> = ({ userAttendance }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isExporting, setIsExporting] = useState(false);

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getAttendanceTypeText = (record: AttendanceRecord) => {
    if (record.attendanceType === 'leave') {
      if (record.leaveRequestId) {
        // Leave request status will be handled by backend
        return 'Izin';
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
        // Leave request status will be handled by backend
        return 'bg-blue-100 text-blue-800';
      }
      return 'bg-blue-100 text-blue-800';
    } else if (record.attendanceType === 'absent') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    
    try {
      // For now, we'll use the existing PDF generation
      const { generateAttendancePDF } = await import('../../../utils/pdfUtils');
      
      // Filter attendance by selected month
      const filteredAttendance = userAttendance.filter(record => {
        const recordDate = new Date(record.date);
        const recordMonth = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
        return recordMonth === selectedMonth;
      });

      // Format month for display
      const monthOptions = getMonthOptions();
      const selectedMonthLabel = monthOptions.find(opt => opt.value === selectedMonth)?.label || selectedMonth;

      // Generate PDF
      generateAttendancePDF({
        title: 'Laporan Absensi Pribadi',
        period: selectedMonthLabel,
        data: filteredAttendance,
        employees: [],
        isAdmin: false
      });

      // Show success message
      setTimeout(() => {
        alert('Laporan PDF berhasil diunduh!');
      }, 500);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Terjadi kesalahan saat membuat laporan PDF. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  // Filter attendance by selected month
  const filteredAttendance = userAttendance.filter(record => {
    const recordDate = new Date(record.date);
    const recordMonth = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
    return recordMonth === selectedMonth;
  });

  // Generate month options for the last 12 months
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    
    return options;
  };

  const monthOptions = getMonthOptions();

  // Calculate working days in the selected month (excluding weekends)
  const getWorkingDaysInMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      // Exclude Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }
    
    return workingDays;
  };

  // Calculate monthly statistics based on working days
  const calculateMonthlyStats = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const totalWorkingDays = getWorkingDaysInMonth(year, month);
    
    const present = filteredAttendance.filter(record => record.attendanceType === 'present').length;
    const leave = filteredAttendance.filter(record => record.attendanceType === 'leave').length;
    const attendedDays = present + leave; // Days with any attendance record
    const absent = totalWorkingDays - attendedDays; // Working days without attendance
    
    return {
      present,
      leave,
      absent: absent > 0 ? absent : 0, // Ensure non-negative
      total: totalWorkingDays
    };
  };

  const monthlyStats = calculateMonthlyStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Riwayat Absensi</h1>
          <p className="text-gray-600">Lihat riwayat absensi Anda</p>
        </div>
      </div>

      {/* Month Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-gray-800">Filter Bulan</h3>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Bulan:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                max={new Date().toISOString().slice(0, 7)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hidden"
            >
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleExportPDF}
              disabled={isExporting || filteredAttendance.length === 0}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Membuat PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Monthly Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{monthlyStats.present}</div>
            <div className="text-sm text-green-800">Hadir</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{monthlyStats.leave}</div>
            <div className="text-sm text-blue-800">Izin</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">{monthlyStats.absent}</div>
            <div className="text-sm text-red-800">Tidak Hadir</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600 mb-1">{monthlyStats.total}</div>
            <div className="text-sm text-gray-800">Hari Kerja</div>
          </div>
        </div>
        
        {/* Working Days Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Catatan:</strong> Statistik dihitung berdasarkan hari kerja (Senin-Jumat) dalam bulan {monthOptions.find(opt => opt.value === selectedMonth)?.label}. 
            Total hari kerja: {monthlyStats.total} hari.
          </p>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            Riwayat Absensi - {monthOptions.find(opt => opt.value === selectedMonth)?.label}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keterangan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jam Masuk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status Masuk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jam Keluar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status Keluar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metode
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Belum ada riwayat absensi untuk bulan ini
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatDateOnly(record.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getAttendanceTypeColor(record)}`}>
                        {getAttendanceTypeText(record)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.attendanceType === 'leave' ? '-' : (record.checkInTime || '-')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.attendanceType === 'leave' ? '-' : (record.checkOutTime || '-')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {record.attendanceType === 'leave' ? (
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-blue-600">Surat Izin</span>
                          </div>
                        ) : (
                          <>
                            {/* Check In Method */}
                            {record.checkInTime && (
                              <div className="flex items-center space-x-1">
                                {record.checkInMethod === 'qr' ? (
                                  <>
                                    <QrCode className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs text-blue-600">QR Masuk</span>
                                  </>
                                ) : record.checkInMethod === 'rfid' ? (
                                  <>
                                    <Wifi className="w-4 h-4 text-purple-500" />
                                    <span className="text-xs text-purple-600">RFID Masuk</span>
                                  </>
                                ) : record.checkInPhoto ? (
                                  <>
                                    <img 
                                      src={record.checkInPhoto} 
                                      alt="Foto Masuk" 
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                    <span className="text-xs text-green-600">Foto Masuk</span>
                                  </>
                                ) : (
                                  <span className="text-xs text-gray-500">-</span>
                                )}
                              </div>
                            )}
                            
                            {/* Separator */}
                            {record.checkInTime && record.checkOutTime && (
                              <span className="text-gray-300">|</span>
                            )}
                            
                            {/* Check Out Method */}
                            {record.checkOutTime && (
                              <div className="flex items-center space-x-1">
                                {record.checkOutMethod === 'qr' ? (
                                  <>
                                    <QrCode className="w-4 h-4 text-purple-500" />
                                    <span className="text-xs text-purple-600">QR Keluar</span>
                                  </>
                                ) : record.checkOutMethod === 'rfid' ? (
                                  <>
                                    <Wifi className="w-4 h-4 text-orange-500" />
                                    <span className="text-xs text-orange-600">RFID Keluar</span>
                                  </>
                                ) : record.checkOutPhoto ? (
                                  <>
                                    <img 
                                      src={record.checkOutPhoto} 
                                      alt="Foto Keluar" 
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                    <span className="text-xs text-purple-600">Foto Keluar</span>
                                  </>
                                ) : (
                                  <span className="text-xs text-gray-500">-</span>
                                )}
                              </div>
                            )}
                            
                            {!record.checkInTime && !record.checkOutTime && (
                              <span className="text-gray-400 text-sm">Tidak ada</span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceView;