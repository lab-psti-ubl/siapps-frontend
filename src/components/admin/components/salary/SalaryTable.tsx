import React from 'react';
import { Eye, CheckCircle, XCircle, Clock, DollarSign, Users, TrendingDown, Calculator } from 'lucide-react';
import { SalaryRecord, SalaryPeriod } from '../../types';

interface SalaryTableProps {
  salaries: SalaryRecord[];
  selectedPeriod: string;
  periods: SalaryPeriod[];
  onViewDetail: (salary: SalaryRecord) => void;
  onUpdateStatus: (salaryId: string, status: string) => void;
  formatCurrency: (amount: number) => string;
}

const SalaryTable: React.FC<SalaryTableProps> = ({
  salaries,
  selectedPeriod,
  periods,
  onViewDetail,
  onUpdateStatus,
  formatCurrency
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'finalized':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'finalized':
        return 'Finalisasi';
      case 'paid':
        return 'Dibayar';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
      <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">
          Data Gaji Pegawai
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
                    ? 'Klik "Hitung Semua" untuk menghitung gaji pegawai'
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
                {/* Employee Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{salary.employeeName}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Periode: {salary.period}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(salary.status)}`}>
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

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewDetail(salary)}
                    className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-xs sm:text-sm font-medium min-h-[36px] sm:min-h-[40px]"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Detail</span>
                  </button>
                  
                  {salary.status === 'draft' && (
                    <button
                      onClick={() => onUpdateStatus(salary.id, 'finalized')}
                      className="flex items-center justify-center space-x-1 px-2 sm:px-3 py-2 sm:py-3 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-xs sm:text-sm font-medium min-h-[36px] sm:min-h-[40px]"
                    >
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Finalisasi</span>
                    </button>
                  )}
                  
                  {salary.status === 'finalized' && (
                    <button
                      onClick={() => onUpdateStatus(salary.id, 'paid')}
                      className="flex items-center justify-center space-x-1 px-2 sm:px-3 py-2 sm:py-3 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-xs sm:text-sm font-medium min-h-[36px] sm:min-h-[40px]"
                    >
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Bayar</span>
                    </button>
                  )}
                </div>
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
              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Nama Pegawai
              </th>
              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Periode
              </th>
              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Gaji Pokok
              </th>
              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Hari Kerja
              </th>
              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Potongan
              </th>
              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Total Gaji
              </th>
              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 lg:px-6 py-3 lg:py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {salaries.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <DollarSign className="w-16 h-16 text-gray-300" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {selectedPeriod ? 'Belum ada data gaji untuk periode ini' : 'Pilih periode untuk melihat data gaji'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedPeriod 
                          ? 'Klik "Hitung Semua" untuk menghitung gaji pegawai'
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
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {salary.employeeName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{salary.employeeName}</div>
                        <div className="text-xs text-gray-500">ID: {salary.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{salary.period}</div>
                    <div className="text-xs text-gray-500">
                      {formatDate(salary.periodStart)} - {formatDate(salary.periodEnd)}
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(salary.basicSalary)}</div>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <span className="font-medium">{salary.attendedDays}</span>
                      <span className="text-gray-500">/{salary.workingDays}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Absen: {salary.absentDays}, Izin: {salary.leaveDays}
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-red-600">{formatCurrency(salary.deductions.total)}</div>
                    <div className="text-xs text-gray-500">
                      {salary.deductions.total > 0 && (
                        <span>Terlambat: {salary.lateCount}x, Pulang Cepat: {salary.earlyLeaveCount}x</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">{formatCurrency(salary.totalSalary)}</div>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(salary.status)}`}>
                      {getStatusText(salary.status)}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-center">
                    
                    
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => onViewDetail(salary)}
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                    {salary.status === 'draft' && (
                      <button
                        onClick={() => onUpdateStatus(salary.id, 'finalized')}
                        className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Finalisasi Gaji"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    
                    {salary.status === 'finalized' && (
                      <button
                        onClick={() => onUpdateStatus(salary.id, 'paid')}
                        className="p-2 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Tandai Sudah Dibayar"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                    )}
                    </div>
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
              <span>Total: <strong>{salaries.length}</strong> pegawai</span>
              <span>Total Gaji: <strong>{formatCurrency(salaries.reduce((sum, s) => sum + s.totalSalary, 0))}</strong></span>
              <span className="hidden sm:inline">Total Potongan: <strong>{formatCurrency(salaries.reduce((sum, s) => sum + s.deductions.total, 0))}</strong></span>
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              Metode: Reverse Attendance | Terakhir dihitung: {new Date().toLocaleDateString('id-ID', {
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
  );
};

export default SalaryTable;