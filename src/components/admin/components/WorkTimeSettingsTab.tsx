import React, { useState } from 'react';
import { Plus, Trash2, Clock, AlertCircle, Save } from 'lucide-react';
import { WorkShift } from '../types';
import { workShiftsAPI } from '../../../services/api';

interface WorkTimeSettingsTabProps {
  workShifts: WorkShift[];
  onUpdate: (shifts: WorkShift[]) => void;
  onNotification: (type: 'success' | 'error', message: string) => void;
}

const WorkTimeSettingsTab: React.FC<WorkTimeSettingsTabProps> = ({
  workShifts,
  onUpdate,
  onNotification
}) => {
  const [shiftCount, setShiftCount] = useState(() => Math.max(1, workShifts.length));
  const [shifts, setShifts] = useState<Array<{
    name: string;
    checkInTime: string;
    checkOutTime: string;
    lateThresholdMinutes: number;
    earlyLeaveThresholdMinutes: number;
  }>>(() => {
    if (workShifts.length > 0) {
      return workShifts.map(shift => ({
        name: shift.name,
        checkInTime: shift.checkInTime,
        checkOutTime: shift.checkOutTime,
        lateThresholdMinutes: shift.lateThresholdMinutes,
        earlyLeaveThresholdMinutes: shift.earlyLeaveThresholdMinutes
      }));
    }
    
    // Default single shift
    return [{
      name: 'Shift Pagi',
      checkInTime: '08:00',
      checkOutTime: '17:00',
      lateThresholdMinutes: 15,
      earlyLeaveThresholdMinutes: 15
    }];
  });
  const [isSaving, setIsSaving] = useState(false);

  // Update shifts array when shift count changes
  const handleShiftCountChange = (count: number) => {
    setShiftCount(count);
    
    const newShifts = [...shifts];
    
    if (count > shifts.length) {
      // Add new shifts
      for (let i = shifts.length; i < count; i++) {
        const shiftNames = ['Shift Pagi', 'Shift Siang', 'Shift Malam', 'Shift 4', 'Shift 5'];
        const defaultTimes = [
          { checkIn: '08:00', checkOut: '17:00' },
          { checkIn: '14:00', checkOut: '23:00' },
          { checkIn: '23:00', checkOut: '08:00' },
          { checkIn: '06:00', checkOut: '15:00' },
          { checkIn: '15:00', checkOut: '00:00' }
        ];
        
        newShifts.push({
          name: shiftNames[i] || `Shift ${i + 1}`,
          checkInTime: defaultTimes[i]?.checkIn || '08:00',
          checkOutTime: defaultTimes[i]?.checkOut || '17:00',
          lateThresholdMinutes: 15,
          earlyLeaveThresholdMinutes: 15
        });
      }
    } else if (count < shifts.length) {
      // Remove excess shifts
      newShifts.splice(count);
    }
    
    setShifts(newShifts);
  };

  const updateShift = (index: number, field: string, value: string | number) => {
    const newShifts = [...shifts];
    newShifts[index] = {
      ...newShifts[index],
      [field]: value
    };
    setShifts(newShifts);
  };

  const handleSave = async () => {
    // Validate shifts
    for (let i = 0; i < shifts.length; i++) {
      const shift = shifts[i];
      if (!shift.name.trim()) {
        onNotification('error', `Nama shift ${i + 1} tidak boleh kosong`);
        return;
      }
      if (!shift.checkInTime || !shift.checkOutTime) {
        onNotification('error', `Jam kerja shift ${i + 1} harus diisi`);
        return;
      }
      
      // For night shifts, allow check out time to be earlier than check in time
      const checkInMinutes = timeToMinutes(shift.checkInTime);
      const checkOutMinutes = timeToMinutes(shift.checkOutTime);
      
      // Only validate if it's not a night shift (crossing midnight)
      if (checkInMinutes < 12 * 60 && checkOutMinutes < 12 * 60 && shift.checkInTime >= shift.checkOutTime) {
        onNotification('error', `Jam masuk shift ${i + 1} harus lebih awal dari jam keluar (kecuali shift malam)`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const response = await workShiftsAPI.updateBulk(shifts);
      if (response.success) {
        const updatedShifts = response.data.map((shift: any) => ({
          ...shift,
          id: shift._id
        }));
        onUpdate(updatedShifts);
        onNotification('success', '⏰ Pengaturan jam kerja berhasil disimpan!');
      }
    } catch (error) {
      console.error('Error saving work shifts:', error);
      onNotification('error', 'Gagal menyimpan pengaturan jam kerja');
    } finally {
      setIsSaving(false);
    }
  };

  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const calculateWorkHours = (checkIn: string, checkOut: string): string => {
    const checkInMinutes = timeToMinutes(checkIn);
    let checkOutMinutes = timeToMinutes(checkOut);
    
    // Handle night shift (crossing midnight)
    if (checkOutMinutes <= checkInMinutes) {
      checkOutMinutes += 24 * 60; // Add 24 hours
    }
    
    const diffMinutes = checkOutMinutes - checkInMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return `${hours}j ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Pengaturan Jam Kerja</h3>
      </div>

      {/* Shift Count Selector */}
      <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-blue-200">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-3 sm:mb-4">
          <h4 className="text-base sm:text-lg font-bold text-blue-800">Jumlah Shift Kerja</h4>
          <select
            value={shiftCount}
            onChange={(e) => handleShiftCountChange(parseInt(e.target.value))}
            className="px-3 sm:px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[40px] text-sm sm:text-base"
          >
            {[1, 2, 3, 4, 5].map(count => (
              <option key={count} value={count}>
                {count} Shift
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs sm:text-sm text-blue-700">
          Pilih jumlah shift kerja yang diinginkan. Setiap shift dapat memiliki jam kerja dan toleransi yang berbeda.
        </p>
      </div>

      {/* Shifts Configuration */}
      <div className="space-y-4 sm:space-y-6">
        {shifts.map((shift, index) => (
          <div key={index} className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 border border-gray-200">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                {index + 1}
              </div>
              <h4 className="text-base sm:text-lg font-bold text-gray-800">Konfigurasi Shift {index + 1}</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {/* Shift Name */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Nama Shift
                </label>
                <input
                  type="text"
                  value={shift.name}
                  onChange={(e) => updateShift(index, 'name', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
                  placeholder={`Shift ${index + 1}`}
                />
              </div>

              {/* Work Hours */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Jam Masuk
                </label>
                <input
                  type="time"
                  value={shift.checkInTime}
                  onChange={(e) => updateShift(index, 'checkInTime', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Jam Keluar
                </label>
                <input
                  type="time"
                  value={shift.checkOutTime}
                  onChange={(e) => updateShift(index, 'checkOutTime', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Durasi Kerja
                </label>
                <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm sm:text-base min-h-[40px] sm:min-h-[44px] flex items-center">
                  {calculateWorkHours(shift.checkInTime, shift.checkOutTime)}
                </div>
              </div>

              {/* Tolerance Settings */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Toleransi Terlambat (menit)
                </label>
                <input
                  type="number"
                  value={shift.lateThresholdMinutes}
                  onChange={(e) => updateShift(index, 'lateThresholdMinutes', parseInt(e.target.value) || 0)}
                  min="0"
                  max="60"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Toleransi Pulang Cepat (menit)
                </label>
                <input
                  type="number"
                  value={shift.earlyLeaveThresholdMinutes}
                  onChange={(e) => updateShift(index, 'earlyLeaveThresholdMinutes', parseInt(e.target.value) || 0)}
                  min="0"
                  max="60"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
                />
              </div>

              {/* Shift Info */}
              <div className="sm:col-span-2 lg:col-span-3">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                  <h5 className="font-medium text-gray-800 mb-2 text-sm sm:text-base">Informasi Shift</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Jam Kerja:</span> {shift.checkInTime} - {shift.checkOutTime}
                    </div>
                    <div>
                      <span className="font-medium">Durasi:</span> {calculateWorkHours(shift.checkInTime, shift.checkOutTime)}
                    </div>
                    <div>
                      <span className="font-medium">Batas Terlambat:</span> {shift.checkInTime} + {shift.lateThresholdMinutes} menit
                    </div>
                    <div>
                      <span className="font-medium">Batas Pulang Cepat:</span> {shift.checkOutTime} - {shift.earlyLeaveThresholdMinutes} menit
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800 mb-2 text-sm sm:text-base">Informasi Penting</h4>
            <ul className="text-xs sm:text-sm text-yellow-700 space-y-1">
              <li>• Setiap shift dapat memiliki jam kerja dan toleransi yang berbeda</li>
              <li>• Shift malam dapat melewati tengah malam (contoh: 23:00 - 08:00)</li>
              <li>• Toleransi terlambat dan pulang cepat dihitung dari jam kerja masing-masing shift</li>
              <li>• Pegawai dapat ditetapkan ke shift tertentu saat menambah/edit data pegawai</li>
              <li>• Perubahan pengaturan akan mempengaruhi perhitungan gaji dan absensi</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 min-h-[44px] text-sm sm:text-base w-full sm:w-auto"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Simpan Pengaturan Jam Kerja</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WorkTimeSettingsTab;