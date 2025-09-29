import React from 'react';
import { CreditCard as Edit, Trash2, Wifi, MapPin, Clock, Activity } from 'lucide-react';
import { RfidDevice } from '../../../types';

interface RfidDevicesTableProps {
  devices: RfidDevice[];
  totalDevices: number;
  onEditDevice: (device: RfidDevice) => void;
  onDeleteDevice: (id: string) => void;
}

const RfidDevicesTable: React.FC<RfidDevicesTableProps> = ({
  devices,
  totalDevices,
  onEditDevice,
  onDeleteDevice
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Daftar Alat RFID</h3>
      </div>
      
      {/* Mobile Card View */}
      <div className="block lg:hidden">
        {devices.length === 0 ? (
          <div className="p-4 sm:p-6 text-center">
            <div className="flex flex-col items-center space-y-3">
              <Wifi className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300" />
              <div>
                <p className="text-sm sm:text-base font-medium text-gray-900">
                  {totalDevices === 0 ? 'Belum ada alat RFID' : 'Tidak ada hasil yang ditemukan'}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {totalDevices === 0 
                    ? 'Tambahkan alat RFID pertama dengan klik tombol "Tambah Alat"'
                    : 'Coba ubah kata kunci pencarian'
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-4 space-y-3">
            {devices.map((device) => (
              <div key={device.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                {/* Device Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{device.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        device.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {device.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Device Details Grid */}
                <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-3 text-xs sm:text-sm">
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-500 text-xs">MAC Address</p>
                      <p className="font-mono text-gray-900 text-xs sm:text-sm break-all">{device.macAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-500 text-xs">Lokasi</p>
                      <p className="font-medium text-gray-900 text-xs sm:text-sm">{device.location}</p>
                    </div>
                  </div>
                  {device.lastActivity && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-500 text-xs">Aktivitas Terakhir</p>
                        <p className="font-medium text-gray-900 text-xs sm:text-sm">{formatDate(device.lastActivity)}</p>
                      </div>
                    </div>
                  )}
                  {device.description && (
                    <div className="col-span-2">
                      <p className="text-gray-500 text-xs">Deskripsi</p>
                      <p className="text-gray-700 text-xs sm:text-sm">{device.description}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEditDevice(device)}
                    className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-xs sm:text-sm font-medium min-h-[36px] sm:min-h-[40px]"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDeleteDevice(device.id)}
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
                Nama Alat
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                MAC Address
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Lokasi
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Aktivitas Terakhir
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {devices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <Wifi className="w-16 h-16 text-gray-300" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {totalDevices === 0 ? 'Belum ada alat RFID' : 'Tidak ada hasil yang ditemukan'}
                      </p>
                      <p className="text-gray-500 mt-1">
                        {totalDevices === 0 
                          ? 'Tambahkan alat RFID pertama dengan klik tombol "Tambah Alat"'
                          : 'Coba ubah kata kunci pencarian'
                        }
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              devices.map((device, index) => (
                <tr 
                  key={device.id} 
                  className={`hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <Wifi className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{device.name}</div>
                        {device.description && (
                          <div className="text-xs text-gray-500">{device.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {device.macAddress}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{device.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      device.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {device.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {device.lastActivity 
                        ? formatDate(device.lastActivity)
                        : 'Belum ada aktivitas'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => onEditDevice(device)}
                        className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Edit Alat"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteDevice(device.id)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Hapus Alat"
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
  );
};

export default RfidDevicesTable;