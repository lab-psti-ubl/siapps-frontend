import React, { useState, useEffect } from 'react';
import { X, Wifi, Clock, MapPin, RefreshCw } from 'lucide-react';
import { Employee } from '../types';
import { rfidDevicesAPI, divisionsAPI, workShiftsAPI } from '../../../services/api';
import { Division, WorkShift } from '../types';

interface EditModalProps {
  employee: Employee;
  formData: {
    name: string;
    position: string;
    phone: string;
    nik: string;
    birthPlace: string;
    birthDate: string;
    basicSalary: string;
    rfidGuid: string;
    divisionId: string;
    workShiftId: string;
  };
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const EditModal: React.FC<EditModalProps> = ({
  employee,
  formData,
  onFormDataChange,
  onSubmit,
  onClose
}) => {
  const [unregisteredCards, setUnregisteredCards] = useState<any[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [showCardSelector, setShowCardSelector] = useState(false);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [isLoadingDivisions, setIsLoadingDivisions] = useState(true);

  // Ensure birthDate is properly formatted when component mounts
  useEffect(() => {
    if (employee.birthDate && !formData.birthDate) {
      const formattedBirthDate = new Date(employee.birthDate).toISOString().split('T')[0];
      onFormDataChange({ ...formData, birthDate: formattedBirthDate });
    }
    
    // Set division and work shift if available
    if (employee.divisionId && !formData.divisionId) {
      onFormDataChange({ ...formData, divisionId: employee.divisionId });
    }
    if (employee.workShiftId && !formData.workShiftId) {
      onFormDataChange({ ...formData, workShiftId: employee.workShiftId });
    }
  }, [employee.birthDate]);

  // Load unregistered cards on modal open
  useEffect(() => {
    loadUnregisteredCards();
    loadDivisions();
    loadWorkShifts();
    
    // Auto-refresh every 5 seconds to catch new taps
    const interval = setInterval(loadUnregisteredCards, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDivisions = async () => {
    try {
      const response = await divisionsAPI.getAll();
      if (response.success) {
        const divisionsData = response.data.map((div: any) => ({
          ...div,
          id: div._id
        }));
        setDivisions(divisionsData);
      }
    } catch (error) {
      console.error('Error loading divisions:', error);
    } finally {
      setIsLoadingDivisions(false);
    }
  };

  const loadWorkShifts = async () => {
    try {
      const response = await workShiftsAPI.getAll();
      if (response.success) {
        const shiftsData = response.data.map((shift: any) => ({
          ...shift,
          id: shift._id
        }));
        setWorkShifts(shiftsData);
      }
    } catch (error) {
      console.error('Error loading work shifts:', error);
    }
  };
  const loadUnregisteredCards = async () => {
    setIsLoadingCards(true);
    try {
      const response = await rfidDevicesAPI.getUnregisteredCards();
      if (response.success) {
        setUnregisteredCards(response.data);
      } else {
        console.warn('Failed to load unregistered cards:', response.message);
        setUnregisteredCards([]);
      }
    } catch (error) {
      console.error('Error loading unregistered cards:', error);
      setUnregisteredCards([]);
    } finally {
      setIsLoadingCards(false);
    }
  };

  const selectCard = async (card: any) => {
    // Set the GUID in form
    onFormDataChange({ ...formData, rfidGuid: card.guid });
    
    // Remove from unregistered list
    try {
      await rfidDevicesAPI.removeUnregisteredCard(card.guid);
      setUnregisteredCards(prev => prev.filter(c => c.guid !== card.guid));
    } catch (error) {
      console.error('Error removing unregistered card:', error);
    }
    
    setShowCardSelector(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Edit Pegawai</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jabatan
              </label>
              <div className="space-y-2">
                <select
                  value={formData.divisionId}
                  onChange={(e) => {
                    const selectedDivision = divisions.find(div => div.id === e.target.value);
                    onFormDataChange({ 
                      ...formData, 
                      divisionId: e.target.value,
                      position: selectedDivision ? selectedDivision.name : formData.position
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Pilih Divisi/Jabatan</option>
                  {divisions.map(division => (
                    <option key={division.id} value={division.id}>
                      {division.name}
                    </option>
                  ))}
                </select>
                {isLoadingDivisions && (
                  <p className="text-xs text-gray-500">Memuat divisi...</p>
                )}
                {!isLoadingDivisions && divisions.length === 0 && (
                  <p className="text-xs text-orange-600">
                    Belum ada divisi. Tambahkan divisi di menu Pengaturan → Pengaturan Divisi
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shift Kerja
              </label>
              <select
                value={formData.workShiftId}
                onChange={(e) => onFormDataChange({ ...formData, workShiftId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Pilih Shift Kerja</option>
                {workShifts.map(shift => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.checkInTime} - {shift.checkOutTime})
                  </option>
                ))}
              </select>
              {workShifts.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  Belum ada shift kerja. Tambahkan shift di menu Pengaturan → Pengaturan Jam Kerja
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Telepon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NIK
              </label>
              <input
                type="text"
                value={formData.nik}
                onChange={(e) => onFormDataChange({ ...formData, nik: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempat Lahir
              </label>
              <input
                type="text"
                value={formData.birthPlace}
                onChange={(e) => onFormDataChange({ ...formData, birthPlace: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => onFormDataChange({ ...formData, birthDate: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gaji Pokok
              </label>
              <input
                type="number"
                value={formData.basicSalary}
                onChange={(e) => onFormDataChange({ ...formData, basicSalary: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RFID GUID (Opsional)
              </label>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.rfidGuid}
                    onChange={(e) => onFormDataChange({ ...formData, rfidGuid: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    placeholder="Tap kartu RFID atau masukkan manual (contoh: 5a2a0ac)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCardSelector(!showCardSelector)}
                    className="flex items-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Wifi className="w-4 h-4" />
                    <span>Pilih Kartu</span>
                    {unregisteredCards.length > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {unregisteredCards.length}
                      </span>
                    )}
                  </button>
                </div>
                
                {/* Unregistered Cards Selector */}
                {showCardSelector && (
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-800">Kartu RFID yang Belum Terdaftar</h4>
                      <button
                        type="button"
                        onClick={loadUnregisteredCards}
                        disabled={isLoadingCards}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoadingCards ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </button>
                    </div>
                    
                    {isLoadingCards ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">Memuat kartu...</p>
                      </div>
                    ) : unregisteredCards.length === 0 ? (
                      <div className="text-center py-6">
                        <Wifi className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm text-gray-600 mb-2">Belum ada kartu RFID yang di-tap</p>
                        <p className="text-xs text-gray-500">
                          Tap kartu RFID pada alat yang terdaftar untuk menampilkan GUID di sini
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {unregisteredCards.map((card, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                  {card.guid}
                                </code>
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(card.timestamp)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Wifi className="w-3 h-3" />
                                  <span>{card.deviceName}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{card.deviceLocation}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => selectCard(card)}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                            >
                              Pilih
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                GUID kartu RFID akan muncul di daftar "Pilih Kartu" ketika kartu ditap pada alat yang terdaftar
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;