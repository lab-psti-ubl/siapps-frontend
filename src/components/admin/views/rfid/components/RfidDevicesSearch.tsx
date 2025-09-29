import React from 'react';
import { Search } from 'lucide-react';

interface RfidDevicesSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const RfidDevicesSearch: React.FC<RfidDevicesSearchProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
      <div className="relative">
        <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari alat RFID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
        />
      </div>
      <p className="text-xs sm:text-sm text-gray-500 mt-2">
        Cari berdasarkan nama alat, MAC address, atau lokasi
      </p>
    </div>
  );
};

export default RfidDevicesSearch;