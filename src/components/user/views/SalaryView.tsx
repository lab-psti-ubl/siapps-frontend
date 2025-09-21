import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Clock,
  FileText,
  AlertCircle,
  Calculator,
  RefreshCw
} from 'lucide-react';
import { User } from '../../../types/auth';
import { SalaryCalculation } from '../types';
import { salaryAPI } from '../../../services/api';

interface SalaryViewProps {
  currentUser: User;
}

const SalaryView: React.FC<SalaryViewProps> = ({ currentUser }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.getMonth() + 1;
  });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [salaryCalculation, setSalaryCalculation] = useState<SalaryCalculation | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    setIsInitialLoading(true);
    loadSalaryCalculation();
  }, [selectedMonth, selectedYear, currentUser.id]);

  const loadSalaryCalculation = async () => {
    try {
      const response = await salaryAPI.getCalculations({
        month: selectedMonth,
        year: selectedYear,
        employeeId: currentUser.id
      });
      
      if (response.success && response.data.length > 0) {
        const calculationData = {
          ...response.data[0],
          id: response.data[0]._id
        };
        setSalaryCalculation(calculationData);
      } else {
        setSalaryCalculation(null);
      }
    } catch (error) {
      console.error('Error loading salary calculation:', error);
      setSalaryCalculation(null);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleCalculateSalary = async () => {
    setIsCalculating(true);
    try {
      const response = await salaryAPI.calculateSalary({
        employeeId: currentUser.id,
        month: selectedMonth,
        year: selectedYear
      });
      
      if (response.success) {
        const calculationData = {
          ...response.data,
          id: response.data._id
        };
        setSalaryCalculation(calculationData);
      }
    } catch (error) {
      console.error('Error calculating salary:', error);
      alert('Gagal menghitung gaji. Silakan coba lagi.');
    } finally {
      setIsCalculating(false);
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

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}j ${mins}m`;
    }
    return `${mins}m`;
  };

  const getMonthName = (month: number) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
  };

  const getDeductionPercentage = () => {
    if (!salaryCalculation) return 0;
    return (salaryCalculation.totalDeduction / salaryCalculation.basicSalary) * 100;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Gaji</h1>
        <p className="text-gray-600">Lihat rincian perhitungan gaji Anda</p>
      </div>

      {/* Month/Year Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-gray-800">Pilih Periode</h3>
            
            <div className="flex items-center space-x-2">
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
              onClick={loadSalaryCalculation}
              disabled={isInitialLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isInitialLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            {!salaryCalculation && (
              <button
                onClick={handleCalculateSalary}
                disabled={isCalculating}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isCalculating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Calculator className="w-4 h-4" />
                )}
                <span>{isCalculating ? 'Menghitung...' : 'Hitung Gaji'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {isInitialLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : salaryCalculation ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Gaji Pokok</p>
                  <p className="text-2xl font-bold">{formatCurrency(salaryCalculation.basicSalary)}</p>
                </div>
                <DollarSign className="w-10 h-10 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">Total Potongan</p>
                  <p className="text-2xl font-bold">{formatCurrency(salaryCalculation.totalDeduction)}</p>
                  <p className="text-xs text-red-200">{getDeductionPercentage().toFixed(1)}% dari gaji pokok</p>
                </div>
                <TrendingDown className="w-10 h-10 text-red-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Gaji Bersih</p>
                  <p className="text-2xl font-bold">{formatCurrency(salaryCalculation.netSalary)}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-200" />
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-blue-500" />
              Ringkasan Kehadiran - {getMonthName(selectedMonth)} {selectedYear}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-600 mb-1">{salaryCalculation.workingDays}</div>
                <div className="text-sm text-gray-800">Hari Kerja</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{salaryCalculation.presentDays}</div>
                <div className="text-sm text-green-800">Hadir</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{salaryCalculation.leaveDays}</div>
                <div className="text-sm text-blue-800">Izin</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">{salaryCalculation.absentDays}</div>
                <div className="text-sm text-red-800">Tidak Hadir</div>
              </div>
            </div>
          </div>

          {/* Deduction Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <TrendingDown className="w-6 h-6 mr-2 text-red-500" />
              Rincian Potongan Gaji
            </h3>
            
            <div className="space-y-4">
              {/* Absent Deduction */}
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-red-800">Potongan Tidak Hadir</p>
                  <p className="text-sm text-red-600">
                    {salaryCalculation.absentDays} hari × {formatCurrency(salaryCalculation.salarySettings.absentDeduction)}
                  </p>
                </div>
                <div className="text-lg font-bold text-red-600">
                  {formatCurrency(salaryCalculation.absentDeduction)}
                </div>
              </div>

              {/* Leave Deduction */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="font-medium text-blue-800">Potongan Izin</p>
                  <p className="text-sm text-blue-600">
                    {salaryCalculation.leaveDays} hari × {formatCurrency(salaryCalculation.salarySettings.leaveDeduction)}
                  </p>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(salaryCalculation.leaveDeduction)}
                </div>
              </div>

              {/* Late Deduction */}
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-medium text-yellow-800">Potongan Terlambat</p>
                  <p className="text-sm text-yellow-600">
                    {formatMinutes(salaryCalculation.totalLateMinutes)} = {salaryCalculation.lateBlocks} blok × {formatCurrency(salaryCalculation.salarySettings.lateDeduction)}
                  </p>
                </div>
                <div className="text-lg font-bold text-yellow-600">
                  {formatCurrency(salaryCalculation.lateDeduction)}
                </div>
              </div>

              {/* Early Leave Deduction */}
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <p className="font-medium text-orange-800">Potongan Pulang Cepat</p>
                  <p className="text-sm text-orange-600">
                    {formatMinutes(salaryCalculation.totalEarlyLeaveMinutes)} = {salaryCalculation.earlyLeaveBlocks} blok × {formatCurrency(salaryCalculation.salarySettings.earlyLeaveDeduction)}
                  </p>
                </div>
                <div className="text-lg font-bold text-orange-600">
                  {formatCurrency(salaryCalculation.earlyLeaveDeduction)}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
                <div>
                  <p className="font-bold text-gray-800 text-lg">Total Potongan</p>
                  <p className="text-sm text-gray-600">
                    {getDeductionPercentage().toFixed(1)}% dari gaji pokok
                  </p>
                </div>
                <div className="text-xl font-bold text-red-600">
                  {formatCurrency(salaryCalculation.totalDeduction)}
                </div>
              </div>
            </div>
          </div>

          {/* Final Calculation */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Calculator className="w-6 h-6 mr-2" />
              Perhitungan Akhir
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-green-100">Gaji Pokok:</span>
                <span className="font-bold text-lg">{formatCurrency(salaryCalculation.basicSalary)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-100">Total Potongan:</span>
                <span className="font-bold text-lg">-{formatCurrency(salaryCalculation.totalDeduction)}</span>
              </div>
              <hr className="border-green-400" />
              <div className="flex items-center justify-between">
                <span className="text-green-100 text-lg">Gaji Bersih:</span>
                <span className="font-bold text-2xl">{formatCurrency(salaryCalculation.netSalary)}</span>
              </div>
            </div>
          </div>

          {/* Download Slip */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Download Slip Gaji</h3>
            <button
              onClick={() => {
                try {
                  const { generateSalarySlipPDF } = require('../../../utils/salaryPdfUtils');
                  generateSalarySlipPDF({
                    calculation: salaryCalculation
                  });
                } catch (error) {
                  console.error('Error generating salary slip:', error);
                  alert('Terjadi kesalahan saat membuat slip gaji. Silakan coba lagi.');
                }
              }}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:scale-105 mx-auto"
            >
              <Download className="w-5 h-5" />
              <span>Download Slip Gaji PDF</span>
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Slip gaji untuk periode {getMonthName(selectedMonth)} {selectedYear}
            </p>
          </div>
        </div>
      ) : (
        /* No Calculation Available */
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Calculator className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Belum Ada Perhitungan Gaji
          </h3>
          <p className="text-gray-600 mb-6">
            Perhitungan gaji untuk {getMonthName(selectedMonth)} {selectedYear} belum tersedia.
            Silakan hubungi admin atau klik tombol di bawah untuk menghitung.
          </p>
          
          <button
            onClick={handleCalculateSalary}
            disabled={isCalculating}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105 mx-auto"
          >
            {isCalculating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Menghitung Gaji...</span>
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                <span>Hitung Gaji Saya</span>
              </>
            )}
          </button>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h4 className="font-medium text-blue-800 mb-1">Informasi</h4>
                <p className="text-sm text-blue-700">
                  Perhitungan gaji didasarkan pada data absensi Anda selama bulan yang dipilih. 
                  Pastikan data absensi Anda sudah lengkap sebelum menghitung gaji.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryView;