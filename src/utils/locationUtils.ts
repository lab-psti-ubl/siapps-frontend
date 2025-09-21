// Utility functions for location-based operations
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Default company location (will be overridden by settings from API)
let COMPANY_LOCATION: Coordinates = {
  latitude: -5.4011664,
  longitude: 105.3541365
};

let ALLOWED_RADIUS_METERS = 20000;

// Function to update location settings from API
export const updateLocationSettings = (latitude: number, longitude: number, radius: number) => {
  COMPANY_LOCATION = { latitude, longitude };
  ALLOWED_RADIUS_METERS = radius;
};

// Getter functions to access current settings
export const getCompanyLocation = (): Coordinates => COMPANY_LOCATION;
export const getAllowedRadius = (): number => ALLOWED_RADIUS_METERS;

// Export for backward compatibility
export { COMPANY_LOCATION, ALLOWED_RADIUS_METERS };

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = coord1.latitude * Math.PI / 180;
  const φ2 = coord2.latitude * Math.PI / 180;
  const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

/**
 * Check if user is within allowed radius of company location
 */
export function isWithinCompanyRadius(userLocation: Coordinates): boolean {
  const distance = calculateDistance(userLocation, COMPANY_LOCATION);
  return distance <= ALLOWED_RADIUS_METERS;
}

/**
 * Get user's current location using Geolocation API
 */
export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} meter`;
  } else {
    return `${(meters / 1000).toFixed(1)} km`;
  }
}