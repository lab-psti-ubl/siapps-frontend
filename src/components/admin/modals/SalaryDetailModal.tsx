import React from 'react';
import { 
  X, 
  User, 
  Calendar, 
  DollarSign, 
  Clock, 
  TrendingDown,
  Calculator,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { SalaryCalculation } from '../types';
import { formatCurrency, formatMinutes, getMonthName } from '../../../utils/salaryUtils';
import { generateSalarySlipPDF } from '../../../utils/salaryPdfUtils';

interface SalaryDetailModalProps {
  calculation: SalaryCalculation;
  onClose: () => void;
}

const SalaryDetailModal: React.FC<SalaryDetailModalProps> = ({
  calculation,
  onClose
}) => {
  const monthName = getMonthName(parseInt(calculation.month.split('-')[1]));
  const year = calculation.year;

  const handleDownloadSlip = () => {
    try {
      generateSalarySlipPDF({
        calculation: calculation
      });
    } catch (error) {
      console.error('Error generating salary slip:', error);
      alert('Terjadi kesalahan saat membuat slip gaji. Silakan coba lagi.');
    }
  };

  const getDeductionPercentage = () => {
    return (calculation.totalDeduction / calculation.basicSalary) * 100;
  };

  const getAttendancePercentage = () => {
    return (calculation.presentDays / calculation.workingDays) * 100;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{calculation.employeeName}</h2>
                <p className="text-blue-100">Detail Gaji - {monthName} {year}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                    ID: {typeof calculation.employeeId === 'object' ? calculation.employeeId._id : calculation.employeeId}
                  </span>
                  <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                    Gaji Bersih: {formatCurrency(calculation.netSalary)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Gaji Pokok</p>
                    <p className="text-2xl font-bold">{formatCurrency(calculation.basicSalary)}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100">Total Potongan</p>
                    <p className="text-2xl font-bold">{formatCurrency(calculation.totalDeduction)}</p>
                    <p className="text-xs text-red-200">{getDeductionPercentage().toFixed(1)}% dari gaji pokok</p>
                  </div>
                  <TrendingDown className="w-10 h-10 text-red-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Gaji Bersih</p>
                    <p className="text-2xl font-bold">{formatCurrency(calculation.netSalary)}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-200" />
                </div>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Clock className="w-6 h-6 mr-2 text-blue-500" />
                Ringkasan Kehadiran
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600 mb-1">{calculation.workingDays}</div>
                  <div className="text-sm text-gray-800">Hari Kerja</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{calculation.presentDays}</div>
                  <div className="text-sm text-green-800">Hadir</div>
                  <div className="text-xs text-green-600 mt-1">{getAttendancePercentage().toFixed(1)}%</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{calculation.leaveDays}</div>
                  <div className="text-sm text-blue-800">Izin</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600 mb-1">{calculation.absentDays}</div>
                  <div className="text-sm text-red-800">Tidak Hadir</div>
                </div>
              </div>

              {/* Time Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                    <div>
                      <p className="font-medium text-yellow-800">Total Terlambat</p>
                      <p className="text-sm text-yellow-600">
                        {formatMinutes(calculation.totalLateMinutes)} = {calculation.lateBlocks} blok
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-6 h-6 text-orange-500" />
                    <div>
                      <p className="font-medium text-orange-800">Total Pulang Cepat</p>
                      <p className="text-sm text-orange-600">
                        {formatMinutes(calculation.totalEarlyLeaveMinutes)} = {calculation.earlyLeaveBlocks} blok
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Deduction Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <TrendingDown className="w-6 h-6 mr-2 text-red-500" />
                Rincian Potongan Gaji
              </h3>
              
              <div className="space-y-4">
                {/* Absent Deduction */}
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-red-800">Potongan Tidak Hadir</p>
                    <p className="text-sm text-red-600">
                      {calculation.absentDays} hari × {formatCurrency(calculation.salarySettings.absentDeduction)}
                    </p>
                  </div>
                  <div className="text-lg font-bold text-red-600">
                    {formatCurrency(calculation.absentDeduction)}
                  </div>
                </div>

                {/* Leave Deduction */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="font-medium text-blue-800">Potongan Izin</p>
                    <p className="text-sm text-blue-600">
                      {calculation.leaveDays} hari × {formatCurrency(calculation.salarySettings.leaveDeduction)}
                    </p>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(calculation.leaveDeduction)}
                  </div>
                </div>

                {/* Late Deduction */}
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <p className="font-medium text-yellow-800">Potongan Terlambat</p>
                    <p className="text-sm text-yellow-600">
                      {formatMinutes(calculation.totalLateMinutes)} = {calculation.lateBlocks} blok × {formatCurrency(calculation.salarySettings.lateDeduction)}
                    </p>
                  </div>
                  <div className="text-lg font-bold text-yellow-600">
                    {formatCurrency(calculation.lateDeduction)}
                  </div>
                </div>

                {/* Early Leave Deduction */}
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <p className="font-medium text-orange-800">Potongan Pulang Cepat</p>
                    <p className="text-sm text-orange-600">
                      {formatMinutes(calculation.totalEarlyLeaveMinutes)} = {calculation.earlyLeaveBlocks} blok × {formatCurrency(calculation.salarySettings.earlyLeaveDeduction)}
                    </p>
                  </div>
                  <div className="text-lg font-bold text-orange-600">
                    {formatCurrency(calculation.earlyLeaveDeduction)}
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
                    {formatCurrency(calculation.totalDeduction)}
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
                  <span className="font-bold text-lg">{formatCurrency(calculation.basicSalary)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-100">Total Potongan:</span>
                  <span className="font-bold text-lg">-{formatCurrency(calculation.totalDeduction)}</span>
                </div>
                <hr className="border-green-400" />
                <div className="flex items-center justify-between">
                  <span className="text-green-100 text-lg">Gaji Bersih:</span>
                  <span className="font-bold text-2xl">{formatCurrency(calculation.netSalary)}</span>
                </div>
              </div>
            </div>

            {/* Settings Used */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-500" />
                Pengaturan yang Digunakan
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Potongan Tidak Hadir:</span>
                    <span className="font-medium">{formatCurrency(calculation.salarySettings.absentDeduction)}/hari</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Potongan Izin:</span>
                    <span className="font-medium">{formatCurrency(calculation.salarySettings.leaveDeduction)}/hari</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Potongan Terlambat:</span>
                    <span className="font-medium">{formatCurrency(calculation.salarySettings.lateDeduction)}/{calculation.salarySettings.lateBlockMinutes}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Potongan Pulang Cepat:</span>
                    <span className="font-medium">{formatCurrency(calculation.salarySettings.earlyLeaveDeduction)}/{calculation.salarySettings.earlyLeaveBlockMinutes}m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Slip */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Download Slip Gaji</h3>
              <button
                onClick={handleDownloadSlip}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:scale-105 mx-auto"
              >
                <Download className="w-5 h-5" />
                <span>Download Slip Gaji PDF</span>
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Slip gaji untuk {calculation.employeeName} - {monthName} {year}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryDetailModal;