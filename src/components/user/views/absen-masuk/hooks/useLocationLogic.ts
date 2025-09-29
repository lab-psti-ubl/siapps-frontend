import { useState, useEffect } from 'react';
import { 
  getCurrentLocation, 
  isWithinCompanyRadius, 
  calculateDistance, 
  getCompanyLocation,
  getAllowedRadius,
  updateLocationSettings,
  formatDistance,
  Coordinates
} from '../../../../../utils/locationUtils';
import { settingsAPI } from '../../../../../services/api';

export const useLocationLogic = () => {
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isWithinRadius, setIsWithinRadius] = useState<boolean>(false);
  const [distanceFromCompany, setDistanceFromCompany] = useState<number>(0);
  const [locationChecked, setLocationChecked] = useState<boolean>(false);

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

  return {
    isCheckingLocation,
    locationError,
    userLocation,
    isWithinRadius,
    distanceFromCompany,
    locationChecked,
    checkUserLocation
  };
};