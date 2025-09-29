import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { RfidDevice } from '../../../types';

interface EditRfidDeviceModalProps {
  device: RfidDevice;
  formData: {
    name: string;
    macAddress: string;
    location: string;
    description: string;
  };
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const EditRfidDeviceModal: React.FC<EditRfidDeviceModalProps> = ({
  device,
  formData,
  onFormDataChange,
  onSubmit,
  onClose
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">Edit Alat RFID</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 touch-target"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Nama Alat
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              MAC Address
            </label>
            <input
              type="text"
              value={formData.macAddress}
              onChange={(e) => onFormDataChange({ ...formData, macAddress: e.target.value.toUpperCase() })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
              pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Format: XX:XX:XX:XX:XX:XX</p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Lokasi
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => onFormDataChange({ ...formData, location: e.target.value })}
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
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base"
              rows={3}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 sm:py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 sm:py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
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
  );
};

export default EditRfidDeviceModal;