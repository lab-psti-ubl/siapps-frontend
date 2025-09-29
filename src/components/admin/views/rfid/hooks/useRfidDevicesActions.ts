import { useState } from 'react';
import { RfidDevice } from '../../../types';
import { rfidDevicesAPI } from '../../../../../services/api';

interface UseRfidDevicesActionsProps {
  devices: RfidDevice[];
  loadDevices: () => void;
  onNotification: (type: 'success' | 'error', message: string) => void;
}

export const useRfidDevicesActions = ({ 
  devices, 
  loadDevices, 
  onNotification 
}: UseRfidDevicesActionsProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<RfidDevice | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    macAddress: '',
    location: '',
    description: ''
  });

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await rfidDevicesAPI.create(formData);
      
      if (response.success) {
        await loadDevices();
        setFormData({ name: '', macAddress: '', location: '', description: '' });
        setShowAddModal(false);
        onNotification('success', `✅ Alat RFID ${formData.name} berhasil ditambahkan!`);
      }
    } catch (error: any) {
      console.error('Error adding RFID device:', error);
      onNotification('error', error.message || 'Gagal menambahkan alat RFID');
    }
  };

  const handleEditDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;

    try {
      const response = await rfidDevicesAPI.update(selectedDevice.id, formData);
      
      if (response.success) {
        await loadDevices();
        setShowEditModal(false);
        setSelectedDevice(null);
        onNotification('success', `✅ Data alat RFID ${formData.name} berhasil diperbarui!`);
      }
    } catch (error: any) {
      console.error('Error updating RFID device:', error);
      onNotification('error', error.message || 'Gagal memperbarui alat RFID');
    }
  };

  const handleDeleteDevice = async (id: string) => {
    const deviceToDelete = devices.find(device => device.id === id);
    if (!confirm(`Apakah Anda yakin ingin menghapus alat RFID ${deviceToDelete?.name}?`)) {
      return;
    }

    try {
      const response = await rfidDevicesAPI.delete(id);
      
      if (response.success) {
        await loadDevices();
        onNotification('success', `✅ Alat RFID ${deviceToDelete?.name} berhasil dihapus!`);
      }
    } catch (error: any) {
      console.error('Error deleting RFID device:', error);
      onNotification('error', error.message || 'Gagal menghapus alat RFID');
    }
  };

  const openEditModal = (device: RfidDevice) => {
    setSelectedDevice(device);
    setFormData({
      name: device.name,
      macAddress: device.macAddress,
      location: device.location,
      description: device.description || ''
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedDevice(null);
    setFormData({ name: '', macAddress: '', location: '', description: '' });
  };

  return {
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
  };
};