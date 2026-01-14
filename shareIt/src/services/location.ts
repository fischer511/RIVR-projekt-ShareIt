import * as Location from 'expo-location';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

/**
 * Requests permission and fetches the user's current location.
 * Returns coordinates or null if permission is denied.
 */
export const getUserLocation = async (): Promise<Coordinates | null> => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.log('Permission to access location was denied');
    return null;
  }

  let location = await Location.getCurrentPositionAsync({});
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};

/**
 * Calculates the distance in kilometers between two coordinates using the Haversine formula.
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (coord2.latitude - coord1.latitude) * (Math.PI / 180);
  const dLon = (coord2.longitude - coord1.longitude) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.latitude * (Math.PI / 180)) *
      Math.cos(coord2.latitude * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

// --- NOVO TUKAJ ---
/**
 * Gets the city name from coordinates using reverse geocoding.
 */
export const getCityFromCoordinates = async (coords: Coordinates): Promise<string | null> => {
  try {
    const [address] = await Location.reverseGeocodeAsync(coords);
    return address?.city || null;
  } catch (error) {
    console.error("Reverse geocoding failed", error);
    return null;
  }
};
