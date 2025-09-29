import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Clock, 
  TrendingDown, 
  Download,
  Eye,
  Filter,
  RefreshCw,
  User,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { User as UserType } from '../../../types/auth';
import { SalaryRecord, SalaryPeriod } from '../../admin/types';
import { salaryAPI } from '../../../services/api';
import UserSalaryDetailModal from '../modals/UserSalaryDetailModal';

interface SalaryViewProps {
  currentUser: UserType;
}

const SalaryView: React.FC<SalaryViewProps> = ({ currentUser }) => {
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [periods, setPeriods] = useState<SalaryPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<SalaryRecord | null>(null);
  const [notification, setNotification] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
    show: false,
    type: 'success',
    message: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      loadSalaries();
    }
  }, [selectedPeriod]);

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

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Load periods
      try {
        const periodsResponse = await salaryAPI.getPeriods();
        if (periodsResponse.success) {
          setPeriods(periodsResponse.data);
          // Set current period as default
          if (periodsResponse.data.length > 0) {
            setSelectedPeriod(periodsResponse.data[0].period);
          }
        }
      } catch (periodsError) {
        console.error('Error loading periods:', periodsError);
        // Generate default periods if API fails
        const defaultPeriods = generateDefaultPeriods();
        setPeriods(defaultPeriods);
        if (defaultPeriods.length > 0) {
          setSelectedPeriod(defaultPeriods[0].period);
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      showNotification('error', 'Gagal memuat data gaji');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDefaultPeriods = (): SalaryPeriod[] => {
    const periods = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const periodDate = new Date(now.getFullYear(), now.getMonth() - i, 5);
      const period = `${periodDate.getFullYear()}-${String(periodDate.getMonth() + 1).padStart(2, '0')}`;
      
      periods.push({
        period,
        label: periodDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }),
        periodStart: new Date(periodDate.getFullYear(), periodDate.getMonth() - 1, 6).toISOString().split('T')[0],
        periodEnd: new Date(periodDate.getFullYear(), periodDate.getMonth(), 5).toISOString().split('T')[0],
        paymentDate: new Date(periodDate.getFullYear(), periodDate.getMonth(), 5).toISOString().split('T')[0]
      });
    }
    
    return periods;
  };

  const loadSalaries = async () => {
    try {
      const response = await salaryAPI.getByEmployee(currentUser.id, {
        period: selectedPeriod,
      });
      
      if (response.success) {
        const salariesData = response.data.map((salary: any) => ({
          ...salary,
          id: salary._id,
          employeeId: typeof salary.employeeId === 'object' && salary.employeeId._id 
            ? salary.employeeId._id 
            : salary.employeeId
        }));
        setSalaries(salariesData);
      }
    } catch (error) {
      console.error('Error loading salaries:', error);
      showNotification('error', 'Gagal memuat data gaji');
      setSalaries([]);
    }
  };

  const handleViewDetail = (salary: SalaryRecord) => {
    setSelectedSalary(salary);
    setShowDetailModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Data Gaji Saya</h1>
          <p className="text-sm sm:text-base text-gray-600">Memuat data gaji...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in max-w-xs sm:max-w-sm">
          <div className={`flex items-start space-x-3 px-6 py-4 rounded-xl shadow-lg border-l-4 backdrop-blur-sm ${
            notification.type === 'success' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
              : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
          }`}>
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-500" />
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
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Data Gaji Saya</h1>
        <p className="text-sm sm:text-base text-gray-600">Lihat riwayat dan detail gaji Anda</p>
      </div>

      {/* Employee Info Card */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl p-4 sm:p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <User className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">{currentUser.name}</h2>
            <p className="text-blue-100 text-sm sm:text-base">{currentUser.position || 'Pegawai'}</p>
            <p className="text-blue-200 text-xs sm:text-sm">ID: {currentUser.qrId || currentUser.id}</p>
          </div>
        </div>
      </div>

      {/* Period Filter */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          <h3 className="text-base sm:text-lg font-bold text-gray-800">Filter Periode Gaji</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Pilih Periode
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
            >
              <option value="">Pilih Periode</option>
              {periods.map(period => (
                <option key={period.period} value={period.period}>
                  {period.label} ({formatDate(period.periodStart)} - {formatDate(period.periodEnd)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadSalaries}
              className="flex items-center justify-center space-x-1 sm:space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Salary Data */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">
            Riwayat Gaji
            {selectedPeriod && (
              <span className="text-sm sm:text-base font-normal text-gray-600 ml-2">
                - {periods.find(p => p.period === selectedPeriod)?.label}
              </span>
            )}
          </h3>
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {salaries.length === 0 ? (
            <div className="p-4 sm:p-6 text-center">
              <div className="flex flex-col items-center space-y-3">
                <DollarSign className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300" />
                <div>
                  <p className="text-sm sm:text-base font-medium text-gray-900">
                    {selectedPeriod ? 'Belum ada data gaji untuk periode ini' : 'Pilih periode untuk melihat data gaji'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {selectedPeriod 
                      ? 'Data gaji akan muncul setelah admin menghitung gaji untuk periode ini'
                      : 'Pilih periode gaji dari dropdown di atas'
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-4 space-y-3">
              {salaries.map((salary) => (
                <div key={salary.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-green-300 transition-colors">
                  {/* Salary Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900">Gaji {salary.period}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {formatDate(salary.periodStart)} - {formatDate(salary.periodEnd)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(salary.status)}`}>
                      {getStatusText(salary.status)}
                    </span>
                  </div>

                  {/* Salary Details */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 text-xs sm:text-sm">
                    <div>
                      <p className="text-gray-500">Gaji Pokok</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(salary.basicSalary)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Gaji</p>
                      <p className="font-bold text-green-600">{formatCurrency(salary.totalSalary)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Hari Kerja</p>
                      <p className="font-medium text-gray-900">{salary.attendedDays}/{salary.workingDays}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Potongan</p>
                      <p className="font-medium text-red-600">{formatCurrency(salary.deductions.total)}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleViewDetail(salary)}
                    className="w-full flex items-center justify-center space-x-2 p-2 sm:p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-xs sm:text-sm font-medium min-h-[36px] sm:min-h-[40px]"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Lihat Detail</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Periode
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Gaji Pokok
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Hari Kerja
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Potongan
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total Gaji
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salaries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <DollarSign className="w-16 h-16 text-gray-300" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          {selectedPeriod ? 'Belum ada data gaji untuk periode ini' : 'Pilih periode untuk melihat data gaji'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedPeriod 
                            ? 'Data gaji akan muncul setelah admin menghitung gaji untuk periode ini'
                            : 'Pilih periode gaji dari dropdown di atas'
                          }
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                salaries.map((salary, index) => (
                  <tr 
                    key={salary.id} 
                    className={`hover:bg-green-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{salary.period}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(salary.periodStart)} - {formatDate(salary.periodEnd)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(salary.basicSalary)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">{salary.attendedDays}</span>
                        <span className="text-gray-500">/{salary.workingDays}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Absen: {salary.absentDays}, Izin: {salary.leaveDays}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-red-600">{formatCurrency(salary.deductions.total)}</div>
                      <div className="text-xs text-gray-500">
                        {salary.deductions.total > 0 && (
                          <span>Terlambat: {salary.lateCount}x, Pulang Cepat: {salary.earlyLeaveCount}x</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">{formatCurrency(salary.totalSalary)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(salary.status)}`}>
                        {getStatusText(salary.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleViewDetail(salary)}
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary */}
        {salaries.length > 0 && (
          <div className="bg-gray-50 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 text-xs sm:text-sm text-gray-600">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 lg:gap-6">
                <span>Total Record: <strong>{salaries.length}</strong></span>
                <span>Total Gaji: <strong>{formatCurrency(salaries.reduce((sum, s) => sum + s.totalSalary, 0))}</strong></span>
                <span className="hidden sm:inline">Total Potongan: <strong>{formatCurrency(salaries.reduce((sum, s) => sum + s.deductions.total, 0))}</strong></span>
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                Data gaji dihitung menggunakan metode Reverse Attendance
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Informasi Data Gaji</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Data gaji dihitung berdasarkan absensi dan pengaturan yang ditetapkan admin</li>
              <li>• Sistem menggunakan metode Reverse Attendance untuk perhitungan yang akurat</li>
              <li>• Status "Draft" berarti gaji masih dalam tahap perhitungan</li>
              <li>• Status "Finalisasi" berarti gaji sudah dikonfirmasi dan siap dibayar</li>
              <li>• Status "Sudah Dibayar" berarti gaji sudah ditransfer</li>
              <li>• Klik "Lihat Detail" untuk melihat breakdown lengkap perhitungan gaji</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Salary Detail Modal */}
      {showDetailModal && selectedSalary && (
        <UserSalaryDetailModal
          salary={selectedSalary}
          currentUser={currentUser}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSalary(null);
          }}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

export default SalaryView;