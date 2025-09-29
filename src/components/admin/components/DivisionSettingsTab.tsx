import React, { useState } from 'react';
import { Plus, CreditCard as Edit, Trash2, Building, Save, X } from 'lucide-react';
import { Division } from '../types';
import { divisionsAPI } from '../../../services/api';

interface DivisionSettingsTabProps {
  divisions: Division[];
  onUpdate: (divisions: Division[]) => void;
  onNotification: (type: 'success' | 'error', message: string) => void;
}

const DivisionSettingsTab: React.FC<DivisionSettingsTabProps> = ({
  divisions,
  onUpdate,
  onNotification
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddDivision = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      onNotification('error', 'Nama divisi tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await divisionsAPI.create({
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      
      if (response.success) {
        const newDivision = {
          ...response.data,
          id: response.data._id
        };
        
        onUpdate([...divisions, newDivision]);
        setFormData({ name: '', description: '' });
        setShowAddModal(false);
        onNotification('success', `✅ Divisi ${formData.name} berhasil ditambahkan!`);
      }
    } catch (error: any) {
      console.error('Error adding division:', error);
      onNotification('error', error.message || 'Gagal menambahkan divisi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDivision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDivision) return;
    
    if (!formData.name.trim()) {
      onNotification('error', 'Nama divisi tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await divisionsAPI.update(selectedDivision.id, {
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      
      if (response.success) {
        const updatedDivision = {
          ...response.data,
          id: response.data._id
        };
        
        const updatedDivisions = divisions.map(div => 
          div.id === selectedDivision.id ? updatedDivision : div
        );
        
        onUpdate(updatedDivisions);
        setShowEditModal(false);
        setSelectedDivision(null);
        onNotification('success', `✅ Divisi ${formData.name} berhasil diperbarui!`);
      }
    } catch (error: any) {
      console.error('Error updating division:', error);
      onNotification('error', error.message || 'Gagal memperbarui divisi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDivision = async (division: Division) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus divisi ${division.name}?`)) {
      return;
    }

    try {
      const response = await divisionsAPI.delete(division.id);
      if (response.success) {
        const updatedDivisions = divisions.filter(div => div.id !== division.id);
        onUpdate(updatedDivisions);
        onNotification('success', `✅ Divisi ${division.name} berhasil dihapus!`);
      }
    } catch (error: any) {
      console.error('Error deleting division:', error);
      onNotification('error', error.message || 'Gagal menghapus divisi');
    }
  };

  const openEditModal = (division: Division) => {
    setSelectedDivision(division);
    setFormData({
      name: division.name,
      description: division.description || ''
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedDivision(null);
    setFormData({ name: '', description: '' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">Pengaturan Divisi</h3>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center space-x-1 sm:space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Tambah Divisi</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>

      {/* Divisions List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
          <h4 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800">Daftar Divisi</h4>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Divisi yang ditambahkan akan muncul sebagai pilihan jabatan saat menambah pegawai
          </p>
        </div>
        
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {divisions.length === 0 ? (
            <div className="p-4 sm:p-6 text-center">
              <div className="flex flex-col items-center space-y-3">
                <Building className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300" />
                <div>
                  <p className="text-sm sm:text-base font-medium text-gray-900">Belum ada divisi</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Tambahkan divisi pertama dengan klik tombol "Tambah Divisi"
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-4 space-y-3">
              {divisions.map((division) => (
                <div key={division.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-purple-300 transition-colors">
                  {/* Division Header */}
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                      <Building className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{division.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500">{formatDate(division.createdAt)}</p>
                    </div>
                  </div>

                  {/* Division Description */}
                  {division.description && (
                    <div className="mb-3">
                      <p className="text-xs sm:text-sm text-gray-700">{division.description}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(division)}
                      className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-xs sm:text-sm font-medium min-h-[36px] sm:min-h-[40px]"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteDivision(division)}
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
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Divisi
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dibuat
                </th>
                <th className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {divisions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 lg:px-6 py-8 lg:py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <Building className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300" />
                      <div>
                        <p className="text-base lg:text-lg font-medium text-gray-900">Belum ada divisi</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Tambahkan divisi pertama dengan klik tombol "Tambah Divisi"
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                divisions.map((division, index) => (
                  <tr 
                    key={division.id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                          <Building className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{division.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <div className="text-sm text-gray-900">
                        {division.description || '-'}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(division.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(division)}
                          className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="Edit Divisi"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDivision(division)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="Hapus Divisi"
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
      </div>

      {/* Add Division Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 w-full max-w-sm sm:max-w-md mx-3 sm:mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Tambah Divisi Baru</h3>
              <button
                onClick={closeModals}
                className="text-gray-500 hover:text-gray-700 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 touch-target"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleAddDivision} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Nama Divisi *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
                  placeholder="Contoh: IT, HR, Finance, Marketing"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base"
                  rows={3}
                  placeholder="Deskripsi singkat tentang divisi ini..."
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  disabled={isSubmitting}
                  className="px-4 py-2 sm:py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 sm:py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Simpan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Division Modal */}
      {showEditModal && selectedDivision && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 w-full max-w-sm sm:max-w-md mx-3 sm:mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Edit Divisi</h3>
              <button
                onClick={closeModals}
                className="text-gray-500 hover:text-gray-700 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 touch-target"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleEditDivision} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Nama Divisi *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base"
                  rows={3}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  disabled={isSubmitting}
                  className="px-4 py-2 sm:py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 sm:py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Update</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DivisionSettingsTab;