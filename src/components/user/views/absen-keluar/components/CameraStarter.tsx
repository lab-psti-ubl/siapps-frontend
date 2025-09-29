import React from 'react';
import { Camera, XCircle, Navigation, LogOut as LogOutIcon, LogIn } from 'lucide-react';

interface CameraStarterProps {
  isWithinRadius: boolean;
  devices: MediaDeviceInfo[];
  onStartCamera: () => void;
  onCheckLocation: () => void;
  cameraButtonText: string;
  icon: 'login' | 'logout';
  title: string;
  description: string;
}

const CameraStarter: React.FC<CameraStarterProps> = ({
  isWithinRadius,
  devices,
  onStartCamera,
  onCheckLocation,
  cameraButtonText,
  icon,
  title,
  description
}) => {
  const IconComponent = icon === 'login' ? LogIn : LogOutIcon;
  const iconColor = icon === 'login' ? 'text-blue-500' : 'text-purple-500';
  const buttonColor = icon === 'login' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 text-center">
      <IconComponent className={`w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 ${iconColor}`} />
      <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-sm lg:text-lg text-gray-600 mb-6 lg:mb-8">
        {description}
      </p>
      
      {isWithinRadius ? (
        <button
          onClick={onStartCamera}
          className={`px-8 lg:px-10 py-3 lg:py-4 ${buttonColor} text-white rounded-xl transition-colors font-medium flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105 text-sm lg:text-lg`}
        >
          <Camera className="w-5 h-5 lg:w-6 lg:h-6" />
          <span>{cameraButtonText}</span>
        </button>
      ) : (
        <div className="space-y-4">
          <button
            disabled
            className="px-8 lg:px-10 py-3 lg:py-4 bg-gray-400 text-white rounded-xl font-medium flex items-center space-x-3 mx-auto cursor-not-allowed text-sm lg:text-lg"
          >
            <XCircle className="w-5 h-5 lg:w-6 lg:h-6" />
            <span>Kamera Tidak Tersedia</span>
          </button>
          
          <button
            onClick={onCheckLocation}
            className="flex items-center space-x-2 px-4 lg:px-6 py-2 lg:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mx-auto text-sm lg:text-base"
          >
            <Navigation className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>Periksa Ulang Lokasi</span>
          </button>
        </div>
      )}
      
      {devices.length > 1 && isWithinRadius && (
        <p className="text-xs lg:text-sm text-gray-500 mt-4">
          💡 Tip: Anda memiliki {devices.length} kamera tersedia. Gunakan tombol ganti kamera setelah membuka kamera.
        </p>
      )}
    </div>
  );
};

export default CameraStarter;