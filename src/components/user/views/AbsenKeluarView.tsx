import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { 
  CheckCircle, 
  XCircle, 
  Camera, 
  RotateCcw, 
  Send, 
  AlertCircle,
  SwitchCamera,
  MapPin,
  Navigation,
  Loader,
  LogOut as LogOutIcon,
  FileText
} from 'lucide-react';
import { User } from '../../../types/auth';
import { AttendanceRecord, LeaveRequest } from '../types';
import { 
  getCurrentLocation, 
  isWithinCompanyRadius, 
  calculateDistance, 
  getCompanyLocation,
  getAllowedRadius,
  updateLocationSettings,
  formatDistance,
  Coordinates,
  ALLOWED_RADIUS_METERS
} from '../../../utils/locationUtils';
import { getWorkSettings, calculateCheckOutStatus, getCurrentTime } from '../../../utils/attendanceUtils';
import { leaveRequestsAPI, settingsAPI } from '../../../services/api';

interface AbsenKeluarViewProps {
  currentUser: User;
  todayAttendance?: AttendanceRecord;
  onAttendanceUpdate: (attendance: AttendanceRecord) => void;
  onBackToDashboard: () => void;
}

const AbsenKeluarView: React.FC<AbsenKeluarViewProps> = ({
  currentUser,
  todayAttendance,
  onAttendanceUpdate,
  onBackToDashboard
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
  // Location states
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isWithinRadius, setIsWithinRadius] = useState<boolean>(false);
  const [distanceFromCompany, setDistanceFromCompany] = useState<number>(0);
  const [locationChecked, setLocationChecked] = useState<boolean>(false);
  
  const webcamRef = useRef<Webcam>(null);

  // Get available video devices
  const handleDevices = useCallback(
    (mediaDevices: MediaDeviceInfo[]) => {
      const videoDevices = mediaDevices.filter(({ kind }) => kind === 'videoinput');
      setDevices(videoDevices);
      
      if (videoDevices.length > 0 && !currentDeviceId) {
        // Prefer front camera for selfie
        const frontCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('front') || 
          device.label.toLowerCase().includes('user') ||
          device.label.toLowerCase().includes('facing')
        );
        setCurrentDeviceId(frontCamera ? frontCamera.deviceId : videoDevices[0].deviceId);
      }
    },
    [currentDeviceId]
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  // Check location on component mount
  useEffect(() => {
    loadLocationSettings();
    checkUserLocation();
  }, []);

  const loadLocationSettings = async () => {
    try {
      const response = await settingsAPI.getLocationSettings();
      if (response.success) {
        updateLocationSettings(
          response.data.companyLatitude,
          response.data.companyLongitude,
          response.data.radiusMeters
        );
      }
    } catch (error) {
      console.error('Error loading location settings:', error);
    }
  };
  const checkUserLocation = async () => {
    setIsCheckingLocation(true);
    setLocationError('');
    
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      
      const companyLocation = getCompanyLocation();
      const allowedRadius = getAllowedRadius();
      const distance = calculateDistance(location, companyLocation);
      setDistanceFromCompany(distance);
      
      const withinRadius = isWithinCompanyRadius(location);
      setIsWithinRadius(withinRadius);
      setLocationChecked(true);
      
      if (!withinRadius) {
        setLocationError(`Anda diluar radius perusahaan. Jarak Anda: ${formatDistance(distance)} dari kantor. Maksimal jarak: ${formatDistance(allowedRadius)}.`);
      }
    } catch (error: any) {
      setLocationError(`Gagal mendapatkan lokasi: ${error.message}. Silakan aktifkan GPS dan berikan izin lokasi.`);
      setLocationChecked(true);
    } finally {
      setIsCheckingLocation(false);
    }
  };

  const videoConstraints = {
    width: 640,
    height: 480,
    deviceId: currentDeviceId ? { exact: currentDeviceId } : undefined,
    facingMode: currentDeviceId ? undefined : facingMode,
  };

  const startCamera = () => {
    if (!isWithinRadius) {
      alert('Anda tidak dapat mengakses kamera karena berada diluar radius perusahaan.');
      return;
    }
    
    setCameraError('');
    setCapturedPhoto(null);
    setIsCapturing(true);
  };

  const stopCamera = () => {
    setIsCapturing(false);
    setCapturedPhoto(null);
    setCameraError('');
  };

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot({
        width: 640,
        height: 480,
        screenshotFormat: 'image/jpeg',
        screenshotQuality: 0.8
      });
      
      if (imageSrc) {
        setCapturedPhoto(imageSrc);
        setIsCapturing(false);
        console.log('Photo captured successfully');
      } else {
        setCameraError('Gagal mengambil foto. Silakan coba lagi.');
      }
    }
  }, [webcamRef]);

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const switchCamera = () => {
    if (devices.length > 1) {
      const currentIndex = devices.findIndex(device => device.deviceId === currentDeviceId);
      const nextIndex = (currentIndex + 1) % devices.length;
      setCurrentDeviceId(devices[nextIndex].deviceId);
    } else {
      // Toggle between front and back camera using facingMode
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    }
  };

  const submitAttendance = async () => {
    if (!capturedPhoto) {
      alert('Silakan ambil foto terlebih dahulu');
      return;
    }

    if (!isWithinRadius) {
      alert('Anda tidak dapat melakukan absensi karena berada diluar radius perusahaan.');
      return;
    }

    if (!todayAttendance) {
      alert('Anda belum melakukan absen masuk hari ini.');
      return;
    }

    setIsSubmitting(true);

    try {
      const currentTimeStr = getCurrentTime();
      const workSettings = getWorkSettings();
      const checkOutStatus = calculateCheckOutStatus(currentTimeStr, workSettings);

      const updatedAttendance: AttendanceRecord = {
        ...todayAttendance,
        checkOutTime: currentTimeStr,
        checkOutStatus: checkOutStatus,
        checkOutMethod: 'photo',
        checkOutPhoto: capturedPhoto,
        location: {
          ...todayAttendance.location,
          ...(userLocation ? {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          } : {})
        }
      };

      onAttendanceUpdate(updatedAttendance);
      setCapturedPhoto(null);
    } catch (error) {
      console.error('Error submitting attendance:', error);
      alert('Terjadi kesalahan saat menyimpan absensi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelAttendance = () => {
    setCapturedPhoto(null);
    stopCamera();
    onBackToDashboard();
  };

  const handleUserMediaError = (error: string | DOMException) => {
    console.error('Camera error:', error);
    let errorMessage = 'Tidak dapat mengakses kamera. ';
    
    if (typeof error === 'string') {
      errorMessage += error;
    } else {
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Izin kamera ditolak. Silakan berikan izin kamera dan refresh halaman.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'Kamera tidak ditemukan.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Kamera sedang digunakan oleh aplikasi lain.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage += 'Kamera tidak mendukung pengaturan yang diminta.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
    }
    
    setCameraError(errorMessage);
    setIsCapturing(false);
  };

  // Check if user has pending leave request for today
  const hasPendingLeaveToday = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await leaveRequestsAPI.getAll({ 
        employeeId: currentUser.id, 
        status: 'pending' 
      });
      
      if (response.success) {
        return response.data.some((req: LeaveRequest) => 
          new Date(req.startDate) <= new Date(today) &&
          new Date(req.endDate) >= new Date(today)
        );
      }
      return false;
    } catch (error) {
      console.error('Error checking pending leave:', error);
      return false;
    }
  };

  // Check if user is on approved leave today
  const isOnApprovedLeaveToday = async () => {
    if (todayAttendance?.attendanceType === 'leave' && todayAttendance.leaveRequestId) {
      try {
        const response = await leaveRequestsAPI.getById(todayAttendance.leaveRequestId);
        return response.success && response.data.status === 'approved';
      } catch (error) {
        console.error('Error checking leave request:', error);
        return false;
      }
    }
    return false;
  };

  // Check leave status on component mount
  const [leaveStatus, setLeaveStatus] = React.useState<{
    hasPending: boolean;
    isOnLeave: boolean;
    loading: boolean;
  }>({ hasPending: false, isOnLeave: false, loading: true });

  React.useEffect(() => {
    const checkLeaveStatus = async () => {
      const hasPending = await hasPendingLeaveToday();
      const isOnLeave = await isOnApprovedLeaveToday();
      setLeaveStatus({ hasPending, isOnLeave, loading: false });
    };
    
    checkLeaveStatus();
  }, [currentUser.id, todayAttendance]);

  if (leaveStatus.loading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Check if user has pending leave request for today
  if (leaveStatus.hasPending) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Absen Keluar</h1>
            <p className="text-sm lg:text-base text-gray-600">Ambil foto untuk melakukan absensi keluar</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 text-center">
          <FileText className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-2">Pengajuan Izin Sedang Pending</h3>
          <p className="text-sm lg:text-base text-gray-600 mb-4">
            Anda tidak dapat melakukan absensi karena memiliki pengajuan izin yang sedang menunggu persetujuan admin untuk hari ini
          </p>
          <button
            onClick={onBackToDashboard}
            className="px-4 lg:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Check if user is on approved leave today
  if (leaveStatus.isOnLeave) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Absen Keluar</h1>
            <p className="text-sm lg:text-base text-gray-600">Ambil foto untuk melakukan absensi keluar</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 text-center">
          <FileText className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-blue-500" />
          <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-2">Anda Sedang Izin Hari Ini</h3>
          <p className="text-sm lg:text-base text-gray-600 mb-4">
            Anda tidak dapat melakukan absensi keluar karena sedang dalam status izin yang disetujui
          </p>
          <button
            onClick={onBackToDashboard}
            className="px-4 lg:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Check if user hasn't checked in yet
  if (!todayAttendance?.checkInTime) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Absen Keluar</h1>
            <p className="text-sm lg:text-base text-gray-600">Ambil foto untuk melakukan absensi keluar</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 text-center">
          <XCircle className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-2">Anda Belum Absen Masuk</h3>
          <p className="text-sm lg:text-base text-gray-600 mb-4">
            Silakan lakukan absen masuk terlebih dahulu sebelum absen keluar
          </p>
          <button
            onClick={onBackToDashboard}
            className="px-4 lg:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Check if user already checked out
  if (todayAttendance?.checkOutTime) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Absen Keluar</h1>
            <p className="text-sm lg:text-base text-gray-600">Ambil foto untuk melakukan absensi keluar</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 text-center">
          <CheckCircle className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-2">Anda Sudah Absen Keluar Hari Ini</h3>
          <p className="text-sm lg:text-base text-gray-600 mb-4">
            Absen keluar pada {todayAttendance.checkOutTime} menggunakan {todayAttendance.checkOutMethod === 'qr' ? 'QR Code' : 'Foto'}
          </p>
          <button
            onClick={onBackToDashboard}
            className="px-4 lg:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Absen Keluar</h1>
          <p className="text-sm lg:text-base text-gray-600">Ambil foto untuk melakukan absensi keluar</p>
        </div>
      </div>

      {/* Location Check Status */}
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
            <div className="flex items-start space-x-3 p-4 bg-re-50 rounded-lg border border-red-200">
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
                onClick={checkUserLocation}
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

      {/* Camera Error */}
      {cameraError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 lg:p-6">
          <div className="flex items-center space-x-3 mb-3">
            <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 text-red-500" />
            <h3 className="text-base lg:text-lg font-bold text-red-800">Error Kamera</h3>
          </div>
          <p className="text-sm lg:text-base text-red-600 mb-4">{cameraError}</p>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => {
                setCameraError('');
                startCamera();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm lg:text-base"
            >
              Coba Lagi
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm lg:text-base"
            >
              Refresh Halaman
            </button>
          </div>
        </div>
      )}

      {/* Camera Preview */}
      {isCapturing && isWithinRadius && (
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-lg lg:text-xl font-bold text-gray-800">Preview Kamera</h3>
            <div className="flex space-x-2">
              {(devices.length > 1 || !currentDeviceId) && (
                <button
                  onClick={switchCamera}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  title="Ganti Kamera"
                >
                  <SwitchCamera className="w-4 h-4" />
                  <span className="hidden sm:inline">Ganti</span>
                </button>
              )}
              <button
                onClick={stopCamera}
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
                onUserMediaError={handleUserMediaError}
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
                onClick={stopCamera}
                className="flex items-center justify-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg transition-colors font-medium text-sm lg:text-base"
              >
                <XCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>Batal</span>
              </button>
              
              <button
                onClick={capturePhoto}
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
      )}

      {/* Captured Photo Preview */}
      {capturedPhoto && (
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
          <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-4 lg:mb-6">Preview Foto Absen Keluar</h3>
          
          <div className="space-y-4 lg:space-y-6">
            <div className="relative bg-gray-100 rounded-xl overflow-hidden border-4 border-green-500">
              <img 
                src={capturedPhoto} 
                alt="Captured" 
                className="w-full h-64 sm:h-80 lg:h-96 object-cover"
              />
              <div className="absolute top-2 lg:top-4 right-2 lg:right-4">
                <span className="bg-green-500 text-white px-3 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-medium">
                  ✓ Foto berhasil diambil
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={retakePhoto}
                disabled={isSubmitting}
                className="flex items-center justify-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg transition-colors font-medium disabled:opacity-50 text-sm lg:text-base"
              >
                <RotateCcw className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>Ambil Ulang</span>
              </button>
              
              <button
                onClick={cancelAttendance}
                disabled={isSubmitting}
                className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg transition-colors font-medium disabled:opacity-50 text-sm lg:text-base"
              >
                <XCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>Batal</span>
              </button>
              
              <button
                onClick={submitAttendance}
                disabled={isSubmitting || !isWithinRadius}
                className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 lg:px-8 py-2 lg:py-3 rounded-lg transition-colors font-medium disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm lg:text-base"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-b-2 border-white"></div>
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>Kirim Absen Keluar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Camera Button */}
      {!isCapturing && !capturedPhoto && !cameraError && locationChecked && (
        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 text-center">
          <LogOutIcon className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 text-purple-500" />
          <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-3">Siap untuk Absen Keluar?</h3>
          <p className="text-sm lg:text-lg text-gray-600 mb-6 lg:mb-8">
            {isWithinRadius 
              ? 'Klik tombol di bawah untuk membuka kamera dan mengambil foto absen keluar'
              : 'Anda harus berada dalam radius perusahaan untuk melakukan absensi'
            }
          </p>
          
          {isWithinRadius ? (
            <button
              onClick={startCamera}
              className="px-8 lg:px-10 py-3 lg:py-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105 text-sm lg:text-lg"
            >
              <Camera className="w-5 h-5 lg:w-6 lg:h-6" />
              <span>Buka Kamera</span>
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
                onClick={checkUserLocation}
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
      )}
    </div>
  );
};

export default AbsenKeluarView;