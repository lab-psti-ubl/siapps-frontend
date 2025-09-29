import React, { useState } from 'react';
import { MapPin, Save, Navigation, AlertCircle } from 'lucide-react';
import { WorkSettings } from '../types';

interface LocationSettingsTabProps {
  settings: WorkSettings;
  onUpdate: (settings: WorkSettings) => void;
}

const LocationSettingsTab: React.FC<LocationSettingsTabProps> = ({
  settings,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    companyLatitude: settings.companyLatitude,
    companyLongitude: settings.companyLongitude,
    radiusMeters: settings.radiusMeters
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        companyLatitude: formData.companyLatitude,
        companyLongitude: formData.companyLongitude,
        radiusMeters: formData.radiusMeters
      };
      
      await onUpdate(updatedSettings);
    } finally {
      setIsSaving(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            companyLatitude: position.coords.latitude,
            companyLongitude: position.coords.longitude
          }));
        },
        (error) => {
          alert('Gagal mendapatkan lokasi: ' + error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert('Geolocation tidak didukung oleh browser ini');
    }
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters} meter`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Pengaturan Lokasi Perusahaan</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Location Settings Form */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 border border-gray-200">
          <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Koordinat Perusahaan</h4>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.companyLatitude}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  companyLatitude: parseFloat(e.target.value) || 0
                }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
                placeholder="-5.4011664"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.companyLongitude}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  companyLongitude: parseFloat(e.target.value) || 0
                }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
                placeholder="105.3541365"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Radius Absensi (meter)
              </label>
              <input
                type="number"
                value={formData.radiusMeters}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  radiusMeters: parseInt(e.target.value) || 0
                }))}
                min="10"
                max="50000"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
                placeholder="20000"
              />
              <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                Jarak maksimal: {formatDistance(formData.radiusMeters)}
              </p>
            </div>

            <button
              onClick={getCurrentLocation}
              className="w-full flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors min-h-[44px] text-sm sm:text-base"
            >
              <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Gunakan Lokasi Saat Ini</span>
            </button>
          </div>
        </div>

        {/* Location Preview */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 border border-gray-200">
          <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Preview Lokasi</h4>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h5 className="font-medium text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">Koordinat Perusahaan</h5>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Latitude:</span>
                  <span className="font-mono">{formData.companyLatitude}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Longitude:</span>
                  <span className="font-mono">{formData.companyLongitude}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Radius:</span>
                  <span className="font-medium">{formatDistance(formData.radiusMeters)}</span>
                </div>
              </div>
            </div>

            {/* Google Maps Link */}
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
              <h5 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">Lihat di Google Maps</h5>
              <a
                href={`https://www.google.com/maps?q=${formData.companyLatitude},${formData.companyLongitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 sm:space-x-2 text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
              >
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Buka di Google Maps</span>
              </a>
            </div>

            {/* Radius Visualization */}
            <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
              <h5 className="font-medium text-green-800 mb-2 text-sm sm:text-base">Area Absensi</h5>
              <p className="text-xs sm:text-sm text-green-700">
                Pegawai dapat melakukan absensi dalam radius <strong>{formatDistance(formData.radiusMeters)}</strong> dari titik koordinat perusahaan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800 mb-2 text-sm sm:text-base">Panduan Pengaturan Lokasi</h4>
            <ul className="text-xs sm:text-sm text-yellow-700 space-y-1">
              <li>• Gunakan koordinat GPS yang akurat untuk lokasi perusahaan</li>
              <li>• Radius absensi menentukan seberapa jauh pegawai dapat melakukan absensi</li>
              <li>• Radius yang terlalu kecil dapat menyulitkan pegawai, terlalu besar dapat mengurangi akurasi</li>
              <li>• Klik "Gunakan Lokasi Saat Ini" jika Anda berada di lokasi perusahaan</li>
              <li>• Perubahan pengaturan akan berlaku untuk semua absensi selanjutnya</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
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
              <span>Simpan Pengaturan Lokasi</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LocationSettingsTab;