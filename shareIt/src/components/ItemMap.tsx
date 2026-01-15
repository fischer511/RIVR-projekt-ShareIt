import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const MapView = require('react-native-maps').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Marker, Circle } = require('react-native-maps');

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
      <Marker coordinate={{ latitude: lat, longitude: lng }} />
      <Circle
        center={{ latitude: lat, longitude: lng }}
        radius={radiusMeters}
        strokeColor="#ef4444"
        fillColor="rgba(239,68,68,0.2)"
      />
    </MapView>
  );
};

const styles = StyleSheet.create({
  nativeMap: { width: '100%', borderRadius: 12, overflow: 'hidden' },
  webWrap: { width: '100%', borderRadius: 12, overflow: 'hidden' },
});

export default ItemMap;
