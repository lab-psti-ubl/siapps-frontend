import React, { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Search, Download, Filter, X } from 'lucide-react';
import { Employee } from '../types';
import { employeesAPI } from '../../../services/api';

interface EmployeesViewProps {
  employees: Employee[];
  onAddEmployee: () => void;
  onViewEmployee: (employee: Employee) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  onAddEmployee,
  onViewEmployee,
  onEditEmployee,
  onDeleteEmployee
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Get unique positions for filter dropdown
  const uniquePositions = [...new Set(employees.map(emp => emp.position))].sort();

  // Filter employees based on search term and position filter
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone.includes(searchTerm) ||
      employee.qrId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPosition = filterPosition === '' || employee.position === filterPosition;
    
    return matchesSearch && matchesPosition;
  });

  const handleExportPDF = async () => {
    setIsExporting(true);
    
    try {
      // For now, we'll use the existing PDF generation
      // In a full implementation, you might want to create a backend endpoint for PDF generation
      const { generateEmployeesPDF } = await import('../../../utils/pdfUtils');
      
      generateEmployeesPDF({
        title: 'Daftar Pegawai',
        data: filteredEmployees,
        searchTerm,
        filterPosition
      });

      // Show success notification
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 4000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('❌ Terjadi kesalahan saat membuat PDF. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterPosition('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Notification - Fixed message */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="flex items-center space-x-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 shadow-lg min-w-[300px]">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Berhasil!</p>
              <p className="text-sm text-green-700">Data pegawai berhasil didownload</p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="flex-shrink-0 text-green-500 hover:text-green-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Pegawai</h1>
          <p className="text-gray-600">Kelola data pegawai perusahaan</p>
        </div>
        <button
          onClick={onAddEmployee}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pegawai</span>
        </button>
      </div>

      {/* Search and Filter Section - Horizontal Layout like in image */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pegawai berdasarkan nama, ID, atau jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-8 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-target"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

          <div className="flex space-x-2 sm:space-x-3">
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border transition-colors text-sm sm:text-base ${
                showFilters || filterPosition
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Filter</span>
              {filterPosition && (
                <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">1</span>
              )}
            </button>

            {/* Export Button */}
            <button
              onClick={handleExportPDF}
              disabled={isExporting || filteredEmployees.length === 0}
              className="flex items-center space-x-1 sm:space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Export</span>
                </>
              ) : (
                <>
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Export</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {showFilters && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Filter Jabatan
                </label>
                <select
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                >
                  <option value="">Semua Jabatan</option>
                  {uniquePositions.map(position => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end sm:flex-shrink-0">
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 text-xs sm:text-sm text-gray-600">
          <span>
            Menampilkan {filteredEmployees.length} dari {employees.length} pegawai
            {searchTerm && ` untuk "${searchTerm}"`}
            {filterPosition && ` dengan jabatan "${filterPosition}"`}
          </span>
          {(searchTerm || filterPosition) && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm"
            >
              Hapus semua filter
            </button>
          )}
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">
            Daftar Pegawai
            {(searchTerm || filterPosition) && (
              <span className="text-sm sm:text-base font-normal text-gray-600 ml-2">
                (Hasil Filter)
              </span>
            )}
          </h3>
        </div>
        
        <div className="overflow-x-auto mobile-table">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nama Pegawai
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                  Jabatan
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                  ID QR
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                  Telepon
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden xl:table-cell">
                  Gaji Pokok
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 sm:px-6 py-8 sm:py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base lg:text-lg font-medium text-gray-900">
                          {employees.length === 0 ? 'Belum ada data pegawai' : 'Tidak ada hasil yang ditemukan'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          {employees.length === 0 
                            ? 'Tambahkan pegawai pertama dengan klik tombol "Tambah Pegawai"'
                            : 'Coba ubah kata kunci pencarian atau filter yang digunakan'
                          }
                        </p>
                      </div>
                      {(searchTerm || filterPosition) && (
                        <button
                          onClick={clearFilters}
                          className="mt-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                        >
                          Reset Pencarian
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee, index) => (
                  <tr 
                    key={employee.id} 
                    className={`hover:bg-blue-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {employee.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{employee.name}</div>
                          <div className="text-xs sm:text-sm text-gray-500 sm:hidden">
                            {employee.position}
                          </div>
                          <div className="text-xs text-gray-500 hidden sm:block">NIK: {employee.nik}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                      <span className="inline-flex px-2 sm:px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {employee.position}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">{employee.qrId}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-xs sm:text-sm text-gray-900">{employee.phone}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden xl:table-cell">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">{formatCurrency(employee.basicSalary)}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                        <button
                          onClick={() => onViewEmployee(employee)}
                          className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-colors touch-target"
                          title="Lihat Detail"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => onEditEmployee(employee)}
                          className="p-1.5 sm:p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100 rounded-lg transition-colors touch-target"
                          title="Edit Pegawai"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteEmployee(employee.id)}
                          className="p-1.5 sm:p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-colors touch-target"
                          title="Hapus Pegawai"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary */}
        {filteredEmployees.length > 0 && (
          <div className="bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 text-xs sm:text-sm text-gray-600">
              <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                <span>Total: <strong>{filteredEmployees.length}</strong> pegawai</span>
                <span>Jabatan: <strong>{uniquePositions.length}</strong> jenis</span>
                <span className="hidden sm:inline">Total Gaji: <strong>{formatCurrency(filteredEmployees.reduce((sum, emp) => sum + emp.basicSalary, 0))}</strong></span>
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
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
    </div>
  );
};

export default EmployeesView;