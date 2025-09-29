import React, { useState, useEffect } from 'react';
import { RfidDevice } from '../../types';
import { rfidDevicesAPI } from '../../../../services/api';
import RfidDevicesHeader from './components/RfidDevicesHeader';
import RfidDevicesSearch from './components/RfidDevicesSearch';
import RfidDevicesTable from './components/RfidDevicesTable';
import AddRfidDeviceModal from './modals/AddRfidDeviceModal';
import EditRfidDeviceModal from './modals/EditRfidDeviceModal';
import { useRfidDevicesData } from './hooks/useRfidDevicesData';
import { useRfidDevicesActions } from './hooks/useRfidDevicesActions';

interface RfidDevicesViewProps {
  onNotification: (type: 'success' | 'error', message: string) => void;
}

const RfidDevicesView: React.FC<RfidDevicesViewProps> = ({ onNotification }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Custom hooks
  const { devices, isLoading, loadDevices } = useRfidDevicesData();
  const {
    showAddModal,
    setShowAddModal,
    showEditModal,
    setShowEditModal,
    selectedDevice,
    formData,
    setFormData,
    handleAddDevice,
    handleEditDevice,
    handleDeleteDevice,
    openEditModal,
    closeModals
  } = useRfidDevicesActions({ devices, loadDevices, onNotification });

  // Filter devices based on search term
  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.macAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Alat RFID</h1>
          <p className="text-gray-600">Memuat data alat RFID...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RfidDevicesHeader onAddDevice={() => setShowAddModal(true)} />

      <RfidDevicesSearch 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <RfidDevicesTable
        devices={filteredDevices}
        totalDevices={devices.length}
        onEditDevice={openEditModal}
        onDeleteDevice={handleDeleteDevice}
      />

      {/* Add Device Modal */}
      {showAddModal && (
        <AddRfidDeviceModal
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleAddDevice}
          onClose={closeModals}
        />
      )}

      {/* Edit Device Modal */}
      {showEditModal && selectedDevice && (
        <EditRfidDeviceModal
          device={selectedDevice}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleEditDevice}
          onClose={closeModals}
        />
      )}
    </div>
  );
};

export default RfidDevicesView;