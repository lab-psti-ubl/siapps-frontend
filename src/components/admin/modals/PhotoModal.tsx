import React from 'react';
import { X, QrCode, Image, Wifi } from 'lucide-react';
import { AttendanceRecord } from '../types';

interface PhotoModalProps {
  attendance: AttendanceRecord;
  photoType: 'checkIn' | 'checkOut';
  onClose: () => void;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ attendance, photoType, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const photo = photoType === 'checkIn' ? attendance.checkInPhoto : attendance.checkOutPhoto;
  const time = photoType === 'checkIn' ? attendance.checkInTime : attendance.checkOutTime;
  const method = photoType === 'checkIn' ? attendance.checkInMethod : attendance.checkOutMethod;
  const title = photoType === 'checkIn' ? 'Foto Absen Masuk' : 'Foto Absen Keluar';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800">{attendance.employeeName}</p>
            <p className="text-sm text-gray-600">{formatDate(attendance.date)} - {time}</p>
          </div>

          {method === 'qr' ? (
            <div className="p-8 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
              <QrCode className="w-16 h-16 mx-auto mb-4 text-blue-500" />
              <p className="text-blue-700 font-medium">Absen menggunakan QR Code</p>
              <p className="text-sm text-blue-600 mt-2">Tidak ada foto tersedia</p>
            </div>
          ) : method === 'rfid' ? (
            <div className="p-8 bg-purple-50 rounded-lg border-2 border-dashed border-purple-300">
              <Wifi className="w-16 h-16 mx-auto mb-4 text-purple-500" />
              <p className="text-purple-700 font-medium">Absen menggunakan RFID Card</p>
              <p className="text-sm text-purple-600 mt-2">
                {photoType === 'checkIn' 
                  ? `Alat: ${attendance.rfidDeviceName || 'Unknown Device'}`
                  : `Alat: ${attendance.checkOutRfidDeviceName || 'Unknown Device'}`
                }
              </p>
            </div>
          ) : photo ? (
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <img 
                src={photo} 
                alt={title} 
                className="w-full h-64 object-cover"
              />
            </div>
          ) : (
            <div className="p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Image className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Foto tidak tersedia</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;