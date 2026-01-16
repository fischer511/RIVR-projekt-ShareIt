import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';

type Props = {
  lat: number;
  lng: number;
  height?: number;
  radiusMeters?: number;
};

const ItemMap: React.FC<Props> = ({ lat, lng, height = 200, radiusMeters = 1000 }) => {
  if (Platform.OS === 'web') {
    // Lazy import for web to avoid native bundling issues.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MapContainer, TileLayer, Marker, Circle } = require('react-leaflet');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const L = require('leaflet');
    const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
    const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
    const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

    const markerIcon = useMemo(
      () =>
        L.icon({
          iconRetinaUrl,
          iconUrl,
          shadowUrl,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      [L, iconRetinaUrl, iconUrl, shadowUrl]
    );

    return (
      <View style={[styles.webWrap, { height }]}>
        <MapContainer center={[lat, lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} icon={markerIcon} />
          <Circle
            center={[lat, lng]}
            radius={radiusMeters}
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2 }}
          />
        </MapContainer>
      </View>
    );
  }

  // Native (Android/iOS)
  // Native (Android/iOS)
  // Avoid requiring `react-native-maps` when running inside Expo Go because the native
  // module won't be present and requiring it will throw a TurboModule error.
  const isExpoGo = Constants?.appOwnership === 'expo';
  if (Platform.OS !== 'web' && !isExpoGo) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const RNMaps = require('react-native-maps');
      const MapView = RNMaps?.default ?? RNMaps;
      const { Marker: RNMarker, Circle: RNCircle } = RNMaps || {};

      if (!MapView) throw new Error('react-native-maps not available');

      return (
        <MapView
          style={[styles.nativeMap, { height }]}
          initialRegion={{
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          {RNMarker && <RNMarker coordinate={{ latitude: lat, longitude: lng }} />}
          {RNCircle && (
            <RNCircle
              center={{ latitude: lat, longitude: lng }}
              radius={radiusMeters}
              strokeColor="#ef4444"
              fillColor="rgba(239,68,68,0.2)"
            />
          )}
        </MapView>
      );
    } catch (err) {
      return <View style={[styles.webWrap, { height }]} />;
    }
  }

  // If we're on web or inside Expo Go, render a non-native placeholder (web handled above).
  return <View style={[styles.webWrap, { height }]} />;
};

const styles = StyleSheet.create({
  nativeMap: { width: '100%', borderRadius: 12, overflow: 'hidden' },
  webWrap: { width: '100%', borderRadius: 12, overflow: 'hidden' },
});

export default ItemMap;
