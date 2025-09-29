import { useState, useEffect } from 'react';
import { RfidDevice } from '../../../types';
import { rfidDevicesAPI } from '../../../../../services/api';

export const useRfidDevicesData = () => {
  const [devices, setDevices] = useState<RfidDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setIsLoading(true);
      const response = await rfidDevicesAPI.getAll();
      if (response.success) {
        const devicesData = response.data.map((device: any) => ({
          ...device,
          id: device._id,
          createdAt: device.createdAt
        }));
        setDevices(devicesData);
      }
    } catch (error) {
      console.error('Error loading RFID devices:', error);
      setDevices([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    devices,
    setDevices,
    isLoading,
    loadDevices
  };
};