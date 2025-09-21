import React, { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, 
  Settings, 
  Calculator, 
  Download, 
  Eye, 
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  FileText,
  AlertCircle
} from 'lucide-react';
import { SalarySettings, SalaryCalculation, SalarySummary } from '../types';
import { salaryAPI } from '../../../services/api';
import SalarySettingsModal from '../modals/SalarySettingsModal';
import SalaryDetailModal from '../modals/SalaryDetailModal';
import { generateSalaryReportPDF } from '../../../utils/salaryPdfUtils';

interface SalaryViewProps {
  onNotification: (type: 'success' | 'error', message: string) => void;
  employees?: any[];
}

const SalaryView: React.FC<SalaryViewProps> = ({ onNotification, employees = [] }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.getMonth() + 1;
  });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [salarySettings, setSalarySettings] = useState<SalarySettings>({
    absentDeduction: 70000,
    leaveDeduction: 35000,
    lateDeduction: 5000,
    earlyLeaveDeduction: 5000,
    lateBlockMinutes: 30,
    earlyLeaveBlockMinutes: 30
  });
  const [calculations, setCalculations] = useState<SalaryCalculation[]>([]);
  const [summary, setSummary] = useState<SalarySummary | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCalculation, setSelectedCalculation] = useState<SalaryCalculation | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Debounced auto-calculation to prevent excessive API calls
  const [autoCalculationTimeout, setAutoCalculationTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      try {
        await Promise.all([
          loadSalarySettings(),
          loadCalculations(),
          loadSummary()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Reload calculations when month/year changes
  useEffect(() => {
    if (!isInitialLoading) {
      loadCalculations();
      loadSummary();
    }
  }, [selectedMonth, selectedYear, isInitialLoading]);

  // Smart auto-calculation with debouncing
  useEffect(() => {
    // Clear existing timeout
    if (autoCalculationTimeout) {
      clearTimeout(autoCalculationTimeout);
    }

    // Only auto-calculate if we have employees and missing calculations
    if (employees.length > 0 && calculations.length < employees.length && !isCalculating && !isInitialLoading) {
      const timeout = setTimeout(() => {
        handleSilentCalculateAll();
      }, 2000); // 2 second delay to prevent excessive calls
      
      setAutoCalculationTimeout(timeout);
    }

    return () => {
      if (autoCalculationTimeout) {
        clearTimeout(autoCalculationTimeout);
      }
    };
  }, [employees.length, calculations.length, isCalculating, isInitialLoading]);

  const loadSalarySettings = async () => {
    try {
      const response = await salaryAPI.getSettings();
      if (response.success) {
        setSalarySettings(response.data);
      }
    } catch (error) {
      console.error('Error loading salary settings:', error);
    }
  };

  const loadCalculations = useCallback(async () => {
    try {
      const response = await salaryAPI.getCalculations({
        month: selectedMonth,
        year: selectedYear
      });
      if (response.success) {
        const calculationsData = response.data.map((calc: any) => ({
          ...calc,
          id: calc._id
        }));
        setCalculations(calculationsData);
      }
    } catch (error) {
      console.error('Error loading calculations:', error);
      setCalculations([]);
    }
  }, [selectedMonth, selectedYear]);

  const loadSummary = useCallback(async () => {
    try {
      const response = await salaryAPI.getSummary({
        month: selectedMonth,
        year: selectedYear
      });
      if (response.success) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
      setSummary(null);
    }
  }, [selectedMonth, selectedYear]);

  // Silent auto-calculation (no user notification)
  const handleSilentCalculateAll = async () => {
    if (isCalculating) return;
    
    try {
      const response = await salaryAPI.calculateAllSalaries({
        month: selectedMonth,
        year: selectedYear
      });
      
      if (response.success) {
        // Update data silently without notifications
        await Promise.all([loadCalculations(), loadSummary()]);
      }
    } catch (error) {
      console.error('Silent calculation error:', error);
    }
  };

  // Manual calculation (with user notification)
  const handleManualCalculateAll = async () => {
    setIsCalculating(true);
    try {
      const response = await salaryAPI.calculateAllSalaries({
        month: selectedMonth,
        year: selectedYear
      });
      
      if (response.success) {
        const calculatedCount = response.data?.length || 0;
        onNotification('success', `💰 Berhasil menghitung ulang gaji untuk ${calculatedCount} pegawai`);
        
        // Update data immediately
        await Promise.all([loadCalculations(), loadSummary()]);
      } else {
        onNotification('error', 'Gagal menghitung gaji pegawai');
      }
    } catch (error) {
      console.error('Error calculating salaries:', error);
      onNotification('error', 'Gagal menghitung gaji pegawai');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleViewDetail = (calculation: SalaryCalculation) => {
    setSelectedCalculation(calculation);
    setShowDetailModal(true);
  };

  const handleSettingsUpdate = async (newSettings: SalarySettings) => {
    try {
      const response = await salaryAPI.updateSettings(newSettings);
      if (response.success) {
        setSalarySettings(newSettings);
        setShowSettingsModal(false);
        onNotification('success', '⚙️ Pengaturan gaji berhasil disimpan');
        
        // Auto-recalculate with new settings (silent)
        setTimeout(() => {
          handleSilentCalculateAll();
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      onNotification('error', 'Gagal menyimpan pengaturan gaji');
    }
  };

  const handleExportAllSalaries = async () => {
    setIsExporting(true);
    try {
      const monthName = getMonthName(selectedMonth);
      const period = `${monthName} ${selectedYear}`;
      
      generateSalaryReportPDF({
        title: 'Laporan Gaji Pegawai',
        period: period,
        calculations: calculations,
        summary: summary || undefined
      });
      
      onNotification('success', `📄 Laporan gaji ${period} berhasil diunduh!`);
    } catch (error) {
      console.error('Error generating salary report:', error);
      onNotification('error', 'Gagal membuat laporan gaji. Silakan coba lagi.');
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

  const getMonthName = (month: number) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
  };

  // Show loading only for initial load
  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Gaji</h1>
          <p className="text-gray-600">Memuat data gaji...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Gaji</h1>
          <p className="text-gray-600">Kelola perhitungan gaji dan pengaturan potongan</p>
        </div>
        <button
          onClick={() => setShowSettingsModal(true)}
          className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan</span>
        </button>
      </div>

      {/* Month/Year Filter and Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <label className="text-sm font-medium text-gray-700">Bulan:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {getMonthName(i + 1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Tahun:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={loadCalculations}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={handleExportAllSalaries}
              disabled={isExporting || calculations.length === 0}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Export...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export Gaji</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleManualCalculateAll}
              disabled={isCalculating}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Menghitung...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  <span>Hitung Ulang</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Employee Status Info */}
        {employees && employees.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-blue-800">
                    Status Pegawai: {employees.length} total
                  </span>
                </div>
                <div className="text-sm text-blue-700">
                  Sudah dihitung: {calculations.length} | 
                  Belum dihitung: {employees.length - calculations.length}
                </div>
              </div>
              {calculations.length < employees.length && (
                <div className="text-xs text-orange-600 font-medium">
                  ⚠️ Sistem akan otomatis menghitung gaji yang belum tersedia
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Pegawai</p>
                <p className="text-2xl font-bold">{summary.totalEmployees}</p>
              </div>
              <Users className="w-10 h-10 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Gaji Bersih</p>
                <p className="text-xl font-bold">{formatCurrency(summary.totalNetSalary)}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Total Potongan</p>
                <p className="text-xl font-bold">{formatCurrency(summary.totalDeductions)}</p>
              </div>
              <TrendingDown className="w-10 h-10 text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Rata-rata Gaji</p>
                <p className="text-xl font-bold">{formatCurrency(summary.averageNetSalary)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-purple-200" />
            </div>
          </div>
        </div>
      )}

      {/* Calculations Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">
            Perhitungan Gaji - {getMonthName(selectedMonth)} {selectedYear}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pegawai
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gaji Pokok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kehadiran
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Potongan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gaji Bersih
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {calculations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <Calculator className="w-12 h-12 text-gray-300" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          {employees.length === 0 ? 'Belum ada data pegawai' : 'Belum ada perhitungan gaji'}
                        </p>
                        <p className="text-gray-500 mt-1">
                          {employees.length === 0
                            ? 'Tambahkan pegawai terlebih dahulu di menu Data Pegawai'
                            : 'Sistem akan otomatis menghitung gaji atau klik tombol "Hitung Ulang"'
                          }
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                calculations.map((calculation) => (
                  <tr key={calculation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {calculation.employeeName}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {typeof calculation.employeeId === 'object' ? calculation.employeeId._id : calculation.employeeId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(calculation.basicSalary)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-600">
                        <div>Hadir: {calculation.presentDays} hari</div>
                        <div>Izin: {calculation.leaveDays} hari</div>
                        <div>Tidak Hadir: {calculation.absentDays} hari</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-red-600">
                        {formatCurrency(calculation.totalDeduction)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(calculation.netSalary)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewDetail(calculation)}
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-900 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-xs">Lihat Rincian</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Employee Summary */}
        {employees && employees.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-6">
                <span>Total Pegawai: <strong>{employees.length}</strong></span>
                <span>Sudah Dihitung: <strong>{calculations.length}</strong></span>
                {calculations.length < employees.length && (
                  <span className="text-orange-600">
                    Belum Dihitung: <strong>{employees.length - calculations.length}</strong>
                    <span className="ml-2 text-blue-600">(Otomatis diproses)</span>
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <SalarySettingsModal
          settings={salarySettings}
          onSave={handleSettingsUpdate}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCalculation && (
        <SalaryDetailModal
          calculation={selectedCalculation}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCalculation(null);
          }}
        />
      )}
    </div>
  );
};

export default SalaryView;