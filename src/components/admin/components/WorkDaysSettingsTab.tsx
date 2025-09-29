import React, { useState, useEffect } from 'react';
import { Calendar, Save, X, AlertCircle, Plus } from 'lucide-react';
import { SalarySettings } from '../types';
import { salarySettingsAPI } from '../../../services/api';

interface WorkDaysSettingsTabProps {
  onNotification: (type: 'success' | 'error', message: string) => void;
}

const WorkDaysSettingsTab: React.FC<WorkDaysSettingsTabProps> = ({
  onNotification
}) => {
  const [salarySettings, setSalarySettings] = useState<SalarySettings | null>(null);
  const [formData, setFormData] = useState({
    workingDaysPerWeek: [1, 2, 3, 4, 5], // Monday to Friday
    salaryPaymentDate: 5,
    holidays: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newHoliday, setNewHoliday] = useState('');

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Load salary settings on component mount
  useEffect(() => {
    loadSalarySettings();
  }, []);

  const loadSalarySettings = async () => {
    try {
      setIsLoading(true);
      const response = await salarySettingsAPI.get();
      if (response.success) {
        setSalarySettings(response.data);
        setFormData({
          workingDaysPerWeek: [...response.data.workingDaysPerWeek],
          salaryPaymentDate: response.data.salaryPaymentDate,
          holidays: [...response.data.holidays]
        });
      }
    } catch (error) {
      console.error('Error loading salary settings:', error);
      onNotification('error', 'Gagal memuat pengaturan hari kerja');
      
      // Set default values if loading fails
      setFormData({
        workingDaysPerWeek: [1, 2, 3, 4, 5],
        salaryPaymentDate: 5,
        holidays: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkingDayToggle = (dayIndex: number) => {
    const newWorkingDays = [...formData.workingDaysPerWeek];
    const index = newWorkingDays.indexOf(dayIndex);
    
    if (index > -1) {
      newWorkingDays.splice(index, 1);
    } else {
      newWorkingDays.push(dayIndex);
    }
    
    newWorkingDays.sort();
    setFormData({ ...formData, workingDaysPerWeek: newWorkingDays });
  };

  const addHoliday = () => {
    if (newHoliday && !formData.holidays.includes(newHoliday)) {
      setFormData({
        ...formData,
        holidays: [...formData.holidays, newHoliday].sort()
      });
      setNewHoliday('');
    }
  };

  const removeHoliday = (holiday: string) => {
    setFormData({
      ...formData,
      holidays: formData.holidays.filter(h => h !== holiday)
    });
  };

  const handleSave = async () => {
    if (formData.workingDaysPerWeek.length === 0) {
      onNotification('error', 'Pilih minimal 1 hari kerja');
      return;
    }
    
    if (formData.salaryPaymentDate < 1 || formData.salaryPaymentDate > 28) {
      onNotification('error', 'Tanggal gajian harus antara 1-28');
      return;
    }

    setIsSaving(true);
    try {
      // Update salary settings with new work days configuration
      const updatedSettings = {
        ...salarySettings!,
        workingDaysPerWeek: formData.workingDaysPerWeek,
        salaryPaymentDate: formData.salaryPaymentDate,
        holidays: formData.holidays
      };

      const response = await salarySettingsAPI.update(updatedSettings);
      
      if (response.success) {
        setSalarySettings(response.data);
        onNotification('success', '📅 Pengaturan hari kerja berhasil disimpan!');
      }
    } catch (error) {
      console.error('Error saving work days settings:', error);
      onNotification('error', 'Gagal menyimpan pengaturan hari kerja');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">Pengaturan Hari Kerja</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Pengaturan Hari Kerja</h3>
      </div>

      {/* Working Days Settings */}
      <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200">
        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          Pengaturan Hari Kerja
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Hari Kerja dalam Seminggu
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {dayNames.map((day, index) => (
                <label key={index} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-blue-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.workingDaysPerWeek.includes(index)}
                    onChange={() => handleWorkingDayToggle(index)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">{day}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Pilih hari-hari yang dianggap sebagai hari kerja untuk perhitungan gaji
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Gajian (setiap bulan)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                value={formData.salaryPaymentDate}
                onChange={(e) => setFormData({ ...formData, salaryPaymentDate: parseInt(e.target.value) || 5 })}
                className="w-20 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                min="1"
                max="28"
                required
              />
              <span className="text-sm text-gray-600">setiap bulan</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Periode gaji akan dihitung dari tanggal {formData.salaryPaymentDate + 1} bulan sebelumnya sampai tanggal {formData.salaryPaymentDate} bulan ini
            </p>
          </div>
        </div>
      </div>

      {/* Holidays Settings */}
      <div className="bg-orange-50 rounded-xl p-4 sm:p-6 border border-orange-200">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Pengaturan Hari Libur</h4>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <input
              type="date"
              value={newHoliday}
              onChange={(e) => setNewHoliday(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Pilih tanggal libur"
            />
            <button
              type="button"
              onClick={addHoliday}
              disabled={!newHoliday || formData.holidays.includes(newHoliday)}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Libur</span>
            </button>
          </div>

          {formData.holidays.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-800 mb-3">Daftar Hari Libur ({formData.holidays.length})</h5>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {formData.holidays.map((holiday, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200 hover:border-orange-300 transition-colors">
                    <span className="text-sm text-gray-900 font-medium">
                      {new Date(holiday).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeHoliday(holiday)}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Hapus hari libur"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.holidays.length === 0 && (
            <div className="text-center py-6 bg-white rounded-lg border-2 border-dashed border-orange-300">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-orange-300" />
              <p className="text-sm text-gray-600">Belum ada hari libur yang ditambahkan</p>
              <p className="text-xs text-gray-500 mt-1">Tambahkan tanggal libur nasional atau cuti bersama</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-green-50 rounded-xl p-4 sm:p-6 border border-green-200">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Preview Pengaturan</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h5 className="font-medium text-gray-800 mb-2">Hari Kerja Aktif</h5>
            <div className="flex flex-wrap gap-2">
              {formData.workingDaysPerWeek.map(dayIndex => (
                <span key={dayIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {dayNames[dayIndex]}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Total: {formData.workingDaysPerWeek.length} hari per minggu
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h5 className="font-medium text-gray-800 mb-2">Jadwal Gajian</h5>
            <p className="text-lg font-bold text-green-600">
              Tanggal {formData.salaryPaymentDate} setiap bulan
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Periode: {formData.salaryPaymentDate + 1} bulan lalu - {formData.salaryPaymentDate} bulan ini
            </p>
          </div>
        </div>

        {formData.holidays.length > 0 && (
          <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
            <h5 className="font-medium text-gray-800 mb-2">Hari Libur Terdaftar</h5>
            <p className="text-sm text-gray-600">
              Total {formData.holidays.length} hari libur yang akan dikecualikan dari perhitungan gaji
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">Informasi Penting</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Perubahan pengaturan akan mempengaruhi perhitungan gaji selanjutnya</li>
              <li>• Hari libur tidak akan dihitung sebagai hari kerja dalam perhitungan gaji</li>
              <li>• Periode gaji dihitung berdasarkan tanggal gajian yang ditetapkan</li>
              <li>• Pastikan pengaturan sudah sesuai sebelum menghitung gaji pegawai</li>
              <li>• Hari kerja yang dipilih akan berlaku untuk semua pegawai</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving || formData.workingDaysPerWeek.length === 0}
          className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 min-h-[44px] text-sm sm:text-base w-full sm:w-auto"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Simpan Pengaturan Hari Kerja</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WorkDaysSettingsTab;