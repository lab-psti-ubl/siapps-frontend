import React, { useState, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  Calendar, 
  Clock, 
  TrendingDown, 
  User,
  Download,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { User as UserType } from '../../../types/auth';
import { SalaryRecord, SalarySettings } from '../../admin/types';
import { salarySettingsAPI } from '../../../services/api';

interface UserSalaryDetailModalProps {
  salary: SalaryRecord;
  currentUser: UserType;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

const UserSalaryDetailModal: React.FC<UserSalaryDetailModalProps> = ({
  salary,
  currentUser,
  onClose,
  formatCurrency,
  formatDate
}) => {
  const [salarySettings, setSalarySettings] = useState<SalarySettings | null>(null);
  const [isGeneratingSlip, setIsGeneratingSlip] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Load salary settings on component mount
  useEffect(() => {
    const loadSalarySettings = async () => {
      try {
        const response = await salarySettingsAPI.get();
        if (response.success) {
          setSalarySettings(response.data);
        }
      } catch (error) {
        console.error('Error loading salary settings:', error);
        // Set default settings if loading fails
        setSalarySettings({
          absentDeduction: 70000,
          leaveDeduction: 35000,
          lateDeduction: 5000,
          earlyLeaveDeduction: 5000,
          lateTimeBlock: 30,
          earlyLeaveTimeBlock: 30,
          workingDaysPerWeek: [1, 2, 3, 4, 5],
          salaryPaymentDate: 5,
          holidays: []
        });
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSalarySettings();
  }, []);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'finalized':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'finalized':
        return 'Finalisasi';
      case 'paid':
        return 'Sudah Dibayar';
      default:
        return status;
    }
  };

  const handleDownloadSlipGaji = async () => {
    setIsGeneratingSlip(true);
    try {
      const { generateSalarySlipPDF } = await import('../../../utils/salarySlipUtils');
      await generateSalarySlipPDF(salary, salarySettings, formatCurrency);
      
      // Show success message
      setTimeout(() => {
        alert('✅ Slip gaji berhasil diunduh!');
      }, 500);
    } catch (error) {
      console.error('Error generating salary slip:', error);
      alert('❌ Terjadi kesalahan saat membuat slip gaji. Silakan coba lagi.');
    } finally {
      setIsGeneratingSlip(false);
    }
  };

  const calculateAttendanceRate = () => {
    return ((salary.attendedDays / salary.workingDays) * 100).toFixed(1);
  };

  const calculateDeductionRate = () => {
    return ((salary.deductions.total / salary.basicSalary) * 100).toFixed(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            <div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Detail Gaji Saya</h3>
              <p className="text-sm sm:text-base text-gray-600">{salary.period}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Status and Download */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(salary.status)}`}>
                {getStatusText(salary.status)}
              </span>
              <span className="text-sm text-gray-500">
                Dihitung: {formatDateTime(salary.calculatedAt)}
              </span>
            </div>
            
            <button
              onClick={handleDownloadSlipGaji}
              disabled={isGeneratingSlip}
              className="flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 text-sm"
            >
              {isGeneratingSlip ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Membuat Slip...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Slip Gaji</span>
                </>
              )}
            </button>
          </div>

          {/* Employee Info */}
          <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Informasi Pegawai
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <label className="block text-sm font-medium text-gray-500 mb-1">Nama Lengkap</label>
                <p className="text-base font-semibold text-gray-800">{currentUser.name}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <label className="block text-sm font-medium text-gray-500 mb-1">ID Pegawai</label>
                <p className="text-base font-semibold text-gray-800">{currentUser.qrId || currentUser.id}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <label className="block text-sm font-medium text-gray-500 mb-1">Jabatan</label>
                <p className="text-base font-semibold text-gray-800">{currentUser.position || 'Pegawai'}</p>
              </div>
            </div>
          </div>

          {/* Period Info */}
          <div className="bg-purple-50 rounded-xl p-4 sm:p-6 border border-purple-200">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-600" />
              Informasi Periode
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <label className="block text-sm font-medium text-gray-500 mb-1">Periode</label>
                <p className="text-base font-semibold text-gray-800">{salary.period}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <label className="block text-sm font-medium text-gray-500 mb-1">Tanggal Mulai</label>
                <p className="text-base font-semibold text-gray-800">{formatDate(salary.periodStart)}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <label className="block text-sm font-medium text-gray-500 mb-1">Tanggal Selesai</label>
                <p className="text-base font-semibold text-gray-800">{formatDate(salary.periodEnd)}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <label className="block text-sm font-medium text-gray-500 mb-1">Hari Kerja</label>
                <p className="text-base font-semibold text-gray-800">{salary.workingDays} hari</p>
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="bg-yellow-50 rounded-xl p-4 sm:p-6 border border-yellow-200">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-yellow-600" />
              Ringkasan Kehadiran
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{salary.presentDays || salary.attendedDays - salary.leaveDays}</div>
                <div className="text-sm text-green-800">Hadir</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{salary.leaveDays}</div>
                <div className="text-sm text-blue-800">Izin</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">{salary.absentDays}</div>
                <div className="text-sm text-red-800">Tidak Hadir</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">{salary.lateCount + salary.earlyLeaveCount}</div>
                <div className="text-sm text-orange-800">Pelanggaran</div>
              </div>
            </div>
            
            {/* Attendance Rate */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Tingkat Kehadiran</span>
                <span className="text-lg font-bold text-green-600">{calculateAttendanceRate()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateAttendanceRate()}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Deductions Breakdown */}
          <div className="bg-red-50 rounded-xl p-4 sm:p-6 border border-red-200">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
              Rincian Potongan Gaji
            </h4>
            
            <div className="space-y-4">
              {/* Deduction Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Potongan Tidak Hadir</span>
                    <span className="text-sm font-bold text-red-600">{formatCurrency(salary.deductions.absent)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {salary.absentDays} hari × {salarySettings ? formatCurrency(salarySettings.absentDeduction) : 'Rp 70.000'}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Potongan Izin</span>
                    <span className="text-sm font-bold text-red-600">{formatCurrency(salary.deductions.leave)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {salary.leaveDays} hari × {salarySettings ? formatCurrency(salarySettings.leaveDeduction) : 'Rp 35.000'}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Potongan Terlambat</span>
                    <span className="text-sm font-bold text-red-600">{formatCurrency(salary.deductions.late)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.ceil(salary.lateMinutes / (salarySettings?.lateTimeBlock || 30))} blok × {salarySettings ? formatCurrency(salarySettings.lateDeduction) : 'Rp 5.000'}
                    <br />
                    ({salary.lateMinutes} menit, blok {salarySettings?.lateTimeBlock || 30} menit)
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Potongan Pulang Cepat</span>
                    <span className="text-sm font-bold text-red-600">{formatCurrency(salary.deductions.earlyLeave)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.ceil(salary.earlyLeaveMinutes / (salarySettings?.earlyLeaveTimeBlock || 30))} blok × {salarySettings ? formatCurrency(salarySettings.earlyLeaveDeduction) : 'Rp 5.000'}
                    <br />
                    ({salary.earlyLeaveMinutes} menit, blok {salarySettings?.earlyLeaveTimeBlock || 30} menit)
                  </div>
                </div>
              </div>

              {/* Total Deductions */}
              <div className="bg-red-100 rounded-lg p-4 border-2 border-red-300">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-red-800">Total Potongan</span>
                  <span className="text-xl font-bold text-red-600">{formatCurrency(salary.deductions.total)}</span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-700">Persentase Potongan</span>
                    <span className="font-bold text-red-600">{calculateDeductionRate()}%</span>
                  </div>
                  <div className="w-full bg-red-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(parseFloat(calculateDeductionRate()), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Final Calculation */}
          <div className="bg-green-50 rounded-xl p-4 sm:p-6 border border-green-200">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Perhitungan Akhir</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-base">
                <span className="text-gray-700">Gaji Pokok</span>
                <span className="font-semibold text-gray-900">{formatCurrency(salary.basicSalary)}</span>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="text-gray-700">Total Potongan</span>
                <span className="font-semibold text-red-600">- {formatCurrency(salary.deductions.total)}</span>
              </div>
              <div className="border-t border-green-300 pt-3">
                <div className="flex items-center justify-between text-xl">
                  <span className="font-bold text-gray-800">Gaji Bersih</span>
                  <span className="font-bold text-green-600">{formatCurrency(salary.totalSalary)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calculation Method Info */}
          

          

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            {isLoadingSettings && (
              <div className="text-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto mb-1"></div>
                <p className="text-xs text-gray-600">Memuat pengaturan gaji...</p>
              </div>
            )}
            
            <button
              onClick={handleDownloadSlipGaji}
              disabled={isGeneratingSlip || isLoadingSettings}
              className="flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isGeneratingSlip ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Membuat Slip...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Slip Gaji</span>
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="flex items-center justify-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Tutup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSalaryDetailModal;