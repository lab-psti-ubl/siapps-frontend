import React, { useState, useEffect } from 'react';
import { Save, Clock, AlertCircle, Database, RefreshCw, CheckCircle, MapPin, Building, Users } from 'lucide-react';
import { WorkSettings, Division, WorkShift } from '../types';
import { settingsAPI, divisionsAPI, workShiftsAPI } from '../../../services/api';
import WorkTimeSettingsTab from '../components/WorkTimeSettingsTab';
import LocationSettingsTab from '../components/LocationSettingsTab';
import DivisionSettingsTab from '../components/DivisionSettingsTab';

interface SettingsViewProps {
  onSettingsUpdate: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onSettingsUpdate }) => {
  const [activeTab, setActiveTab] = useState<'worktime' | 'location' | 'divisions'>('worktime');
  const [settings, setSettings] = useState<WorkSettings>({
    checkInTime: "08:00",
    checkOutTime: "17:00",
    lateThresholdMinutes: 15,
    earlyLeaveThresholdMinutes: 15,
    companyLatitude: -5.4011664,
    companyLongitude: 105.3541365,
    radiusMeters: 20000
  });
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
    show: false,
    type: 'success',
    message: ''
  });

  // Load all settings data on component mount
  useEffect(() => {
    loadAllSettings();
  }, []);

  // Auto hide notification after 4 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({
      show: true,
      type,
      message
    });
  };

  const loadAllSettings = async () => {
    try {
      setIsLoading(true);
      
      // Load all settings in parallel
      const [settingsResponse, divisionsResponse, shiftsResponse] = await Promise.all([
        settingsAPI.getWorkSettings(),
        divisionsAPI.getAll(),
        workShiftsAPI.getAll()
      ]);
      
      if (settingsResponse.success) {
        setSettings(settingsResponse.data);
      }
      
      if (divisionsResponse.success) {
        const divisionsData = divisionsResponse.data.map((div: any) => ({
          ...div,
          id: div._id
        }));
        setDivisions(divisionsData);
      }
      
      if (shiftsResponse.success) {
        const shiftsData = shiftsResponse.data.map((shift: any) => ({
          ...shift,
          id: shift._id
        }));
        setWorkShifts(shiftsData);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showNotification('error', 'Gagal memuat pengaturan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSettingsUpdate = async (newSettings: WorkSettings) => {
    try {
      const response = await settingsAPI.updateWorkSettings(newSettings);
      if (response.success) {
        setSettings(newSettings);
        onSettingsUpdate();
        showNotification('success', '📍 Pengaturan lokasi berhasil disimpan!');
      }
    } catch (error) {
      console.error('Error saving location settings:', error);
      showNotification('error', 'Gagal menyimpan pengaturan lokasi');
    }
  };

  const handleDivisionUpdate = (updatedDivisions: Division[]) => {
    setDivisions(updatedDivisions);
    showNotification('success', '🏢 Pengaturan divisi berhasil diperbarui!');
  };

  const handleWorkShiftsUpdate = (updatedShifts: WorkShift[]) => {
    setWorkShifts(updatedShifts);
    onSettingsUpdate();
    showNotification('success', '⏰ Pengaturan jam kerja berhasil diperbarui!');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Pengaturan Sistem</h1>
          <p className="text-gray-600">Memuat pengaturan...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in max-w-sm">
          <div className={`flex items-start space-x-3 px-6 py-4 rounded-xl shadow-lg border-l-4 backdrop-blur-sm ${
            notification.type === 'success' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
              : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
          }`}>
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${
                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {notification.type === 'success' ? 'Berhasil!' : 'Gagal!'}
              </p>
              <p className={`text-sm mt-1 leading-relaxed ${
                notification.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Pengaturan Sistem</h1>
        <p className="text-gray-600">Kelola pengaturan jam kerja, lokasi perusahaan, dan divisi</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('worktime')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === 'worktime'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Pengaturan Jam Kerja</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('location')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === 'location'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Pengaturan Lokasi</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('divisions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === 'divisions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>Pengaturan Divisi</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'worktime' && (
            <WorkTimeSettingsTab
              workShifts={workShifts}
              onUpdate={handleWorkShiftsUpdate}
              onNotification={showNotification}
            />
          )}
          
          {activeTab === 'location' && (
            <LocationSettingsTab
              settings={settings}
              onUpdate={handleLocationSettingsUpdate}
            />
          )}
          
          {activeTab === 'divisions' && (
            <DivisionSettingsTab
              divisions={divisions}
              onUpdate={handleDivisionUpdate}
              onNotification={showNotification}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;