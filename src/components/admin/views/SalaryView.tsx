import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Calculator, 
  Settings, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  Filter,
  RefreshCw,
  FileText
} from 'lucide-react';
import { SalaryRecord, SalarySettings, SalaryPeriod } from '../types';
import { salaryAPI, salarySettingsAPI } from '../../../services/api';
import SalaryTable from '../components/salary/SalaryTable';
import SalaryDetailModal from '../modals/salary/SalaryDetailModal';
import SalarySettingsModal from '../modals/salary/SalarySettingsModal';
import { generateSalaryExportPDF } from '../../../utils/salaryExportUtils';

interface SalaryViewProps {
  onNotification: (type: 'success' | 'error', message: string) => void;
}

const SalaryView: React.FC<SalaryViewProps> = ({ onNotification }) => {
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [salarySettings, setSalarySettings] = useState<SalarySettings | null>(null);
  const [periods, setPeriods] = useState<SalaryPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<SalaryRecord | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      loadSalaries();
    }
  }, [selectedPeriod, selectedStatus]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Load salary settings and periods in parallel
      const [settingsResponse, periodsResponse] = await Promise.all([
        salarySettingsAPI.get(),
        salarySettingsAPI.get().then(() => salaryAPI.getPeriods()).catch(() => ({ success: false, data: [] }))
      ]);
      
      if (settingsResponse.success) {
        setSalarySettings(settingsResponse.data);
      }
      
      // Load periods separately
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
      onNotification('error', 'Gagal memuat data awal sistem gaji');
      
      // Set default salary settings if loading fails
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
      const response = await salaryAPI.getAll({
        period: selectedPeriod,
        status: selectedStatus || undefined
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
      onNotification('error', 'Gagal memuat data gaji');
      setSalaries([]);
    }
  };

  const handleCalculateAll = async () => {
    if (!selectedPeriod) {
      onNotification('error', 'Pilih periode gaji terlebih dahulu');
      return;
    }

    const periodLabel = periods.find(p => p.period === selectedPeriod)?.label;
    if (!confirm(`Apakah Anda yakin ingin menghitung gaji untuk semua pegawai periode ${periodLabel}?\n\nSistem akan menggunakan metode Reverse Attendance:\n- Semua hari kerja dianggap tidak hadir\n- Dikurangi berdasarkan data absensi yang tercatat`)) {
      return;
    }

    setIsCalculating(true);
    try {
      const response = await salaryAPI.calculateAll({ period: selectedPeriod });
      
      if (response.success) {
        await loadSalaries();
        const summary = response.summary;
        onNotification('success', 
          `✅ Gaji berhasil dihitung untuk ${summary.successfulCalculations} pegawai!\n` +
          `Total gaji: ${formatCurrency(summary.totalSalaryAmount)}\n` +
          `Total potongan: ${formatCurrency(summary.totalDeductions)}`
        );
      }
    } catch (error) {
      console.error('Error calculating salaries:', error);
      onNotification('error', 'Gagal menghitung gaji pegawai');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleViewDetail = (salary: SalaryRecord) => {
    setSelectedSalary(salary);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (salaryId: string, status: string) => {
    try {
      const response = await salaryAPI.updateStatus(salaryId, { status });
      
      if (response.success) {
        await loadSalaries();
        const statusText = status === 'finalized' ? 'difinalisasi' : status === 'paid' ? 'dibayar' : 'draft';
        onNotification('success', `✅ Status gaji berhasil diubah menjadi ${statusText}!`);
      }
    } catch (error) {
      console.error('Error updating salary status:', error);
      onNotification('error', 'Gagal mengubah status gaji');
    }
  };

  const handleSettingsUpdate = async (newSettings: SalarySettings) => {
    try {
      const response = await salarySettingsAPI.update(newSettings);
      
      if (response.success) {
        setSalarySettings(newSettings);
        setShowSettingsModal(false);
        onNotification('success', '⚙️ Pengaturan gaji berhasil diperbarui!');
      }
    } catch (error) {
      console.error('Error updating salary settings:', error);
      onNotification('error', 'Gagal memperbarui pengaturan gaji');
    }
  };

  const handleOpenSettings = () => {
    console.log('Opening salary settings modal');
    console.log('Current salary settings:', salarySettings);
    setShowSettingsModal(true);
  };

  const handleExportSalary = async () => {
    if (!selectedPeriod) {
      onNotification('error', 'Pilih periode gaji terlebih dahulu untuk export');
      return;
    }

    if (salaries.length === 0) {
      onNotification('error', 'Tidak ada data gaji untuk di-export');
      return;
    }

    setIsExporting(true);
    try {
      // Get period label for display
      const periodLabel = periods.find(p => p.period === selectedPeriod)?.label || selectedPeriod;
      
      // Generate PDF
      generateSalaryExportPDF({
        title: 'Laporan Gaji Pegawai',
        period: periodLabel,
        data: salaries,
        formatCurrency
      });

      // Show success message
      setTimeout(() => {
        onNotification('success', `📄 Laporan gaji periode ${periodLabel} berhasil diunduh!`);
      }, 500);
    } catch (error) {
      console.error('Error generating salary export PDF:', error);
      onNotification('error', '❌ Terjadi kesalahan saat membuat laporan gaji. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateTotalSalaries = () => {
    return salaries.reduce((total, salary) => total + salary.totalSalary, 0);
  };

  const getStatusStats = () => {
    const draft = salaries.filter(s => s.status === 'draft').length;
    const finalized = salaries.filter(s => s.status === 'finalized').length;
    const paid = salaries.filter(s => s.status === 'paid').length;
    
    return { draft, finalized, paid, total: salaries.length };
  };

  const statusStats = getStatusStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Manajemen Gaji</h1>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Manajemen Gaji</h1>
          <p className="text-sm sm:text-base text-gray-600">Kelola perhitungan dan pembayaran gaji pegawai</p>
        </div>
        <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-2 sm:space-x-3">
          <button
            onClick={handleOpenSettings}
            className="flex items-center justify-center space-x-1 sm:space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors shadow-md hover:shadow-lg text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
          >
            <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Pengaturan Gaji</span>
          </button>
          <button
            onClick={handleExportSalary}
            disabled={isExporting || !selectedPeriod || salaries.length === 0}
            className="flex items-center justify-center space-x-1 sm:space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                <span>Export...</span>
              </>
            ) : (
              <>
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Export PDF</span>
              </>
            )}
          </button>
          <button
            onClick={handleCalculateAll}
            disabled={isCalculating || !selectedPeriod}
            className="flex items-center justify-center space-x-1 sm:space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
          >
            {isCalculating ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                <span>Menghitung...</span>
              </>
            ) : (
              <>
                <Calculator className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Hitung Semua</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs sm:text-sm">Total Gaji</p>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold">{formatCurrency(calculateTotalSalaries())}</p>
            </div>
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm">Draft</p>
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">{statusStats.draft}</p>
            </div>
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-xs sm:text-sm">Finalisasi</p>
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">{statusStats.finalized}</p>
            </div>
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs sm:text-sm">Dibayar</p>
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">{statusStats.paid}</p>
            </div>
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          <h3 className="text-base sm:text-lg font-bold text-gray-800">Filter Data Gaji</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Periode Gaji
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
            >
              <option value="">Pilih Periode</option>
              {periods.map(period => (
                <option key={period.period} value={period.period}>
                  {period.label} ({new Date(period.periodStart).toLocaleDateString('id-ID')} - {new Date(period.periodEnd).toLocaleDateString('id-ID')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
            >
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="finalized">Finalisasi</option>
              <option value="paid">Dibayar</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadSalaries}
              className="w-full flex items-center justify-center space-x-1 sm:space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        
      </div>

      {/* Salary Table */}
      <SalaryTable
        salaries={salaries}
        selectedPeriod={selectedPeriod}
        periods={periods}
        onViewDetail={handleViewDetail}
        onUpdateStatus={handleUpdateStatus}
        formatCurrency={formatCurrency}
      />

      {/* Salary Detail Modal */}
      {showDetailModal && selectedSalary && (
        <SalaryDetailModal
          salary={selectedSalary}
          salarySettings={salarySettings}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSalary(null);
          }}
          onUpdateStatus={handleUpdateStatus}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Salary Settings Modal */}
      {showSettingsModal && salarySettings && (
        <SalarySettingsModal
          settings={salarySettings}
          onUpdate={handleSettingsUpdate}
          onClose={() => setShowSettingsModal(false)}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

export default SalaryView;