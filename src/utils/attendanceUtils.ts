import { WorkSettings } from '../components/admin/types';
import { settingsAPI } from '../services/api';

export const DEFAULT_WORK_SETTINGS: WorkSettings = {
  checkInTime: "08:00",
  checkOutTime: "17:00",
  lateThresholdMinutes: 15,
  earlyLeaveThresholdMinutes: 15,
  companyLatitude: -5.4011664,
  companyLongitude: 105.3541365,
  radiusMeters: 20000
};

export async function loadWorkSettingsFromAPI(): Promise<WorkSettings> {
  try {
    const response = await settingsAPI.getWorkSettings();
    if (response.success) {
      return response.data;
    }
  } catch (error) {
    console.error('Error loading work settings from API:', error);
  }
  
  // Return default settings if API fails
  return DEFAULT_WORK_SETTINGS;
}

export function getWorkSettings(): WorkSettings {
  // Always return default settings - will be loaded from API when needed
  return DEFAULT_WORK_SETTINGS;
}


export function getCurrentTime(): string {
  // Use server time - this will be handled by the server
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

export function getCurrentDateJakarta(): string {
  // Use server date - this will be handled by the server
  const now = new Date();
  return now.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

export function getCurrentDateTimeJakarta(): string {
  // Use server datetime - this will be handled by the server
  const now = new Date();
  return now.toISOString();
}

export function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function calculateCheckInStatus(checkInTime: string, workSettings: WorkSettings): 'on-time' | 'late' {
  const checkInMinutes = timeToMinutes(checkInTime);
  const workStartMinutes = timeToMinutes(workSettings.checkInTime);
  const lateThreshold = workStartMinutes + workSettings.lateThresholdMinutes;
  
  return checkInMinutes <= lateThreshold ? 'on-time' : 'late';
}

export function calculateCheckOutStatus(checkOutTime: string, workSettings: WorkSettings): 'on-time' | 'early' {
  const checkOutMinutes = timeToMinutes(checkOutTime);
  const workEndMinutes = timeToMinutes(workSettings.checkOutTime);
  const earlyThreshold = workEndMinutes - workSettings.earlyLeaveThresholdMinutes;
  
  return checkOutMinutes >= earlyThreshold ? 'on-time' : 'early';
}

export function formatTime(timeString: string): string {
  return timeString;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'on-time':
      return 'bg-green-100 text-green-800';
    case 'late':
      return 'bg-red-100 text-red-800';
    case 'early':
      return 'bg-yellow-100 text-yellow-800';
    case 'not-checked-out':
      return 'bg-gray-100 text-gray-800';
    case 'absent':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case 'on-time':
      return 'Tepat Waktu';
    case 'late':
      return 'Terlambat';
    case 'early':
      return 'Pulang Cepat';
    case 'not-checked-out':
      return 'Belum Checkout';
    case 'absent':
      return 'Tidak Hadir';
    default:
      return status;
  }
}