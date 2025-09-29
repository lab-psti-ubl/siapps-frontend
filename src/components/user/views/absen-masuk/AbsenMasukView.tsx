import React, { useState, useEffect } from 'react';
import { User } from '../../../../types/auth';
import { AttendanceRecord, LeaveRequest } from '../../types';
import { leaveRequestsAPI } from '../../../../services/api';
import LeaveStatusChecker from './components/LeaveStatusChecker';
import AttendanceChecker from './components/AttendanceChecker';
import LocationChecker from './components/LocationChecker';
import CameraController from './components/CameraController';
import PhotoPreview from './components/PhotoPreview';
import CameraStarter from './components/CameraStarter';
import { useAbsenMasukLogic } from './hooks/useAbsenMasukLogic';
import { useLocationLogic } from './hooks/useLocationLogic';
import { useCameraLogic } from './hooks/useCameraLogic';

interface AbsenMasukViewProps {
  currentUser: User;
  todayAttendance?: AttendanceRecord;
  onAttendanceSubmit: (attendance: AttendanceRecord) => void;
  onBackToDashboard: () => void;
}

const AbsenMasukView: React.FC<AbsenMasukViewProps> = ({
  currentUser,
  todayAttendance,
  onAttendanceSubmit,
  onBackToDashboard
}) => {
  // Check leave status on component mount
  const [leaveStatus, setLeaveStatus] = useState<{
    hasPending: boolean;
    isOnLeave: boolean;
    loading: boolean;
  }>({ hasPending: false, isOnLeave: false, loading: true });

  // Custom hooks for business logic
  const { 
    hasPendingLeaveToday, 
    isOnApprovedLeaveToday 
  } = useAbsenMasukLogic(currentUser, todayAttendance);

  const {
    isCheckingLocation,
    locationError,
    userLocation,
    isWithinRadius,
    distanceFromCompany,
    locationChecked,
    checkUserLocation
  } = useLocationLogic();

  const {
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
    handleUserMediaError
  } = useCameraLogic({
    currentUser,
    todayAttendance,
    userLocation,
    isWithinRadius,
    onAttendanceSubmit,
    onBackToDashboard
  });

  useEffect(() => {
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
      <LeaveStatusChecker
        title="Absen Masuk"
        subtitle="Ambil foto untuk melakukan absensi masuk"
        status="pending"
        onBackToDashboard={onBackToDashboard}
      />
    );
  }

  // Check if user is on approved leave today
  if (leaveStatus.isOnLeave) {
    return (
      <LeaveStatusChecker
        title="Absen Masuk"
        subtitle="Ambil foto untuk melakukan absensi masuk"
        status="approved"
        onBackToDashboard={onBackToDashboard}
      />
    );
  }

  if (todayAttendance?.checkInTime) {
    return (
      <AttendanceChecker
        title="Absen Masuk"
        subtitle="Ambil foto untuk melakukan absensi masuk"
        status="already-checked-in"
        checkInTime={todayAttendance.checkInTime}
        checkInMethod={todayAttendance.checkInMethod}
        onBackToDashboard={onBackToDashboard}
      />
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Absen Masuk</h1>
          <p className="text-sm lg:text-base text-gray-600">Ambil foto untuk melakukan absensi masuk</p>
        </div>
      </div>

      <LocationChecker
        isCheckingLocation={isCheckingLocation}
        locationError={locationError}
        isWithinRadius={isWithinRadius}
        distanceFromCompany={distanceFromCompany}
        userLocation={userLocation}
        onCheckLocation={checkUserLocation}
      />

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

      {isCapturing && isWithinRadius && (
        <CameraController
          webcamRef={webcamRef}
          devices={devices}
          currentDeviceId={currentDeviceId}
          onSwitchCamera={switchCamera}
          onStopCamera={stopCamera}
          onCapturePhoto={capturePhoto}
          onUserMediaError={handleUserMediaError}
        />
      )}

      {capturedPhoto && (
        <PhotoPreview
          capturedPhoto={capturedPhoto}
          isSubmitting={isSubmitting}
          isWithinRadius={isWithinRadius}
          onRetakePhoto={retakePhoto}
          onCancel={() => {
            setCapturedPhoto(null);
            stopCamera();
            onBackToDashboard();
          }}
          onSubmit={submitAttendance}
          submitButtonText="Kirim Absen Masuk"
        />
      )}

      {!isCapturing && !capturedPhoto && !cameraError && locationChecked && (
        <CameraStarter
          isWithinRadius={isWithinRadius}
          devices={devices}
          onStartCamera={startCamera}
          onCheckLocation={checkUserLocation}
          cameraButtonText="Buka Kamera"
          icon="login"
          title="Siap untuk Absen Masuk?"
          description={
            isWithinRadius 
              ? 'Klik tombol di bawah untuk membuka kamera dan mengambil foto absen masuk'
              : 'Anda harus berada dalam radius perusahaan untuk melakukan absensi'
          }
        />
      )}
    </div>
  );
};

export default AbsenMasukView;