import React, { useState } from 'react';
import { 
  X, 
  Save, 
  DollarSign, 
  Clock, 
  Calendar, 
  AlertCircle,
  Settings,
  TrendingDown
} from 'lucide-react';
import { SalarySettings } from '../../types';

interface SalarySettingsModalProps {
  settings: SalarySettings;
  onUpdate: (settings: SalarySettings) => void;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
}

const SalarySettingsModal: React.FC<SalarySettingsModalProps> = ({
  settings,
  onUpdate,
  onClose,
  formatCurrency
}) => {
  const [formData, setFormData] = useState<SalarySettings>({
    absentDeduction: settings.absentDeduction,
    leaveDeduction: settings.leaveDeduction,
    lateDeduction: settings.lateDeduction,
    earlyLeaveDeduction: settings.earlyLeaveDeduction,
    lateTimeBlock: settings.lateTimeBlock,
    earlyLeaveTimeBlock: settings.earlyLeaveTimeBlock,
    workingDaysPerWeek: [...settings.workingDaysPerWeek],
    salaryPaymentDate: settings.salaryPaymentDate,
    holidays: [...settings.holidays]
  });
  const [isSaving, setIsSaving] = useState(false);
  const [newHoliday, setNewHoliday] = useState('');

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    try {
      await onUpdate(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Pengaturan Potongan Gaji</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Deduction Settings */}
          <div className="bg-red-50 rounded-xl p-4 sm:p-6 border border-red-200">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
              Pengaturan Potongan Gaji
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Atur besaran potongan untuk berbagai jenis pelanggaran absensi
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Potongan Tidak Hadir (per hari)
                </label>
                <input
                  type="number"
                  value={formData.absentDeduction}
                  onChange={(e) => setFormData({ ...formData, absentDeduction: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Saat ini: {formatCurrency(formData.absentDeduction)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Potongan Izin (per hari)
                </label>
                <input
                  type="number"
                  value={formData.leaveDeduction}
                  onChange={(e) => setFormData({ ...formData, leaveDeduction: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Saat ini: {formatCurrency(formData.leaveDeduction)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Potongan Terlambat (per blok)
                </label>
                <input
                  type="number"
                  value={formData.lateDeduction}
                  onChange={(e) => setFormData({ ...formData, lateDeduction: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Saat ini: {formatCurrency(formData.lateDeduction)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Potongan Pulang Cepat (per blok)
                </label>
                <input
                  type="number"
                  value={formData.earlyLeaveDeduction}
                  onChange={(e) => setFormData({ ...formData, earlyLeaveDeduction: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Saat ini: {formatCurrency(formData.earlyLeaveDeduction)}</p>
              </div>
            </div>
          </div>

          {/* Time Block Settings */}
          <div className="bg-yellow-50 rounded-xl p-4 sm:p-6 border border-yellow-200">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-yellow-600" />
              Pengaturan Blok Waktu
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Atur sistem blok waktu untuk perhitungan potongan terlambat dan pulang cepat
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blok Waktu Terlambat (menit)
                </label>
                <input
                  type="number"
                  value={formData.lateTimeBlock}
                  onChange={(e) => setFormData({ ...formData, lateTimeBlock: parseInt(e.target.value) || 30 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="120"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Waktu terlambat akan dibulatkan ke atas ke blok {formData.lateTimeBlock} menit
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blok Waktu Pulang Cepat (menit)
                </label>
                <input
                  type="number"
                  value={formData.earlyLeaveTimeBlock}
                  onChange={(e) => setFormData({ ...formData, earlyLeaveTimeBlock: parseInt(e.target.value) || 30 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="120"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Waktu pulang cepat akan dibulatkan ke atas ke blok {formData.earlyLeaveTimeBlock} menit
                </p>
              </div>
            </div>
          </div>


          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Informasi Penting</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Perubahan pengaturan akan mempengaruhi perhitungan gaji selanjutnya</li>
                  <li>• Waktu terlambat dan pulang cepat akan dibulatkan ke atas ke blok terdekat</li>
                  <li>• Pengaturan hari kerja dan libur dapat diatur di menu Pengaturan → Hari Kerja</li>
                  <li>• Pastikan pengaturan sudah sesuai sebelum menghitung gaji pegawai</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan Potongan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalarySettingsModal;