import React from 'react';
import { MapPin, CheckCircle, XCircle, AlertCircle, Loader, Navigation } from 'lucide-react';
import { Coordinates, formatDistance, getAllowedRadius } from '../../../../../utils/locationUtils';

interface LocationCheckerProps {
  isCheckingLocation: boolean;
  locationError: string;
  isWithinRadius: boolean;
  distanceFromCompany: number;
  userLocation: Coordinates | null;
  onCheckLocation: () => void;
}

const LocationChecker: React.FC<LocationCheckerProps> = ({
  isCheckingLocation,
  locationError,
  isWithinRadius,
  distanceFromCompany,
  userLocation,
  onCheckLocation
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
      <div className="flex items-center space-x-3 mb-4">
        <MapPin className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500" />
        <h3 className="text-lg lg:text-xl font-bold text-gray-800">Status Lokasi</h3>
      </div>

      {isCheckingLocation ? (
        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Loader className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500 animate-spin" />
          <div>
            <p className="font-medium text-blue-800 text-sm lg:text-base">Memeriksa Lokasi...</p>
            <p className="text-xs lg:text-sm text-blue-600">Mohon tunggu, sedang mendapatkan lokasi Anda</p>
          </div>
        </div>
      ) : locationError ? (
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-red-800 text-sm lg:text-base">
                {locationError.includes('diluar radius') ? 'Diluar Radius Perusahaan' : 'Error Lokasi'}
              </p>
              <p className="text-xs lg:text-sm text-red-600 break-words">{locationError}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onCheckLocation}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm lg:text-base"
            >
              <Navigation className="w-4 h-4" />
              <span>Periksa Ulang Lokasi</span>
            </button>
            
            {userLocation && (
              <div className="flex items-center justify-center space-x-2 text-xs lg:text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Jarak: {formatDistance(distanceFromCompany)}</span>
              </div>
            )}
          </div>
        </div>
      ) : isWithinRadius ? (
        <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-500" />
          <div className="flex-1">
            <p className="font-medium text-green-800 text-sm lg:text-base">Dalam Radius Perusahaan</p>
            <p className="text-xs lg:text-sm text-green-600">
              Jarak Anda: {formatDistance(distanceFromCompany)} dari kantor
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <XCircle className="w-5 h-5 lg:w-6 lg:h-6 text-red-500" />
          <div className="flex-1">
            <p className="font-medium text-red-800 text-sm lg:text-base">Diluar Radius Perusahaan</p>
            <p className="text-xs lg:text-sm text-red-600">
              Jarak Anda: {formatDistance(distanceFromCompany)} dari kantor (Maks: {formatDistance(getAllowedRadius())})
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationChecker;