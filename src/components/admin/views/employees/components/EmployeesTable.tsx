import React from 'react';
import { Eye, CreditCard as Edit, Trash2, Search, User, Phone, Briefcase, Hash } from 'lucide-react';
import { Employee } from '../../../types';
import { formatCurrency } from '../utils/employeesUtils';

interface EmployeesTableProps {
  employees: Employee[];
  filteredEmployees: Employee[];
  searchTerm: string;
  filterPosition: string;
  clearFilters: () => void;
  onViewEmployee: (employee: Employee) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

const EmployeesTable: React.FC<EmployeesTableProps> = ({
  employees,
  filteredEmployees,
  searchTerm,
  filterPosition,
  clearFilters,
  onViewEmployee,
  onEditEmployee,
  onDeleteEmployee
}) => {
  // Get unique positions for summary
  const uniquePositions = [...new Set(employees.map(emp => emp.position))].sort();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">
          Daftar Pegawai
          {(searchTerm || filterPosition) && (
            <span className="text-sm sm:text-base font-normal text-gray-600 ml-2">
              (Hasil Filter)
            </span>
          )}
        </h3>
      </div>
      
      {/* Mobile Card View */}
      <div className="block lg:hidden">
        {filteredEmployees.length === 0 ? (
          <div className="p-4 sm:p-6 text-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-medium text-gray-900">
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
                  className="mt-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Reset Pencarian
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-4 space-y-3">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                {/* Employee Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-sm sm:text-base font-bold text-white">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{employee.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">{employee.position}</p>
                  </div>
                </div>

                {/* Employee Details Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 text-xs sm:text-sm">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-gray-500 text-xs">ID QR</p>
                      <p className="font-medium text-gray-900 truncate">{employee.qrId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-gray-500 text-xs">Telepon</p>
                      <p className="font-medium text-gray-900 truncate">{employee.phone}</p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center space-x-2">
                    <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-gray-500 text-xs">Gaji Pokok</p>
                      <p className="font-semibold text-green-600 text-sm sm:text-base">{formatCurrency(employee.basicSalary)}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewEmployee(employee)}
                    className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-xs sm:text-sm font-medium min-h-[36px] sm:min-h-[40px]"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Detail</span>
                  </button>
                  <button
                    onClick={() => onEditEmployee(employee)}
                    className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-xs sm:text-sm font-medium min-h-[36px] sm:min-h-[40px]"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDeleteEmployee(employee.id)}
                    className="flex items-center justify-center p-2 sm:p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors min-w-[36px] sm:min-w-[40px] min-h-[36px] sm:min-h-[40px]"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Nama Pegawai
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Jabatan
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ID QR
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Telepon
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Gaji Pokok
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {employees.length === 0 ? 'Belum ada data pegawai' : 'Tidak ada hasil yang ditemukan'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {employees.length === 0 
                          ? 'Tambahkan pegawai pertama dengan klik tombol "Tambah Pegawai"'
                          : 'Coba ubah kata kunci pencarian atau filter yang digunakan'
                        }
                      </p>
                    </div>
                    {(searchTerm || filterPosition) && (
                      <button
                        onClick={clearFilters}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {employee.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">{employee.name}</div>
                        <div className="text-xs text-gray-500">NIK: {employee.nik}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {employee.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{employee.qrId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(employee.basicSalary)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => onViewEmployee(employee)}
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditEmployee(employee)}
                        className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Edit Pegawai"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteEmployee(employee.id)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Hapus Pegawai"
                      >
                        <Trash2 className="w-4 h-4" />
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
        <div className="bg-gray-50 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-t border-gray-200">
          <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 text-xs sm:text-sm text-gray-600">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 lg:gap-6">
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
  );
};

export default EmployeesTable;