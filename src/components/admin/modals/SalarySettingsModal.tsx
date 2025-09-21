import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { SalarySettings } from '../types';

interface SalarySettingsModalProps {
  settings: SalarySettings;
  onSave: (settings: SalarySettings) => void;
  onClose: () => void;
}

const SalarySettingsModal: React.FC<SalarySettingsModalProps> = ({
  settings,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<SalarySettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Pengaturan Potongan Gaji</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Informasi Pengaturan Potongan Gaji</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Potongan tidak hadir: dipotong per hari tidak masuk kerja</li>
                  <li>• Potongan izin: dipotong per hari izin yang disetujui</li>
                  <li>• Potongan terlambat: dipotong per blok waktu (default 30 menit)</li>
                  <li>• Potongan pulang cepat: dipotong per blok waktu (default 30 menit)</li>
                  <li>• Waktu terlambat/pulang cepat dibulatkan ke atas ke blok terdekat</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deduction Settings */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-gray-800">Pengaturan Potongan</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Potongan Tidak Hadir (per hari)
                </label>
                <input
                  type="number"
                  value={formData.absentDeduction}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    absentDeduction: parseInt(e.target.value) || 0
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="70000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Saat ini: {formatCurrency(formData.absentDeduction)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Potongan Izin (per hari)
                </label>
                <input
                  type="number"
                  value={formData.leaveDeduction}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    leaveDeduction: parseInt(e.target.value) || 0
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="35000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Saat ini: {formatCurrency(formData.leaveDeduction)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Potongan Terlambat (per blok)
                </label>
                <input
                  type="number"
                  value={formData.lateDeduction}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    lateDeduction: parseInt(e.target.value) || 0
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Saat ini: {formatCurrency(formData.lateDeduction)} per {formData.lateBlockMinutes} menit
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Potongan Pulang Cepat (per blok)
                </label>
                <input
                  type="number"
                  value={formData.earlyLeaveDeduction}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    earlyLeaveDeduction: parseInt(e.target.value) || 0
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Saat ini: {formatCurrency(formData.earlyLeaveDeduction)} per {formData.earlyLeaveBlockMinutes} menit
                </p>
              </div>
            </div>

            {/* Block Settings */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-gray-800">Pengaturan Blok Waktu</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blok Waktu Terlambat (menit)
                </label>
                <input
                  type="number"
                  value={formData.lateBlockMinutes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    lateBlockMinutes: parseInt(e.target.value) || 30
                  }))}
                  min="1"
                  max="60"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="30"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Waktu terlambat akan dibulatkan ke kelipatan {formData.lateBlockMinutes} menit
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blok Waktu Pulang Cepat (menit)
                </label>
                <input
                  type="number"
                  value={formData.earlyLeaveBlockMinutes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    earlyLeaveBlockMinutes: parseInt(e.target.value) || 30
                  }))}
                  min="1"
                  max="60"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="30"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Waktu pulang cepat akan dibulatkan ke kelipatan {formData.earlyLeaveBlockMinutes} menit
                </p>
              </div>

              {/* Example Calculation */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-3">Contoh Perhitungan</h5>
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between">
                    <span>Gaji Pokok:</span>
                    <span className="font-medium">Rp 5.000.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tidak Hadir (2 hari):</span>
                    <span className="text-red-600">-{formatCurrency(2 * formData.absentDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Izin (1 hari):</span>
                    <span className="text-red-600">-{formatCurrency(1 * formData.leaveDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Terlambat (90 menit = 3 blok):</span>
                    <span className="text-red-600">-{formatCurrency(3 * formData.lateDeduction)}</span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between font-medium">
                    <span>Gaji Bersih:</span>
                    <span className="text-green-600">
                      {formatCurrency(5000000 - (2 * formData.absentDeduction) - (1 * formData.leaveDeduction) - (3 * formData.lateDeduction))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Simpan Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalarySettingsModal;