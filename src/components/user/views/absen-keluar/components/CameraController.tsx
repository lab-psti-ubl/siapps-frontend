import React from 'react';
import Webcam from 'react-webcam';
import { Camera, XCircle, SwitchCamera } from 'lucide-react';

interface CameraControllerProps {
  webcamRef: React.RefObject<Webcam>;
  devices: MediaDeviceInfo[];
  currentDeviceId: string;
  onSwitchCamera: () => void;
  onStopCamera: () => void;
  onCapturePhoto: () => void;
  onUserMediaError: (error: string | DOMException) => void;
}

const CameraController: React.FC<CameraControllerProps> = ({
  webcamRef,
  devices,
  currentDeviceId,
  onSwitchCamera,
  onStopCamera,
  onCapturePhoto,
  onUserMediaError
}) => {
  const videoConstraints = {
    width: 640,
    height: 480,
    deviceId: currentDeviceId ? { exact: currentDeviceId } : undefined,
    facingMode: currentDeviceId ? undefined : 'user',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="text-lg lg:text-xl font-bold text-gray-800">Preview Kamera</h3>
        <div className="flex space-x-2">
          {(devices.length > 1 || !currentDeviceId) && (
            <button
              onClick={onSwitchCamera}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              title="Ganti Kamera"
            >
              <SwitchCamera className="w-4 h-4" />
              <span className="hidden sm:inline">Ganti</span>
            </button>
          )}
          <button
            onClick={onStopCamera}
            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
            title="Tutup Kamera"
          >
            <XCircle className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </div>
      </div>
      
      <div className="space-y-4 lg:space-y-6">
        {/* Camera Preview Container */}
        <div className="relative bg-gray-900 rounded-xl overflow-hidden border-4 border-blue-500">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMediaError={onUserMediaError}
            className="w-full h-64 sm:h-80 lg:h-96 object-cover"
            style={{ 
              transform: 'scaleX(-1)', // Mirror effect for selfie
              minHeight: '256px'
            }}
            mirrored={true}
          />
          
          {/* Camera overlay with guidelines */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top instruction */}
            <div className="absolute top-2 lg:top-4 left-2 lg:left-4 right-2 lg:right-4 text-center">
              <span className="bg-blue-500/90 text-white px-3 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-medium backdrop-blur-sm">
                📸 Posisikan wajah Anda di dalam frame
              </span>
            </div>
            
            {/* Face guide circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-32 lg:w-48 lg:h-48 border-4 border-white/50 rounded-full border-dashed"></div>
            </div>
            
            {/* Bottom status */}
            <div className="absolute bottom-2 lg:bottom-4 left-2 lg:left-4 right-2 lg:right-4 text-center">
              <span className="bg-green-500/90 text-white px-3 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-medium backdrop-blur-sm">
                ✅ Kamera siap - Klik tombol untuk mengambil foto
              </span>
            </div>
          </div>
        </div>
        
        {/* Camera Controls */}
        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={onStopCamera}
            className="flex items-center justify-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg transition-colors font-medium text-sm lg:text-base"
          >
            <XCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>Batal</span>
          </button>
          
          <button
            onClick={onCapturePhoto}
            className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 lg:px-8 py-2 lg:py-3 rounded-lg transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105 text-sm lg:text-base"
          >
            <Camera className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>Ambil Foto</span>
          </button>
        </div>

        {/* Camera Info */}
        {devices.length > 0 && (
          <div className="text-center">
            <p className="text-xs lg:text-sm text-gray-600">
              Kamera aktif: {devices.find(d => d.deviceId === currentDeviceId)?.label || 'Default Camera'}
            </p>
            {devices.length > 1 && (
              <p className="text-xs text-gray-500 mt-1">
                💡 Tip: Gunakan tombol "Ganti" untuk beralih antar kamera
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraController;