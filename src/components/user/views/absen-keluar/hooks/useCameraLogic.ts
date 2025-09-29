import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { User } from '../../../../../types/auth';
import { AttendanceRecord } from '../../../types';
import { Coordinates } from '../../../../../utils/locationUtils';
import { getWorkSettings, calculateCheckOutStatus, getCurrentTime } from '../../../../../utils/attendanceUtils';

interface UseCameraLogicProps {
  currentUser: User;
  todayAttendance?: AttendanceRecord;
  userLocation: Coordinates | null;
  isWithinRadius: boolean;
  onAttendanceUpdate: (attendance: AttendanceRecord) => void;
  onBackToDashboard: () => void;
}

export const useCameraLogic = ({
  currentUser,
  todayAttendance,
  userLocation,
  isWithinRadius,
  onAttendanceUpdate,
  onBackToDashboard
}: UseCameraLogicProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
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

  return {
    isCapturing,
    capturedPhoto,
    cameraError,
    devices,
    currentDeviceId,
    facingMode,
    webcamRef,
    isSubmitting,
    startCamera,
    stopCamera,
    capturePhoto,
    retakePhoto,
    switchCamera,
    submitAttendance,
    handleUserMediaError,
    setCameraError,
    setCapturedPhoto
  };
};